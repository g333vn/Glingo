// src/pages/RegisterPage.jsx
// Registration Page - Clean, modern design with validation

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuthActions } from '../hooks/useAuthActions.jsx';
import { Mail, Lock, User, AlertCircle, Loader, Check } from 'lucide-react';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { handleRegister, isSubmitting, actionError, clearError } = useAuthActions();

  // Form state
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  /**
   * Calculate password strength
   */
  useEffect(() => {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    setPasswordStrength(Math.min(strength, 5));
  }, [password]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!email.includes('@')) {
      errors.email = 'Email không hợp lệ';
    }

    // Display name validation
    if (!displayName.trim()) {
      errors.displayName = 'Tên hiển thị là bắt buộc';
    } else if (displayName.trim().length < 2) {
      errors.displayName = 'Tên phải ít nhất 2 ký tự';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password là bắt buộc';
    } else if (password.length < 6) {
      errors.password = 'Password tối thiểu 6 ký tự';
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Password không khớp';
    }

    // Terms validation
    if (!agreeTerms) {
      errors.terms = 'Bạn phải đồng ý với điều khoản';
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
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const result = await handleRegister(email, password, displayName);

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  };

  /**
   * Get password strength label and color
   */
  const getPasswordStrengthInfo = () => {
    const strengths = [
      { label: 'Very Weak', color: '#ef4444', width: '20%' },
      { label: 'Weak', color: '#f97316', width: '40%' },
      { label: 'Fair', color: '#eab308', width: '60%' },
      { label: 'Good', color: '#84cc16', width: '80%' },
      { label: 'Strong', color: '#22c55e', width: '100%' },
    ];
    return strengths[passwordStrength - 1] || strengths[0];
  };

  /**
   * Show loading state while auth is initializing
   */
  if (authLoading) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-loader">
            <Loader className="spinner" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-background" />

      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us today</p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="success-banner">
              <Check size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Global error message */}
            {actionError && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Display Name field */}
            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                <User size={18} />
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (formErrors.displayName) {
                    setFormErrors({ ...formErrors, displayName: '' });
                  }
                }}
                className={`form-input ${formErrors.displayName ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.displayName && (
                <p className="field-error">{formErrors.displayName}</p>
              )}
            </div>

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
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                Password
              </label>
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

              {/* Password strength indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: getPasswordStrengthInfo().width,
                        backgroundColor: getPasswordStrengthInfo().color,
                      }}
                    />
                  </div>
                  <span className="strength-label">
                    Strength: {getPasswordStrengthInfo().label}
                  </span>
                </div>
              )}

              {formErrors.password && (
                <p className="field-error">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm password field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={18} />
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) {
                      setFormErrors({ ...formErrors, confirmPassword: '' });
                    }
                  }}
                  className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="show-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="field-error">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="form-group terms-group">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (formErrors.terms) {
                    setFormErrors({ ...formErrors, terms: '' });
                  }
                }}
                className="form-checkbox"
                disabled={isSubmitting}
              />
              <label htmlFor="agreeTerms" className="terms-label">
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
              {formErrors.terms && (
                <p className="field-error">{formErrors.terms}</p>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>Already have an account?</span>
          </div>

          {/* Login link */}
          <Link to="/login" className="login-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
