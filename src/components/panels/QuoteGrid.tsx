import { QUOTE_SYMBOLS } from '../../../server/symbols'
import type { Quote, QuoteError } from '../../types'
import type { Accent } from '../../lib/accents'
import { formatPrice } from '../../lib/format'
import { ALL_QUOTE_SYMBOLS, useQuotes } from '../../lib/queries'
import { trendOf } from '../../lib/signals'
import { ChangePct } from './ChangePct'
import { Panel } from './Panel'
import { Sparkline } from './Sparkline'

// Derived from the server allowlist so group membership can never drift
// from the symbols the API actually recognizes.
function symbolsInGroup(group: 'index' | 'commodity'): string[] {
  return Object.entries(QUOTE_SYMBOLS)
    .filter(([, def]) => def.group === group)
    .map(([symbol]) => symbol)
}

interface QuoteGridProps {
  title: string
  accent: Accent
  badge?: string
  /** Filter by group, or pass explicit symbols; defaults to all */
  group?: 'index' | 'commodity'
  symbols?: readonly string[]
  className?: string
}

function QuoteCard({ quote }: { quote: Quote | QuoteError }) {
  if ('error' in quote) {
    return (
      <div className="rounded-md border border-wall-border bg-wall-card p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-wall-muted">
          {quote.label}
        </div>
        <div className="mt-2 text-sm text-wall-muted">unavailable</div>
      </div>
    )
  }
  return (
    <div className="rounded-md border border-wall-border bg-wall-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-wall-muted">
          {quote.label}
        </span>
        <ChangePct value={quote.changePct} className="text-xs" />
      </div>
      <div className="mt-1 font-mono text-lg text-slate-100">{formatPrice(quote.price)}</div>
      <Sparkline
        data={quote.sparkline}
        trend={trendOf(quote.changePct)}
        className="mt-2 h-9 w-full"
      />
    </div>
  )
}

export function QuoteGrid({ title, accent, badge, group, symbols, className }: QuoteGridProps) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useQuotes()
  const wanted = symbols ?? (group ? symbolsInGroup(group) : ALL_QUOTE_SYMBOLS)
  const visible = (data?.quotes ?? []).filter((q) => wanted.includes(q.symbol))

  return (
    <Panel
      title={title}
      accent={accent}
      badge={badge}
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {visible.map((quote) => (
          <QuoteCard key={quote.symbol} quote={quote} />
        ))}
      </div>
    </Panel>
  )
}
