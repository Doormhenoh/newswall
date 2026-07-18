// Sanitization for untrusted upstream content (RSS titles, links).
// Everything returned by the API must be plain text and http(s) links only.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

export function decodeEntities(input: string): string {
  return input.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code[0] === '#') {
      const hex = code[1] === 'x' || code[1] === 'X'
      const codePoint = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10)
      if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return ''
      try {
        return String.fromCodePoint(codePoint)
      } catch {
        return ''
      }
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match
  })
}

/**
 * Reduce arbitrary feed markup to plain text: strips tags (including ones that
 * only appear after entity decoding, e.g. `&lt;script&gt;`), then removes any
 * leftover angle brackets so the API output is guaranteed HTML-free.
 */
const TAG_PATTERN = /<\/?[a-zA-Z!][^>]*>/g

export function toPlainText(input: string, maxLen = 300): string {
  let text = input.replace(/<!\[CDATA\[|\]\]>/g, '')
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeEntities(text.replace(TAG_PATTERN, ' '))
    if (next === text) break
    text = next
  }
  text = text.replace(TAG_PATTERN, ' ').replace(/[<>]/g, ' ')
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLen)
}

/** Accept only absolute http(s) URLs — blocks javascript:, data:, file: etc. */
export function safeLink(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}
