// src/features/books/pages/LessonPage.jsx
// 📚 Lesson Page với PDF Viewer & Quiz Tabs - Mobile Responsive

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { bookData } from '../../../data/level/bookData.js';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';
import { demoQuizzes } from '../../../data/level/n1/demo-book/quizzes.js';
import storageManager from '../../../utils/localStorageManager.js';
import { setLessonCompletion, getLessonCompletion, updateStudyStreak } from '../../../utils/lessonProgressTracker.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { saveLearningProgress, getLessonProgress } from '../../../services/learningProgressService.js';

// ✅ Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';

// ✅ PHASE 3: Import SRS Widget
import SRSWidget from '../../../components/SRSWidget.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';
import LessonPageSkeleton from '../../../components/skeletons/LessonPageSkeleton.jsx';

// Tab constants
const TABS = {
  THEORY: 'theory',
  QUIZ: 'quiz'
};

function LessonPage() {
  const { levelId, bookId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Backward compatibility: nếu không có chapterId, dùng lessonId làm chapterId
  const finalChapterId = chapterId || lessonId;
  const finalLessonId = lessonId || chapterId;
  
  // State management
  const [activeTab, setActiveTab] = useState(TABS.THEORY);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [allQuizzes, setAllQuizzes] = useState([]); // ✅ All quizzes for this lesson
  const [isLoading, setIsLoading] = useState(true);
  const [booksMetadata, setBooksMetadata] = useState([]);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  
  // PDF Viewer state
  const [pdfUrl, setPdfUrl] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null); // ✅ NEW: HTML content
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Refs
  const contentRef = useRef(null);
  useDictionaryDoubleClick(contentRef);
  
  // Load books metadata (và đồng bộ category từ seriesId giống BookDetailPage)
  useEffect(() => {
    const loadBooksMetadata = async () => {
      const savedBooks = await storageManager.getBooks(levelId);

      if (savedBooks && savedBooks.length > 0) {
        let booksWithCategory = savedBooks;

        try {
          const seriesList = await storageManager.getSeries(levelId);
          if (Array.isArray(seriesList) && seriesList.length > 0) {
            const seriesMap = {};
            seriesList.forEach(s => {
              if (s && s.id) {
                seriesMap[s.id] = s.name || s.id;
              }
            });

            booksWithCategory = savedBooks.map(book => {
              if (book.category && book.category.length > 0) return book;
              const seriesName = book.seriesId ? seriesMap[book.seriesId] : null;
              return {
                ...book,
                category: seriesName || book.category || null,
              };
            });
          }
        } catch (err) {
          console.warn('[LessonPage] ⚠️ Could not load series for category mapping:', err);
        }

        setBooksMetadata(booksWithCategory);
        await storageManager.saveBooks(levelId, booksWithCategory);
        console.log(`[LessonPage] ✅ Loaded ${booksWithCategory.length} books from storage for ${levelId} (categories synced)`);
      } else {
        if (levelId === 'n1') {
          setBooksMetadata(n1BooksMetadata);
          console.log(`📁 Loaded ${n1BooksMetadata.length} books from static file`);
        }
      }
    };

    loadBooksMetadata();
  }, [levelId]);
  
  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      setIsLoading(true);
      try {
        console.log(`🔍 Loading lesson: bookId=${bookId}, chapterId=${finalChapterId}, lessonId=${finalLessonId}`);
        
        // Load lesson data from Supabase + storage
        const savedLessons = await storageManager.getLessons(bookId, finalChapterId, levelId);
        let lesson = savedLessons?.find(l => l.id === finalLessonId);
        
        if (lesson) {
          setCurrentLesson(lesson);
          console.log(`✅ Loaded lesson:`, lesson);
          
          // Check lesson content (new format + legacy fallback)
          const theoryData = lesson.theory || {};
          
          const resolvedPdf =
            theoryData.pdfUrl ||
            lesson.pdfUrl ||
            null;
          if (resolvedPdf) {
            setPdfUrl(resolvedPdf);
          }
          
          const resolvedHtml =
            theoryData.htmlContent ||
            lesson.content ||
            null;
          if (resolvedHtml) {
            setHtmlContent(resolvedHtml);
          }
          
          // Load lesson completion status
          // ✅ NEW: Ưu tiên đọc từ Supabase nếu user đã đăng nhập
          let completed = false;
          if (user && typeof user.id === 'string') {
            const { success, data: progress } = await getLessonProgress(user.id, bookId, finalChapterId, finalLessonId);
            if (success && progress && progress.status === 'completed') {
              completed = true;
            } else {
              // Fallback to localStorage
              completed = getLessonCompletion(bookId, finalChapterId, finalLessonId);
            }
          } else {
            // User chưa đăng nhập, đọc từ localStorage
            completed = getLessonCompletion(bookId, finalChapterId, finalLessonId);
          }
          setIsLessonCompleted(completed);
        } else {
          // Fallback: create basic lesson info
          setCurrentLesson({
            id: finalLessonId,
            title: `Bài ${finalLessonId}`,
            description: ''
          });
        }
        
        // Load chapter info
        const savedChapters = await storageManager.getChapters(bookId, levelId);
        const chapter = savedChapters?.find(ch => ch.id === finalChapterId);
        if (chapter) {
          setCurrentChapter(chapter);
        }
        
        // ✅ Load all quizzes for this lesson
        const allQuizzesList = [];
        
        // Load from Supabase + storage
        let savedQuiz = await storageManager.getQuiz(bookId, finalChapterId, finalLessonId, levelId);
        if (savedQuiz) {
          allQuizzesList.push(savedQuiz);
        }
        
        // ✅ Try to load all quizzes that might match this lesson
        // ✅ FIXED: Chỉ load quiz có lessonId chính xác (không load quiz cũ không có lessonId)
        try {
          const allQuizzesFromStorage = await storageManager.getAllQuizzes(levelId);
          const filteredQuizzes = allQuizzesFromStorage.filter(q => {
            // Chỉ match quiz có lessonId chính xác
            const matchesLesson = q.lessonId === finalLessonId;
            // Phải có bookId và chapterId khớp
            const matchesBookChapter = q.bookId === bookId && q.chapterId === finalChapterId;
            const matchesLevel = !q.level || q.level === levelId;
            // Quiz phải có questions hợp lệ (không rỗng)
            const hasValidQuestions = q.questions && Array.isArray(q.questions) && q.questions.length > 0;
            
            return matchesBookChapter && matchesLesson && matchesLevel && hasValidQuestions;
          });
          // Add unique quizzes (avoid duplicates)
          filteredQuizzes.forEach(q => {
            if (!allQuizzesList.find(existing => existing.id === q.id)) {
              allQuizzesList.push(q);
            }
          });
        } catch (e) {
          console.warn('Error loading all quizzes:', e);
        }
        
        // ✅ FALLBACK: Try demo quizzes if not found in storage
        if (allQuizzesList.length === 0 && bookId === 'demo-complete-001') {
          const quizKey = `${bookId}_${finalChapterId}_${finalLessonId}`;
          const demoQuiz = demoQuizzes[quizKey];
          if (demoQuiz) {
            allQuizzesList.push(demoQuiz);
            console.log(`📁 Loaded DEMO quiz from static file`);
          }
        }
        
        // Transform and set quizzes
        // ✅ FIXED: Filter và validate quiz trước khi hiển thị
        const transformedQuizzes = allQuizzesList
          .map(savedQuiz => {
            let quizToSet = savedQuiz;
            if (savedQuiz.questions && Array.isArray(savedQuiz.questions)) {
              const firstQuestion = savedQuiz.questions[0];
              if (firstQuestion && (firstQuestion.question || firstQuestion.correctAnswer || firstQuestion.text)) {
                quizToSet = {
                  ...savedQuiz,
                  questions: savedQuiz.questions.map(q => ({
                    id: q.id,
                    text: q.question || q.text,
                    options: q.options || [],
                    correct: q.correctAnswer || q.correct,
                    explanation: q.explanation || ''
                  }))
                };
              }
            }
            return quizToSet;
          })
          // ✅ FIXED: Chỉ giữ lại quiz hợp lệ (có questions và ít nhất 1 câu hỏi có nội dung)
          .filter(quiz => {
            if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
              console.warn(`⚠️ Filtered out invalid quiz (no questions):`, quiz);
              return false;
            }
            if (quiz.questions.length === 0) {
              console.warn(`⚠️ Filtered out quiz with empty questions:`, quiz);
              return false;
            }
            // Kiểm tra ít nhất 1 câu hỏi có text
            const hasValidQuestion = quiz.questions.some(q => 
              (q.text && q.text.trim().length > 0) || 
              (q.question && q.question.trim().length > 0)
            );
            if (!hasValidQuestion) {
              console.warn(`⚠️ Filtered out quiz with no valid question text:`, quiz);
              return false;
            }
            return true;
          });
        
        console.log(`✅ Loaded ${transformedQuizzes.length} valid quiz(es) for lesson ${finalLessonId}`);
        setAllQuizzes(transformedQuizzes);
        if (transformedQuizzes.length > 0) {
          setCurrentQuiz(transformedQuizzes[0]);
          console.log(`✅ Loaded ${transformedQuizzes.length} quiz(zes) for lesson`);
        }
        
      } catch (error) {
        console.error('Error loading lesson:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [bookId, finalChapterId, finalLessonId]);
  
  // Get current book & category (ưu tiên dữ liệu động từ booksMetadata)
  const currentBookMeta = booksMetadata.find(book => book.id === bookId);
  const currentBookTitle = currentBookMeta?.title || bookId;
  const currentBookCategory = currentBookMeta?.category || null;

  // Tạo danh sách categories (bộ sách) từ booksMetadata cho Sidebar
  const categories = React.useMemo(() => {
    const categoryCounts = {};
    booksMetadata.forEach(book => {
      if (book.category) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });

    return Object.keys(categoryCounts).map(name => ({
      name,
      id: name,
      count: categoryCounts[name],
    }));
  }, [booksMetadata]);

  // Handler cho category click trong sidebar
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) {
      navigate(`/level/${levelId}`);
      return;
    }

    // ✅ Navigate về level page và filter theo category (hiển thị danh sách sách trong bộ đó)
    // Sử dụng URL query parameter để truyền category
    navigate(`/level/${levelId}?category=${encodeURIComponent(categoryName)}`);
  };
  
  // Toggle lesson completion
  const handleToggleCompletion = () => {
    const newStatus = !isLessonCompleted;
    setIsLessonCompleted(newStatus);
    setLessonCompletion(bookId, finalChapterId, finalLessonId, newStatus);
    
    // Update study streak if marking as completed
    if (newStatus) {
      updateStudyStreak(user);
      
      // ✅ NEW: Lưu progress vào Supabase nếu user đã đăng nhập
      if (user && typeof user.id === 'string') {
        saveLearningProgress({
          userId: user.id,
          type: 'lesson_complete',
          bookId: bookId,
          chapterId: finalChapterId,
          lessonId: finalLessonId,
          status: 'completed',
          metadata: {
            levelId: levelId,
            completedAt: new Date().toISOString()
          }
        }).catch(err => {
          console.error('[LessonPage] Error saving progress to Supabase:', err);
        });
      }
    }
  };
  
  // PDF Viewer handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  // Helper function to get clean PDF URL without toolbar
  const getCleanPdfUrl = (url) => {
    if (!url) return url;
    
    // For data URLs and blob URLs, return as is (these are already clean)
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // For regular URLs, add hash fragment parameters to hide toolbar
    // This works with Chrome/Edge built-in PDF viewer and most PDF.js viewers
    const baseUrl = url.split('#')[0];
    
    // Add hash fragment parameters to hide all UI elements
    // toolbar=0: Hide toolbar
    // navpanes=0: Hide navigation panes
    // scrollbar=0: Hide scrollbar
    // view=FitH: Fit to width
    return `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  };
  
  const handleDownloadPDF = async () => {
    if (!pdfUrl) return;
    
    try {
      // Handle data URLs (base64) - already a blob
      if (pdfUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `lesson-${lessonId || 'document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Handle blob URLs - convert to download
      if (pdfUrl.startsWith('blob:')) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `lesson-${lessonId || 'document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
      
      // Handle regular URLs - fetch and download
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Get filename from URL or use lesson title
      const urlParts = pdfUrl.split('/');
      let filename = urlParts[urlParts.length - 1];
      
      // Remove query parameters if any
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }
      
      // Use lesson title if available, otherwise use filename or default
      if (!filename || !filename.endsWith('.pdf')) {
        filename = currentLesson?.title 
          ? `${currentLesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          : `lesson-${lessonId || 'document'}.pdf`;
      }
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: open in new tab if download fails
      window.open(pdfUrl, '_blank');
    }
  };
  
  // Breadcrumbs
  const breadcrumbPaths = [
    { name: 'Home', link: '/' },
    { name: 'Level', link: '/level' },
    { name: levelId.toUpperCase(), link: `/level/${levelId}` },
    { name: currentBookTitle, link: `/level/${levelId}/${bookId}` },
    ...(finalChapterId !== finalLessonId ? [
      { name: currentChapter?.title || `Chapter ${finalChapterId}`, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}` }
    ] : []),
    { name: currentLesson?.title || `Lesson ${finalLessonId}`, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}/lesson/${finalLessonId}` }
  ];
  
  // Loading state
  if (isLoading) {
    const loadingLabel = t('lesson.loading');
    console.log('🔍 DEBUG lesson.loading:', {
      key: 'lesson.loading',
      value: loadingLabel,
      currentLanguage: useLanguage ? 'has context' : 'no context'
    });
    return (
      <>
        <DictionaryButton />
        <DictionaryPopup />
        <LoadingSpinner label={loadingLabel || 'Đang tải bài học...'} icon="📚" />
        <LessonPageSkeleton
          currentBookCategory={currentBookCategory}
          onCategoryClick={handleCategoryClick}
        />
      </>
    );
  }
  
  return (
    <>
      {/* Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />
      
      <div className="w-full pr-0 md:pr-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar 
            selectedCategory={currentBookCategory}
            onCategoryClick={handleCategoryClick}
            categories={categories}
          />
          
          <div className="flex-1 min-w-0 w-full bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col 
                          md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
            {/* Breadcrumbs */}
            <div className="pt-3 px-3 sm:px-4 md:px-5 pb-2 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            
            {/* Header */}
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 break-words">
                {currentLesson?.title || `Bài ${finalLessonId}`}
              </h2>
              {currentLesson?.description && (
                <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium break-words">{currentLesson.description}</p>
              )}
            </div>
            
            {/* Tabs - Mobile Responsive */}
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  onClick={() => setActiveTab(TABS.THEORY)}
                  className={`px-4 sm:px-6 py-2 rounded-lg border-[3px] border-black font-black uppercase tracking-wide transition-all duration-200 whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                    activeTab === TABS.THEORY
                      ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  📄 {t('lesson.theory')}
                </button>
                
                {currentQuiz && (
                  <button
                    onClick={() => setActiveTab(TABS.QUIZ)}
                    className={`px-4 sm:px-6 py-2 rounded-lg border-[3px] border-black font-black uppercase tracking-wide transition-all duration-200 whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                      activeTab === TABS.QUIZ
                        ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    ❓ {t('lesson.quiz')}
                  </button>
                )}
              </div>
            </div>
            
            {/* Content Area */}
            <div ref={contentRef} className="flex-1 md:overflow-y-auto overflow-x-hidden">
              <div className="px-3 sm:px-4 md:px-5 pt-4 pb-6 min-h-full flex flex-col max-w-full">
                {activeTab === TABS.THEORY ? (
                  <div className="flex flex-col">
                  {pdfUrl ? (
                    <>
                      {/* PDF Viewer - Clean display without controls */}
                      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6 relative w-full" style={{ minHeight: '80vh', height: '80vh', maxWidth: '100%' }}>
                        {/* White overlay to hide PDF viewer toolbar - Must be on top */}
                        <div 
                          className="absolute top-0 left-0 right-0 bg-white z-20 pointer-events-none"
                          style={{ height: '56px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        />
                        <div className="w-full relative" style={{ paddingTop: '56px', minHeight: 'calc(80vh - 56px)', height: 'calc(100% - 56px)' }}>
                          <div 
                            className="w-full relative"
                            style={{ 
                              marginTop: '-56px',
                              height: 'calc(100% + 56px)',
                              minHeight: 'calc(80vh)'
                            }}
                          >
                            <iframe
                              src={getCleanPdfUrl(pdfUrl)}
                              className="w-full h-full border-none rounded"
                              title="PDF Viewer"
                              style={{ 
                                transform: `scale(${zoomLevel / 100})`, 
                                transformOrigin: 'top left',
                                width: `${100 / (zoomLevel / 100)}%`,
                                height: `${100 / (zoomLevel / 100)}%`
                              }}
                              allow="fullscreen"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* PDF Controls - Mobile-friendly */}
                      <div className="flex flex-wrap gap-2 justify-between items-center bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={handleZoomOut}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md border-[2px] border-black font-black hover:bg-blue-600 transition-colors min-h-[48px] min-w-[48px]"
                            title="Zoom Out"
                          >
                            🔍-
                          </button>
                          <span className="px-3 py-2 bg-gray-100 rounded-md border-[2px] border-black font-bold flex items-center">
                            {zoomLevel}%
                          </span>
                          <button
                            onClick={handleZoomIn}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md border-[2px] border-black font-black hover:bg-blue-600 transition-colors min-h-[48px] min-w-[48px]"
                            title="Zoom In"
                          >
                            🔍+
                          </button>
                        </div>
                        
                        <button
                          onClick={handleDownloadPDF}
                          className="px-4 py-2 bg-green-500 text-white rounded-md border-[2px] border-black font-black hover:bg-green-600 transition-colors min-h-[48px]"
                        >
                          📥 {t('lesson.download')}
                        </button>
                      </div>
                    </>
                  ) : htmlContent ? (
                    <>
                      {/* HTML Content Viewer - Rich text */}
                      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6 p-3 sm:p-4 md:p-6 w-full max-w-full">
                        <div 
                          className="prose prose-sm sm:prose-base md:prose-lg max-w-none w-full overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                          style={{
                            fontSize: `${zoomLevel}%`,
                            lineHeight: '1.8',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        />
                      </div>
                      
                      {/* HTML Content Controls */}
                      <div className="flex flex-wrap gap-2 justify-between items-center bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={handleZoomOut}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md border-[2px] border-black font-black hover:bg-blue-600 transition-colors min-h-[48px] min-w-[48px]"
                            title="Zoom Out"
                          >
                            🔍-
                          </button>
                          <span className="px-3 py-2 bg-gray-100 rounded-md border-[2px] border-black font-bold flex items-center">
                            {zoomLevel}%
                          </span>
                          <button
                            onClick={handleZoomIn}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md border-[2px] border-black font-black hover:bg-blue-600 transition-colors min-h-[48px] min-w-[48px]"
                            title="Zoom In"
                          >
                            🔍+
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500 font-medium">
                          📝 HTML Content
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
                        <p className="text-gray-600 mb-4">📄 {t('lesson.noTheory')}</p>
                        <p className="text-sm text-gray-500">{t('lesson.contactAdmin')}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Lesson Actions */}
                  <div className="mt-6 mb-5 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center w-full">
                    <label className="flex items-center gap-2 cursor-pointer bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 sm:p-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 min-h-[48px] w-full sm:w-auto">
                      <input
                        type="checkbox"
                        checked={isLessonCompleted}
                        onChange={handleToggleCompletion}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="font-bold text-sm sm:text-base text-gray-800 break-words">✅ {t('lesson.completed')}</span>
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {currentQuiz && (
                        <button
                          onClick={() => setActiveTab(TABS.QUIZ)}
                          className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px] text-sm sm:text-base"
                        >
                          {t('lesson.doQuiz')} →
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/level/${levelId}/${bookId}/chapter/${finalChapterId}`)}
                        className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px] text-sm sm:text-base"
                      >
                        {t('lesson.nextLesson')} →
                      </button>
                    </div>
                  </div>

                  {/* ✅ PHASE 3: SRS Widget */}
                  {currentLesson && <SRSWidget lesson={currentLesson} />}
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {allQuizzes.length > 0 ? (
                    <div className="flex-1 overflow-y-auto">
                      {/* Quiz List with Scroll */}
                      <div className="space-y-4">
                        {allQuizzes.map((quiz, index) => (
                          <div key={quiz.id || index} className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{quiz.title || `Quiz ${index + 1}`}</h3>
                            <p className="text-gray-600 mb-4">{t('lesson.total')}: {quiz.questions?.length || 0}</p>
                            
                            <Link
                              to={`/level/${levelId}/${bookId}/chapter/${finalChapterId}/lesson/${finalLessonId}/quiz${quiz.id ? `?quizId=${quiz.id}` : ''}`}
                              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
                            >
                              {t('lesson.startQuiz')}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
                        <p className="text-gray-600 mb-4">❓ {t('lesson.noQuiz')}</p>
                        <p className="text-sm text-gray-500">{t('lesson.contactAdmin')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LessonPage;
