import { useRef } from 'react'
import { clsx } from 'clsx'
import { ACCENT_STYLES, type Accent } from '../../lib/accents'

export interface TabDef<Id extends string> {
  id: Id
  label: string
  accent: Accent
}

interface TabBarProps<Id extends string> {
  tabs: readonly TabDef<Id>[]
  active: Id
  onChange: (id: Id) => void
}

export function TabBar<Id extends string>({ tabs, active, onChange }: TabBarProps<Id>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    if (next === null) return
    const target = tabs[next]
    if (!target) return
    event.preventDefault()
    onChange(target.id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pt-3"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === active
        const styles = ACCENT_STYLES[tab.accent]
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={clsx(
              'whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-[color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-wall-bg',
              selected
                ? clsx('bg-wall-panel', styles.text, styles.borderB)
                : 'border-transparent text-wall-muted opacity-70 hover:text-slate-300 hover:opacity-100',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
