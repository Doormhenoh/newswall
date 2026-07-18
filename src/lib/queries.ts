import { useQuery } from '@tanstack/react-query'
import type { FeedId } from '../../server/feeds'
import { QUOTE_SYMBOLS } from '../../server/symbols'
import type { NewsResponse, QuotesResponse } from '../types'
import { COINS, fetchCandles, fetchCoinSparkline, fetchCoinTickers } from './binance'
import type { BinanceSymbol } from './binance'
import { fetchFearGreed } from './fearGreed'

const MINUTE = 60_000

// Derived from the same allowlist the server validates against, so the two
// can never drift — one canonical symbol set → one canonical URL → maximal
// CDN cache hits.
export const ALL_QUOTE_SYMBOLS = Object.keys(QUOTE_SYMBOLS)

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: () =>
      getJson<QuotesResponse>(`/api/quote?symbols=${encodeURIComponent(ALL_QUOTE_SYMBOLS.join(','))}`),
    refetchInterval: MINUTE,
    staleTime: 30_000,
  })
}

export function useNews(feed: FeedId) {
  return useQuery({
    queryKey: ['news', feed],
    queryFn: () => getJson<NewsResponse>(`/api/news?feed=${feed}`),
    refetchInterval: 10 * MINUTE,
    staleTime: 5 * MINUTE,
  })
}

export function useCoinTickers() {
  return useQuery({
    queryKey: ['coin-tickers'],
    queryFn: fetchCoinTickers,
    refetchInterval: MINUTE,
    staleTime: 30_000,
  })
}

export function useCoinSparkline(symbol: BinanceSymbol) {
  return useQuery({
    queryKey: ['coin-sparkline', symbol],
    queryFn: () => fetchCoinSparkline(symbol),
    refetchInterval: 30 * MINUTE,
    staleTime: 15 * MINUTE,
  })
}

export function useFearGreed() {
  return useQuery({
    queryKey: ['fear-greed'],
    queryFn: fetchFearGreed,
    refetchInterval: 30 * MINUTE,
    staleTime: 15 * MINUTE,
  })
}

/** Daily (400) + weekly (210) BTC candles for the Key Levels panel. */
export function useBtcCandles() {
  return useQuery({
    queryKey: ['btc-candles'],
    queryFn: async () => {
      const [daily, weekly] = await Promise.all([
        fetchCandles('BTCUSDT', '1d', 400),
        fetchCandles('BTCUSDT', '1w', 210),
      ])
      return { daily, weekly }
    },
    refetchInterval: 60 * MINUTE,
    staleTime: 30 * MINUTE,
  })
}

export { COINS }
export type { FeedId }
