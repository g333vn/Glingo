import React, { useEffect, useState } from 'react';

function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [quoteHover, setQuoteHover] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-20 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Japanese Quote - Vintage Scroll Style */}
      <div 
        className="quote-scroll hidden xl:block absolute top-4 right-2 md:top-12 md:right-16 z-10"
        onMouseEnter={() => setQuoteHover(true)}
        onMouseLeave={() => setQuoteHover(false)}
      >
        <div className={`relative transition-all duration-700 ${quoteHover ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}`}>
          <div className="absolute -top-1 md:-top-2 left-1/2 transform -translate-x-1/2 w-4/5 h-1 md:h-2 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-full shadow-md"></div>
          <div className="absolute -top-1.5 md:-top-3 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 md:h-1 bg-stone-900 rounded-full opacity-60"></div>
          <div className="absolute -top-4 md:-top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-3 md:h-6 bg-stone-700 opacity-50"></div>
          
          <div className="relative overflow-hidden rounded-lg shadow-2xl">
            <div className="relative bg-gradient-to-br from-stone-200 via-amber-100/60 to-stone-300 px-3 py-4 md:px-6 md:py-8 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-stone-400/10 via-transparent to-amber-900/10"></div>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-stone-400/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-stone-400/20 to-transparent"></div>
              
              <div className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-red-800/70 rounded-sm transform rotate-6 shadow-md flex items-center justify-center opacity-70">
                <div className="w-4 h-4 md:w-6 md:h-6 border border-red-400/30 rounded-sm flex items-center justify-center">
                  <span className="text-[8px] md:text-[10px] text-red-200/80 font-bold">学</span>
                </div>
              </div>

              <div className="relative flex flex-row gap-2 md:gap-6">
                <div className="relative">
                  <h1 
                    className={`text-lg md:text-3xl leading-relaxed md:leading-loose tracking-wider transition-all duration-700 ${
                      quoteHover ? 'text-stone-900' : 'text-stone-800/80'
                    }`}
                    style={{ 
                      writingMode: 'vertical-rl',
                      fontFamily: "'Kaisei Decol', 'Yuji Syuku', 'Noto Serif JP', 'MS Mincho', serif",
                      letterSpacing: '0.2em',
                      fontWeight: '500',
                      textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.15)'
                    }}
                  >
                    天は人の上に人を造らず
                  </h1>
                </div>

                <div className="relative">
                  <h1 
                    className={`text-lg md:text-3xl leading-relaxed md:leading-loose tracking-wider transition-all duration-700 ${
                      quoteHover ? 'text-stone-900' : 'text-stone-800/80'
                    }`}
                    style={{ 
                      writingMode: 'vertical-rl',
                      fontFamily: "'Kaisei Decol', 'Yuji Syuku', 'Noto Serif JP', 'MS Mincho', serif",
                      letterSpacing: '0.2em',
                      fontWeight: '500',
                      textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.15)'
                    }}
                  >
                    人の下に人を造らず
                  </h1>
                </div>
              </div>

              {quoteHover && (
                <>
                  <div className="absolute bottom-2 left-4 w-px h-3 bg-gradient-to-b from-stone-700 to-transparent opacity-15"></div>
                  <div className="absolute top-1/3 right-5 w-px h-2 bg-gradient-to-b from-stone-700 to-transparent opacity-10"></div>
                </>
              )}
            </div>

            <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none opacity-20"></div>
          </div>

          <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-4/5 h-1 md:h-2 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 rounded-full shadow-md"></div>
          <div className="absolute -bottom-1.5 md:-bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 md:h-1 bg-stone-900 rounded-full opacity-60"></div>
          
          <link href="https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;500;700&family=Yuji+Syuku&family=Noto+Serif+JP:wght@400;500;600&display=swap" rel="stylesheet" />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden max-w-6xl border-2 border-white/50 relative z-0">
        <section className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-8 py-12 md:px-12 md:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <img
                  src="/logo/main.png"
                  alt="Learn Your Approach Logo"
                  className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                Learn Your Approach
              </h1>

              <p className="text-xl md:text-2xl text-gray-800 mb-4 font-bold drop-shadow">
                Học tiếng Nhật mọi lúc mọi nơi
              </p>
              <p className="text-lg md:text-xl text-gray-700 mb-12 flex items-center justify-center gap-2 font-semibold">
                <span className="text-2xl">💚</span>
                <span>100% miễn phí</span>
                <span className="text-2xl">💚</span>
              </p>

              <div className={`flex flex-col sm:flex-row gap-6 justify-center items-stretch mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <a
                  href="/level"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden w-full sm:w-[280px]"
                >
                  <span className="text-2xl relative z-10">📚</span>
                  <span className="relative z-10 text-center">
                    Bắt đầu học ngay
                    <br />
                    <span className="text-sm font-normal opacity-90">Start Learning</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>

                <a
                  href="/jlpt"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 overflow-hidden border-2 border-white/30 w-full sm:w-[280px]"
                >
                  <span className="text-2xl relative z-10">📝</span>
                  <span className="relative z-10 text-center">
                    Luyện đề JLPT
                    <br />
                    <span className="text-sm font-normal opacity-90">Practice JLPT</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>

              <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full blur-lg opacity-30 animate-pulseGlow"></div>
                  
                  <a
                    href="/about"
                    className="relative group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white via-gray-50 to-white text-transparent bg-clip-text border-2 border-transparent rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #a855f7, #ec4899, #ef4444)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm -z-10"></div>
                    
                    <span className="text-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 filter drop-shadow-lg">
                      💫
                    </span>
                    
                    <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-red-700 transition-all duration-300">
                      My Story
                    </span>
                    
                    <span className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300">
                      →
                    </span>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  </a>

                  <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse pointer-events-none">✨</div>
                  <div className="absolute -bottom-2 -left-2 text-pink-400 text-xl animate-pulse animation-delay-500 pointer-events-none">✨</div>
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">📝</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">JLPT Tests</h3>
                  <p className="text-sm text-gray-700 font-medium">N1-N5</p>
                </div>

                <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">📚</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">LEVEL System</h3>
                  <p className="text-sm text-gray-700 font-medium">Đa dạng</p>
                </div>


                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">🔍</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">Tra từ nhanh</h3>
                  <p className="text-sm text-gray-700 font-medium">Nhật-Việt-Anh</p>
                </div>
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">🌙</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">24/7 Access</h3>
                  <p className="text-sm text-gray-700 font-medium">Mọi lúc</p>
                </div>

                <div className="group bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-pink-300">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">💚</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">100% Free</h3>
                  <p className="text-sm text-gray-700 font-medium">Miễn phí</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulseGlow animation-delay-1000"></div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;