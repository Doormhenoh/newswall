// API response shapes come type-only from the server layer — no runtime import.
export type {
  NewsItem,
  NewsResponse,
  Quote,
  QuoteError,
  QuotesResponse,
} from '../../server/types'

export interface CoinTicker {
  /** Display ticker, e.g. "BTC" */
  symbol: string
  name: string
  price: number
  changePct24h: number
}

export interface FearGreedPoint {
  value: number
  timestamp: number
}

export interface FearGreedData {
  current: FearGreedPoint
  /** Oldest first */
  history: FearGreedPoint[]
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface KeyLevels {
  price: number
  ma200d: number | null
  ma200w: number | null
  high52w: number
  low52w: number
  support30d: number
  resistance30d: number
}
