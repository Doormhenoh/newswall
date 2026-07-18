import { lazy, Suspense, useState, type ComponentType } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/layout/Header'
import { TabBar, type TabDef } from './components/layout/TabBar'

const TABS = [
  { id: 'overview', label: 'Overview', accent: 'yellow' },
  { id: 'markets', label: 'Markets & Energy', accent: 'magenta' },
  { id: 'crypto', label: 'Crypto', accent: 'orange' },
  { id: 'geo', label: 'Geo / War', accent: 'red' },
  { id: 'macro', label: 'Macro & Policy', accent: 'blue' },
  { id: 'tech', label: 'Tech & Corporates', accent: 'green' },
] as const satisfies readonly TabDef<string>[]

type TabId = (typeof TABS)[number]['id']

// Only one tab is ever mounted at a time, so each is its own chunk —
// loaded on first visit instead of shipped in the initial bundle.
const TAB_CONTENT: Record<TabId, ComponentType> = {
  overview: lazy(() => import('./components/tabs/OverviewTab').then((m) => ({ default: m.OverviewTab }))),
  markets: lazy(() => import('./components/tabs/MarketsTab').then((m) => ({ default: m.MarketsTab }))),
  crypto: lazy(() => import('./components/tabs/CryptoTab').then((m) => ({ default: m.CryptoTab }))),
  geo: lazy(() => import('./components/tabs/GeoTab').then((m) => ({ default: m.GeoTab }))),
  macro: lazy(() => import('./components/tabs/MacroTab').then((m) => ({ default: m.MacroTab }))),
  tech: lazy(() => import('./components/tabs/TechTab').then((m) => ({ default: m.TechTab }))),
}

function TabFallback() {
  return (
    <div className="grid animate-pulse gap-3 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 rounded-lg border border-wall-border bg-wall-panel" />
      ))}
    </div>
  )
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
          <Suspense fallback={<TabFallback />}>
            <ActiveTab />
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 text-center text-[10px] text-wall-muted">
        Data: Yahoo Finance · Stooq · Binance · alternative.me · public RSS feeds — auto-refreshing.
        Informational only, not investment advice.
      </footer>
    </div>
  )
}
