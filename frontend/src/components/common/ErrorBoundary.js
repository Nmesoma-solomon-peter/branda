import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120, background: 'var(--gray-50)' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{
              width: 80, height: 80, background: '#FEF2F2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Something Went Wrong</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
              An unexpected error occurred. Please try again.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={this.handleReset} className="btn btn-primary">
                Try Again
              </button>
              <a href="/" className="btn" style={{
                display: 'inline-flex', padding: '12px 24px', borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-300)', background: 'var(--white)',
                color: 'var(--gray-600)', fontSize: 14, fontWeight: 500, textDecoration: 'none'
              }}>
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
