import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
              Đã xảy ra lỗi
            </h2>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
              Có lỗi xảy ra khi tải ứng dụng. Vui lòng refresh trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Refresh trang
            </button>
            <details style={{ marginTop: '16px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                Chi tiết lỗi (dành cho developer)
              </summary>
              <pre style={{
                backgroundColor: '#f3f4f6',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '8px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
