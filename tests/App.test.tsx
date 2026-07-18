// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { renderWithProviders } from './testUtils'

afterEach(cleanup)

// Panel titles render unconditionally (loading/error only affects the body),
// so these assertions hold even with fetch offline — no real network needed.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('network disabled in component tests')),
  )
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('defaults to the Overview tab', async () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    // Each tab is a lazy-loaded chunk (code-split per tab), so its content
    // resolves asynchronously even on first mount — findBy* waits for it.
    expect(
      await screen.findByRole('heading', { name: 'Market Snapshot' }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('switches tabs on click and renders that tab’s panels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('tab', { name: 'Crypto' }))
    expect(screen.getByRole('tab', { name: 'Crypto' })).toHaveAttribute('aria-selected', 'true')
    expect(
      await screen.findByRole('heading', { name: 'Crypto Prices' }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })
})
