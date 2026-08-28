import type { HandlerResult } from '../server/handlers.js'

// Vercel skips files starting with "_" when creating serverless functions.

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

export function toResponse(result: HandlerResult): Response {
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': result.cacheControl,
    },
  })
}

export function errorResponse(): Response {
  return new Response(JSON.stringify({ error: 'internal error' }), {
    status: 500,
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': 'no-store',
    },
  })
}
