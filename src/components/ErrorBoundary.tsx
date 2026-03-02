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
        <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
          <h1 className="text-xl font-bold text-red-400">Algo ha fallado</h1>
          <pre className="mt-4 overflow-auto rounded bg-zinc-900 p-4 text-sm text-red-300">
            {this.state.error.message}
          </pre>
          <p className="mt-4 text-sm text-zinc-500">
            Revisa la consola del navegador para más detalles.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
