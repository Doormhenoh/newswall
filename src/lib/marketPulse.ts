import type { KeyLevels } from '../types'
import { formatPrice } from './format'
import { fearGreedZone, pctFrom } from './signals'

export interface MarketPulseInputs {
  btcPrice: number
  btcChange24h: number
  levels: KeyLevels
  fearGreedValue: number
  cryptoNewsCount: number
}

export function generateMarketPulse(inputs: MarketPulseInputs): string {
  const { btcPrice, btcChange24h, levels, fearGreedValue, cryptoNewsCount } = inputs
  const parts: string[] = []

  parts.push(priceContext(btcPrice, levels))
  parts.push(momentum(btcChange24h))
  parts.push(sentiment(fearGreedValue))

  const sr = supportResistance(btcPrice, levels)
  if (sr) parts.push(sr)

  parts.push(newsVolume(cryptoNewsCount))

  return parts.join(' ')
}

function priceContext(price: number, levels: KeyLevels): string {
  const p = `$${formatPrice(price)}`
  const aboveMa = levels.ma200d !== null && price > levels.ma200d
  const distHigh = pctFrom(price, levels.high52w)
  const distLow = pctFrom(price, levels.low52w)

  if (aboveMa && distHigh !== null && distHigh > -5) {
    return `Bitcoin is trading near its 52-week high at ${p}, well above its long-term average.`
  }
  if (aboveMa) {
    return `Bitcoin is at ${p}, holding above its long-term average — a sign the broader trend is still positive.`
  }
  if (!aboveMa && distLow !== null && distLow < 10) {
    return `Bitcoin is trading at ${p} near its 52-week low and below its long-term average, which often signals a prolonged downturn.`
  }
  if (!aboveMa && levels.ma200d !== null) {
    return `Bitcoin is at ${p}, sitting below its long-term average. It may be searching for a floor.`
  }
  return `Bitcoin is trading at ${p}.`
}

function momentum(change24h: number): string {
  const abs = Math.abs(change24h).toFixed(1)
  if (change24h > 5) return `In the last 24 hours alone it jumped ${abs}%, a sharp move up.`
  if (change24h > 0) return `It's up ${abs}% over the past day.`
  if (change24h < -5) return `It dropped ${abs}% in the last 24 hours, a significant sell-off.`
  if (change24h < 0) return `It's down ${abs}% over the past day.`
  return 'It has been mostly flat over the past day.'
}

function sentiment(value: number): string {
  const zone = fearGreedZone(value)
  switch (zone) {
    case 'Extreme Fear':
      return `Market mood is at ${value} out of 100 — deep in fear territory. Historically, extreme fear can mean the market is oversold and due for a bounce.`
    case 'Fear':
      return `Market mood sits at ${value} out of 100, in the cautious zone. Traders are nervous and holding back.`
    case 'Neutral':
      return `Market mood is neutral at ${value} out of 100 — neither panic nor excitement.`
    case 'Greed':
      return `Market mood is at ${value} out of 100, leaning greedy. Confidence is building, but too much optimism can come before a dip.`
    case 'Extreme Greed':
      return `Market mood has hit ${value} out of 100 — extreme optimism. Markets are euphoric, which historically has come right before pullbacks.`
  }
}

function supportResistance(price: number, levels: KeyLevels): string | null {
  const distRes = pctFrom(price, levels.resistance30d)
  const distSup = pctFrom(price, levels.support30d)

  if (distRes !== null && Math.abs(distRes) < 3) {
    return `The price is testing its recent ceiling around $${formatPrice(levels.resistance30d)}.`
  }
  if (distSup !== null && Math.abs(distSup) < 3) {
    return `The price is hovering near its recent floor around $${formatPrice(levels.support30d)}.`
  }
  return null
}

function newsVolume(count: number): string {
  if (count >= 10) return `Crypto headlines are buzzing with ${count} stories in the feed, suggesting a lot of market attention right now.`
  if (count >= 5) return `There are ${count} crypto headlines making the rounds today.`
  return 'Crypto news flow is light today.'
}
