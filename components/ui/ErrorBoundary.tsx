'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-heading text-black mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 font-body mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-button font-semibold text-sm text-gray-800 mb-2">
                    Error Details (Development Only):
                  </h3>
                  <pre className="text-xs text-gray-700 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.retry}
                  className="btn-primary flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
                
                <a
                  href="/"
                  className="btn-secondary flex items-center justify-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized error boundary for dashboard components
export const DashboardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="card text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-button font-medium text-gray-700 mb-2">
          Failed to load content
        </h3>
        <p className="text-gray-500 font-body text-sm">
          Please refresh the page to try again
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// Form error boundary with retry functionality
export const FormErrorBoundary: React.FC<{ children: ReactNode; onRetry?: () => void }> = ({ 
  children, 
  onRetry 
}) => (
  <ErrorBoundary
    fallback={
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-3" />
        <h3 className="font-button font-medium text-red-800 mb-2">
          Form Error
        </h3>
        <p className="text-red-700 font-body text-sm mb-4">
          There was an error with the form. Please try again.
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary text-sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
        )}
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);