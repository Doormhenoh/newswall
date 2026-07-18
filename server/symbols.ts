// Hardcoded symbol allowlist — the quote endpoint refuses anything else.

export interface SymbolDef {
  stooq: string
  label: string
  group: 'index' | 'commodity'
}

export const QUOTE_SYMBOLS: Record<string, SymbolDef> = {
  '^DJI': { stooq: '^dji', label: 'Dow Jones', group: 'index' },
  '^GSPC': { stooq: '^spx', label: 'S&P 500', group: 'index' },
  '^IXIC': { stooq: '^ndq', label: 'Nasdaq', group: 'index' },
  '^KS11': { stooq: '^kospi', label: 'KOSPI', group: 'index' },
  'CL=F': { stooq: 'cl.f', label: 'WTI Crude', group: 'commodity' },
  'BZ=F': { stooq: 'cb.f', label: 'Brent Crude', group: 'commodity' },
  'GC=F': { stooq: 'gc.f', label: 'Gold', group: 'commodity' },
  'RB=F': { stooq: 'rb.f', label: 'RBOB Gasoline', group: 'commodity' },
}
