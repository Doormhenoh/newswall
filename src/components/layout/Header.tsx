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
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Wealth Lab" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h1 className="font-display text-xl font-bold tracking-wide text-white">
            Wealth Lab
          </h1>
          <span className="text-wall-muted">|</span>
          <span className="text-sm font-semibold uppercase tracking-widest text-wall-muted">News Wall</span>
        </div>
        <span className="rounded-md bg-gradient-to-r from-blue-500 via-sky-500 to-green-500 px-3 py-1 text-sm font-bold tracking-wider text-white">
          {formatDateLong(now)} (LIVE)
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs text-wall-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          LIVE · {formatClock(now)}
        </span>
      </div>
    </header>
  )
}
