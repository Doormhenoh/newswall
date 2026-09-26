import type { CoinTicker } from '../../types'
import { COINS } from '../../lib/binance'
import type { BinanceSymbol } from '../../lib/binance'
import { CoinIcon } from '../../lib/coinIcons'
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
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-wall-text-secondary">
          <CoinIcon symbol={coin.symbol} size={18} />
          {coin.symbol}
          <span className="font-normal normal-case text-wall-muted">{coin.name}</span>
        </span>
        <ChangePct value={coin.changePct24h} className="text-xs" />
      </div>
      <div className="mt-1 font-mono text-lg text-wall-text">${formatPrice(coin.price)}</div>
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
      icon="coins"
      accent="orange"
            updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
        {(data ?? []).map((coin) => (
          <CoinCard key={coin.symbol} coin={coin} />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-wall-muted">24h change · 7-day sparkline · Binance</p>
    </Panel>
  )
}
