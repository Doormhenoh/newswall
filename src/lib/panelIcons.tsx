const S = 16

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width={S} height={S} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  )
}

export function ChartLineIcon() {
  return <Icon><polyline points="2 12 5.5 6 9 9 14 3" /></Icon>
}

export function GlobeIcon() {
  return <Icon><circle cx="8" cy="8" r="6" /><path d="M2 8h12" /><path d="M8 2a10 10 0 0 1 3 6 10 10 0 0 1-3 6" /><path d="M8 2a10 10 0 0 0-3 6 10 10 0 0 0 3 6" /></Icon>
}

export function BankIcon() {
  return <Icon><path d="M2 14h12" /><path d="M3 6v6" /><path d="M7 6v6" /><path d="M11 6v6" /><path d="M1 6l7-4 7 4" /></Icon>
}

export function CpuIcon() {
  return <Icon><rect x="4" y="4" width="8" height="8" rx="1" /><path d="M8 1v3" /><path d="M8 12v3" /><path d="M1 8h3" /><path d="M12 8h3" /></Icon>
}

export function CoinsIcon() {
  return <Icon><circle cx="6" cy="7" r="4" /><circle cx="10" cy="9" r="4" /></Icon>
}

export function BookIcon() {
  return <Icon><path d="M2 3h5a3 3 0 0 1 3 3v8a2 2 0 0 0-2-2H2z" /><path d="M14 3H9a3 3 0 0 0-3 3v8a2 2 0 0 1 2-2h6z" /></Icon>
}

export function BarChartIcon() {
  return <Icon><rect x="2" y="8" width="3" height="6" rx=".5" /><rect x="6.5" y="4" width="3" height="10" rx=".5" /><rect x="11" y="6" width="3" height="8" rx=".5" /></Icon>
}

export function GaugeIcon() {
  return <Icon><path d="M8 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" /><path d="M8 8l2.5-2.5" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /></Icon>
}

export function NewspaperIcon() {
  return <Icon><rect x="2" y="3" width="12" height="10" rx="1" /><path d="M5 6h6" /><path d="M5 9h4" /></Icon>
}

export function BriefcaseIcon() {
  return <Icon><rect x="2" y="5" width="12" height="9" rx="1" /><path d="M6 5V3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5V5" /><path d="M2 9h12" /></Icon>
}

export type PanelIconName = 'chart-line' | 'globe' | 'bank' | 'cpu' | 'coins' | 'book' | 'bar-chart' | 'gauge' | 'newspaper' | 'briefcase'

const MAP: Record<PanelIconName, () => React.JSX.Element> = {
  'chart-line': ChartLineIcon,
  globe: GlobeIcon,
  bank: BankIcon,
  cpu: CpuIcon,
  coins: CoinsIcon,
  book: BookIcon,
  'bar-chart': BarChartIcon,
  gauge: GaugeIcon,
  newspaper: NewspaperIcon,
  briefcase: BriefcaseIcon,
}

export function PanelIcon({ name }: { name: PanelIconName }) {
  const Comp = MAP[name]
  return <Comp />
}
