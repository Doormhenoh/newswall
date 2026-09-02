import { useCallback, useEffect, useRef, useState } from 'react'
import { QUOTE_SYMBOLS } from '../../../server/symbols'
import type { Quote, QuoteError } from '../../types'
import { formatPrice } from '../../lib/format'
import { useQuotes } from '../../lib/queries'
import { trendOf } from '../../lib/signals'
import { ChangePct } from './ChangePct'
import { Sparkline } from './Sparkline'

const SPEED_PX_PER_SEC = 40

function CarouselCard({ quote }: { quote: Quote | QuoteError }) {
  if ('error' in quote) {
    return (
      <div className="w-40 shrink-0 rounded-md bg-wall-card p-3 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:w-44">
        <div className="text-xs font-semibold uppercase tracking-wide text-wall-muted">
          {quote.label}
        </div>
        <div className="mt-2 text-sm text-wall-muted">unavailable</div>
      </div>
    )
  }
  return (
    <div className="w-40 shrink-0 rounded-md bg-wall-card p-3 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:w-44">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-wall-muted">
          {quote.label}
        </span>
        <ChangePct value={quote.changePct} className="text-xs" />
      </div>
      <div className="mt-1 font-mono tabular-nums text-lg text-slate-100">{formatPrice(quote.price)}</div>
      <Sparkline
        data={quote.sparkline}
        trend={trendOf(quote.changePct)}
        className="mt-2 h-9 w-full"
      />
    </div>
  )
}

export function QuoteCarousel({ className }: { className?: string }) {
  const { data, isPending } = useQuotes()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const offsetRef = useRef(0)
  const lastTimeRef = useRef(0)

  const quotes = (data?.quotes ?? []).filter((q) => {
    const def = QUOTE_SYMBOLS[q.symbol] as (typeof QUOTE_SYMBOLS)[keyof typeof QUOTE_SYMBOLS] | undefined
    return def !== undefined
  })

  const animate = useCallback(
    (time: number) => {
      const el = scrollRef.current
      if (!el || paused || quotes.length === 0) {
        lastTimeRef.current = time
        return
      }

      if (lastTimeRef.current > 0) {
        const dt = (time - lastTimeRef.current) / 1000
        offsetRef.current += SPEED_PX_PER_SEC * dt

        const halfWidth = el.scrollWidth / 2
        if (halfWidth > 0 && offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth
        }

        el.scrollLeft = offsetRef.current
      }

      lastTimeRef.current = time
    },
    [paused, quotes.length],
  )

  useEffect(() => {
    let rafId: number
    function loop(time: number) {
      animate(time)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [animate])

  const handlePause = useCallback(() => setPaused(true), [])
  const handleResume = useCallback(() => {
    lastTimeRef.current = 0
    setPaused(false)
  }, [])

  if (isPending && quotes.length === 0) {
    return (
      <div
        className={`overflow-hidden rounded-xl bg-wall-panel p-2 shadow-[var(--shadow-panel)] ${className ?? ''}`}
      >
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 w-40 shrink-0 rounded-md sm:w-44"
              style={{
                background: 'linear-gradient(90deg, var(--color-wall-card) 25%, var(--color-wall-border) 50%, var(--color-wall-card) 75%)',
                backgroundSize: '200% 100%',
                animation: `shimmer 1.5s var(--ease-in-out) infinite`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label="Market quotes carousel"
      className={`overflow-hidden rounded-xl bg-wall-panel p-2 shadow-[var(--shadow-panel)] ${className ?? ''}`}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
    >
      <div ref={scrollRef} className="flex gap-1.5 overflow-hidden">
        {quotes.map((q) => (
          <CarouselCard key={q.symbol} quote={q} />
        ))}
        {quotes.map((q) => (
          <CarouselCard key={`dup-${q.symbol}`} quote={q} />
        ))}
      </div>
    </div>
  )
}
