// src/pages/RegisterPage.jsx
// ✨ NEO BRUTALISM + JAPANESE AESTHETIC
// ✅ UPGRADED: Full Supabase registration support + validation

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSetting } from '../utils/settingsManager.js';
import { signUp as supabaseSignUp, getUserProfile } from '../services/authService.js';
import { validateEmail, validatePassword, getPasswordStrengthInfo } from '../utils/validation.js';
import { fullSync } from '../services/dataSyncService.js';

function RegisterPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Check if registration is enabled
    const registrationEnabled = getSetting('system', 'registrationEnabled');
    if (registrationEnabled === false) {
      setError(t('auth.registrationDisabled'));
    }
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    setError('');

    // Update password strength in real-time
    if (name === 'password') {
      const { strength } = validatePassword(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ✅ Validate email format
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        setIsLoading(false);
        return;
      }

      // ✅ Validate password strength
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error);
        setIsLoading(false);
        return;
      }

      // ✅ Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.passwordMismatch'));
        setIsLoading(false);
        return;
      }

      // ✅ CRITICAL: Register via Supabase (production auth)
      if (formData.email && formData.email.includes('@')) {
        console.log('[REGISTER] Attempting Supabase registration...');

        const { success, data, error: supabaseError } = await supabaseSignUp({
          email: formData.email,
          password: formData.password,
          displayName: formData.name
        });

        if (success) {
          console.log('[REGISTER][Supabase] Registration successful:', data.user?.email);

          // ✅ Create user profile
          const userId = data.user?.id;

          // Map Supabase user to app format
          const supabaseUserForApp = {
            id: userId,
            username: data.user?.email,
            name: formData.name || data.user?.email,
            email: data.user?.email,
            role: 'user', // Default role for new users
          };

          // Update AuthContext
          updateUser(supabaseUserForApp);

          // ✅ Auto sync to localStorage
          import('../data/users.js').then(({ syncSupabaseUserToLocal }) => {
            syncSupabaseUserToLocal(data.user, null).then(result => {
              if (result.success) {
                console.log('[REGISTER] Auto-synced user to localStorage');
              }
            });
          });

          // ✅ Auto sync data
          fullSync(userId).then(result => {
            if (result.success) {
              console.log('[REGISTER][Sync] Data synced successfully');
            }
          }).catch(err => {
            console.warn('[REGISTER][Sync] Error:', err);
          });

          // Show success message
          alert(t('auth.registrationSuccess') || 'Registration successful! Please check your email to verify your account.');

          // Navigate to home
          navigate('/', { replace: true });
          setIsLoading(false);
          return;
        } else {
          // ✅ SECURITY: Generic error message (don't leak info)
          console.error('[REGISTER][Supabase] Error:', supabaseError);
          setError(t('auth.registrationFailed') || 'Registration failed. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // ❌ Fallback: Local registration (not recommended for production)
      console.warn('[REGISTER] Using local registration (not email) - not recommended');
      const result = register({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email
      });

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error || t('auth.registerFailed'));
      }
    } catch (err) {
      console.error('[REGISTER] Unexpected error:', err);
      setError(t('auth.registrationFailed') || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get password strength info
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* ✨ NEO BRUTALISM Main Register Card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="bg-white rounded-2xl border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* ✨ NEO BRUTALISM Header */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-6 sm:p-8 border-b-[4px] border-black">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-black text-center mb-2 uppercase tracking-wider text-black"
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                textShadow: '3px 3px 0px rgba(0,0,0,0.15)'
              }}
            >
              {t('auth.registerTitle')}
            </h1>
            <p className="text-center text-black text-base sm:text-lg font-bold">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* ✨ NEO BRUTALISM Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500 text-white px-4 py-3 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-sm sm:text-base">{error}</span>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm sm:text-base font-black uppercase mb-2 text-black tracking-wide">
                  {t('auth.name')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    placeholder={t('auth.enterName')}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm sm:text-base font-black uppercase mb-2 text-black tracking-wide">
                  {t('auth.email')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('auth.enterEmail')}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-1">
                  ✉️ We'll send a verification email
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm sm:text-base font-black uppercase mb-2 text-black tracking-wide">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setShowPasswordHint(true)}
                    required
                    minLength={8}
                    placeholder={t('auth.enterPassword')}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                  />
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full border-2 border-black transition-all ${level <= passwordStrength ? strengthInfo.color : 'bg-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ${strengthInfo.color.replace('bg-', 'text-')}`}>
                      {strengthInfo.label}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                {showPasswordHint && (
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p className="font-bold">Password must contain:</p>
                    <ul className="list-none space-y-0.5 ml-2">
                      <li className={formData.password.length >= 8 ? 'text-green-600 font-bold' : ''}>
                        {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600 font-bold' : ''}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? 'text-green-600 font-bold' : ''}>
                        {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                      </li>
                      <li className={/[0-9]/.test(formData.password) ? 'text-green-600 font-bold' : ''}>
                        {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm sm:text-base font-black uppercase mb-2 text-black tracking-wide">
                  {t('auth.confirmPassword')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder={t('auth.reEnterPassword')}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 font-bold">
                    ⚠️ Passwords don't match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || getSetting('system', 'registrationEnabled') === false}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black text-base sm:text-lg py-3.5 sm:py-4 px-6 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.registering')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    {t('auth.registerButton')}
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-gray-700 text-sm sm:text-base">
                  {t('auth.haveAccount')}{' '}
                  <Link
                    to="/login"
                    className="text-black font-black hover:text-yellow-600 transition-colors underline decoration-2 underline-offset-2"
                  >
                    {t('auth.loginNow')}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 border-[4px] border-yellow-400 rounded-lg rotate-12 opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-[4px] border-orange-400 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400 border-[4px] border-black rounded-lg -rotate-12 opacity-10"></div>
      </div>
    </div>
  );
}

export default RegisterPage;
