import { todaysTerm } from '../../lib/glossary'
import { Panel } from './Panel'

export function TermOfTheDay({ className }: { className?: string }) {
  const { term, definition } = todaysTerm()

  return (
    <Panel
      title="Term of the Day"
      icon="book"
      accent="blue"
      updatedAt={Date.now()}
      isLoading={false}
      isError={false}
      className={className}
    >
      <p className="text-base font-semibold text-wall-text">{term}</p>
      <p className="mt-1 text-sm leading-relaxed text-wall-text-secondary">{definition}</p>
    </Panel>
  )
}
