import type { Candle, CoinTicker } from '../types'

// Official Binance public market-data mirror — same API shape as api.binance.com
// but reachable from regions/networks where the main host is blocked.
const BINANCE_BASE = 'https://data-api.binance.vision/api/v3'

export const COINS = [
  { binance: 'BTCUSDT', ticker: 'BTC', name: 'Bitcoin' },
  { binance: 'ETHUSDT', ticker: 'ETH', name: 'Ethereum' },
  { binance: 'SOLUSDT', ticker: 'SOL', name: 'Solana' },
  { binance: 'XRPUSDT', ticker: 'XRP', name: 'XRP' },
  { binance: 'BNBUSDT', ticker: 'BNB', name: 'BNB' },
  { binance: 'DOGEUSDT', ticker: 'DOGE', name: 'Dogecoin' },
] as const

export type BinanceSymbol = (typeof COINS)[number]['binance']

const MAX_RESPONSE_BYTES = 2_000_000

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`Binance request failed: ${res.status}`)
  const text = await res.text()
  if (text.length > MAX_RESPONSE_BYTES) throw new Error('Binance response too large')
  return JSON.parse(text) as T
}

interface Binance24hTicker {
  symbol: string
  lastPrice: string
  priceChangePercent: string
}

export async function fetchCoinTickers(): Promise<CoinTicker[]> {
  const symbols = encodeURIComponent(JSON.stringify(COINS.map((c) => c.binance)))
  const data = await fetchJson<Binance24hTicker[]>(`${BINANCE_BASE}/ticker/24hr?symbols=${symbols}`)
  return COINS.flatMap((coin) => {
    const ticker = data.find((d) => d.symbol === coin.binance)
    if (!ticker) return []
    const price = Number(ticker.lastPrice)
    const changePct24h = Number(ticker.priceChangePercent)
    if (!Number.isFinite(price)) return []
    return [{ symbol: coin.ticker, name: coin.name, price, changePct24h }]
  })
}

/** Kline row: [openTime, open, high, low, close, volume, ...] as strings/numbers */
type KlineRow = [number, string, string, string, string, ...unknown[]]

export async function fetchCandles(
  symbol: BinanceSymbol,
  interval: '4h' | '1d' | '1w',
  limit: number,
): Promise<Candle[]> {
  const data = await fetchJson<KlineRow[]>(
    `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  )
  return data
    .map((k) => ({
      time: Number(k[0]),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
    }))
    .filter((c) => Number.isFinite(c.close))
}

/** ~7 days of 4h closes for mini sparklines */
export async function fetchCoinSparkline(symbol: BinanceSymbol): Promise<number[]> {
  const candles = await fetchCandles(symbol, '4h', 42)
  return candles.map((c) => c.close)
}
