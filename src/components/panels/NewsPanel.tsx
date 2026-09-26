import { clsx } from 'clsx'
import { ACCENT_STYLES, type Accent } from '../../lib/accents'
import { timeAgo } from '../../lib/format'
import type { PanelIconName } from '../../lib/panelIcons'
import { useNews, type FeedId } from '../../lib/queries'
import { Panel } from './Panel'

const FEED_ICON: Record<FeedId, PanelIconName> = {
  crypto: 'coins',
  markets: 'chart-line',
  geo: 'globe',
  macro: 'bank',
  tech: 'cpu',
  corporate: 'briefcase',
  energy: 'bar-chart',
}

interface NewsPanelProps {
  feed: FeedId
  title: string
  accent: Accent
  badge?: string
  limit?: number
  className?: string
}

export function NewsPanel({ feed, title, accent, badge, limit = 10, className }: NewsPanelProps) {
  const { data, isPending, isError, refetch, dataUpdatedAt } = useNews(feed)
  const styles = ACCENT_STYLES[accent]
  const items = data?.items.slice(0, limit) ?? []

  return (
    <Panel
      title={title}
      icon={FEED_ICON[feed]}
      accent={accent}
      badge={badge}
      updatedAt={dataUpdatedAt}
      isLoading={isPending}
      isError={isError && !data}
      onRetry={() => void refetch()}
      className={className}
    >
      <ul>
        {items.map((item) => (
          <li
            key={`${item.source}-${item.title}`}
            className="border-b border-wall-border/40 py-2 first:pt-0 last:border-0 last:pb-0"
          >
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm leading-snug text-wall-text-secondary transition-[color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-white focus-visible:text-white focus-visible:underline focus-visible:outline-none"
              >
                {item.title}
              </a>
            ) : (
              <span className="text-sm leading-snug text-wall-text-secondary">{item.title}</span>
            )}
            <div className="mt-0.5 flex gap-2 text-[11px] uppercase tracking-wide text-wall-muted">
              <span className={clsx('font-semibold', styles.text)}>{item.source}</span>
              {item.publishedAt !== null && <span>{timeAgo(item.publishedAt)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
