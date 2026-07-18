import { DOWN_MARK, FLAT_MARK, UP_MARK } from '../../lib/accents'

interface SparklineProps {
  data: number[]
  /** Direction decides the validated mark color; the signed % text nearby carries the value */
  trend: 'up' | 'down' | 'flat'
  width?: number
  height?: number
  className?: string
}

const TREND_COLOR = { up: UP_MARK, down: DOWN_MARK, flat: FLAT_MARK } as const

/** Decorative micro-chart inside stat tiles; the numbers are shown as text beside it. */
export function Sparkline({ data, trend, width = 120, height = 36, className }: SparklineProps) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - 2 - ((value - min) / range) * (height - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const color = TREND_COLOR[trend]
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polygon
        points={`0,${height} ${points.join(' ')} ${width},${height}`}
        fill={color}
        opacity="0.12"
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
