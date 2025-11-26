// src/components/Header.jsx - ✨ NEO BRUTALISM + JAPANESE AESTHETIC
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExamGuard } from '../hooks/useExamGuard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { hasAccess } from '../utils/accessControlManager.js';
import { hasDashboardAccess } from '../utils/dashboardAccessManager.js';
import { getSettings } from '../utils/settingsManager.js';
import StreakCounter from './StreakCounter.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import NotificationBell from './NotificationBell.jsx';

function Header({ onUserIconClick, isMaintenanceLock = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigate: examNavigate, WarningModal, shouldShowWarning, clearExamData } = useExamGuard();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(getSettings());
  
  // Check if user is editor
  const isEditor = () => {
    return user && user.role === 'editor';
  };
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isJlptDropdownOpen, setIsJlptDropdownOpen] = useState(false);
  const [isMobileLevelOpen, setIsMobileLevelOpen] = useState(false);
  const [isMobileJlptOpen, setIsMobileJlptOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      setSettings(event.detail);
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    // Also check on mount in case settings changed while page was not active
    const currentSettings = getSettings();
    setSettings(currentSettings);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);
  
  // ✨ NEW: Scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  const mobileMenuRef = useRef(null);
  const burgerButtonRef = useRef(null);

  // Check access for all levels
  const levelAccessMap = useMemo(() => {
    const map = {};
    ['n1', 'n2', 'n3', 'n4', 'n5'].forEach(level => {
      map[level] = hasAccess('level', level, user);
    });
    return map;
  }, [user]);

  const jlptAccessMap = useMemo(() => {
    const map = {};
    ['n1', 'n2', 'n3', 'n4', 'n5'].forEach(level => {
      map[level] = hasAccess('jlpt', level, user);
    });
    return map;
  }, [user]);

  // ✨ NEW: Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Helper function để check active state
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        burgerButtonRef.current &&
        !burgerButtonRef.current.contains(event.target)
      ) {
        setIsMobileLevelOpen(false);
        setIsMobileJlptOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // ✅ Function để get class cho link - NEO BRUTALISM STYLE
  const getLinkClass = (path) => {
    const baseClass = 'transition-all duration-200 font-black uppercase tracking-wide';
    if (isActive(path)) {
      return `text-black bg-yellow-400 px-3 py-1.5 rounded-md border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${baseClass}`;
    }
    return `text-white hover:text-black hover:bg-yellow-400 px-3 py-1.5 rounded-md border-[3px] border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${baseClass}`;
  };

  // ✅ Function để get class cho mobile link - NEO BRUTALISM STYLE
  const getMobileLinkClass = (path) => {
    const baseClass = 'text-left py-3 px-4 rounded-lg transition-all duration-200 font-bold uppercase';
    if (isActive(path)) {
      return `text-black bg-yellow-400 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${baseClass}`;
    }
    return `text-white hover:text-black hover:bg-yellow-400 border-[3px] border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${baseClass}`;
  };

  const handleMobileLinkClick = () => {
    setIsMobileLevelOpen(false);
    setIsMobileJlptOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    // ✅ TẤT CẢ navigation đều phải qua examNavigate để exam guard có thể check và cảnh báo
    examNavigate(path);
  };

  const handleLogoutConfirmed = () => {
    setShowLogoutConfirm(false);
    clearExamData?.();
    logout();
    examNavigate('/');
    handleMobileLinkClick();
  };

  const handleLogoutClick = () => {
    if (shouldShowWarning) {
      setShowLogoutConfirm(true);
    } else {
      handleLogoutConfirmed();
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ✨ REDESIGNED HEADER - Clean & Beautiful */}
      <header 
        lang="en"
        style={{ 
          fontFamily: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          fontFeatureSettings: 'normal',
          fontVariant: 'normal',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
        className={`
          fixed top-0 left-0 right-0 z-50 
          transition-all duration-300
          ${isScrolled 
            ? 'bg-[#2D2D2D] md:bg-[#2D2D2D]/95 md:backdrop-blur-sm shadow-[0_4px_0px_0px_rgba(0,0,0,1)]' 
            : 'bg-[#2D2D2D]'
          }
          border-b-[3px] border-black
        `}
      >
        <nav className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-3.5 flex justify-between items-center gap-3 sm:gap-4">
          {/* Logo - Clean & Compact */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 sm:gap-3 bg-transparent border-none cursor-pointer group flex-shrink-0 min-w-0"
          >
            {/* Logo Icon */}
            <div className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center bg-gradient-to-br from-white to-yellow-50 rounded-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1.5 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:from-yellow-400 group-hover:to-yellow-300 transition-all duration-200 group-hover:scale-105">
              <img
                src="/logo/main.png"
                alt={settings.system.platformName}
                className="h-full w-full object-contain drop-shadow-lg"
              />
            </div>
            {/* Logo text - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex flex-col">
              <span className="font-black text-sm md:text-base lg:text-lg text-white whitespace-nowrap transition-colors duration-200 group-hover:text-yellow-400 leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {settings.system.platformName}
              </span>
              <span className="text-[10px] md:text-xs text-yellow-400 font-bold uppercase tracking-wide">
                {settings.system.platformTagline}
              </span>
            </div>
          </button>

          {/* Desktop Links - Centered & Balanced (chỉ hiển thị từ lg trở lên để tablet dọc dùng menu mobile) */}
          <div 
            lang="en"
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              contain: 'layout style'
            }}
            className="hidden lg:flex items-center gap-2 lg:gap-3 flex-1 justify-center max-w-2xl mx-auto"
          >
            {/* Home */}
            <button
              onClick={() => handleNavigate('/')}
              className={`px-3 lg:px-4 py-1.5 lg:py-2 font-bold text-sm lg:text-base uppercase tracking-wide transition-all duration-200 rounded-md ${
                isActive('/') && location.pathname === '/'
                  ? 'text-black bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-white hover:text-yellow-400 hover:bg-white/10 border-[3px] border-transparent hover:border-yellow-400/30'
              }`}
            >
              Home
            </button>

            {/* LEVEL Dropdown - Improved styling */}
            <div
              className="relative group"
              onMouseEnter={() => setIsLevelDropdownOpen(true)}
              onMouseLeave={() => setIsLevelDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavigate('/level')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 font-bold text-sm lg:text-base uppercase tracking-wide transition-all duration-200 rounded-md flex items-center gap-1.5 ${
                  isActive('/level')
                    ? 'text-black bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-white hover:text-yellow-400 hover:bg-white/10 border-[3px] border-transparent hover:border-yellow-400/30'
                }`}
              >
                Level
                <svg className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 ${isLevelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLevelDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-20">
                  <div className="bg-white rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[2px] border-black py-1.5 px-1 min-w-[100px]">
                    {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => {
                      const hasLevelAccess = levelAccessMap[level];
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            if (hasLevelAccess) {
                              handleNavigate(`/level/${level}`);
                            } else {
                              alert(t('accessControl.noAccessMessage', { level: level.toUpperCase() }));
                            }
                          }}
                          className={`block w-full text-center px-3 py-1.5 text-sm font-bold rounded transition-all duration-200 flex items-center justify-center gap-2 ${
                            hasLevelAccess
                              ? 'text-black hover:bg-yellow-400'
                              : 'text-gray-400 cursor-not-allowed opacity-60'
                          }`}
                        >
                          {!hasLevelAccess && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                          <span>{level.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* JLPT Dropdown - Improved styling */}
            <div
              className="relative group"
              onMouseEnter={() => setIsJlptDropdownOpen(true)}
              onMouseLeave={() => setIsJlptDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavigate('/jlpt')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 font-bold text-sm lg:text-base uppercase tracking-wide transition-all duration-200 rounded-md flex items-center gap-1.5 ${
                  isActive('/jlpt')
                    ? 'text-black bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-white hover:text-yellow-400 hover:bg-white/10 border-[3px] border-transparent hover:border-yellow-400/30'
                }`}
              >
                JLPT
                <svg className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 ${isJlptDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isJlptDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-20">
                  <div className="bg-white rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[2px] border-black py-1.5 px-1 min-w-[100px]">
                    {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => {
                      const hasLevelAccess = jlptAccessMap[level];
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            if (hasLevelAccess) {
                              handleNavigate(`/jlpt/${level}`);
                            } else {
                              alert(t('accessControl.noAccessMessage', { level: level.toUpperCase() }));
                            }
                          }}
                          className={`block w-full text-center px-3 py-1.5 text-sm font-bold rounded transition-all duration-200 flex items-center justify-center gap-2 ${
                            hasLevelAccess
                              ? 'text-black hover:bg-yellow-400'
                              : 'text-gray-400 cursor-not-allowed opacity-60'
                          }`}
                        >
                          {!hasLevelAccess && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                          <span>{level.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <button
              onClick={() => handleNavigate('/about')}
              className={`px-3 lg:px-4 py-1.5 lg:py-2 font-bold text-sm lg:text-base uppercase tracking-wide transition-all duration-200 rounded-md ${
                isActive('/about')
                  ? 'text-black bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-white hover:text-yellow-400 hover:bg-white/10 border-[3px] border-transparent hover:border-yellow-400/30'
              }`}
            >
              About
            </button>
          </div>

          {/* Right Side - Clean & Compact (ẩn trên tablet dọc, chỉ hiện từ lg) */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Language Switcher - 3D Waving Flag */}
            <LanguageSwitcher />

            {/* Notification Bell */}
            {user && !isMaintenanceLock && <NotificationBell />}

            {/* Streak Counter */}
            {user && !isMaintenanceLock && <StreakCounter />}
            
            {/* User Menu - Very compact */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 lg:gap-2 px-1.5 lg:px-2 py-1 lg:py-1.5 bg-white/10 hover:bg-white/20 rounded-full border-[2px] border-white/30 hover:border-white transition-all duration-200"
                  title={`${t('header.userMenu.account')}: ${user.name || user.username}`}
                >
                  {/* User Avatar Circle */}
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 border-[2px] border-black flex items-center justify-center font-black text-white text-base lg:text-lg shadow-sm">
                    {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  {/* Username - Only show on xl+ screens */}
                  <span className="hidden xl:block text-white font-semibold text-sm truncate max-w-[120px]">
                    {user.name || user.username}
                  </span>
                  {/* Role Badge - Only on 2xl screens */}
                  {isAdmin() && (
                    <span className="hidden 2xl:flex items-center text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full border border-black font-bold">
                      {t('header.userMenu.admin')}
                    </span>
                  )}
                  {isEditor() && !isAdmin() && (
                    <span className="hidden 2xl:flex items-center text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full border border-black font-bold">
                      {t('header.userMenu.editor')}
                    </span>
                  )}
                </button>
                
                {/* Dropdown Menu - Google Style */}
                <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[260px]">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-b-[3px] border-black">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white border-[3px] border-black flex items-center justify-center font-black text-gray-800 text-xl shadow-md">
                          {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-base text-black">{user.name || user.username}</div>
                          <div className="text-xs text-gray-800 font-medium">{user.email || t('header.userMenu.userAccount')}</div>
                          {(isAdmin() || isEditor()) && (
                            <div className="mt-1 flex items-center gap-1">
                              {isAdmin() && (
                                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full border border-black font-bold">
                                  ⚙️ {t('header.userMenu.admin')}
                                </span>
                              )}
                              {isEditor() && !isAdmin() && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full border border-black font-bold">
                                  ✏️ {t('header.userMenu.editor')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dashboard - Check access first */}
                      {hasDashboardAccess(user) ? (
                        <button
                          onClick={() => handleNavigate('/dashboard')}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 flex items-center gap-3 text-sm font-semibold text-gray-800 transition-colors border-b border-gray-100"
                        >
                          <span className="text-xl">📊</span>
                          <div className="flex-1">
                            <div className="font-bold">{t('header.userMenu.dashboard')}</div>
                            <div className="text-xs text-gray-500">{t('header.userMenu.dashboardDesc')}</div>
                          </div>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full text-left px-4 py-3 bg-gray-100 flex items-center gap-3 text-sm font-semibold text-gray-400 transition-colors border-b border-gray-100 cursor-not-allowed opacity-60"
                        >
                          <span className="text-xl">🔒</span>
                          <div className="flex-1">
                            <div className="font-bold">{t('header.userMenu.dashboard')}</div>
                            <div className="text-xs text-gray-400">{t('header.userMenu.dashboardLocked')}</div>
                          </div>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleNavigate('/profile')}
                        className="w-full text-left px-4 py-3 hover:bg-yellow-50 flex items-center gap-3 text-sm font-semibold text-gray-800 transition-colors"
                      >
                        <span className="text-xl">👤</span>
                        <span>{t('header.userMenu.myProfile')}</span>
                      </button>
                      
                      {/* Divider if admin/editor */}
                      {(isAdmin() || isEditor()) && (
                        <div className="border-t-[2px] border-gray-200 my-2"></div>
                      )}
                      
                      {isAdmin() && (
                        <button
                          onClick={() => handleNavigate('/admin')}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 text-sm font-semibold text-gray-800 transition-colors"
                        >
                          <span className="text-xl">⚙️</span>
                          <div className="flex-1">
                            <div className="font-bold">{t('header.userMenu.adminPanel')}</div>
                            <div className="text-xs text-purple-600">{t('header.userMenu.adminPanelDesc')}</div>
                          </div>
                        </button>
                      )}
                      
                      {isEditor() && (
                        <button
                          onClick={() => handleNavigate('/editor')}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 text-sm font-semibold text-gray-800 transition-colors"
                        >
                          <span className="text-xl">✏️</span>
                          <div className="flex-1">
                            <div className="font-bold">{t('header.userMenu.editorPanel')}</div>
                            <div className="text-xs text-blue-600">{t('header.userMenu.editorPanelDesc')}</div>
                          </div>
                        </button>
                      )}
                    </div>
                    
                    {/* Logout */}
                    <div className="border-t-[3px] border-gray-200">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-bold text-red-600 transition-colors"
                      >
                        <span className="text-xl">🚪</span>
                        <span>{t('header.userMenu.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('/login')}
                className="px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 md:py-2 lg:py-2.5 bg-yellow-400 text-black font-bold rounded-md lg:rounded-lg border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-xs md:text-sm lg:text-base hover:scale-105"
              >
                {t('auth.login')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button - Simplified (hiển thị cho màn hình nhỏ hơn lg, bao gồm tablet dọc) */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher - Mobile (3 Flags) */}
            <LanguageSwitcher />
            
            {/* Notification Bell - Mobile */}
            {user && !isMaintenanceLock && <NotificationBell />}
            
            {/* Streak (if logged in) */}
            {user && !isMaintenanceLock && <StreakCounter />}
            
            {/* User Avatar - Mobile (if logged in) */}
            {user && (
              <button
                onClick={() => {
                  // Toggle user menu on mobile - could open a dropdown or navigate to profile
                  handleNavigate('/profile');
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 border-[2px] border-black flex items-center justify-center font-black text-white text-sm shadow-sm"
                title={`${user.name || user.username}`}
              >
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </button>
            )}
            
            {/* Burger Menu */}
            <button
              ref={burgerButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none text-lg sm:text-xl p-1.5 sm:p-2 bg-white/10 border-[2px] border-white/30 rounded-lg hover:bg-white/20 hover:border-white transition-all duration-200 flex-shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile Menu - NEO BRUTALISM (áp dụng cho < lg, bao gồm tablet dọc) */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            lang="en"
            style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            className="lg:hidden absolute left-0 right-0 top-full bg-[#2D2D2D] px-4 py-4 flex flex-col gap-2 max-h-[70vh] overflow-y-auto border-t-[4px] border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* Home */}
            <button
              onClick={() => { handleNavigate('/'); handleMobileLinkClick(); }}
              className={getMobileLinkClass('/')}
            >
              🏠 Home
            </button>

            {/* LEVEL Dropdown */}
            <div className="border-t-[3px] border-black pt-2">
              <button
                onClick={() => setIsMobileLevelOpen(!isMobileLevelOpen)}
                className={`w-full ${getMobileLinkClass('/level')} flex justify-between items-center`}
              >
                <span>📚 LEVEL</span>
                <span className="text-sm transition-transform duration-200" style={{ transform: isMobileLevelOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {isMobileLevelOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-1">
                  <button
                    onClick={() => { handleNavigate('/level'); handleMobileLinkClick(); }}
                    className="text-black bg-yellow-400 font-black text-left py-2.5 px-4 rounded-lg transition-all text-sm border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    🎯 Select Level
                  </button>
                  {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => {
                    const hasLevelAccess = levelAccessMap[level];
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          if (hasLevelAccess) {
                            handleNavigate(`/level/${level}`);
                            handleMobileLinkClick();
                          } else {
                            alert(t('accessControl.noAccessMessage', { level: level.toUpperCase() }));
                          }
                        }}
                        className={`text-left py-2.5 px-4 rounded-lg transition-all text-sm font-black border-[3px] flex items-center gap-2 ${
                          hasLevelAccess
                            ? 'text-white hover:text-black hover:bg-yellow-400 border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            : 'text-gray-400 cursor-not-allowed opacity-60 border-transparent'
                        }`}
                      >
                        {!hasLevelAccess && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                        <span>{level.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* JLPT Dropdown */}
            <div className="border-t-[3px] border-black pt-2">
              <button
                onClick={() => setIsMobileJlptOpen(!isMobileJlptOpen)}
                className={`w-full ${getMobileLinkClass('/jlpt')} flex justify-between items-center`}
              >
                <span>📝 JLPT</span>
                <span className="text-sm transition-transform duration-200" style={{ transform: isMobileJlptOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {isMobileJlptOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-1">
                  <button
                    onClick={() => { handleNavigate('/jlpt'); handleMobileLinkClick(); }}
                    className="text-black bg-yellow-400 font-black text-left py-2.5 px-4 rounded-lg transition-all text-sm border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    🎯 Select Level
                  </button>
                  {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => {
                    const hasLevelAccess = jlptAccessMap[level];
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          if (hasLevelAccess) {
                            handleNavigate(`/jlpt/${level}`);
                            handleMobileLinkClick();
                          } else {
                            alert(t('accessControl.noAccessMessage', { level: level.toUpperCase() }));
                          }
                        }}
                        className={`text-left py-2.5 px-4 rounded-lg transition-all text-sm font-black border-[3px] flex items-center gap-2 ${
                          hasLevelAccess
                            ? 'text-white hover:text-black hover:bg-yellow-400 border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            : 'text-gray-400 cursor-not-allowed opacity-60 border-transparent'
                        }`}
                      >
                        {!hasLevelAccess && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                        <span>Mock Test {level.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* About */}
            <div className="border-t-[3px] border-black pt-2">
              <button
                onClick={() => { handleNavigate('/about'); handleMobileLinkClick(); }}
                className={getMobileLinkClass('/about')}
              >
                💫 ABOUT ME
              </button>
            </div>

            {/* Mobile User Info / Login */}
            <div className="border-t-[3px] border-black pt-2">
              {user ? (
                <>
                  {/* User Info Card */}
                  <button
                    onClick={() => {
                      handleNavigate('/profile');
                      handleMobileLinkClick();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-yellow-400 text-black font-black mb-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <p className="text-sm">
                      👤 {user.name || user.username}
                    </p>
                    {isAdmin() && (
                      <p className="text-xs text-red-500 mt-1 font-black">{t('header.userMenu.roleAdmin')}</p>
                    )}
                    {isEditor() && !isAdmin() && (
                      <p className="text-xs text-blue-500 mt-1 font-black">{t('header.userMenu.roleEditor')}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{t('header.userMenu.clickToView')}</p>
                  </button>

                  {/* Dashboard - Check access first */}
                  {hasDashboardAccess(user) ? (
                    <button
                      onClick={() => {
                        handleNavigate('/dashboard');
                        handleMobileLinkClick();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-purple-400 to-blue-400 text-white font-black mb-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <p className="text-sm">📊 {t('header.userMenu.dashboard')}</p>
                      <p className="text-xs text-white/80 mt-1">{t('header.userMenu.dashboardDesc')}</p>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full text-left px-4 py-3 rounded-lg bg-gray-300 text-gray-500 font-black mb-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed opacity-60"
                    >
                      <p className="text-sm">🔒 {t('header.userMenu.dashboard')}</p>
                      <p className="text-xs text-gray-400 mt-1">{t('header.userMenu.dashboardLocked')}</p>
                    </button>
                  )}
                  
                  {/* Divider before admin/editor panels */}
                  {(isAdmin() || isEditor()) && (
                    <div className="my-2 border-t-[2px] border-white/20"></div>
                  )}

                  {/* Admin Panel */}
                  {isAdmin() && (
                    <button
                      onClick={() => {
                        handleNavigate('/admin');
                        handleMobileLinkClick();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-purple-500 text-white font-black mb-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">⚙️</span>
                        <div>
                          <div className="text-sm">{t('header.userMenu.adminPanel')}</div>
                          <div className="text-xs opacity-90 font-medium">{t('header.userMenu.adminPanelDesc')}</div>
                        </div>
                      </span>
                    </button>
                  )}
                  
                  {/* Editor Panel */}
                  {isEditor() && (
                    <button
                      onClick={() => {
                        handleNavigate('/editor');
                        handleMobileLinkClick();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-blue-500 text-white font-black mb-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">✏️</span>
                        <div>
                          <div className="text-sm">{t('header.userMenu.editorPanel')}</div>
                          <div className="text-xs opacity-90 font-medium">{t('header.userMenu.editorPanelDesc')}</div>
                        </div>
                      </span>
                    </button>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-400 hover:text-white font-black border-[3px] border-red-400 hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  >
                    🚪 {t('header.userMenu.logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleNavigate('/login');
                    handleMobileLinkClick();
                  }}
                  className={getMobileLinkClass('/login')}
                >
                  🔐 {t('auth.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ✅ CRITICAL: Render WarningModal từ useExamGuard */}
      {WarningModal}

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-black text-red-600 mb-3">{t('header.logoutModal.title')}</h2>
            <p className="text-gray-700 mb-6">
              {t('header.logoutModal.message')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-bold border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-300 transition-all duration-200"
              >
                {t('header.logoutModal.stayButton')}
              </button>
              <button
                onClick={handleLogoutConfirmed}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-bold border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all duration-200"
              >
                {t('header.logoutModal.confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
