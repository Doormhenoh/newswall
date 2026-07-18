// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Panel } from '../src/components/panels/Panel'

afterEach(cleanup)

describe('Panel', () => {
  it('renders children when neither loading nor errored', () => {
    render(
      <Panel title="Test Panel" accent="red">
        Content
      </Panel>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Test Panel' })).toBeInTheDocument()
  })

  it('shows a loading skeleton instead of children while isLoading', () => {
    render(
      <Panel title="Test Panel" accent="red" isLoading>
        Content
      </Panel>,
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('shows an error state and calls onRetry when clicked', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(
      <Panel title="Test Panel" accent="red" isError onRetry={onRetry}>
        Content
      </Panel>,
    )
    expect(screen.getByText('Data unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
