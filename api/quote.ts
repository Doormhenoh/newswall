import { handleQuote } from '../server/handlers'
import { toResponse, errorResponse } from './_shared'

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    return toResponse(await handleQuote(url.searchParams.get('symbols')))
  } catch (err) {
    console.error('[api/quote]', err)
    return errorResponse()
  }
}
