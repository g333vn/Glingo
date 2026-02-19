// src/components/LanguageSwitcher.jsx
// Language Switcher Component - 3D Waving Flags

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const flags = [
    { code: 'vi', flagSrc: '/flags/vietnam.svg', name: 'Tiếng Việt', country: 'Vietnam' },
    { code: 'en', flagSrc: '/flags/uk.svg', name: 'English', country: 'United Kingdom' },
    { code: 'ja', flagSrc: '/flags/japan.svg', name: '日本語', country: 'Japan' }
  ];
  
  const currentFlag = flags.find(f => f.code === currentLanguage);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <div ref={dropdownRef} className="relative">
      {/* Perfect Waving Flag - Ultra compact */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center transition-all duration-300 group w-12 h-9 md:w-14 md:h-10 lg:w-16 lg:h-12 xl:w-20 xl:h-14"
        aria-label="Change Language"
        title={currentFlag?.name}
        style={{ 
          perspective: '1500px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main Flag Container - 3D Waving */}
        <div 
          className="absolute inset-0 animate-flag-perfect-wave"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center'
          }}
        >
          {/* Flag Rectangle with Curve Effect */}
          <div className="relative w-full h-full">
            {/* Flag Image with 3D Wave */}
            <div 
              className="absolute inset-0 rounded-r-lg lg:rounded-r-xl shadow-[3px_3px_10px_rgba(0,0,0,0.6)] lg:shadow-[5px_5px_15px_rgba(0,0,0,0.6)] overflow-hidden border-[2px] lg:border-[3px] border-black/40 group-hover:border-black/70 transition-colors duration-300"
              style={{
                clipPath: 'polygon(0% 0%, 95% 5%, 100% 50%, 95% 95%, 0% 100%)'
              }}
            >
              <img 
                src={currentFlag?.flagSrc} 
                alt={currentFlag?.country}
                width={48}
                height={36}
                className="w-full h-full object-cover"
              />
              
              {/* Wave Ripple Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10 animate-wave-ripple"></div>
              
              {/* Fabric Texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 animate-fabric-wave"></div>
              
              {/* Intense Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-flag-shine" style={{ width: '30%' }}></div>
              
              {/* Edge Glow */}
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/20 to-transparent animate-edge-glow"></div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Wind Trails */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex flex-col gap-2">
            {/* Top wind stream */}
            <div className="flex gap-1.5 items-center">
              <span className="text-white/70 text-base font-bold animate-wind-trail-1">~</span>
              <span className="text-white/60 text-sm animate-wind-trail-2">~</span>
              <span className="text-white/40 text-xs animate-wind-trail-3">~</span>
            </div>
            {/* Bottom wind stream */}
            <div className="flex gap-1.5 items-center">
              <span className="text-white/60 text-sm animate-wind-trail-4">~</span>
              <span className="text-white/50 text-xs animate-wind-trail-5">~</span>
              <span className="text-white/30 text-xs animate-wind-trail-6">~</span>
            </div>
          </div>
        </div>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50 min-w-[220px]">
          {flags.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 font-medium transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-yellow-400 text-black'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              {/* Flag Image - No Pole */}
              <div className="relative w-12 h-9 flex-shrink-0 rounded-md overflow-hidden shadow-md border-[2px] border-black/20">
                <img 
                  src={lang.flagSrc} 
                  alt={lang.country}
                  width={48}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{lang.name}</div>
                <div className="text-xs text-gray-600">{lang.country}</div>
              </div>
              {currentLanguage === lang.code && (
                <span className="text-green-600 font-bold text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;

