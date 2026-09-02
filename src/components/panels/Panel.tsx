import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { ACCENT_STYLES, type Accent } from '../../lib/accents'
import { timeAgo } from '../../lib/format'

interface PanelProps {
  title: string
  accent: Accent
  badge?: string
  updatedAt?: number
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
  children?: ReactNode
}

function Skeleton() {
  return (
    <div className="space-y-3 py-1" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-3 rounded"
          style={{
            width: `${90 - i * 12}%`,
            background: 'linear-gradient(90deg, var(--color-wall-border) 25%, var(--color-wall-card) 50%, var(--color-wall-border) 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s var(--ease-in-out) infinite`,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Shared card shell: accent border, section badge, "as of" timestamp, and
 * per-panel loading/error states so one dead source never blanks the page.
 */
export function Panel({
  title,
  accent,
  badge,
  updatedAt,
  isLoading,
  isError,
  onRetry,
  className,
  children,
}: PanelProps) {
  const styles = ACCENT_STYLES[accent]
  return (
    <section className={clsx('flex flex-col rounded-xl border-t-2 bg-wall-panel shadow-[var(--shadow-panel)]', styles.borderT, className)}>
      <header className="flex items-center gap-2 border-b border-wall-border/40 px-3 py-2">
        {badge && (
          <span
            className={clsx(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold',
              styles.badge,
            )}
          >
            {badge}
          </span>
        )}
        <h2 className={clsx('text-xs font-bold uppercase tracking-widest', styles.text)}>{title}</h2>
        {updatedAt !== undefined && updatedAt > 0 && (
          <span className="ml-auto text-[10px] text-wall-muted">{timeAgo(updatedAt)}</span>
        )}
      </header>
      <div className="flex-1 p-2.5">
        {isError ? (
          <div className="flex flex-col items-center gap-2 py-6 text-sm text-wall-muted">
            <span>Data unavailable</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded border border-wall-border px-3 py-1 text-xs text-slate-300 transition-[background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-wall-card hover:shadow-[var(--shadow-card)]"
              >
                Retry
              </button>
            )}
          </div>
        ) : isLoading ? (
          <Skeleton />
        ) : (
          <div style={{ animation: 'fade-in var(--duration-normal) var(--ease-out) both' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
