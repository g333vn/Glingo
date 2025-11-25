import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings } from '../utils/settingsManager.js';

const STORY_TRANSLATIONS = {
  vi: {
    title: 'Câu Chuyện Của Mình',
    paragraph1: 'Chào bạn, mình là một du học sinh ở Tokyo. Qua các trải nghiệm cũng như khó khăn trong quá trình học tiếng Nhật, cắm cúi tìm từng giáo trình một, từng đề thi, mua ở nhà sách, thư viện... lượng kiến thức cũng như tài liệu là khá nhiều.',
    paragraph2: 'Trong khi trải nghiệm học tập trên tài liệu truyền thống như sách giấy chưa tối ưu cũng như linh hoạt với cuộc sống bận rộn hiện tại của du học sinh như chúng mình hay là người đi làm có nhu cầu học tiếng Nhật để phục vụ công việc.',
    quote: 'Phải chi có cái app nào để học trên tàu, không cần mang sách...',
    paragraph3: 'Đêm đó, mình bắt đầu những dòng code đầu tiên của hocJLPTonline.com.'
  },
  en: {
    title: 'My Story',
    paragraph1: "Hi there! I'm an international student in Tokyo. Learning Japanese was a real challenge—spending hours hunting for textbooks, practice tests, and visiting bookstores and libraries. There was so much to learn and countless materials to go through.",
    paragraph2: "Studying with traditional paper books just wasn't practical or flexible for the busy lifestyle of students like me—or for working professionals who need Japanese for their careers.",
    quote: 'I wish there was an app to study on the train, without carrying books...',
    paragraph3: 'That night, I started writing the very first lines of code for hocJLPTonline.com.'
  },
  ja: {
    title: '私のストーリー',
    paragraph1: 'こんにちは、私は東京の留学生です。日本語を学ぶのは本当に大変で、教科書や模擬試験を探して本屋や図書館を何度も回りました。学ぶべきことも、こなすべき資料も山のようにありました。',
    paragraph2: '紙の教材での学習は、私たち留学生の忙しい生活や仕事で日本語が必要な社会人にとって、柔軟でも実用的でもありませんでした。',
    quote: '電車の中で本を持たずに勉強できるアプリがあればいいのに…',
    paragraph3: 'その夜、私は hocJLPTonline.com の最初のコードを書き始めました。'
  }
};

