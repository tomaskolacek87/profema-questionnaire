'use client';

import React from 'react';
import { Result, Button } from 'antd';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="error"
            title="Něco se pokazilo"
            subTitle="Omlouváme se, došlo k neočekávané chybě."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Obnovit stránku
              </Button>
            }
          />
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{ marginTop: 20, textAlign: 'left', padding: '0 20px' }}>
              <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
                {this.state.error.toString()}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
