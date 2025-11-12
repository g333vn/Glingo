import React, { useEffect, useState } from 'react';

function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [quoteHover, setQuoteHover] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/2 right-10 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Japanese Quote removed on About page as requested */}

      {/* UPDATED MAIN CONTAINER - Synchronized Styling */}
      <div className="mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden max-w-6xl border-2 border-white/50 relative z-0">
        {/* Hero Section */}
        <section className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 py-12 md:px-12 md:py-24">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <img
                  src="/logo/main.png"
                  alt="Learn Your Approach Logo"
                  className="h-28 sm:h-40 md:h-56 w-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient px-2">
                Learn Your Approach
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
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 md:p-12 border-2 border-white/50 hover:shadow-3xl transition-shadow duration-500">
              {/* Vietnamese Version */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-4xl animate-bounceSubtle">🎌</span>
                  <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    Câu Chuyện Của Mình
                  </span>
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-yellow-500 first-letter:mr-2 first-letter:float-left">
                    Chào bạn, mình là một du học sinh ở Tokyo. Qua các trải nghiệm cũng như khó khăn trong quá trình học tiếng Nhật, cắm cúi tìm từng giáo trình một, từng đề thi, mua ở nhà sách, thư viện... lượng kiến thức cũng như tài liệu là khá nhiều.
                  </p>
                  <p>
                    Trong khi trải nghiệm học tập trên tài liệu truyền thống như sách giấy chưa tới ưu cũng như linh hoạt với cuộc sống bận rộn hiện tại của du học sinh như chúng mình hay là người đi làm có nhu cầu học tiếng Nhật để phục vụ công việc.
                  </p>
                  <p className="italic text-yellow-600 font-semibold text-xl border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 py-3 rounded-r-lg">
                    "Phải chi có cái app nào để học trên tàu, không cần mang sách..."
                  </p>
                  <p>
                    Đêm đó, mình bắt đầu những dòng code đầu tiên của <span className="font-bold text-yellow-600">hocJLPTonline.com</span>.
                  </p>
                </div>
              </div>

              {/* English Version */}
              <div className="border-t-2 border-orange-200 pt-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-4xl animate-bounceSubtle animation-delay-500">📖</span>
                  <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent">
                    My Story
                  </span>
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-orange-500 first-letter:mr-2 first-letter:float-left">
                    Hi there! I'm an international student in Tokyo. Learning Japanese was a real challenge—spending hours hunting for textbooks, practice tests, and visiting bookstores and libraries. There was so much to learn and countless materials to go through.
                  </p>
                  <p>
                    Studying with traditional paper books just wasn’t practical or flexible for the busy lifestyle of students like me—or for working professionals who need Japanese for their careers.
                  </p>
                  <p className="italic text-orange-600 font-semibold text-xl border-l-4 border-orange-500 pl-4 bg-orange-50/50 py-3 rounded-r-lg">
                    "I wish there was an app to study on the train, without carrying books..."
                  </p>
                  <p>
                    That night, I started writing the very first lines of code for <span className="font-bold text-orange-600">hocJLPTonline.com</span>.
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
              {/* Mission - UPDATED STYLING */}
              <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 hover:scale-105 hover:shadow-3xl transition-all duration-300 border-2 border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-bounceSubtle">🎯</span>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Sứ Mệnh
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Mang đến trải nghiệm học tiếng Nhật linh hoạt, hiện đại cho mọi người - bất kể bạn đang trên tàu điện, quán cà phê, hay giữa giờ nghỉ trưa.
                </p>
                <p className="text-gray-600 italic text-sm border-t border-gray-200 pt-3">
                  Bringing a flexible, modern Japanese learning experience to everyone - whether you're on the train, at a café, or during lunch break.
                </p>
              </div>

              {/* Vision - UPDATED STYLING */}
              <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 hover:scale-105 hover:shadow-3xl transition-all duration-300 border-2 border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-bounceSubtle animation-delay-300">✨</span>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Tầm Nhìn
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Trở thành nền tảng học tiếng Nhật hàng đầu cho du học sinh và người đi làm, nơi kiến thức luôn sẵn sàng trong túi bạn.
                </p>
                <p className="text-gray-600 italic text-sm border-t border-gray-200 pt-3">
                  Becoming the leading Japanese learning platform for students and professionals, where knowledge is always in your pocket.
                </p>
              </div>

              {/* 100% Free - UPDATED STYLING */}
              <div className="bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 hover:scale-105 hover:shadow-3xl transition-all duration-300 border-2 border-green-400">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl animate-pulseGlow">💚</span>
                  <h3 className="text-2xl font-bold text-green-800">
                    100% Miễn Phí
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                  Phi lợi nhuận - Phục vụ cộng đồng
                </p>
                <p className="text-gray-600 italic text-sm border-t border-green-300 pt-3">
                  100% Free - Non-profit - Community Service
                </p>
                <div className="mt-4 flex items-center gap-2 text-green-700 font-medium">
                  <span className="text-2xl">🌱</span>
                  <span className="text-sm">Vì tình yêu tiếng Nhật</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 md:px-12 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient">
              Key Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* JLPT Practice - UPDATED STYLING */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-2 border-white/50">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">JLPT Practice Tests</h4>
                <p className="text-gray-600 mb-2">Đề thi thử JLPT đầy đủ từ N1-N5</p>
                <p className="text-gray-500 text-sm italic">Complete JLPT mock tests from N1-N5</p>
              </div>

              {/* LEVEL System - UPDATED STYLING */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-2 border-white/50">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Hệ Thống LEVEL</h4>
                <p className="text-gray-600 mb-2">Giáo trình đa dạng: Shinkanzen, TRY, GENKI...</p>
                <p className="text-gray-500 text-sm italic">Various textbooks available</p>
              </div>

              {/* Dictionary Feature - NEW */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-2 border-white/50">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Tra Từ Nhanh</h4>
                <p className="text-gray-600 mb-2">Double-click để tra nghĩa từ Nhật-Việt-Anh</p>
                <p className="text-gray-500 text-sm italic">Quick dictionary lookup feature</p>
              </div>

              {/* 24/7 Learning - UPDATED STYLING */}
              <div className="group bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-2 border-white/50">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌙</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">24/7 Access</h4>
                <p className="text-gray-600 mb-2">Học mọi lúc, mọi nơi</p>
                <p className="text-gray-500 text-sm italic">Learn anytime, anywhere</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 md:px-12 text-center">
            {/* Free Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border-2 border-white/50 animate-pulseGlow">
              <span className="text-3xl">💚</span>
              <span className="text-white font-bold text-lg">100% MIỄN PHÍ | 100% FREE</span>
              <span className="text-3xl">💚</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Let's Study!
            </h2>
            <p className="text-white text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
              Mình ở đây 24/7, nếu có vấn đề gì hay đơn giản là bạn muốn thêm giáo trình gì đừng ngại hãy liên lạc với mình nhé! 🚀
            </p>
            <p className="text-white/90 text-md md:text-lg mb-8 italic">
              I'm here 24/7, if you have any issues or simply want to add more textbooks, don't hesitate to contact me!
            </p>
            
            <a
              href="mailto:letranhoanggiangqb@gmail.com"
              className="inline-flex items-center gap-2 sm:gap-3 bg-white text-orange-600 font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 text-sm sm:text-lg break-all sm:break-normal max-w-full mx-auto"
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">📧</span>
              <span className="break-all sm:break-normal text-center sm:text-left">letranhoanggiangqb@gmail.com</span>
            </a>

            {/* Community Note */}
            <div className="mt-8 text-white/90 text-sm max-w-xl mx-auto">
              <p className="flex items-center justify-center gap-2">
                <span className="text-xl">🌸</span>
                <span>Dự án phi lợi nhuận - phục vụ cộng đồng học tiếng Nhật</span>
              </p>
              <p className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xl">🌸</span>
                <span className="italic">Non-profit project - serving the Japanese learning community</span>
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
                  Quay về trang chủ
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full transition-all duration-300"></span>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer Quote */}
        <section className="py-12 bg-gray-900 text-white rounded-b-[3rem]">
          <div className="container mx-auto px-8 md:px-12 text-center">
            <p className="text-2xl md:text-3xl font-serif italic mb-4">
              "天は人の上に人を造らず人の下に人を造らず"
            </p>
            <p className="text-gray-400 text-sm">
              Heaven does not create one person above or below another
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