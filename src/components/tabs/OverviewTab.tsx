import { FearGreedGauge } from '../panels/FearGreedGauge'
import { KeyLevels } from '../panels/KeyLevels'
import { NewsPanel } from '../panels/NewsPanel'
import { QuoteGrid } from '../panels/QuoteGrid'
import { TickerStrip } from '../panels/TickerStrip'
import { WeekSummary } from '../panels/WeekSummary'

export function OverviewTab() {
  return (
    <div className="space-y-3">
      <TickerStrip />
      <QuoteGrid title="Market Snapshot" accent="purple" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <FearGreedGauge />
        <KeyLevels />
        <WeekSummary />
        <NewsPanel feed="geo" title="Geo / War" accent="red" badge="1" limit={4} />
        <NewsPanel feed="macro" title="Macro / Policy" accent="blue" badge="2" limit={4} />
        <NewsPanel feed="markets" title="Markets" accent="magenta" badge="3" limit={4} />
        <NewsPanel feed="tech" title="Tech / AI" accent="green" badge="4" limit={4} />
        <NewsPanel feed="corporate" title="Corporates / Deals" accent="yellow" badge="5" limit={4} />
        <NewsPanel feed="crypto" title="Crypto" accent="orange" badge="6" limit={4} />
      </div>
    </div>
  )
}
