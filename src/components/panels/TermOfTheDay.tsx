import { todaysTerm } from '../../lib/glossary'
import { Panel } from './Panel'

export function TermOfTheDay({ className }: { className?: string }) {
  const { term, definition } = todaysTerm()

  return (
    <Panel
      title="Term of the Day"
      accent="blue"
      updatedAt={Date.now()}
      isLoading={false}
      isError={false}
      className={className}
    >
      <p className="text-base font-semibold text-slate-100">{term}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{definition}</p>
    </Panel>
  )
}
