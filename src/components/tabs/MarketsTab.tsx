import { NewsPanel } from '../panels/NewsPanel'
import { QuoteGrid } from '../panels/QuoteGrid'

export function MarketsTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <QuoteGrid title="Indexes" accent="magenta" badge="3" group="index" />
      <QuoteGrid title="Commodities & Energy" accent="yellow" group="commodity" />
      <NewsPanel feed="markets" title="Markets News" accent="magenta" limit={12} />
      <NewsPanel feed="energy" title="Energy News" accent="yellow" limit={12} />
    </div>
  )
}
