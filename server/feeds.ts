// Hardcoded feed allowlist — the news endpoint can ONLY fetch these URLs.
// Every theme has multiple feeds; a failing feed is skipped, never fatal.

export interface FeedDef {
  url: string
  source: string
}

export const FEEDS = {
  geo: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html', source: 'CNBC World' },
  ],
  macro: [
    { url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', source: 'CNBC Economy' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch' },
  ],
  markets: [
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC Top News' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_marketpulse', source: 'MarketWatch' },
  ],
  energy: [
    { url: 'https://oilprice.com/rss/main', source: 'OilPrice.com' },
    { url: 'https://www.cnbc.com/id/19836768/device/rss/rss.html', source: 'CNBC Energy' },
  ],
  tech: [
    { url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', source: 'CNBC Tech' },
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  ],
  corporate: [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance' },
    { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC Finance' },
  ],
  crypto: [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
  ],
} as const satisfies Record<string, readonly FeedDef[]>

export type FeedId = keyof typeof FEEDS

export function isFeedId(value: string): value is FeedId {
  return Object.hasOwn(FEEDS, value)
}
