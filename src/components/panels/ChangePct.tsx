import { clsx } from 'clsx'
import { DOWN_TEXT, UP_TEXT } from '../../lib/accents'
import { formatPct } from '../../lib/format'

export function ChangePct({ value, className }: { value: number | null; className?: string }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={clsx('font-mono text-wall-muted', className)}>—</span>
  }
  return (
    <span className={clsx('font-mono', value >= 0 ? UP_TEXT : DOWN_TEXT, className)}>
      {formatPct(value)}
    </span>
  )
}
