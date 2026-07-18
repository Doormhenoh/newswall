// Shared API response shapes. The client imports these type-only,
// so no server code ends up in the browser bundle.

export interface Quote {
  symbol: string
  label: string
  group: 'index' | 'commodity'
  price: number
  change: number | null
  changePct: number | null
  currency: string
  /** Unix ms of the latest market data point */
  marketTime: number | null
  /** Recent daily closes, oldest first (~1 month) */
  sparkline: number[]
  source: 'yahoo' | 'stooq'
}

export interface QuoteError {
  symbol: string
  label: string
  error: true
}

export interface QuotesResponse {
  quotes: (Quote | QuoteError)[]
  asOf: number
}

export interface NewsItem {
  title: string
  link: string | null
  source: string
  /** Unix ms, null when the feed omitted a usable date */
  publishedAt: number | null
}

export interface NewsResponse {
  items: NewsItem[]
  asOf: number
}
