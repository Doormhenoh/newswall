# Newswall

A live, self-updating market news wall — dark, dense, color-coded. Indices, commodities,
crypto, sentiment, computed key levels, and themed headlines across six tabs, refreshing
automatically. Built for **$0/month**: every data source is keyless and free, and the whole
thing deploys on Vercel's free tier.

## Tabs

1. **Overview** — ticker strip, market snapshot, Fear & Greed gauge, BTC key levels, weekly index moves, top headlines from every theme
2. **Markets & Energy** — index and commodity cards with sparklines, markets + energy news
3. **Crypto** — BTC/ETH/SOL/XRP/BNB/DOGE prices with 7-day sparklines, Fear & Greed trend, computed BTC key levels, crypto news
4. **Geo / War** — geopolitics headlines with oil prices for context
5. **Macro & Policy** — macro/economy headlines, weekly index summary, gold and gasoline
6. **Tech & Corporates** — tech/AI and business/deals headlines

## Stack

React 18 + TypeScript + Vite 8 + Tailwind CSS + TanStack Query (polling, retries,
localStorage persistence) + custom SVG micro-charts. Two tiny serverless functions
(`api/quote`, `api/news`) proxy CORS-blocked upstreams; the same handlers run as Vite
dev middleware, so local dev is just one command.

## Data sources (all keyless & free)

| Data | Source | Path |
|---|---|---|
| Indices (Dow, S&P 500, Nasdaq, KOSPI) | Yahoo Finance chart API, Stooq CSV fallback | via `/api/quote` |
| Commodities (WTI, Brent, Gold, RBOB Gasoline) | Yahoo Finance chart API, Stooq fallback | via `/api/quote` |
| News by theme (7 themes, 2–3 feeds each) | Public RSS (BBC, Al Jazeera, CNBC, MarketWatch, TechCrunch, Yahoo Finance, OilPrice, CoinDesk, Cointelegraph, Decrypt) | via `/api/news` |
| Crypto prices + candles | Binance public data API (`data-api.binance.vision`) | direct from browser |
| Crypto Fear & Greed | alternative.me | direct from browser |

Refresh cadence: quotes/crypto every 60s (paused while the tab is hidden), news every
10 minutes. Serverless responses carry CDN cache headers (`s-maxage` +
`stale-while-revalidate`) so the free-tier edge absorbs nearly all traffic.

Not available without paid/keyed APIs (intentionally omitted, never faked): ETF flows,
PCE/CPI stats, economic calendars, national pump-price averages (RBOB futures shown
instead). Editorial commentary is replaced by **computed signals**: 200-day/200-week MAs,
52-week range, 30-day support/resistance, Fear & Greed zones.

## Getting started

```bash
npm install
npm run dev        # app + API middleware on http://localhost:5173
```

Other scripts:

```bash
npm test           # Vitest unit tests (signals math, sanitization, RSS parsing)
npm run lint       # ESLint (flat config)
npm run build      # tsc + production build
npm run preview    # serve the production build locally
```

## Deploy free on Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → New Project → import the repo (Hobby tier, no card needed).
3. Vercel auto-detects Vite; the `api/` folder becomes serverless functions and
   `vercel.json` applies the security headers. No environment variables needed.

## Security notes

- RSS content is sanitized **server-side**: titles reduced to plain text, links restricted
  to `http(s)` (blocks `javascript:`/`data:` XSS), lengths capped.
- Both API endpoints are allowlist-only (hardcoded feeds and symbols) — they cannot be
  repurposed as an open proxy.
- Upstream fetches have 8s timeouts and 1 MB response caps; XML entity expansion is
  disabled (XML-bomb defense); upstream errors are never echoed to clients.
- Production ships a strict CSP plus `nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  and `frame-ancestors 'none'` via `vercel.json`.
- No `dangerouslySetInnerHTML` anywhere, enforced by ESLint (`react/no-danger`).

## Project structure

```
api/        Vercel serverless wrappers (quote, news)
server/     shared handler logic: fetch/sanitize/parse + Vite dev middleware
src/
  components/layout/   Header, TabBar
  components/panels/   Panel, TickerStrip, QuoteGrid, CryptoGrid, NewsPanel,
                       FearGreedGauge, KeyLevels, WeekSummary, Sparkline
  components/tabs/     the six tab layouts
  lib/                 API clients, TanStack Query hooks, signals math, formatters
tests/      Vitest unit tests
```

Informational dashboard only — not investment advice.
