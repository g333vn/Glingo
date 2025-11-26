// src/pages/LoginPage.jsx
// ✨ NEO BRUTALISM + JAPANESE AESTHETIC

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { signIn as supabaseSignIn, getUserProfile } from '../services/authService.js';
import { fullSync } from '../services/dataSyncService.js';

function LoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { login, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 🔹 Nếu user nhập email (có ký tự @) thì ưu tiên thử login bằng Supabase
      if (username.includes('@')) {
        const { success, data, error } = await supabaseSignIn({
          email: username,
          password,
        });

        if (success) {
          // Lấy profile (role, display_name) từ bảng profiles
          const userId = data?.user?.id;
          const { success: profileOk, profile, error: profileError } = await getUserProfile(userId);

          // Map dữ liệu Supabase thành user object mà app đang dùng
          const supabaseUserForApp = {
            id: userId,
            username: data?.user?.email,
            name: profile?.display_name || data?.user?.email,
            email: data?.user?.email,
            role: profile?.role || 'user',
          };

          // Cập nhật AuthContext để toàn app nhận diện user này
          updateUser(supabaseUserForApp);

          // ✅ NEW: Auto sync data khi đăng nhập thành công
          fullSync(userId).then(result => {
            if (result.success) {
              console.log('[LOGIN][Sync] Data synced successfully:', result);
            } else {
              console.warn('[LOGIN][Sync] Sync completed with errors:', result.errors);
            }
          }).catch(err => {
            console.error('[LOGIN][Sync] Error syncing data:', err);
          });

          // eslint-disable-next-line no-console
          console.log('[LOGIN][Supabase] Login successful:', {
            id: data?.user?.id,
            email: data?.user?.email,
            profile: profileOk
              ? { role: profile?.role, display_name: profile?.display_name }
              : 'No profile or error',
            profileError: profileError?.message,
          });
          navigate('/', { replace: true });
          setIsLoading(false);
          return;
        }

        // Nếu Supabase login fail, hiển thị lỗi và dừng (không fallback sang local user)
        setError(error?.message || t('auth.loginFailed'));
        setPassword('');
        setIsLoading(false);
        return;
      }

      // 🔹 Trường hợp username không phải email → dùng hệ thống login cũ (local)
      const result = login(username, password);

      if (result.success) {
        const loggedInUser = result.user || user;

        console.log('[LOGIN] Login successful, redirecting to home:', {
          userRole: loggedInUser?.role,
          username: loggedInUser?.username,
        });

        navigate('/', { replace: true });
      } else {
        setError(result.error || t('auth.loginFailed'));
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      {/* ✨ NEO BRUTALISM Background - Đã loại bỏ backdrop-blur để background rõ hơn */}

      {/* ✨ NEO BRUTALISM Main Login Card */}
      <div 
        className={`relative z-10 w-full max-w-md transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-white rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10 md:p-12">
          {/* ✨ NEO BRUTALISM Header with Logo */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400 rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 sm:mb-6 transform hover:scale-110 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <span className="text-4xl sm:text-5xl">🔐</span>
            </div>
            <h1 
              className="text-3xl sm:text-4xl font-black mb-3 text-black uppercase tracking-wide"
              style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            >
              {t('auth.loginTitle')}
            </h1>
            <p className="text-gray-700 text-sm sm:text-base font-bold">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* ✨ NEO BRUTALISM Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-black text-black mb-2.5 uppercase tracking-wide">
                {t('auth.username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-black text-lg font-black">👤</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder={t('auth.enterUsername')}
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 border-[3px] border-black rounded-lg focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base bg-white font-bold"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-black text-black mb-2.5 uppercase tracking-wide">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-black text-lg font-black">🔒</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder={t('auth.enterPassword')}
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 border-[3px] border-black rounded-lg focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base bg-white font-bold"
                  required
                />
              </div>
            </div>

            {/* ✨ NEO BRUTALISM Error Message */}
            {error && (
              <div className="bg-red-500 border-[3px] border-black text-white px-4 py-3 rounded-lg text-sm sm:text-base flex items-center gap-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ✨ NEO BRUTALISM Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-[#FFB800] hover:bg-[#FF5722] text-black hover:text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('auth.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>{t('auth.loginButton')}</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-4">
            <p className="text-gray-700 text-sm sm:text-base">
              {t('auth.noAccount')}{' '}
              <Link 
                to="/register" 
                className="text-black font-black hover:text-yellow-600 transition-colors underline decoration-2 underline-offset-2"
              >
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>

          {/* ✨ NEO BRUTALISM Footer */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-black hover:text-[#FF5722] transition-colors text-sm sm:text-base font-black uppercase tracking-wide hover:bg-yellow-400 px-3 py-1.5 rounded-lg border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>←</span>
              <span>{t('auth.backToHome')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
