import { describe, expect, it } from 'vitest'
import { decodeEntities, safeLink, toPlainText } from '../server/sanitize'

describe('toPlainText', () => {
  it('strips HTML tags', () => {
    expect(toPlainText('<b>Fed</b> holds <i>rates</i>')).toBe('Fed holds rates')
    expect(toPlainText('<script>alert(1)</script>Markets rally')).toBe('alert(1) Markets rally')
  })

  it('strips tags that only appear after entity decoding', () => {
    expect(toPlainText('&lt;script&gt;alert(1)&lt;/script&gt;Oil news')).not.toContain('<')
    expect(toPlainText('&amp;lt;img onerror=x&amp;gt;')).not.toContain('<')
  })

  it('never returns angle brackets', () => {
    expect(toPlainText('a < b > c')).toBe('a b c')
  })

  it('decodes common entities and collapses whitespace', () => {
    expect(toPlainText('S&amp;P 500   hits\n record')).toBe('S&P 500 hits record')
    expect(toPlainText('Dow&nbsp;rises &#8212; again')).toBe('Dow rises — again')
  })

  it('removes CDATA wrappers and truncates long input', () => {
    expect(toPlainText('<![CDATA[Breaking news]]>')).toBe('Breaking news')
    expect(toPlainText('x'.repeat(500)).length).toBeLessThanOrEqual(300)
  })
})

describe('safeLink', () => {
  it('accepts http(s) URLs', () => {
    expect(safeLink('https://example.com/story')).toBe('https://example.com/story')
    expect(safeLink('http://example.com/a?b=1')).toBe('http://example.com/a?b=1')
  })

  it('rejects javascript:, data:, and other schemes', () => {
    expect(safeLink('javascript:alert(1)')).toBeNull()
    expect(safeLink('JavaScript:alert(1)')).toBeNull()
    expect(safeLink('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(safeLink('file:///etc/passwd')).toBeNull()
    expect(safeLink('vbscript:x')).toBeNull()
  })

  it('rejects relative URLs and non-strings', () => {
    expect(safeLink('/relative/path')).toBeNull()
    expect(safeLink(42)).toBeNull()
    expect(safeLink(undefined)).toBeNull()
  })
})

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('&amp;&lt;&gt;')).toBe('&<>')
    expect(decodeEntities('&#65;&#x42;')).toBe('AB')
  })

  it('drops out-of-range code points and keeps unknown entities literal', () => {
    expect(decodeEntities('&#1114112;')).toBe('')
    expect(decodeEntities('&unknownentity;')).toBe('&unknownentity;')
  })
})
