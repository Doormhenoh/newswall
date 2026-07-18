import { describe, expect, it } from 'vitest'
import { parseFeed } from '../server/rss'

const RSS2_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title><![CDATA[Oil jumps as <b>Hormuz</b> tension rises]]></title>
      <link>https://example.com/oil-story</link>
      <pubDate>Fri, 17 Jul 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>&lt;script&gt;alert('xss')&lt;/script&gt;Fed decision looms</title>
      <link>javascript:alert(1)</link>
      <pubDate>Fri, 17 Jul 2026 09:00:00 GMT</pubDate>
    </item>
    <item>
      <title></title>
      <link>https://example.com/no-title</link>
    </item>
  </channel>
</rss>`

const ATOM_FIXTURE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <entry>
    <title type="html">Chipmakers &amp; the memory squeeze</title>
    <link rel="alternate" href="https://example.com/chips"/>
    <link rel="self" href="https://example.com/self"/>
    <updated>2026-07-17T08:30:00Z</updated>
  </entry>
</feed>`

describe('parseFeed', () => {
  it('parses RSS 2.0 items with sanitized titles', () => {
    const items = parseFeed(RSS2_FIXTURE, 'Test Source')
    const first = items[0]
    expect(first.title).toBe('Oil jumps as Hormuz tension rises')
    expect(first.link).toBe('https://example.com/oil-story')
    expect(first.source).toBe('Test Source')
    expect(first.publishedAt).toBe(Date.parse('Fri, 17 Jul 2026 10:00:00 GMT'))
  })

  it('neutralizes XSS in titles and rejects javascript: links', () => {
    const items = parseFeed(RSS2_FIXTURE, 'Test Source')
    const evil = items[1]
    expect(evil.title).not.toContain('<')
    expect(evil.title).toContain('Fed decision looms')
    expect(evil.link).toBeNull()
  })

  it('drops items without a title', () => {
    const items = parseFeed(RSS2_FIXTURE, 'Test Source')
    expect(items).toHaveLength(2)
  })

  it('parses Atom entries and picks the alternate link', () => {
    const items = parseFeed(ATOM_FIXTURE, 'Atom Source')
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Chipmakers & the memory squeeze')
    expect(items[0].link).toBe('https://example.com/chips')
    expect(items[0].publishedAt).toBe(Date.parse('2026-07-17T08:30:00Z'))
  })

  it('returns an empty list for garbage input', () => {
    expect(parseFeed('this is not xml at all {', 'X')).toEqual([])
    expect(parseFeed('', 'X')).toEqual([])
  })
})
