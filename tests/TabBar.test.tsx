// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { TabBar, type TabDef } from '../src/components/layout/TabBar'

// @testing-library/react only auto-cleans up via afterEach when Vitest's
// `globals: true` is on; this project imports test globals explicitly, so
// cleanup must be triggered by hand or renders leak across tests in the file.
afterEach(cleanup)

type Id = 'a' | 'b' | 'c'
const TABS: readonly TabDef<Id>[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

// Controlled like real usage in App.tsx, so keyboard/click nav is exercised
// end-to-end rather than against a static `active` prop.
function ControlledTabBar() {
  const [active, setActive] = useState<Id>('a')
  return <TabBar tabs={TABS} active={active} onChange={setActive} />
}

describe('TabBar', () => {
  it('marks only the active tab as selected', () => {
    render(<ControlledTabBar />)
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches the active tab on click', async () => {
    const user = userEvent.setup()
    render(<ControlledTabBar />)
    await user.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false')
  })

  it('supports roving-tabindex arrow key navigation, including Home/End wrap', async () => {
    const user = userEvent.setup()
    render(<ControlledTabBar />)
    screen.getByRole('tab', { name: 'Alpha' }).focus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus()

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
  })
})
