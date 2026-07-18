import { NewsPanel } from '../panels/NewsPanel'
import { QuoteGrid } from '../panels/QuoteGrid'
import { WeekSummary } from '../panels/WeekSummary'

export function MacroTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <NewsPanel
        feed="macro"
        title="Macro / Policy"
        accent="blue"
        badge="2"
        limit={15}
        className="lg:col-span-2"
      />
      <div className="space-y-3">
        <WeekSummary />
        <QuoteGrid title="Gold & Gasoline" accent="yellow" symbols={['GC=F', 'RB=F']} />
      </div>
    </div>
  )
}
