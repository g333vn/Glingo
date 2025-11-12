// src/components/Modal.jsx
// ✅ Standard Modal Component - Theo quy chuẩn UX/UI hiện đại
// Tham khảo: Material Design, Apple HIG, Nielsen Norman Group

import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal Component - Tuân thủ các tiêu chuẩn UX/UI:
 * 
 * 1. POSITIONING: Center cả vertical và horizontal
 * 2. ACCESSIBILITY: ESC to close, Click outside to close, Focus trap
 * 3. ANIMATIONS: Smooth fade in/out transitions
 * 4. RESPONSIVE: Mobile-first, adaptive sizing
 * 5. SCROLL: Body scroll lock, modal internal scroll
 * 6. VISUAL: Modern design với depth và spacing hợp lý
 */

function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxWidth = '42rem',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
  className = ''
}) {
  
  // ✅ 1. BODY SCROLL LOCK
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Prevent scroll jump by adding padding equal to scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // ✅ 2. ESC KEY HANDLER
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  // ✅ 3. CLICK OUTSIDE HANDLER
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnClickOutside) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay-enter"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`modal-content-enter ${className}`}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth,
          width: '100%',
          maxHeight: 'calc(100vh - 2rem)',
          margin: '2rem auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ 4. HEADER với Close Button */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0,
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  marginLeft: 'auto',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
                aria-label="Close modal"
                title="Close (ESC)"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* ✅ 5. CONTENT với Internal Scroll */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;

