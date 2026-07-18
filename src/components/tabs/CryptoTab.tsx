import { CryptoGrid } from '../panels/CryptoGrid'
import { FearGreedGauge } from '../panels/FearGreedGauge'
import { KeyLevels } from '../panels/KeyLevels'
import { NewsPanel } from '../panels/NewsPanel'

export function CryptoTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <CryptoGrid className="lg:col-span-2" />
      <FearGreedGauge />
      <NewsPanel feed="crypto" title="Crypto News" accent="orange" badge="6" limit={12} className="lg:col-span-2" />
      <KeyLevels />
    </div>
  )
}
