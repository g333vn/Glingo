// trang chọn level thi thử - Neo Brutalism Design
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { hasAccess } from '../../../utils/accessControlManager.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

function JLPTPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // JLPT Levels with translation keys
  const jlptLevels = [
    { id: 'n1', titleKey: 'jlpt.n1Title', descKey: 'jlpt.n1Desc', bgColor: '#FF0080' },
    { id: 'n2', titleKey: 'jlpt.n2Title', descKey: 'jlpt.n2Desc', bgColor: '#00D9FF' },
    { id: 'n3', titleKey: 'jlpt.n3Title', descKey: 'jlpt.n3Desc', bgColor: '#FFD600' },
    { id: 'n4', titleKey: 'jlpt.n4Title', descKey: 'jlpt.n4Desc', bgColor: '#00FF94' },
    { id: 'n5', titleKey: 'jlpt.n5Title', descKey: 'jlpt.n5Desc', bgColor: '#A78BFA' },
  ];

  // Check access for all levels
  const accessMap = useMemo(() => {
    const map = {};
    jlptLevels.forEach(level => {
      map[level.id] = hasAccess('jlpt', level.id, user);
    });
    return map;
  }, [user]);

  const handleJlptClick = (levelId) => {
    if (!accessMap[levelId]) {
      alert(t('accessControl.noAccessMessage', { level: levelId.toUpperCase() }));
      return;
    }
    navigate(`/jlpt/${levelId}`);
  };

  // Breadcrumbs - Always English
  const breadcrumbPaths = [
    { name: 'Home', link: '/' },
    { name: 'JLPT', link: '/jlpt' }
  ];

  return (
    <div className="w-full pr-0 md:pr-4">
      {/* Layout chính: Nội dung levels */}
      <div className="mt-4 w-full">
        {/* Nội dung chính */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full min-h-app">
          
          {/* ========== BREADCRUMBS - Compact ========== */}
          <div className="pt-3 px-4 sm:px-5 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* ========== JLPT LEVEL CARDS - Neo Brutalism Design ========== */}
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-4">
              {/* Row 1: N1 | N2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jlptLevels.slice(0, 2).map((level, index) => {
                  const hasLevelAccess = accessMap[level.id];
                  return (
                    <div 
                      key={level.id} 
                      className="group relative"
                      style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                        transition: `opacity 0.5s ease-out ${index * 100}ms, transform 0.5s ease-out ${index * 100}ms`
                      }}
                    >
                      <div
                        onClick={() => handleJlptClick(level.id)}
                        className={`w-full h-[180px] border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between transition-all duration-150 ease-out relative overflow-hidden ${
                          hasLevelAccess 
                            ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' 
                            : 'cursor-not-allowed'
                        }`}
                        style={{ backgroundColor: level.bgColor }}
                      >
                        {!hasLevelAccess && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                            <div className="bg-white border-[4px] border-black rounded-full w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Icon */}
                        <div className="flex justify-center">
                          <div className="bg-white border-4 border-black w-[72px] h-[72px] flex items-center justify-center text-4xl font-black text-black">
                            {level.id.toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-extrabold text-black text-center">
                          {t(level.titleKey)}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className="text-sm font-medium text-gray-700 text-center">
                          {t(level.descKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: N3 | N4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jlptLevels.slice(2, 4).map((level, index) => {
                  const hasLevelAccess = accessMap[level.id];
                  return (
                    <div 
                      key={level.id} 
                      className="group relative"
                      style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                        transition: `opacity 0.5s ease-out ${(index + 2) * 100}ms, transform 0.5s ease-out ${(index + 2) * 100}ms`
                      }}
                    >
                      <div
                        onClick={() => handleJlptClick(level.id)}
                        className={`w-full h-[180px] border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between transition-all duration-150 ease-out relative overflow-hidden ${
                          hasLevelAccess 
                            ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' 
                            : 'cursor-not-allowed'
                        }`}
                        style={{ backgroundColor: level.bgColor }}
                      >
                        {!hasLevelAccess && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                            <div className="bg-white border-[4px] border-black rounded-full w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Icon */}
                        <div className="flex justify-center">
                          <div className="bg-white border-4 border-black w-[72px] h-[72px] flex items-center justify-center text-4xl font-black text-black">
                            {level.id.toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-extrabold text-black text-center">
                          {t(level.titleKey)}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className="text-sm font-medium text-gray-700 text-center">
                          {t(level.descKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 3: N5 (Full Width) */}
              <div 
                className="group relative"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease-out ${4 * 100}ms, transform 0.5s ease-out ${4 * 100}ms`
                }}
              >
                {(() => {
                  const level = jlptLevels[4];
                  const hasLevelAccess = accessMap[level.id];
                  return (
                    <div
                      onClick={() => handleJlptClick(level.id)}
                      className={`w-full h-[160px] border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between transition-all duration-150 ease-out relative overflow-hidden ${
                        hasLevelAccess 
                          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' 
                          : 'cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: level.bgColor }}
                    >
                      {!hasLevelAccess && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                          <div className="bg-white border-[4px] border-black rounded-full w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {/* Icon */}
                      <div className="flex justify-center">
                        <div className="bg-white border-4 border-black w-[72px] h-[72px] flex items-center justify-center text-4xl font-black text-black">
                          {level.id.toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-extrabold text-black text-center">
                        {t(level.titleKey)}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-sm font-medium text-gray-700 text-center">
                        {t(level.descKey)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ========== QUOTE SECTION - ALBERT EINSTEIN ========== */}
          <div className="flex-1 px-5 pb-5 flex items-stretch min-h-0">
            <div className="w-full flex flex-col md:flex-row items-stretch gap-6 bg-gradient-to-br from-white via-blue-50/30 to-white rounded-xl shadow-inner border-2 border-gray-200 p-6 overflow-hidden">
              
              {/* Ảnh Albert Einstein - Proportional */}
              <div className="w-full md:w-2/5 flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/quote/quote_02.jpg" 
                  alt="Albert Einstein - Nhà vật lý thiên재" 
                  className="w-full h-full max-h-[240px] md:max-h-full object-cover rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                />
              </div>

              {/* Quote Content - Well Spaced */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-4 py-2">
                
                {/* Tên nhà khoa học - Elegant */}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-12 h-0.5 bg-blue-400 hidden md:block"></div>
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                    {t('jlpt.quoteAuthor')}
                  </h4>
                  <div className="w-12 h-0.5 bg-blue-400 hidden md:block"></div>
                </div>
                
                {/* Quote tiếng Anh - Prominent */}
                <blockquote className="text-lg md:text-xl font-serif italic text-gray-800 leading-relaxed border-l-4 border-blue-400 pl-5 py-2 bg-white/50 rounded-r-lg">
                  "{t('jlpt.quoteEn')}"
                </blockquote>

                {/* Quote tiếng Nhật - Complementary */}
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium pl-5">
                  {t('jlpt.quoteJa')}
                </p>

                {/* Decorative line */}
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto md:mx-0"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JLPTPage;