function AboutPage() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const storyData = STORY_TRANSLATIONS[currentLanguage] || STORY_TRANSLATIONS.en;
  const [isVisible, setIsVisible] = useState(false);
  const [quoteHover, setQuoteHover] = useState(false);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setIsVisible(true);
    
    // Listen for settings updates
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

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/2 right-10 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Japanese Quote removed on About page as requested */}

      {/* ✨ NEO BRUTALISM MAIN CONTAINER */}
      <div className="mx-auto bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-w-6xl relative z-0">
        {/* Hero Section */}
        <section className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 py-12 md:px-12 md:py-24">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <img
                  src="/logo/main.png"
                  alt={`${settings.system.platformName} Logo`}
                  className="h-28 sm:h-40 md:h-56 w-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>
              
              {/* Title - NEO BRUTALISM */}
              <h1 
                className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 text-black uppercase tracking-wide px-2"
                style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
              >
                {settings.system.platformName}
              </h1>
              <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                <span>🌐</span>
                <a 
                  href="https://hocJLPTonline.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-yellow-500 transition-colors duration-300 underline"
                >
                  hocJLPTonline.com
                </a>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow animation-delay-1000"></div>
        </section>

        {/* Story Section - UPDATED STYLING */}
        <section className={`py-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 md:px-12 max-w-4xl">
            <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 md:p-12 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-4xl animate-bounceSubtle">🎌</span>
                  <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    {storyData.title}
                  </span>
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                  {/* Paragraph 1 - với drop cap */}
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-yellow-500 first-letter:mr-2 first-letter:float-left">
                    {storyData.paragraph1}
                  </p>
                  
                  {/* Paragraph 2 */}
                  <p>
                    {storyData.paragraph2}
                  </p>
                  
                  {/* Quote - highlight box */}
                  <p className="italic text-yellow-600 font-semibold text-xl border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 py-3 rounded-r-lg">
                    "{storyData.quote}"
                  </p>
                  
                  {/* Paragraph 3 - câu cuối */}
                  <p>
                    {storyData.paragraph3}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className={`py-16 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 md:px-12 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Mission - NEO BRUTALISM */}
              <div className="bg-[#FFE5E5] rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-bounceSubtle">🎯</span>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {t('about.missionTitle')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t('about.missionText')}
                </p>
              </div>

              {/* Vision - NEO BRUTALISM */}
              <div className="bg-[#E5F5FF] rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-bounceSubtle animation-delay-300">✨</span>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {t('about.visionTitle')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t('about.visionText')}
                </p>
              </div>

              {/* 100% Free - NEO BRUTALISM */}
              <div className="bg-[#E5FFE5] rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-pulseGlow">💚</span>
                  <h3 className="text-2xl font-bold text-green-800">
                    {t('about.freeTitle')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                  {t('about.freeSubtitle')}
                </p>
                <div className="mt-4 flex items-center gap-2 text-green-700 font-medium">
                  <span className="text-2xl">🌱</span>
                  <span className="text-sm">{t('about.forLove')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ Key Features Section - 6 Cards */}
        <section className={`py-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4 sm:px-8 md:px-12 max-w-7xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-12 text-black uppercase tracking-wide">
              🎯 {t('about.keyFeatures')}
            </h2>
            
            {/* 6 Cards Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Card 1: SRS - Purple Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">🧠</div>
                  
                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.srs.title')}</h3>
                  
                  {/* Badge */}
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.srs.badge')}
                  </span>
                  
                  {/* Description */}
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.srs.description')}
                  </p>
                  
                  {/* Key Points */}
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm flex items-start gap-2">
                      <span className="flex-shrink-0">{t('about.features.srs.point1')}</span>
                    </li>
                    <li className="text-white/90 text-xs sm:text-sm flex items-start gap-2">
                      <span className="flex-shrink-0">{t('about.features.srs.point2')}</span>
                    </li>
                    <li className="text-white/90 text-xs sm:text-sm flex items-start gap-2">
                      <span className="flex-shrink-0">{t('about.features.srs.point3')}</span>
                    </li>
                  </ul>
                  
                  {/* CTA Button */}
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {t('about.features.srs.cta')}
                  </button>
                </div>
              </div>

              {/* Card 2: JLPT - Pink-Red Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">📝</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.jlpt.title')}</h3>
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.jlpt.badge')}
                  </span>
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.jlpt.description')}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.jlpt.point1')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.jlpt.point2')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.jlpt.point3')}</li>
                  </ul>
                  <button 
                    onClick={() => navigate('/jlpt')}
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {t('about.features.jlpt.cta')}
                  </button>
                </div>
              </div>

              {/* Card 3: Roadmap - Blue Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">🗺️</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.roadmap.title')}</h3>
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.roadmap.badge')}
                  </span>
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.roadmap.description')}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.roadmap.point1')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.roadmap.point2')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.roadmap.point3')}</li>
                  </ul>
                  <button 
                    onClick={() => navigate('/level')}
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {t('about.features.roadmap.cta')}
                  </button>
                </div>
              </div>

              {/* Card 4: Dictionary - Green Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">📖</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.dictionary.title')}</h3>
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.dictionary.badge')}
                  </span>
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.dictionary.description')}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dictionary.point1')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dictionary.point2')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dictionary.point3')}</li>
                  </ul>
                  {/* Dictionary - No specific route, button remains non-clickable */}
                  <button 
                    disabled
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base opacity-75 cursor-not-allowed"
                  >
                    {t('about.features.dictionary.cta')}
                  </button>
                </div>
              </div>

              {/* Card 5: Dashboard - Pink-Yellow Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">📊</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.dashboard.title')}</h3>
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.dashboard.badge')}
                  </span>
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.dashboard.description')}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dashboard.point1')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dashboard.point2')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.dashboard.point3')}</li>
                  </ul>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {t('about.features.dashboard.cta')}
                  </button>
                </div>
              </div>

              {/* Card 6: Streak - Orange Gradient */}
              <div className="group relative rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%)' }}>
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 group-hover:rotate-5 transition-transform duration-300">🔥</div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-wide">{t('about.features.streak.title')}</h3>
                  <span className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border-[2px] border-white/30 rounded-md text-white text-xs sm:text-sm font-bold">
                    {t('about.features.streak.badge')}
                  </span>
                  <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed">
                    {t('about.features.streak.description')}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.streak.point1')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.streak.point2')}</li>
                    <li className="text-white/90 text-xs sm:text-sm">{t('about.features.streak.point3')}</li>
                  </ul>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white/20 backdrop-blur-sm border-[2px] border-white/30 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/30 hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {t('about.features.streak.cta')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section - NEO BRUTALISM */}
        <section className={`py-16 bg-[#FFB800] border-t-[4px] border-black transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 md:px-12 text-center">
            {/* Free Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border-2 border-white/50 animate-pulseGlow">
              <span className="text-3xl">💚</span>
              <span className="text-white font-bold text-lg">{t('about.freeTitle')}</span>
              <span className="text-3xl">💚</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('about.letsStudy')}
            </h2>
            <p className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('about.ctaText')}
            </p>
            
            <a
              href={`mailto:${settings.system.contactEmail}`}
              className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black font-black px-4 sm:px-8 py-3 sm:py-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm sm:text-lg break-all sm:break-normal max-w-full mx-auto uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">📧</span>
              <span className="break-all sm:break-normal text-center sm:text-left">{settings.system.contactEmail}</span>
            </a>

            {/* Community Note */}
            <div className="mt-8 text-white/90 text-sm max-w-xl mx-auto">
              <p className="flex items-center justify-center gap-2">
                <span className="text-xl">🌸</span>
                <span>{t('about.communityProject')}</span>
              </p>
            </div>

            {/* Back to Home Link */}
            <div className="mt-8">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-yellow-200 font-semibold transition-all duration-300 group"
              >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                <span className="relative">
                  {t('about.backToHome')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full transition-all duration-300"></span>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer Quote - NEO BRUTALISM */}
        <section className="py-12 bg-[#2D2D2D] text-white border-t-[4px] border-black">
          <div className="container mx-auto px-8 md:px-12 text-center">
            <p className="text-2xl md:text-3xl font-serif italic mb-4">
              "天は人の上に人を造らず人の下に人を造らず"
            </p>
            <p className="text-gray-400 text-sm">
              {t('about.quoteTranslation')}
            </p>
          </div>
        </section>
      </div>

      {/* Import Google Fonts for calligraphy */}
      <link href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;500;700&family=Yuji+Syuku&family=Noto+Serif+JP:wght@400;500;600&display=swap" rel="stylesheet" />
    </div>
  );
}

export default AboutPage;