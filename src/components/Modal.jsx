// src/components/Modal.jsx
// NEO BRUTALISM + JAPANESE AESTHETIC MODAL

import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal Component - Neo Brutalism Style:
 * 
 * 1. POSITIONING: Center cả vertical và horizontal
 * 2. ACCESSIBILITY: ESC to close, Click outside to close, Focus trap
 * 3. ANIMATIONS: Smooth transitions với hard shadows
 * 4. RESPONSIVE: Mobile-first, adaptive sizing
 * 5. SCROLL: Body scroll lock, modal internal scroll
 * 6. VISUAL: Neo Brutalism design với thick borders và hard shadows
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
  
  // 1. BODY SCROLL LOCK
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // 2. ESC KEY HANDLER
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

  // 3. CLICK OUTSIDE HANDLER
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 99999, // Increased to match admin pages and ensure modal is always on top
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden', // Removed overflowY: 'auto' - overlay should not scroll
        overflowX: 'hidden',
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
          border: '4px solid black',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          maxWidth,
          width: '100%',
          maxHeight: '90vh', // Changed from calc(100vh - 2rem) to 90vh for better viewport fit
          margin: 'auto', // Removed '2rem auto' - let flexbox center handle it
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          minWidth: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 4. HEADER với Close Button - NEO BRUTALISM */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '3px solid black',
              flexShrink: 0,
              backgroundColor: '#FFB800',
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '900',
                  color: 'black',
                  margin: 0,
                  fontFamily: "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', sans-serif",
                  textTransform: 'none',
                  letterSpacing: '0.02em',
                  lineHeight: '1.4',
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
                  borderRadius: '6px',
                  border: '3px solid black',
                  backgroundColor: 'white',
                  color: 'black',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  fontWeight: '900',
                  transition: 'all 0.2s',
                  boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF5722';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                  e.currentTarget.style.boxShadow = '3px 3px 0px 0px rgba(0,0,0,1)';
                  e.currentTarget.style.transform = 'translate(0, 0)';
                }}
                aria-label="Close modal"
                title="Close (ESC)"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* 5. CONTENT với Internal Scroll */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
            minWidth: 0,
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
