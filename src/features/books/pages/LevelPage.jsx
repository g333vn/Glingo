// chọn cấp độ học - OPTION A: 5 Cards Ngang + Quote Section Balanced
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';

const levels = [
  { id: 'n1', title: 'N1 - Cao cấp', description: 'Nội dung nâng cao nhất', imageUrl: '/level-buttons/n1-icon.jpg', colorClass: 'from-red-100 to-red-300 text-red-800' },
  { id: 'n2', title: 'N2 - Trung cao cấp', description: 'Nội dung trung cao cấp', imageUrl: '/level-buttons/n2-icon.jpg', colorClass: 'from-orange-100 to-orange-300 text-orange-800' },
  { id: 'n3', title: 'N3 - Trung cấp', description: 'Nội dung trung cấp', imageUrl: '/level-buttons/n3-icon.jpg', colorClass: 'from-yellow-100 to-yellow-300 text-yellow-800' },
  { id: 'n4', title: 'N4 - Sơ cấp', description: 'Nội dung sơ cấp', imageUrl: '/level-buttons/n4-icon.jpg', colorClass: 'from-green-100 to-green-300 text-green-800' },
  { id: 'n5', title: 'N5 - Cơ bản', description: 'Nội dung cơ bản nhất', imageUrl: '/level-buttons/n5-icon.jpg', colorClass: 'from-blue-100 to-blue-300 text-blue-800' },
];

function LevelPage() {
  const navigate = useNavigate();

  const handleLevelClick = (levelId) => {
    navigate(`/level/${levelId}`);
  };

  const breadcrumbPaths = [
    { name: 'ホーム', link: '/' },
    { name: 'LEVEL', link: '/level' }
  ];

  return (
    <div className="w-full pr-0 md:pr-4 flex flex-col md:flex-row">
      {/* Layout chính: Sidebar và Nội dung levels */}
      <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 mt-4 w-full">
        
        {/* Sidebar */}
        <Sidebar className="flex-shrink-0" />

        {/* Nội dung chính - HEIGHT MATCH SIDEBAR */}
        <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col w-full min-h-app">
          
          {/* ========== BREADCRUMBS - Compact ========== */}
          <div className="pt-3 px-5 pb-2 flex-shrink-0">
            <Breadcrumbs paths={breadcrumbPaths} />
          </div>
          
          {/* ========== LEVEL CARDS - 5 NGANG, ĐỀU NHAU, 220px ========== */}
          <div className="px-5 pt-2 pb-3 flex-shrink-0">
            <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible snap-x snap-mandatory">
              {levels.map((level) => (
                <div 
                  key={level.id} 
                  className="h-[220px] flex-shrink-0 min-w-[240px] sm:min-w-[260px] lg:min-w-0 lg:flex-shrink lg:w-auto snap-start"
                >
                  <div
                    onClick={() => handleLevelClick(level.id)}
                    className="cursor-pointer w-full h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                  >
                    <div className={`rounded-xl shadow-lg p-4 text-center border-2 border-gray-200 group-hover:border-yellow-400 h-full flex flex-col justify-between bg-gradient-to-br ${level.colorClass}`}>
                      
                      {/* Icon/Placeholder - Prominent */}
                      <div className="w-full h-20 rounded-lg mb-3 flex items-center justify-center text-3xl font-extrabold bg-gradient-to-br from-white/95 to-white/60 shadow-md">
                        {level.id.toUpperCase()}
                      </div>
                      
                      {/* Title - Clear */}
                      <h3 className="font-bold text-gray-800 mb-2 text-base leading-tight">
                        {level.title}
                      </h3>
                      
                      {/* Description - Readable */}
                      <p className="text-sm text-gray-700 leading-snug font-medium">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== QUOTE SECTION - CHIẾM HẾT KHÔNG GIAN CÒN LẠI ========== */}
          <div className="flex-1 px-5 pb-5 flex items-stretch min-h-0">
            <div className="w-full flex flex-col md:flex-row items-stretch gap-6 bg-gradient-to-br from-white via-amber-50/30 to-white rounded-xl shadow-inner border-2 border-gray-200 p-6 overflow-hidden">
              
              {/* Ảnh Paulo Coelho - Proportional */}
              <div className="w-full md:w-2/5 flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/quote/quote_01.jpg" 
                  alt="Paulo Coelho - Tác giả The Alchemist" 
                  className="w-full h-full max-h-[240px] md:max-h-full object-cover rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                />
              </div>

              {/* Quote Content - Well Spaced */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-4 py-2">
                
                {/* Tên tác giả - Elegant */}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-12 h-0.5 bg-yellow-400 hidden md:block"></div>
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                    Paulo Coelho
                  </h4>
                  <div className="w-12 h-0.5 bg-yellow-400 hidden md:block"></div>
                </div>
                
                {/* Quote tiếng Anh - Prominent */}
                <blockquote className="text-lg md:text-xl font-serif italic text-gray-800 leading-relaxed border-l-4 border-yellow-400 pl-5 py-2 bg-white/50 rounded-r-lg">
                  "And, when you want something, all the universe conspires in helping you to achieve it."
                </blockquote>

                {/* Quote tiếng Nhật - Complementary */}
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium pl-5">
                  「そして、あなたが何かを欲する時、全宇宙があなたがそれを実現するのを手伝うために共謀する。」
                </p>

                {/* Decorative line */}
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto md:mx-0"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LevelPage;