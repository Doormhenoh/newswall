import { NewsPanel } from '../panels/NewsPanel'
import { QuoteGrid } from '../panels/QuoteGrid'

export function GeoTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <NewsPanel
        feed="geo"
        title="Geopolitics & Conflict"
        accent="red"
        badge="1"
        limit={15}
        className="lg:col-span-2"
      />
      <div className="space-y-3">
        <QuoteGrid title="Oil (Geo Context)" accent="yellow" symbols={['CL=F', 'BZ=F']} />
        <NewsPanel feed="energy" title="Energy" accent="yellow" limit={8} />
      </div>
    </div>
  )
}
