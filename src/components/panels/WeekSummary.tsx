import { formatPrice } from '../../lib/format'
import { useQuotes } from '../../lib/queries'
import { ChangePct } from './ChangePct'
import { Panel } from './Panel'

const SESSIONS_PER_WEEK = 5

/** Index performance over the last ~5 trading sessions, from the daily sparkline. */
export function WeekSummary({ className }: { className?: string }) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useQuotes()
  const indexes = (data?.quotes ?? []).filter(
    (q) => !('error' in q) && q.group === 'index',
  )

  return (
    <Panel
      title="Weekly Index Moves"
      accent="blue"
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      <table className="w-full text-sm">
        <tbody>
          {indexes.map((quote) => {
            if ('error' in quote) return null
            const closes = quote.sparkline
            const weekAgo = closes.length > SESSIONS_PER_WEEK ? closes[closes.length - 1 - SESSIONS_PER_WEEK] : null
            const weekPct =
              weekAgo !== null && weekAgo !== 0 ? ((quote.price - weekAgo) / weekAgo) * 100 : null
            return (
              <tr key={quote.symbol} className="border-b border-wall-border/40 last:border-0">
                <td className="py-1.5 pr-2 text-wall-muted">{quote.label}</td>
                <td className="py-1.5 pr-2 text-right font-mono text-slate-200">
                  {formatPrice(quote.price)}
                </td>
                <td className="py-1.5 text-right">
                  <ChangePct value={weekPct} className="text-xs" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-wall-muted">Change over the last 5 trading sessions</p>
    </Panel>
  )
}
