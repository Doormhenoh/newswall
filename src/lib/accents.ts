// Section accent colors (UI chrome, always paired with text labels) and the
// validated up/down mark colors (dataviz-checked against the dark card surface;
// values always carry a signed % label, so color is never the only encoding).

export type Accent = 'red' | 'blue' | 'magenta' | 'green' | 'orange' | 'yellow' | 'purple'

interface AccentStyle {
  text: string
  border: string
  borderB: string
  borderT: string
  badge: string
}

// All class names are literal strings so Tailwind's content scanner sees them.
export const ACCENT_STYLES: Record<Accent, AccentStyle> = {
  red: {
    text: 'text-red-400',
    border: 'border-red-500/30',
    borderB: 'border-b-red-500',
    borderT: 'border-t-red-500/80',
    badge: 'bg-red-500/15 text-red-400',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    borderB: 'border-b-blue-500',
    borderT: 'border-t-blue-500/80',
    badge: 'bg-blue-500/15 text-blue-400',
  },
  magenta: {
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/30',
    borderB: 'border-b-fuchsia-500',
    borderT: 'border-t-fuchsia-500/80',
    badge: 'bg-fuchsia-500/15 text-fuchsia-400',
  },
  green: {
    text: 'text-green-400',
    border: 'border-green-500/30',
    borderB: 'border-b-green-500',
    borderT: 'border-t-green-500/80',
    badge: 'bg-green-500/15 text-green-400',
  },
  orange: {
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    borderB: 'border-b-orange-500',
    borderT: 'border-t-orange-500/80',
    badge: 'bg-orange-500/15 text-orange-400',
  },
  yellow: {
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    borderB: 'border-b-sky-500',
    borderT: 'border-t-sky-500/80',
    badge: 'bg-sky-500/15 text-sky-400',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    borderB: 'border-b-purple-500',
    borderT: 'border-t-purple-500/80',
    badge: 'bg-purple-500/15 text-purple-400',
  },
}

/** Mark colors (sparkline strokes, gauge fills) — palette-validator approved */
export const UP_MARK = '#059669'
export const DOWN_MARK = '#ef4444'
export const FLAT_MARK = '#8b8b9e'

/** Text tints for small signed values (brighter for small-size legibility) */
export const UP_TEXT = 'text-emerald-400'
export const DOWN_TEXT = 'text-red-400'
