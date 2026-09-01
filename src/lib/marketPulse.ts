import type { KeyLevels } from '../types'
import { formatPrice } from './format'
import { fearGreedZone, pctFrom } from './signals'

export interface MarketPulseInputs {
  btcPrice: number
  btcChange24h: number
  levels: KeyLevels
  fearGreedValue: number
  cryptoNewsTitles: string[]
}

export function generateMarketPulse(inputs: MarketPulseInputs): string {
  const { btcPrice, btcChange24h, levels, fearGreedValue, cryptoNewsTitles } = inputs
  const parts: string[] = []

  parts.push(priceContext(btcPrice, levels))
  parts.push(momentum(btcChange24h))
  parts.push(sentiment(fearGreedValue))

  const sr = supportResistance(btcPrice, levels)
  if (sr) parts.push(sr)

  parts.push(newsContext(cryptoNewsTitles))

  return parts.join(' ')
}

function priceContext(price: number, levels: KeyLevels): string {
  const p = `$${formatPrice(price)}`
  const above200d = levels.ma200d !== null && price > levels.ma200d
  const above50w = levels.ma50w !== null && price > levels.ma50w

  if (above200d && above50w) {
    return `Bitcoin is at ${p}, trading above both its 200-day and 50-week moving averages. That alignment suggests a strong uptrend across both short and long timeframes.`
  }
  if (above200d && !above50w && levels.ma50w !== null) {
    return `Bitcoin is at ${p}, still above its 200-day average but has slipped below the 50-week moving average. The daily trend is positive, though the longer weekly trend shows some weakness.`
  }
  if (!above200d && above50w && levels.ma200d !== null) {
    return `Bitcoin is at ${p}, below its 200-day average but holding above the 50-week moving average. The weekly structure remains intact, though the daily trend needs to recover for full confirmation.`
  }
  if (!above200d && !above50w && levels.ma200d !== null) {
    return `Bitcoin is at ${p}, sitting below both its 200-day and 50-week moving averages. Both timeframes point downward, which typically signals continued bearish pressure.`
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
      return `Market mood is at ${value} out of 100, deep in fear territory. Historically, extreme fear can mean the market is oversold and due for a bounce.`
    case 'Fear':
      return `Market mood sits at ${value} out of 100, in the cautious zone. Traders are nervous and holding back.`
    case 'Neutral':
      return `Market mood is neutral at ${value} out of 100. Neither panic nor excitement is driving the market right now.`
    case 'Greed':
      return `Market mood is at ${value} out of 100, leaning greedy. Confidence is building, but too much optimism can come before a dip.`
    case 'Extreme Greed':
      return `Market mood has hit ${value} out of 100, showing extreme optimism. Markets are euphoric, which historically has come right before pullbacks.`
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

// ─── News theme detection ────────────────────────────────────────────────────

interface ThemeDef {
  label: string
  keywords: string[]
  impact: string
}

const NEWS_THEMES: ThemeDef[] = [
  {
    label: 'regulatory and legal developments',
    keywords: ['sec', 'regulation', 'ban', 'lawsuit', 'compliance', 'law', 'sanction', 'enforce', 'probe', 'subpoena', 'court'],
    impact: 'Regulatory moves tend to create short-term uncertainty as traders weigh how new rules could reshape the market.',
  },
  {
    label: 'ETF and institutional activity',
    keywords: ['etf', 'institutional', 'blackrock', 'fidelity', 'fund', 'grayscale', 'inflow', 'outflow', 'custody'],
    impact: 'Institutional interest usually signals growing mainstream confidence, though large inflows or outflows can amplify price swings.',
  },
  {
    label: 'security incidents',
    keywords: ['hack', 'exploit', 'breach', 'stolen', 'scam', 'fraud', 'vulnerability', 'attack', 'drain'],
    impact: 'Security incidents erode trust in affected projects and can trigger sell-offs as investors move funds to safer positions.',
  },
  {
    label: 'bullish momentum',
    keywords: ['rally', 'surge', 'high', 'bullish', 'soar', 'pump', 'breakout', 'record', 'moon', 'gain'],
    impact: 'Strong upward momentum often attracts more buyers, but rapid rallies can also set the stage for corrections when profit-taking kicks in.',
  },
  {
    label: 'bearish pressure',
    keywords: ['crash', 'plunge', 'dump', 'bearish', 'drop', 'sell-off', 'tumble', 'slump', 'decline', 'loss'],
    impact: 'Sustained negative coverage tends to deepen sell pressure, though sharp drops have historically been followed by relief bounces.',
  },
  {
    label: 'adoption and partnerships',
    keywords: ['adopt', 'accept', 'partner', 'launch', 'integrate', 'payment', 'merchant', 'onboard', 'expand'],
    impact: 'Growing adoption strengthens the long-term case for crypto by expanding real-world utility and broadening the user base.',
  },
]

function newsContext(titles: string[]): string {
  if (titles.length === 0) return 'News flow is quiet today with limited crypto coverage.'

  const counts = new Map<ThemeDef, number>()
  const combined = titles.join(' ').toLowerCase()

  for (const theme of NEWS_THEMES) {
    let hits = 0
    for (const kw of theme.keywords) {
      if (combined.includes(kw)) hits++
    }
    if (hits > 0) counts.set(theme, hits)
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])

  if (ranked.length === 0) {
    return 'News flow is mixed today with no single theme dominating the headlines.'
  }

  const top = ranked[0]!
  const second = ranked.length > 1 ? ranked[1] : undefined

  if (second && second[1] >= top[1] * 0.6) {
    return `Recent headlines are focused on ${top[0].label} and ${second[0].label}. ${top[0].impact}`
  }

  return `Recent headlines are centered around ${top[0].label}. ${top[0].impact}`
}
