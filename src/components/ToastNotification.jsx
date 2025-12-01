// src/components/ToastNotification.jsx
// 🍞 Toast Notification System - Neo Brutalism Style

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type = 'info', duration = 5000, action = null) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, action };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const success = useCallback((message, duration, action) => {
    return addToast(message, 'success', duration, action);
  }, [addToast]);
  
  const error = useCallback((message, duration, action) => {
    return addToast(message, 'error', duration, action);
  }, [addToast]);
  
  const warning = useCallback((message, duration, action) => {
    return addToast(message, 'warning', duration, action);
  }, [addToast]);
  
  const info = useCallback((message, duration, action) => {
    return addToast(message, 'info', duration, action);
  }, [addToast]);
  
  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-24 right-4 z-[9999] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { type, message, action } = toast;
  
  // Color schemes - Neo Brutalism
  const typeStyles = {
    success: {
      bg: 'bg-green-400',
      icon: '✅',
      border: 'border-black'
    },
    error: {
      bg: 'bg-red-400',
      icon: '❌',
      border: 'border-black'
    },
    warning: {
      bg: 'bg-yellow-400',
      icon: '⚠️',
      border: 'border-black'
    },
    info: {
      bg: 'bg-blue-400',
      icon: 'ℹ️',
      border: 'border-black'
    }
  };
  
  const style = typeStyles[type] || typeStyles.info;
  
  return (
    <div 
      className={`${style.bg} ${style.border} border-[4px] rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 min-w-[300px] animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 break-words">{message}</p>
          
          {/* Action Button */}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="mt-2 px-3 py-1 bg-white text-black font-black rounded border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-xs uppercase hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              {action.label}
            </button>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-900 hover:text-black font-black text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// CSS Animation (add to index.css)
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

export default ToastProvider;

