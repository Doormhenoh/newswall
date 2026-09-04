import { useCallback, useEffect, useRef, useState } from 'react'
import { QUOTE_SYMBOLS } from '../../../server/symbols'
import type { Quote, QuoteError } from '../../types'
import { formatPrice } from '../../lib/format'
import { useQuotes } from '../../lib/queries'
import { trendOf } from '../../lib/signals'
import { ChangePct } from './ChangePct'
import { Sparkline } from './Sparkline'

const SPEED_PX_PER_SEC = 40
const SCROLL_STEP = 200
const MOMENTUM_DECAY = 0.95
const MOMENTUM_MIN = 0.5

function ScrollButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Scroll ${direction}`}
      onClick={onClick}
      className="absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-wall-card/80 text-wall-muted shadow-[var(--shadow-card)] backdrop-blur-sm transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] hover:bg-wall-card hover:text-white hover:shadow-[var(--shadow-card-hover)] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      style={{ [direction === 'left' ? 'left' : 'right']: '6px' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d={direction === 'left' ? 'M9 2L4 7L9 12' : 'M5 2L10 7L5 12'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function CarouselCard({ quote }: { quote: Quote | QuoteError }) {
  if ('error' in quote) {
    return (
      <div className="w-40 shrink-0 rounded-md bg-wall-card p-3 shadow-[var(--shadow-card)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] sm:w-44">
        <div className="text-xs font-semibold uppercase tracking-wide text-wall-muted">
          {quote.label}
        </div>
        <div className="mt-2 text-sm text-wall-muted">unavailable</div>
      </div>
    )
  }
  return (
    <div className="w-40 shrink-0 rounded-md bg-wall-card p-3 shadow-[var(--shadow-card)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] sm:w-44">
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

  const dragRef = useRef({ active: false, startX: 0, startOffset: 0, lastX: 0, lastTime: 0, velocity: 0 })
  const momentumRef = useRef<number | null>(null)

  const quotes = (data?.quotes ?? []).filter((q) => {
    const def = QUOTE_SYMBOLS[q.symbol] as (typeof QUOTE_SYMBOLS)[keyof typeof QUOTE_SYMBOLS] | undefined
    return def !== undefined
  })

  const clampOffset = useCallback((offset: number) => {
    const el = scrollRef.current
    if (!el) return offset
    const halfWidth = el.scrollWidth / 2
    if (halfWidth > 0) {
      let o = offset % halfWidth
      if (o < 0) o += halfWidth
      return o
    }
    return Math.max(0, offset)
  }, [])

  const setScroll = useCallback((offset: number) => {
    const el = scrollRef.current
    if (!el) return
    offsetRef.current = clampOffset(offset)
    el.scrollLeft = offsetRef.current
  }, [clampOffset])

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

  const stopMomentum = useCallback(() => {
    if (momentumRef.current !== null) {
      cancelAnimationFrame(momentumRef.current)
      momentumRef.current = null
    }
  }, [])

  const startMomentum = useCallback((velocity: number) => {
    stopMomentum()
    let v = velocity
    function tick() {
      v *= MOMENTUM_DECAY
      if (Math.abs(v) < MOMENTUM_MIN) {
        momentumRef.current = null
        return
      }
      setScroll(offsetRef.current + v)
      momentumRef.current = requestAnimationFrame(tick)
    }
    momentumRef.current = requestAnimationFrame(tick)
  }, [stopMomentum, setScroll])

  const handlePause = useCallback(() => {
    stopMomentum()
    setPaused(true)
  }, [stopMomentum])

  const handleResume = useCallback(() => {
    if (dragRef.current.active) return
    lastTimeRef.current = 0
    setPaused(false)
  }, [])

  const scrollBy = useCallback((dir: 'left' | 'right') => {
    stopMomentum()
    setPaused(true)
    const target = offsetRef.current + (dir === 'left' ? -SCROLL_STEP : SCROLL_STEP)
    const start = offsetRef.current
    const delta = target - start
    const duration = 300
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScroll(start + delta * eased)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [stopMomentum, setScroll])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const el = scrollRef.current
    if (!el) return
    stopMomentum()
    dragRef.current = { active: true, startX: e.clientX, startOffset: offsetRef.current, lastX: e.clientX, lastTime: e.timeStamp, velocity: 0 }
    setPaused(true)
    el.setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [stopMomentum])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = dragRef.current.startX - e.clientX
    setScroll(dragRef.current.startOffset + dx)

    const dt = e.timeStamp - dragRef.current.lastTime
    if (dt > 0) {
      dragRef.current.velocity = (dragRef.current.lastX - e.clientX) / dt * 16
    }
    dragRef.current.lastX = e.clientX
    dragRef.current.lastTime = e.timeStamp
  }, [setScroll])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const velocity = dragRef.current.velocity
    dragRef.current.active = false
    const el = scrollRef.current
    if (el) el.releasePointerCapture(e.pointerId)
    if (Math.abs(velocity) > 1) {
      startMomentum(velocity)
    }
  }, [startMomentum])

  if (isPending && quotes.length === 0) {
    return (
      <div
        className={`overflow-hidden rounded-lg bg-wall-panel p-2 shadow-[var(--shadow-panel)] ${className ?? ''}`}
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
      className={`relative rounded-lg bg-wall-panel p-2 shadow-[var(--shadow-panel)] ${className ?? ''}`}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
    >
      <ScrollButton direction="left" onClick={() => scrollBy('left')} />
      <ScrollButton direction="right" onClick={() => scrollBy('right')} />
      <div
        ref={scrollRef}
        className="flex cursor-grab gap-1.5 overflow-hidden select-none active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
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
