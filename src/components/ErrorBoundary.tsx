import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-cp-black p-8 text-cp-light">
          <h1 className="text-xl font-bold text-red-400">Algo ha fallado</h1>
          <pre className="mt-4 overflow-auto rounded bg-cp-dark border border-cp-surface p-4 text-sm text-red-300">
            {this.state.error.message}
          </pre>
          <p className="mt-4 text-sm text-cp-muted">
            Revisa la consola del navegador para más detalles.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 rounded border border-cp-neon bg-cp-neon px-4 py-2 text-sm font-medium text-cp-black hover:bg-cp-neon/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
