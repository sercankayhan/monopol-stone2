"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Performance monitoring - error tracking
    if (typeof window !== 'undefined') {
      // Send error to monitoring service
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // You can integrate with services like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // For now, log to console - replace with actual service
    console.error('Error logged:', errorData);
    
    // Example: Send to monitoring service
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Poppins, sans-serif',
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{
              color: '#e74c3c',
              fontSize: '1.8rem',
              marginBottom: '16px',
              fontWeight: 600,
            }}>
              Bir Hata Oluştu
            </h2>
            
            <p style={{
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'left',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                  Hata Detayları (Development)
                </summary>
                <pre style={{
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: '#e74c3c',
                }}>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#FD7E14',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e6690f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FD7E14'}
              >
                Sayfayı Yenile
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}