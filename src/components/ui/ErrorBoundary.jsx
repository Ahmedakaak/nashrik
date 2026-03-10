import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[60vh] page-enter">
                    <div className="text-center space-y-4 max-w-md mx-auto px-4">
                        <div className="w-20 h-20 rounded-2xl bg-status-error/10 flex items-center justify-center mx-auto">
                            <AlertTriangle size={36} className="text-status-error" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">
                            Something went wrong
                        </h2>
                        <p className="text-text-secondary text-sm">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs text-text-muted bg-surface-card border border-surface-border rounded-xl p-3 text-start overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
