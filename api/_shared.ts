import type { HandlerResult } from '../server/handlers'

// Vercel skips files starting with "_" when creating serverless functions.

export function toResponse(result: HandlerResult): Response {
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': result.cacheControl,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export function errorResponse(): Response {
  return new Response(JSON.stringify({ error: 'internal error' }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
