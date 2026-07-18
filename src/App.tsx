import { useState, type ComponentType } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/layout/Header'
import { TabBar, type TabDef } from './components/layout/TabBar'
import { CryptoTab } from './components/tabs/CryptoTab'
import { GeoTab } from './components/tabs/GeoTab'
import { MacroTab } from './components/tabs/MacroTab'
import { MarketsTab } from './components/tabs/MarketsTab'
import { OverviewTab } from './components/tabs/OverviewTab'
import { TechTab } from './components/tabs/TechTab'

const TABS = [
  { id: 'overview', label: 'Overview', accent: 'yellow' },
  { id: 'markets', label: 'Markets & Energy', accent: 'magenta' },
  { id: 'crypto', label: 'Crypto', accent: 'orange' },
  { id: 'geo', label: 'Geo / War', accent: 'red' },
  { id: 'macro', label: 'Macro & Policy', accent: 'blue' },
  { id: 'tech', label: 'Tech & Corporates', accent: 'green' },
] as const satisfies readonly TabDef<string>[]

type TabId = (typeof TABS)[number]['id']

const TAB_CONTENT: Record<TabId, ComponentType> = {
  overview: OverviewTab,
  markets: MarketsTab,
  crypto: CryptoTab,
  geo: GeoTab,
  macro: MacroTab,
  tech: TechTab,
}

export default function App() {
  const [active, setActive] = useState<TabId>('overview')
  const ActiveTab = TAB_CONTENT[active]
  return (
    <div className="min-h-screen">
      <Header />
      <TabBar tabs={TABS} active={active} onChange={setActive} />
      <main
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mx-auto max-w-7xl px-4 py-4"
      >
        {/* keyed by tab id so switching tabs remounts a crashed boundary */}
        <ErrorBoundary key={active}>
          <ActiveTab />
        </ErrorBoundary>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 text-center text-[10px] text-wall-muted">
        Data: Yahoo Finance · Stooq · Binance · alternative.me · public RSS feeds — auto-refreshing.
        Informational only, not investment advice.
      </footer>
    </div>
  )
}
