import { handleNews } from '../server/handlers'
import { toResponse, errorResponse } from './_shared'

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    return toResponse(await handleNews(url.searchParams.get('feed')))
  } catch (err) {
    console.error('[api/news]', err)
    return errorResponse()
  }
}
