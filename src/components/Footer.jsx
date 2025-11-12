import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden mt-0">
      {/* 🌟 GLASSMORPHISM BACKGROUND - Matching Header */}
      <div className="bg-gradient-to-br from-gray-900/85 via-gray-800/85 to-gray-900/85 backdrop-blur-xl border-t border-white/10 relative">
        
        {/* ✨ Animated Gradient Border Top - Matching Header's Bottom Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent opacity-70 animate-[gradientBorder_3s_ease_infinite]"></div>
        
        {/* Decorative background elements - Enhanced with more opacity */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulseGlow"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulseGlow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Brand Section - Enhanced */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 group">
                <img
                  src="/logo/main.png"
                  alt="Learn Your Approach Logo"
                  className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
                />
                <span className="font-bold text-lg text-white transition-colors duration-300 group-hover:text-yellow-300">
                  Learn Your Approach
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Học tiếng Nhật mọi lúc mọi nơi
                <br />
                <span className="text-yellow-400 font-semibold drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">100% miễn phí</span>
              </p>
            </div>

            {/* Quick Links - Enhanced with Icons */}
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center gap-2">
                <span className="text-xl">📚</span>
                <span>Quick Links</span>
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🏠</span>
                    <span className="relative">
                      Home
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/level" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">📖</span>
                    <span className="relative">
                      LEVEL System
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/jlpt" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">📝</span>
                    <span className="relative">
                      JLPT Practice
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-1 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">💫</span>
                    <span className="relative">
                      About Me
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Social - Enhanced */}
            <div className="text-center md:text-right">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-end gap-2">
                <span className="text-xl">📧</span>
                <span>Contact</span>
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:letranhoanggiangqb@gmail.com"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm group"
                >
                  <span className="group-hover:scale-125 transition-transform text-base">✉️</span>
                  <span className="relative">
                    letranhoanggiangqb@gmail.com
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </a>
                
                <div className="flex items-center justify-center md:justify-end gap-2 text-sm group">
                  <span className="text-gray-400 text-base group-hover:scale-110 transition-transform">🌐</span>
                  <a 
                    href="https://hocJLPTonline.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 relative"
                  >
                    hocJLPTonline.com
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-400"></span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-yellow-400 hover:w-full transition-all duration-300"></span>
                  </a>
                </div>

                {/* Social Media - Enhanced Glass Effect Buttons */}
                <div className="flex items-center justify-center md:justify-end gap-4 mt-4">
                  <button 
                    className="relative p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-125 group"
                    aria-label="Facebook"
                    title="Coming soon"
                  >
                    <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 rounded-full blur-sm transition-all duration-300"></div>
                    <Facebook size={20} className="relative z-10 drop-shadow-[0_0_8px_rgba(250,204,21,0)]" />
                  </button>
                  <button 
                    className="relative p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-125 group"
                    aria-label="Instagram"
                    title="Coming soon"
                  >
                    <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 rounded-full blur-sm transition-all duration-300"></div>
                    <Instagram size={20} className="relative z-10" />
                  </button>
                  <button 
                    className="relative p-2 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:scale-125 group"
                    aria-label="Line"
                    title="Coming soon"
                  >
                    <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 rounded-full blur-sm transition-all duration-300"></div>
                    <MessageCircle size={20} className="relative z-10" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider - Enhanced with gradient */}
          <div className="relative mb-6">
            <div className="border-t border-gray-700/50"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          </div>

          {/* Bottom Section - Enhanced Typography */}
          <div className="flex flex-col items-center gap-4">
            {/* Row 1: Copyright and Mission */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
              <p className="text-gray-500 text-xs sm:text-sm text-center transition-colors duration-300 hover:text-gray-400">
                © {currentYear} Learn Your Approach (Glingo). All Rights Reserved.
              </p>
              
              {/* Mission Statement - Enhanced with animation */}
              <div className="flex items-center gap-2 text-xs text-gray-500 group">
                <span className="text-green-400 animate-pulse text-base">💚</span>
                <span className="transition-colors duration-300 group-hover:text-green-400">
                  Phi lợi nhuận - Phục vụ cộng đồng
                </span>
                <span className="text-green-400 animate-pulse animation-delay-500 text-base">💚</span>
              </div>
            </div>

            {/* Row 2: Japanese Quote - Enhanced Glass Card */}
            <div className="relative group">
              {/* Glass card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative text-center px-6 py-3 rounded-lg transition-all duration-500 group-hover:bg-white/5">
                <p className="text-gray-600 text-sm italic font-serif transition-colors duration-300 group-hover:text-gray-500">
                  "天は人の上に人を造らず人の下に人を造らず"
                </p>
              </div>
            </div>

            {/* ✨ Scroll to Top Button - NEW */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-4 group relative px-6 py-2 bg-white/5 hover:bg-yellow-400/10 backdrop-blur-md border border-white/10 hover:border-yellow-400/30 rounded-full transition-all duration-300 hover:scale-105"
              aria-label="Scroll to top"
            >
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300">
                <span className="text-sm font-medium">Scroll to Top</span>
                <span className="text-base group-hover:-translate-y-1 transition-transform duration-300">⬆️</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;