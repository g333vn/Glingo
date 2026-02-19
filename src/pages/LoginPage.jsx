// src/pages/LoginPage.jsx
// Login Page - Clean, modern design with proper error handling

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuthActions } from '../hooks/useAuthActions.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useToast } from '../components/ToastNotification.jsx';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { handleLogin, isSubmitting, actionError, clearError } = useAuthActions();
  const { t } = useLanguage();
  const { success } = useToast();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!email.includes('@')) {
      errors.email = 'Email không hợp lệ';
    }

    if (!password) {
      errors.password = 'Password là bắt buộc';
    } else if (password.length < 6) {
      errors.password = 'Password tối thiểu 6 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await handleLogin(email, password);

    if (result.success) {
      // Redirect to homepage after successful login
      success(t('auth.loginSuccess'));
      navigate('/', { replace: true });
    }
  };

  /**
   * Show loading state while auth is initializing
   */
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-loader">
            <Loader className="spinner" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-background" />

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Global error message */}
            {actionError && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors({ ...formErrors, email: '' });
                  }
                }}
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="field-error">{formErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="form-group">
              <div className="password-label-container">
                <label htmlFor="password" className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Quên password?
                </Link>
              </div>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors({ ...formErrors, password: '' });
                    }
                  }}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="show-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formErrors.password && (
                <p className="field-error">{formErrors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="spinner-small" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>Don't have an account?</span>
          </div>

          {/* Register link */}
          <Link to="/register" className="register-link">
            Create new account
          </Link>


        </div>
      </div>
    </div>
  );
}
