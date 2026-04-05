import { Component, type ReactNode, type ErrorInfo } from "react"

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Send to error tracking service in production
    console.error("Uncaught error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: "var(--j-bg-base)" }}
        >
          <div className="text-center max-w-md">
            <p className="text-4xl mb-4">💥</p>
            <h1
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--j-text-primary)" }}
            >
              Something went wrong
            </h1>
            <p className="text-sm mb-4" style={{ color: "var(--j-text-muted)" }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
