import { CryptoGrid } from '../panels/CryptoGrid'
import { FearGreedGauge } from '../panels/FearGreedGauge'
import { KeyLevels } from '../panels/KeyLevels'
import { MarketPulse } from '../panels/MarketPulse'
import { NewsPanel } from '../panels/NewsPanel'
import { QuoteCarousel } from '../panels/QuoteCarousel'
import { TermOfTheDay } from '../panels/TermOfTheDay'
import { WeekSummary } from '../panels/WeekSummary'

export function OverviewTab() {
  return (
    <div className="space-y-2">
      <QuoteCarousel />
      <CryptoGrid />
      <div className="grid gap-2 md:grid-cols-2">
        <FearGreedGauge />
        <KeyLevels />
      </div>
      <MarketPulse />
      <div className="grid gap-2 md:grid-cols-2">
        <TermOfTheDay />
        <WeekSummary />
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <NewsPanel feed="crypto" title="Crypto" accent="orange" limit={4} />
        <NewsPanel feed="markets" title="Markets" accent="magenta" limit={4} />
        <NewsPanel feed="geo" title="Geo / War" accent="red" limit={4} />
        <NewsPanel feed="macro" title="Macro / Policy" accent="blue" limit={4} />
        <NewsPanel feed="tech" title="Tech / AI" accent="green" limit={4} />
        <NewsPanel feed="corporate" title="Corporates / Deals" accent="yellow" limit={4} />
      </div>
    </div>
  )
}
