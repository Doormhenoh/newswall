import { useMemo } from 'react'
import { useBtcCandles, useCoinTickers, useFearGreed, useNews } from '../../lib/queries'
import { generateMarketPulse } from '../../lib/marketPulse'
import { computeKeyLevels } from '../../lib/signals'
import { Panel } from './Panel'

export function MarketPulse({ className }: { className?: string }) {
  const candles = useBtcCandles()
  const fearGreed = useFearGreed()
  const coins = useCoinTickers()
  const news = useNews('crypto')

  const levels = useMemo(
    () => (candles.data ? computeKeyLevels(candles.data.daily, candles.data.weekly) : null),
    [candles.data],
  )

  const btc = coins.data?.find((c) => c.symbol === 'BTC')
  const fgValue = fearGreed.data?.current.value

  const isReady = levels !== null && btc !== undefined && fgValue !== undefined
  const isPending =
    candles.isPending || fearGreed.isPending || coins.isPending || news.isPending

  const paragraph = useMemo(() => {
    if (!isReady) return ''
    return generateMarketPulse({
      btcPrice: levels.price,
      btcChange24h: btc.changePct24h,
      levels,
      fearGreedValue: fgValue,
      cryptoNewsCount: news.data?.items.length ?? 0,
    })
  }, [isReady, levels, btc, fgValue, news.data?.items.length])

  const earliestUpdate = Math.min(
    candles.dataUpdatedAt || Infinity,
    fearGreed.dataUpdatedAt || Infinity,
    coins.dataUpdatedAt || Infinity,
    news.dataUpdatedAt || Infinity,
  )

  return (
    <Panel
      title="Market Pulse"
      accent="green"
      updatedAt={earliestUpdate === Infinity ? 0 : earliestUpdate}
      isLoading={isPending && !isReady}
      isError={false}
      className={className}
    >
      <p className="text-sm leading-relaxed text-slate-300">{paragraph}</p>
      <p className="mt-2 text-[10px] text-wall-muted">
        Auto-generated from live data — not investment advice.
      </p>
    </Panel>
  )
}
