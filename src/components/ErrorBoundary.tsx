import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// Class component: React only supports error boundaries via
// componentDidCatch/getDerivedStateFromError, there is no hook equivalent.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-red-500/30 bg-wall-panel p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-400">
            Something went wrong rendering this section
          </p>
          <p className="max-w-md text-xs text-wall-muted">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded border border-wall-border px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-wall-card"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
