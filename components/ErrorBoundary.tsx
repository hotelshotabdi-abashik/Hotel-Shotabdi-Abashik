
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-10 text-center bg-white rounded-[2rem] border border-red-50 shadow-xl">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Something went wrong</h2>
          <p className="text-gray-500 max-w-md mb-8 leading-relaxed font-medium">
            An unexpected error occurred in this section. Our team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-hotel-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
            >
              <RefreshCw size={16} /> Reload Page
            </button>
            <a 
              href="/"
              className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
            >
              <Home size={16} /> Back to Home
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-10 p-6 bg-gray-50 rounded-2xl text-left w-full max-w-2xl overflow-auto border border-gray-100">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Error Details:</p>
              <pre className="text-[10px] font-mono text-gray-600 leading-relaxed">
                {error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}
