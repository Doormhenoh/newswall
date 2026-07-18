import { FEEDS, isFeedId } from './feeds'
import { parseFeed } from './rss'
import { QUOTE_SYMBOLS, type SymbolDef } from './symbols'
import type { NewsItem, NewsResponse, Quote, QuoteError, QuotesResponse } from './types'

export interface HandlerResult {
  status: number
  body: unknown
  cacheControl: string
}

const UPSTREAM_TIMEOUT_MS = 8_000
const MAX_UPSTREAM_BYTES = 1_000_000
const MAX_NEWS_ITEMS = 30

const QUOTES_CACHE = 'public, s-maxage=60, stale-while-revalidate=300'
const NEWS_CACHE = 'public, s-maxage=600, stale-while-revalidate=1800'
const NO_CACHE = 'no-store'

// ─── Hardened upstream fetch ──────────────────────────────────────────────────

async function fetchTextCapped(url: string, accept: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Newswall/0.1)',
      Accept: accept,
    },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`upstream responded ${res.status}`)
  if (!res.body) return ''

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_UPSTREAM_BYTES) {
      await reader.cancel()
      throw new Error('upstream response too large')
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder('utf-8').decode(merged)
}

// ─── Quotes: Yahoo chart endpoint with Stooq CSV fallback ─────────────────────

interface YahooChartMeta {
  regularMarketPrice?: number
  regularMarketTime?: number
  currency?: string
}

async function fetchYahooQuote(symbol: string, def: SymbolDef): Promise<Quote> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/` +
    `${encodeURIComponent(symbol)}?range=1mo&interval=1d`
  const data = JSON.parse(await fetchTextCapped(url, 'application/json')) as {
    chart?: {
      result?: {
        meta?: YahooChartMeta
        indicators?: { quote?: { close?: (number | null)[] }[] }
      }[]
    }
  }
  const result = data.chart?.result?.[0]
  if (!result) throw new Error('yahoo: empty chart result')

  const meta = result.meta ?? {}
  const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(
    (c): c is number => typeof c === 'number' && Number.isFinite(c),
  )
  const price =
    typeof meta.regularMarketPrice === 'number' ? meta.regularMarketPrice : closes.at(-1)
  if (typeof price !== 'number') throw new Error('yahoo: no price in response')

  const prevClose = closes.length >= 2 ? (closes.at(-2) ?? null) : null
  return {
    symbol,
    label: def.label,
    group: def.group,
    price,
    change: prevClose !== null ? price - prevClose : null,
    changePct: prevClose !== null && prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : null,
    currency: meta.currency ?? 'USD',
    marketTime:
      typeof meta.regularMarketTime === 'number' ? meta.regularMarketTime * 1000 : null,
    sparkline: closes,
    source: 'yahoo',
  }
}

async function fetchStooqQuote(symbol: string, def: SymbolDef): Promise<Quote> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(def.stooq)}&i=d`
  const csv = await fetchTextCapped(url, 'text/csv')
  // Format: Date,Open,High,Low,Close,Volume (header + rows, oldest first)
  const rows = csv.trim().split('\n').slice(1)
  const parsed = rows
    .map((row) => {
      const cols = row.split(',')
      return { date: Date.parse(cols[0] ?? ''), close: Number.parseFloat(cols[4] ?? '') }
    })
    .filter((r) => Number.isFinite(r.date) && Number.isFinite(r.close))
    .slice(-23)
  const last = parsed.at(-1)
  if (!last) throw new Error('stooq: no rows')

  const prev = parsed.length >= 2 ? parsed[parsed.length - 2] : null
  return {
    symbol,
    label: def.label,
    group: def.group,
    price: last.close,
    change: prev ? last.close - prev.close : null,
    changePct: prev && prev.close !== 0 ? ((last.close - prev.close) / prev.close) * 100 : null,
    currency: 'USD',
    marketTime: last.date,
    sparkline: parsed.map((r) => r.close),
    source: 'stooq',
  }
}

export async function handleQuote(symbolsParam: string | null): Promise<HandlerResult> {
  if (!symbolsParam) {
    return { status: 400, body: { error: 'missing symbols parameter' }, cacheControl: NO_CACHE }
  }
  const requested = [...new Set(symbolsParam.split(',').map((s) => s.trim()))].filter(Boolean)

  // Resolve each symbol's allowlist entry up front: an entry only ends up in
  // `resolved` once it's known to exist, so callers below never need to
  // re-check QUOTE_SYMBOLS[symbol] for undefined.
  const resolved: { symbol: string; def: SymbolDef }[] = []
  const invalid: string[] = []
  for (const symbol of requested) {
    const def = QUOTE_SYMBOLS[symbol]
    if (def) resolved.push({ symbol, def })
    else invalid.push(symbol)
  }
  if (requested.length === 0 || invalid.length > 0) {
    return {
      status: 400,
      body: { error: 'unknown symbol', allowed: Object.keys(QUOTE_SYMBOLS) },
      cacheControl: NO_CACHE,
    }
  }

  const quotes = await Promise.all(
    resolved.map(async ({ symbol, def }): Promise<Quote | QuoteError> => {
      try {
        return await fetchYahooQuote(symbol, def)
      } catch (yahooErr) {
        try {
          return await fetchStooqQuote(symbol, def)
        } catch (stooqErr) {
          console.warn(`[quote] ${symbol} failed:`, yahooErr, stooqErr)
          return { symbol, label: def.label, error: true }
        }
      }
    }),
  )

  const allFailed = quotes.every((q) => 'error' in q)
  const body: QuotesResponse = { quotes, asOf: Date.now() }
  return {
    status: allFailed ? 502 : 200,
    body: allFailed ? { error: 'all quote sources unavailable' } : body,
    cacheControl: allFailed ? NO_CACHE : QUOTES_CACHE,
  }
}

// ─── News: allowlisted RSS feeds, merged + deduped ────────────────────────────

export async function handleNews(feedParam: string | null): Promise<HandlerResult> {
  if (!feedParam || !isFeedId(feedParam)) {
    return {
      status: 400,
      body: { error: 'unknown feed', allowed: Object.keys(FEEDS) },
      cacheControl: NO_CACHE,
    }
  }

  const results = await Promise.allSettled(
    FEEDS[feedParam].map(async (feed) => {
      const xml = await fetchTextCapped(
        feed.url,
        'application/rss+xml, application/atom+xml, application/xml, text/xml',
      )
      return parseFeed(xml, feed.source)
    }),
  )

  const items: NewsItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') items.push(...result.value)
    else console.warn(`[news] a "${feedParam}" feed failed:`, result.reason)
  }
  if (items.length === 0) {
    return { status: 502, body: { error: 'all feeds unavailable' }, cacheControl: NO_CACHE }
  }

  items.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
  const seen = new Set<string>()
  const deduped = items.filter((item) => {
    const key = item.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const body: NewsResponse = { items: deduped.slice(0, MAX_NEWS_ITEMS), asOf: Date.now() }
  return { status: 200, body, cacheControl: NEWS_CACHE }
}
