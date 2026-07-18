import { clsx } from 'clsx'
import { formatPrice } from '../../lib/format'
import { useCoinTickers, useQuotes } from '../../lib/queries'
import { ChangePct } from './ChangePct'

const STRIP_SYMBOLS = ['^DJI', '^GSPC', '^IXIC', 'CL=F', 'BZ=F', 'GC=F'] as const

interface StripItem {
  label: string
  price: number
  changePct: number | null
}

function Item({ item, first }: { item: StripItem; first: boolean }) {
  return (
    <div
      className={clsx(
        'flex shrink-0 items-baseline gap-2 px-3 py-2',
        !first && 'border-l border-wall-border/60',
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-wall-muted">
        {item.label}
      </span>
      <span className="font-mono text-sm text-slate-100">{formatPrice(item.price)}</span>
      <ChangePct value={item.changePct} className="text-xs" />
    </div>
  )
}

/** Top ticker strip: indices + commodities from the proxy, BTC/ETH from Binance. */
export function TickerStrip() {
  const quotes = useQuotes()
  const coins = useCoinTickers()

  const items: StripItem[] = []
  for (const symbol of STRIP_SYMBOLS) {
    const quote = quotes.data?.quotes.find((q) => q.symbol === symbol)
    if (quote && !('error' in quote)) {
      items.push({ label: quote.label, price: quote.price, changePct: quote.changePct })
    }
  }
  for (const ticker of ['BTC', 'ETH']) {
    const coin = coins.data?.find((c) => c.symbol === ticker)
    if (coin) items.push({ label: coin.symbol, price: coin.price, changePct: coin.changePct24h })
  }

  if (items.length === 0) {
    return (
      <div className="h-10 animate-pulse rounded-lg border border-wall-border bg-wall-panel" aria-hidden="true" />
    )
  }
  return (
    <div className="flex overflow-x-auto rounded-lg border border-wall-border bg-wall-panel">
      {items.map((item, i) => (
        <Item key={item.label} item={item} first={i === 0} />
      ))}
    </div>
  )
}
