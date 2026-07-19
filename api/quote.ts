import { handleQuote } from '../server/handlers.js'
import { toResponse, errorResponse } from './_shared.js'

// Named HTTP-method export — Vercel's current runtime treats a single-arg
// default export as the legacy Node (req, res) signature (request.url ends
// up as a bare path, breaking `new URL()`), and only invokes a real Web
// `Request`/`Response` when the export matches an HTTP method name.
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    return toResponse(await handleQuote(url.searchParams.get('symbols')))
  } catch (err) {
    console.error('[api/quote]', err)
    return errorResponse()
  }
}
