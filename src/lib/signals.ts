import type { Candle, KeyLevels } from '../types'

// Pure functions — the dashboard's computed replacement for editorial commentary.

/** Simple moving average over the LAST `period` values; null if not enough data. */
export function sma(values: number[], period: number): number | null {
  if (period <= 0 || values.length < period) return null
  const window = values.slice(-period)
  return window.reduce((sum, v) => sum + v, 0) / period
}

/**
 * Key levels from daily + weekly candle history (oldest first).
 * Note: the most recent candle may be in progress; acceptable for level display.
 */
export function computeKeyLevels(daily: Candle[], weekly: Candle[]): KeyLevels | null {
  const closes = daily.map((c) => c.close)
  const price = closes.at(-1)
  if (price === undefined) return null

  const month = daily.slice(-30)
  return {
    price,
    ma200d: sma(closes, 200),
    ma200w: sma(
      weekly.map((c) => c.close),
      200,
    ),
    ma50w: sma(
      weekly.map((c) => c.close),
      50,
    ),
    support30d: Math.min(...month.map((c) => c.low)),
    resistance30d: Math.max(...month.map((c) => c.high)),
  }
}

/** Signed % distance of price from a level, e.g. +4.2 means price is 4.2% above. */
export function pctFrom(price: number, level: number | null): number | null {
  if (level === null || level === 0) return null
  return ((price - level) / level) * 100
}

export type Trend = 'up' | 'down' | 'flat'

export function trendOf(changePct: number | null): Trend {
  if (changePct === null || changePct === 0) return 'flat'
  return changePct > 0 ? 'up' : 'down'
}

export type FearGreedZone = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'

export function fearGreedZone(value: number): FearGreedZone {
  if (value <= 25) return 'Extreme Fear'
  if (value <= 45) return 'Fear'
  if (value <= 55) return 'Neutral'
  if (value <= 75) return 'Greed'
  return 'Extreme Greed'
}
