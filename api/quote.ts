import { handleQuote } from '../server/handlers'
import { toResponse, errorResponse } from './_shared'

// Vercel Fetch-API convention for a plain (non-framework) api/ function:
// a default export taking a standard Request and returning a Response.
export default async function handler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    return toResponse(await handleQuote(url.searchParams.get('symbols')))
  } catch (err) {
    console.error('[api/quote]', err)
    return errorResponse()
  }
}
