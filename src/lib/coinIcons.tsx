const SIZE = 20

const icons: Record<string, { bg: string; letter: string }> = {
  BTC: { bg: '#f7931a', letter: 'B' },
  ETH: { bg: '#627eea', letter: 'E' },
  SOL: { bg: '#9945ff', letter: 'S' },
  XRP: { bg: '#23292f', letter: 'X' },
  BNB: { bg: '#f0b90b', letter: 'B' },
  DOGE: { bg: '#c2a633', letter: 'D' },
}

export function CoinIcon({ symbol, size = SIZE }: { symbol: string; size?: number }) {
  const icon = icons[symbol]
  if (!icon) return null
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={r} cy={r} r={r} fill={icon.bg} />
      <text
        x={r}
        y={r}
        dy=".35em"
        textAnchor="middle"
        fill="#fff"
        fontSize={size * 0.5}
        fontWeight="700"
        fontFamily="var(--font-body)"
      >
        {icon.letter}
      </text>
    </svg>
  )
}
