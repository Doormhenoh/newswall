import type { FearGreedData } from '../types'

interface FngApiResponse {
  data?: { value: string; timestamp: string }[]
}

export async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch('https://api.alternative.me/fng/?limit=30', {
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Fear & Greed request failed: ${res.status}`)
  const json = (await res.json()) as FngApiResponse

  const history = (json.data ?? [])
    .map((d) => ({ value: Number(d.value), timestamp: Number(d.timestamp) * 1000 }))
    .filter((p) => Number.isFinite(p.value) && Number.isFinite(p.timestamp))
    .reverse() // API returns newest first

  const current = history.at(-1)
  if (!current) throw new Error('Fear & Greed: empty response')
  return { current, history }
}
