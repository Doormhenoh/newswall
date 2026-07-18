import { XMLParser } from 'fast-xml-parser'
import { safeLink, toPlainText } from './sanitize'
import type { NewsItem } from './types'

// processEntities: false — no entity/DTD expansion (XML-bomb defense).
// Entities we care about are decoded later by our own bounded decoder.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
})

function textOf(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node && typeof node === 'object' && '#text' in node) {
    return String((node as Record<string, unknown>)['#text'])
  }
  return ''
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

/** Atom links come as objects/arrays with rel attributes; RSS links are plain strings. */
function extractLink(item: Record<string, unknown>): string | null {
  const raw = item.link
  for (const candidate of asArray(raw)) {
    if (typeof candidate === 'string') {
      const safe = safeLink(candidate)
      if (safe) return safe
    } else if (candidate && typeof candidate === 'object') {
      const obj = candidate as Record<string, unknown>
      const rel = obj['@_rel']
      if (rel === undefined || rel === 'alternate') {
        const safe = safeLink(obj['@_href'] ?? textOf(candidate))
        if (safe) return safe
      }
    }
  }
  // RSS 1.0 / some feeds use <guid isPermaLink="true">
  const guid = item.guid
  if (guid !== undefined) {
    const safe = safeLink(textOf(guid))
    if (safe) return safe
  }
  return null
}

function extractDate(item: Record<string, unknown>): number | null {
  for (const key of ['pubDate', 'published', 'updated', 'dc:date', 'date']) {
    const value = textOf(item[key])
    if (value) {
      const ms = Date.parse(value)
      if (Number.isFinite(ms)) return ms
    }
  }
  return null
}

/**
 * Parse an RSS 2.0 / Atom / RDF feed document into sanitized news items.
 * Items without a usable title are dropped; links are http(s)-only or null.
 */
export function parseFeed(xml: string, source: string): NewsItem[] {
  let doc: Record<string, unknown>
  try {
    doc = parser.parse(xml) as Record<string, unknown>
  } catch {
    return []
  }

  const rss = doc.rss as Record<string, unknown> | undefined
  const channel = rss?.channel as Record<string, unknown> | undefined
  const atom = doc.feed as Record<string, unknown> | undefined
  const rdf = doc['rdf:RDF'] as Record<string, unknown> | undefined

  const rawItems = [
    ...asArray(channel?.item),
    ...asArray(atom?.entry),
    ...asArray(rdf?.item),
  ] as Record<string, unknown>[]

  const items: NewsItem[] = []
  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') continue
    const title = toPlainText(textOf(raw.title))
    if (!title) continue
    items.push({
      title,
      link: extractLink(raw),
      source: toPlainText(source, 60),
      publishedAt: extractDate(raw),
    })
  }
  return items
}
