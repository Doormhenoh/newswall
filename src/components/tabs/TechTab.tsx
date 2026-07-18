import { NewsPanel } from '../panels/NewsPanel'

export function TechTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <NewsPanel feed="tech" title="Tech / AI" accent="green" badge="4" limit={14} />
      <NewsPanel feed="corporate" title="Corporates / Deals" accent="yellow" badge="5" limit={14} />
    </div>
  )
}
