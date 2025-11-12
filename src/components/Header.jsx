// src/components/Header.jsx - ✨ GLASSMORPHISM VERSION với Scroll Effects
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExamGuard } from '../hooks/useExamGuard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function Header({ onUserIconClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigate: examNavigate, WarningModal } = useExamGuard();
  const { user, logout, isAdmin } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isJlptDropdownOpen, setIsJlptDropdownOpen] = useState(false);
  const [isMobileLevelOpen, setIsMobileLevelOpen] = useState(false);
  const [isMobileJlptOpen, setIsMobileJlptOpen] = useState(false);
  
  // ✨ NEW: Scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  const mobileMenuRef = useRef(null);
  const burgerButtonRef = useRef(null);

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

  // ✨ ENHANCED: Base hover effect với glow
  const linkHoverEffect = `
    relative pb-1 
    after:absolute after:bottom-[-4px] after:left-0 
    after:h-[3px] after:w-full 
    after:bg-gradient-to-r after:from-yellow-400 after:via-yellow-300 after:to-yellow-400
    after:scale-x-0 group-hover:after:scale-x-100 
    after:transition-all after:duration-300 after:ease-out
    after:origin-left
    after:shadow-[0_0_8px_rgba(250,204,21,0.6)]
    transition-all duration-300
  `;

  // ✨ ENHANCED: Active state với glow animation
  const linkActiveEffect = `
    relative pb-1 
    after:absolute after:bottom-[-4px] after:left-0 
    after:h-[3px] after:w-full 
    after:bg-gradient-to-r after:from-yellow-400 after:via-yellow-300 after:to-yellow-400
    after:scale-x-100
    after:shadow-[0_0_12px_rgba(250,204,21,0.8)]
    after:animate-pulse
  `;

  // ✅ Function để get class cho link
  const getLinkClass = (path) => {
    const baseClass = 'transition-all duration-300 hover:scale-105';
    if (isActive(path)) {
      return `text-yellow-400 font-semibold ${linkActiveEffect} ${baseClass} drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]`;
    }
    return `text-white ${linkHoverEffect} ${baseClass} hover:text-yellow-300`;
  };

  // ✅ Function để get class cho mobile link
  const getMobileLinkClass = (path) => {
    const baseClass = 'text-left py-3 px-4 rounded-lg transition-all duration-300';
    if (isActive(path)) {
      return `text-yellow-400 font-semibold bg-gradient-to-r from-gray-700/50 to-gray-600/50 ${baseClass} shadow-lg border-l-4 border-yellow-400`;
    }
    return `text-white hover:bg-gray-700/50 ${baseClass} hover:translate-x-1 hover:border-l-4 hover:border-yellow-400/50`;
  };

  const handleMobileLinkClick = () => {
    setIsMobileLevelOpen(false);
    setIsMobileJlptOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    // Sử dụng navigate thông thường cho các link không liên quan đến exam
    if (path.startsWith('/level/') || path.startsWith('/jlpt/')) {
      examNavigate(path); // Sử dụng examNavigate để check exam guard
    } else {
      navigate(path); // Sử dụng navigate thông thường
    }
  };

  // Lock body scroll when mobile menu is open (prevents layout jumps/glitches)
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
      {/* 🌟 GLASSMORPHISM HEADER WRAPPER với Scroll Effect */}
      <header 
        className={`
          sticky top-0 z-50 
          transition-all duration-500 ease-out
          ${isScrolled 
            ? 'bg-[rgba(35,35,35,0.95)] backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_40px_rgba(250,204,21,0.1)]' 
            : 'bg-[rgba(35,35,35,0.75)] backdrop-blur-lg shadow-md'
          }
          border-b border-white/10
        `}
      >
        {/* ✨ Gradient Border Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-60"></div>
        
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          {/* Logo với Scale Animation */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 sm:gap-3 bg-transparent border-none cursor-pointer group"
          >
            <img
              src="/logo/main.png"
              alt="Learn Your Approach Logo"
              className={`
                h-6 sm:h-7 md:h-8 w-auto object-contain 
                transition-all duration-500 ease-out
                group-hover:scale-110 group-hover:rotate-3
                drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]
                ${isScrolled ? 'scale-90' : 'scale-100'}
              `}
            />
            <span className={`
              font-bold text-sm sm:text-base md:text-lg lg:text-xl text-white whitespace-nowrap
              transition-all duration-500
              group-hover:text-yellow-300
              ${isScrolled ? 'text-sm sm:text-base md:text-base lg:text-lg' : 'text-sm sm:text-base md:text-lg lg:text-xl'}
            `}>
              Learn Your Approach
            </span>
          </button>

          {/* Desktop Links với Enhanced Effects - Tablet: gap nhỏ hơn, Desktop: gap lớn */}
          <div className="hidden md:flex items-center gap-3 lg:gap-8">
            {/* Home */}
            <button
              onClick={() => handleNavigate('/')}
              className={`${getLinkClass('/')} bg-transparent border-none cursor-pointer font-medium text-sm md:text-base`}
            >
              HOME 
            </button>

            {/* LEVEL Dropdown với Glassmorphism - FIXED GAP ISSUE */}
            <div
              className="relative group"
              onMouseEnter={() => setIsLevelDropdownOpen(true)}
              onMouseLeave={() => setIsLevelDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavigate('/level')}
                className={`${getLinkClass('/level')} flex items-center bg-transparent border-none cursor-pointer font-medium text-sm md:text-base`}
              >
                LEVEL
                <svg 
                  className={`ml-1 w-4 h-4 transition-transform duration-300 ${isLevelDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLevelDropdownOpen && (
                <>
                  {/* ✨ Hover Bridge - Invisible area để không bị mất dropdown */}
                  <div className="absolute left-0 top-full w-full h-2 bg-transparent z-10"></div>
                  
                  {/* Dropdown Menu (centered under trigger) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 min-w-[9rem] z-20">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl py-2 px-1 border border-yellow-400/20 origin-top scale-100 opacity-100 transition-none">
                      {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleNavigate(`/level/${level}`)}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 font-medium hover:translate-x-1"
                        >
                          {level.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* JLPT Dropdown với Glassmorphism - FIXED GAP ISSUE */}
            <div
              className="relative group"
              onMouseEnter={() => setIsJlptDropdownOpen(true)}
              onMouseLeave={() => setIsJlptDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavigate('/jlpt')}
                className={`${getLinkClass('/jlpt')} flex items-center bg-transparent border-none cursor-pointer font-medium text-sm md:text-base`}
              >
                JLPT
                <svg 
                  className={`ml-1 w-4 h-4 transition-transform duration-300 ${isJlptDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isJlptDropdownOpen && (
                <>
                  {/* ✨ Hover Bridge - Invisible area để không bị mất dropdown */}
                  <div className="absolute left-0 top-full w-full h-2 bg-transparent z-10"></div>
                  
                  {/* Dropdown Menu (centered under trigger) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 min-w-[11rem] z-20">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl py-2 px-1 border border-yellow-400/20 origin-top scale-100 opacity-100 transition-none">
                      {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleNavigate(`/jlpt/${level}`)}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 font-medium hover:translate-x-1"
                        >
                          Thi thử {level.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* About */}
            <button
              onClick={() => handleNavigate('/about')}
              className={`${getLinkClass('/about')} bg-transparent border-none cursor-pointer font-medium text-sm md:text-base`}
            >
              ABOUT ME
            </button>

            {/* User Info / Login */}
            {user ? (
              <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
                {/* Admin Panel Button (chỉ hiển thị cho admin) */}
                {isAdmin() && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    title="Admin Dashboard"
                  >
                    <span>⚙️</span>
                    <span>Admin Panel</span>
                  </button>
                )}
                  <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                    <span className="text-yellow-400 text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-none">
                      👤 {user.name || user.username}
                    </span>
                    {isAdmin() && (
                      <span className="text-xs bg-red-500 text-white px-1.5 md:px-2 py-0.5 rounded-full flex-shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-2 md:px-3 py-1 md:py-1.5 text-white hover:text-red-400 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                    title="Đăng xuất"
                  >
                    <span className="hidden lg:inline">Đăng xuất</span>
                    <span className="lg:hidden">X</span>
                  </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-2 md:px-4 py-1 md:py-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 rounded-lg transition-all font-medium text-xs md:text-sm border border-yellow-400/30 whitespace-nowrap"
              >
                <span className="hidden lg:inline">Đăng nhập</span>
                <span className="lg:hidden">Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button với Enhanced Animation */}
          <div className="md:hidden flex items-center">
            <button
              ref={burgerButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none text-2xl p-2 transition-all duration-300 hover:scale-110 hover:rotate-90 hover:text-yellow-400 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile Menu với Glassmorphism */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute left-0 right-0 top-full bg-[rgba(43,43,43,0.95)] backdrop-blur-xl px-4 py-4 flex flex-col gap-2 max-h-[70vh] overflow-y-auto border-t border-yellow-400/20 animate-[mobileMenuSlide_0.3s_ease-out]"
          >
            {/* Home */}
            <button
              onClick={() => { handleNavigate('/'); handleMobileLinkClick(); }}
              className={getMobileLinkClass('/')}
            >
              🏠 Home
            </button>

            {/* LEVEL Dropdown */}
            <div className="border-t border-gray-600/50 pt-2">
              <button
                onClick={() => setIsMobileLevelOpen(!isMobileLevelOpen)}
                className={`w-full ${getMobileLinkClass('/level')} flex justify-between items-center`}
              >
                <span>📚 LEVEL</span>
                <span className="text-sm transition-transform duration-300" style={{ transform: isMobileLevelOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {isMobileLevelOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-1 animate-[mobileMenuSlide_0.3s_ease-out]">
                  {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => (
                    <button
                      key={level}
                      onClick={() => { handleNavigate(`/level/${level}`); handleMobileLinkClick(); }}
                      className="text-gray-300 text-left py-2.5 px-4 hover:bg-gray-700/50 hover:text-yellow-400 rounded-lg transition-all text-sm font-medium hover:translate-x-1 border-l-2 border-transparent hover:border-yellow-400"
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* JLPT Dropdown */}
            <div className="border-t border-gray-600/50 pt-2">
              <button
                onClick={() => setIsMobileJlptOpen(!isMobileJlptOpen)}
                className={`w-full ${getMobileLinkClass('/jlpt')} flex justify-between items-center`}
              >
                <span>📝 JLPT</span>
                <span className="text-sm transition-transform duration-300" style={{ transform: isMobileJlptOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {isMobileJlptOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-1 animate-[mobileMenuSlide_0.3s_ease-out]">
                  {['n1', 'n2', 'n3', 'n4', 'n5'].map((level) => (
                    <button
                      key={level}
                      onClick={() => { handleNavigate(`/jlpt/${level}`); handleMobileLinkClick(); }}
                      className="text-gray-300 text-left py-2.5 px-4 hover:bg-gray-700/50 hover:text-yellow-400 rounded-lg transition-all text-sm font-medium hover:translate-x-1 border-l-2 border-transparent hover:border-yellow-400"
                    >
                      Thi thử {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="border-t border-gray-600/50 pt-2">
              <button
                onClick={() => { handleNavigate('/about'); handleMobileLinkClick(); }}
                className={getMobileLinkClass('/about')}
              >
                💫 ABOUT ME
              </button>
            </div>

            {/* Mobile User Info / Login */}
            <div className="border-t border-gray-600/50 pt-2">
              {user ? (
                <>
                  {/* Admin Panel Button (Mobile) */}
                  {isAdmin() && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        handleMobileLinkClick();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors mb-2 border border-purple-400/30"
                    >
                      <span className="flex items-center gap-2">
                        <span>⚙️</span>
                        <span className="font-semibold">Admin Panel</span>
                      </span>
                    </button>
                  )}
                  <div className="px-4 py-3 bg-yellow-400/10 rounded-lg mb-2 border border-yellow-400/30">
                    <p className="text-yellow-400 text-sm font-medium">
                      👤 {user.name || user.username}
                    </p>
                    {isAdmin() && (
                      <p className="text-xs text-red-400 mt-1">Role: Admin</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      handleMobileLinkClick();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    🚪 Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    handleMobileLinkClick();
                  }}
                  className={getMobileLinkClass('/login')}
                >
                  🔐 Đăng nhập
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ✅ CRITICAL: Render WarningModal từ useExamGuard */}
      {WarningModal}
    </>
  );
}

export default Header;