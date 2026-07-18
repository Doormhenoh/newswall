import { clsx } from 'clsx'
import { DOWN_MARK, UP_MARK } from '../../lib/accents'
import { useFearGreed } from '../../lib/queries'
import { fearGreedZone, type FearGreedZone } from '../../lib/signals'
import { Panel } from './Panel'
import { Sparkline } from './Sparkline'

// Arc fill color per zone; the zone NAME is always rendered as text beside the
// value, so color never carries the meaning alone. Keyed by the same zone
// labels signals.ts computes, so the thresholds live in exactly one place.
const ZONE_COLORS: Record<FearGreedZone, string> = {
  'Extreme Fear': DOWN_MARK,
  Fear: '#ea580c',
  Neutral: '#ca8a04',
  Greed: '#65a30d',
  'Extreme Greed': UP_MARK,
}

const ARC_RADIUS = 80
const ARC_LENGTH = Math.PI * ARC_RADIUS

export function FearGreedGauge({ className }: { className?: string }) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useFearGreed()

  const value = data?.current.value ?? 0
  const zone = fearGreedZone(value)
  const color = ZONE_COLORS[zone]
  const history = data?.history.map((p) => p.value) ?? []
  const monthAgo = data?.history[0]?.value
  const monthTrend =
    monthAgo === undefined || history.length < 2 ? 'flat' : value >= monthAgo ? 'up' : 'down'

  return (
    <Panel
      title="Crypto Fear & Greed"
      accent="orange"
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      {data && (
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 200 112" className="w-48" aria-hidden="true">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#232330"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(value / 100) * ARC_LENGTH} ${ARC_LENGTH}`}
            />
            <text
              x="100"
              y="86"
              textAnchor="middle"
              className="fill-slate-100"
              fontSize="36"
              fontWeight="700"
              fontFamily="monospace"
            >
              {value}
            </text>
          </svg>
          <div className={clsx('text-sm font-bold uppercase tracking-widest')} style={{ color }}>
            {zone}
          </div>
          <div className="mt-3 w-full">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-wall-muted">
              30-day trend
            </div>
            <Sparkline data={history} trend={monthTrend} className="h-8 w-full" />
          </div>
        </div>
      )}
    </Panel>
  )
}
