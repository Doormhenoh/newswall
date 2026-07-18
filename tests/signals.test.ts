import { describe, expect, it } from 'vitest'
import { computeKeyLevels, fearGreedZone, pctFrom, sma } from '../src/lib/signals'
import type { Candle } from '../src/types'

function candle(close: number, i = 0): Candle {
  return { time: i, open: close, high: close * 1.02, low: close * 0.98, close }
}

describe('sma', () => {
  it('averages the last N values', () => {
    expect(sma([1, 2, 3, 4], 2)).toBe(3.5)
    expect(sma([10, 20, 30], 3)).toBe(20)
  })

  it('returns null when there is not enough data', () => {
    expect(sma([1, 2], 3)).toBeNull()
    expect(sma([], 1)).toBeNull()
    expect(sma([1], 0)).toBeNull()
  })
})

describe('computeKeyLevels', () => {
  it('returns null for empty history', () => {
    expect(computeKeyLevels([], [])).toBeNull()
  })

  it('computes price, range, and support/resistance', () => {
    const daily = Array.from({ length: 365 }, (_, i) => candle(100 + i * 0.1, i))
    const weekly = Array.from({ length: 210 }, (_, i) => candle(90 + i * 0.2, i))
    const levels = computeKeyLevels(daily, weekly)
    expect(levels).not.toBeNull()
    expect(levels!.price).toBeCloseTo(100 + 364 * 0.1)
    // highest high of last 365 daily candles: last close * 1.02
    expect(levels!.high52w).toBeCloseTo((100 + 364 * 0.1) * 1.02)
    // lowest low: first close * 0.98
    expect(levels!.low52w).toBeCloseTo(100 * 0.98)
    expect(levels!.ma200d).not.toBeNull()
    expect(levels!.ma200w).not.toBeNull()
    // support (30d min low) below resistance (30d max high)
    expect(levels!.support30d).toBeLessThan(levels!.resistance30d)
  })

  it('returns null MAs when history is too short', () => {
    const daily = Array.from({ length: 50 }, (_, i) => candle(100, i))
    const levels = computeKeyLevels(daily, [])
    expect(levels!.ma200d).toBeNull()
    expect(levels!.ma200w).toBeNull()
  })
})

describe('pctFrom', () => {
  it('computes signed distance', () => {
    expect(pctFrom(110, 100)).toBeCloseTo(10)
    expect(pctFrom(90, 100)).toBeCloseTo(-10)
  })

  it('handles null and zero levels', () => {
    expect(pctFrom(100, null)).toBeNull()
    expect(pctFrom(100, 0)).toBeNull()
  })
})

describe('fearGreedZone', () => {
  it('maps values to zones at the boundaries', () => {
    expect(fearGreedZone(0)).toBe('Extreme Fear')
    expect(fearGreedZone(25)).toBe('Extreme Fear')
    expect(fearGreedZone(26)).toBe('Fear')
    expect(fearGreedZone(45)).toBe('Fear')
    expect(fearGreedZone(50)).toBe('Neutral')
    expect(fearGreedZone(75)).toBe('Greed')
    expect(fearGreedZone(76)).toBe('Extreme Greed')
    expect(fearGreedZone(100)).toBe('Extreme Greed')
  })
})
