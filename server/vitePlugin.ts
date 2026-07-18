import type { ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { handleNews, handleQuote, type HandlerResult } from './handlers'

// Dev-only niceties: serve the same handlers the Vercel functions use, with a
// small in-memory TTL cache so HMR reloads don't hammer upstreams. Full
// security headers (CSP etc.) are prod-only via vercel.json — a strict CSP
// would break Vite HMR in dev.

const DEV_CACHE_TTL: Record<string, number> = {
  '/api/quote': 60_000,
  '/api/news': 600_000,
}
const devCache = new Map<string, { expires: number; result: HandlerResult }>()

function sendJson(res: ServerResponse, result: HandlerResult) {
  res.statusCode = result.status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', result.cacheControl)
  res.end(JSON.stringify(result.body))
}

export function newswallApi(): Plugin {
  return {
    name: 'newswall-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const route = url.pathname
        if (route !== '/api/quote' && route !== '/api/news') return next()

        const cacheKey = `${route}?${url.searchParams.toString()}`
        const hit = devCache.get(cacheKey)
        if (hit && hit.expires > Date.now()) return sendJson(res, hit.result)

        const handle =
          route === '/api/quote'
            ? handleQuote(url.searchParams.get('symbols'))
            : handleNews(url.searchParams.get('feed'))

        handle
          .then((result) => {
            if (result.status === 200) {
              devCache.set(cacheKey, { expires: Date.now() + DEV_CACHE_TTL[route], result })
            }
            sendJson(res, result)
          })
          .catch((err: unknown) => {
            console.error('[newswall-api]', err)
            sendJson(res, { status: 500, body: { error: 'internal error' }, cacheControl: 'no-store' })
          })
      })
    },
  }
}
