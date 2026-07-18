import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleNews, handleQuote } from '../server/handlers'

// server/handlers.ts is exercised entirely through global fetch, so every
// test here mocks fetch and asserts on the public handleQuote/handleNews
// contract — never reaching into private helpers — to test behavior, not
// implementation.

function requestUrl(input: string | URL | Request): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function mockFetch(responder: (url: string) => Response | 'network-error') {
  const fn = vi.fn(async (input: string | URL | Request) => {
    const result = responder(requestUrl(input))
    if (result === 'network-error') throw new TypeError('fetch failed')
    return result
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

function yahooOk(price: number, prevClose: number | null) {
  const closes = prevClose === null ? [price] : [prevClose, price]
  return new Response(
    JSON.stringify({
      chart: {
        result: [
          {
            meta: { regularMarketPrice: price, regularMarketTime: 1_700_000_000, currency: 'USD' },
            indicators: { quote: [{ close: closes }] },
          },
        ],
      },
    }),
    { status: 200 },
  )
}

function stooqOk(prevClose: number, price: number) {
  const csv = `Date,Open,High,Low,Close,Volume\n2024-01-01,0,0,0,${prevClose},0\n2024-01-02,0,0,0,${price},0\n`
  return new Response(csv, { status: 200 })
}

const upstreamDown = () => new Response('', { status: 500 })

function rssOk(titles: string[], source: string) {
  const items = titles
    .map((t, i) => `<item><title>${t}</title><link>https://example.com/${i}</link><pubDate>Fri, 17 Jul 2026 ${10 + i}:00:00 GMT</pubDate></item>`)
    .join('')
  void source
  return new Response(`<rss version="2.0"><channel>${items}</channel></rss>`, { status: 200 })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('handleQuote', () => {
  it('rejects a missing symbols parameter', async () => {
    const result = await handleQuote(null)
    expect(result.status).toBe(400)
  })

  it('rejects an unknown symbol and lists the allowlist', async () => {
    const result = await handleQuote('NOT_A_REAL_SYMBOL')
    expect(result.status).toBe(400)
    expect((result.body as { allowed: string[] }).allowed).toContain('^DJI')
  })

  it('returns a Yahoo-sourced quote on success', async () => {
    mockFetch((url) => (url.includes('yahoo.com') ? yahooOk(105, 100) : upstreamDown()))
    const result = await handleQuote('^DJI')
    expect(result.status).toBe(200)
    const quotes = (result.body as { quotes: { symbol: string; source?: string; price?: number }[] }).quotes
    expect(quotes[0]).toMatchObject({ symbol: '^DJI', source: 'yahoo', price: 105 })
  })

  it('falls back to Stooq when Yahoo fails', async () => {
    mockFetch((url) => (url.includes('stooq.com') ? stooqOk(50, 55) : upstreamDown()))
    const result = await handleQuote('GC=F')
    expect(result.status).toBe(200)
    const quotes = (result.body as { quotes: { source?: string; price?: number }[] }).quotes
    expect(quotes[0]).toMatchObject({ source: 'stooq', price: 55 })
  })

  it('marks a symbol as an error entry when both sources fail, without failing symbols that succeed', async () => {
    // '^DJI' fails both Yahoo and Stooq; 'CL=F' succeeds via Yahoo.
    mockFetch((url) => (url.includes('CL') ? yahooOk(80, 78) : upstreamDown()))
    const result = await handleQuote('^DJI,CL=F')
    expect(result.status).toBe(200)
    const quotes = (
      result.body as { quotes: { symbol: string; error?: boolean; source?: string }[] }
    ).quotes
    expect(quotes.find((q) => q.symbol === '^DJI')).toMatchObject({ error: true })
    expect(quotes.find((q) => q.symbol === 'CL=F')).toMatchObject({ source: 'yahoo' })
  })

  it('returns 502 when every requested symbol fails on both sources', async () => {
    mockFetch(() => upstreamDown())
    const result = await handleQuote('^DJI,GC=F')
    expect(result.status).toBe(502)
  })

  it('rejects an oversized upstream response instead of buffering it, and still falls back', async () => {
    const oversized = new Response('a'.repeat(1_500_000), { status: 200 })
    mockFetch((url) => (url.includes('yahoo.com') ? oversized : stooqOk(50, 55)))
    const result = await handleQuote('GC=F')
    expect(result.status).toBe(200)
    const [quote] = (result.body as { quotes: { source?: string }[] }).quotes
    expect(quote?.source).toBe('stooq')
  })
})

describe('handleNews', () => {
  it('rejects a missing/unknown feed id', async () => {
    const missing = await handleNews(null)
    expect(missing.status).toBe(400)
    const unknown = await handleNews('not-a-real-feed')
    expect(unknown.status).toBe(400)
    expect((unknown.body as { allowed: string[] }).allowed).toContain('geo')
  })

  it('merges items from working feeds and skips a failing one within the same theme', async () => {
    mockFetch((url) =>
      url.includes('aljazeera.com') ? upstreamDown() : rssOk(['Story A', 'Story B'], 'x'),
    )
    const result = await handleNews('geo')
    expect(result.status).toBe(200)
    const items = (result.body as { items: { title: string }[] }).items
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((i) => i.title === 'Story A')).toBe(true)
  })

  it('returns 502 when every feed in the theme fails', async () => {
    mockFetch(() => upstreamDown())
    const result = await handleNews('geo')
    expect(result.status).toBe(502)
  })

  it('dedupes by title and sorts newest first', async () => {
    mockFetch((url) => {
      if (url.includes('bbci.co.uk')) {
        return new Response(
          '<rss version="2.0"><channel>' +
            '<item><title>Shared Headline</title><link>https://example.com/a</link><pubDate>Fri, 17 Jul 2026 09:00:00 GMT</pubDate></item>' +
            '</channel></rss>',
          { status: 200 },
        )
      }
      if (url.includes('aljazeera.com')) {
        return new Response(
          '<rss version="2.0"><channel>' +
            '<item><title>Shared Headline</title><link>https://example.com/b</link><pubDate>Fri, 17 Jul 2026 08:00:00 GMT</pubDate></item>' +
            '<item><title>Newer Story</title><link>https://example.com/c</link><pubDate>Fri, 17 Jul 2026 12:00:00 GMT</pubDate></item>' +
            '</channel></rss>',
          { status: 200 },
        )
      }
      return upstreamDown()
    })
    const result = await handleNews('geo')
    expect(result.status).toBe(200)
    const items = (result.body as { items: { title: string }[] }).items
    const sharedCount = items.filter((i) => i.title === 'Shared Headline').length
    expect(sharedCount).toBe(1)
    const [newest] = items
    expect(newest?.title).toBe('Newer Story')
  })
})
