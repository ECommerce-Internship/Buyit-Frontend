// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Keep this — helps you catch real bugs during dev/QA.
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f6fb] px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                    <p className="mt-2 text-gray-500">
                        An unexpected error occurred. Try reloading the page.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300 ease-out hover:scale-[1.01]"
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}