import { formatPrice } from '../../lib/format'
import { useBtcCandles } from '../../lib/queries'
import { computeKeyLevels, pctFrom } from '../../lib/signals'
import { ChangePct } from './ChangePct'
import { Panel } from './Panel'

/** Computed BTC levels — the dashboard's data-driven stand-in for editorial "watch levels". */
export function KeyLevels({ className }: { className?: string }) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useBtcCandles()
  const levels = data ? computeKeyLevels(data.daily, data.weekly) : null

  const rows = levels
    ? [
        { label: '200-day MA', value: levels.ma200d },
        { label: '200-week MA', value: levels.ma200w },
        { label: '50-week MA', value: levels.ma50w },
        { label: '30-day support', value: levels.support30d },
        { label: '30-day resistance', value: levels.resistance30d },
      ]
    : []

  return (
    <Panel
      title="BTC Key Levels"
      accent="purple"
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      {levels && (
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-wall-muted">BTC/USD</span>
            <span className="font-mono text-xl text-slate-100">${formatPrice(levels.price)}</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-wall-border/40 last:border-0">
                  <td className="py-1.5 pr-2 text-wall-muted">{row.label}</td>
                  <td className="py-1.5 pr-2 text-right font-mono text-slate-200">
                    {row.value !== null ? `$${formatPrice(row.value)}` : '—'}
                  </td>
                  <td className="py-1.5 text-right">
                    <ChangePct value={pctFrom(levels.price, row.value)} className="text-xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] leading-snug text-wall-muted">
            % = distance of current price from each level. Computed from Binance daily/weekly
            candles — not investment advice.
          </p>
        </div>
      )}
    </Panel>
  )
}
