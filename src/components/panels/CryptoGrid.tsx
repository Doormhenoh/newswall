import type { CoinTicker } from '../../types'
import { COINS } from '../../lib/binance'
import type { BinanceSymbol } from '../../lib/binance'
import { formatPrice } from '../../lib/format'
import { useCoinSparkline, useCoinTickers } from '../../lib/queries'
import { trendOf } from '../../lib/signals'
import { ChangePct } from './ChangePct'
import { Panel } from './Panel'
import { Sparkline } from './Sparkline'

function binanceSymbolFor(ticker: string): BinanceSymbol | null {
  return COINS.find((c) => c.ticker === ticker)?.binance ?? null
}

function CoinCard({ coin }: { coin: CoinTicker }) {
  const symbol = binanceSymbolFor(coin.symbol)
  const spark = useCoinSparkline(symbol ?? 'BTCUSDT')
  return (
    <div className="rounded-md border border-wall-border bg-wall-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
          {coin.symbol}
          <span className="ml-1.5 font-normal normal-case text-wall-muted">{coin.name}</span>
        </span>
        <ChangePct value={coin.changePct24h} className="text-xs" />
      </div>
      <div className="mt-1 font-mono text-lg text-slate-100">${formatPrice(coin.price)}</div>
      {spark.data && (
        <Sparkline data={spark.data} trend={trendOf(coin.changePct24h)} className="mt-2 h-9 w-full" />
      )}
    </div>
  )
}

export function CryptoGrid({ className }: { className?: string }) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useCoinTickers()
  return (
    <Panel
      title="Crypto Prices"
      accent="orange"
      badge="6"
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {(data ?? []).map((coin) => (
          <CoinCard key={coin.symbol} coin={coin} />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-wall-muted">24h change · 7-day sparkline · Binance</p>
    </Panel>
  )
}
