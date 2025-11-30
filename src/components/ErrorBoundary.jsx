// src/components/ErrorBoundary.jsx
// Error Boundary để catch lỗi React và hiển thị thông báo thân thiện

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('❌ Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              ⚠️ Đã xảy ra lỗi
            </h1>
            
            <p style={{
              color: '#4b5563',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Ứng dụng gặp lỗi khi tải. Vui lòng thử các bước sau:
            </p>

            <div style={{
              backgroundColor: '#fef3c7',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#92400e'
              }}>
                Các bước khắc phục:
              </h2>
              <ol style={{
                marginLeft: '20px',
                color: '#78350f',
                lineHeight: '1.8'
              }}>
                <li>Mở Console (F12) và xem lỗi chi tiết</li>
                <li>Thử refresh trang (Ctrl+Shift+R)</li>
                <li>Xóa cache và restart dev server</li>
                <li>Kiểm tra file .env.local có đúng không</li>
              </ol>
            </div>

            {this.state.error && (
              <details style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Chi tiết lỗi (Click để xem)
                </summary>
                <pre style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              🔄 Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

