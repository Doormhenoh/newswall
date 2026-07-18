import { useEffect, useState } from 'react'
import { formatClock, formatDateLong } from '../../lib/format'

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function Header() {
  const now = useNow(30_000)
  return (
    <header className="sticky top-0 z-20 border-b border-wall-border bg-wall-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <h1 className="font-display text-xl tracking-wide text-slate-100">
          DAILY NEWS <span className="text-red-500">WALL</span>
        </h1>
        <span className="rounded bg-red-700 px-3 py-1 text-sm font-bold tracking-wider text-white">
          {formatDateLong(now)} (LIVE)
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs text-wall-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          LIVE · {formatClock(now)}
        </span>
      </div>
    </header>
  )
}
