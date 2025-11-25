// src/features/books/pages/LessonPage.jsx
// 📚 Lesson Page với PDF Viewer & Quiz Tabs - Mobile Responsive

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { bookData } from '../../../data/level/bookData.js';
import { n1BooksMetadata } from '../../../data/level/n1/index.js';
import { demoLessons } from '../../../data/level/n1/demo-book/lessons.js';
import { demoQuizzes } from '../../../data/level/n1/demo-book/quizzes.js';
import storageManager from '../../../utils/localStorageManager.js';
import { setLessonCompletion, getLessonCompletion, updateStudyStreak } from '../../../utils/lessonProgressTracker.js';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';

// ✅ Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';

// ✅ PHASE 3: Import SRS Widget
import SRSWidget from '../../../components/SRSWidget.jsx';

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
  
  // Load books metadata
  useEffect(() => {
    const loadBooksMetadata = async () => {
      const savedBooks = await storageManager.getBooks(levelId);
      if (savedBooks && savedBooks.length > 0) {
        setBooksMetadata(savedBooks);
        console.log(`✅ Loaded ${savedBooks.length} books from storage for ${levelId}`);
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
        
        // Load lesson data from storage
        const savedLessons = await storageManager.getLessons(bookId, finalChapterId);
        let lesson = savedLessons?.find(l => l.id === finalLessonId);
        
        // ✅ FALLBACK: Try demo lessons if not found in storage
        if (!lesson && bookId === 'demo-complete-001') {
          const demoKey = `${bookId}_${finalChapterId}`;
          const demoLessonList = demoLessons[demoKey];
          lesson = demoLessonList?.find(l => l.id === finalLessonId);
          if (lesson) {
            console.log(`📁 Loaded DEMO lesson from static file:`, lesson);
          }
        }
        
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
          
          // Load lesson completion status using progress tracker
          const completed = getLessonCompletion(bookId, finalChapterId, finalLessonId);
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
        const savedChapters = await storageManager.getChapters(bookId);
        const chapter = savedChapters?.find(ch => ch.id === finalChapterId);
        if (chapter) {
          setCurrentChapter(chapter);
        }
        
        // ✅ Load all quizzes for this lesson
        const allQuizzesList = [];
        
        // Load from storage
        let savedQuiz = await storageManager.getQuiz(bookId, finalChapterId, finalLessonId);
        if (savedQuiz) {
          allQuizzesList.push(savedQuiz);
        }
        
        // ✅ Try to load all quizzes that might match this lesson
        try {
          const allQuizzesFromStorage = await storageManager.getAllQuizzes();
          const filteredQuizzes = allQuizzesFromStorage.filter(q => 
            q.bookId === bookId && 
            q.chapterId === finalChapterId && 
            (q.lessonId === finalLessonId || !q.lessonId)
          );
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
        const transformedQuizzes = allQuizzesList.map(savedQuiz => {
          let quizToSet = savedQuiz;
          if (savedQuiz.questions && Array.isArray(savedQuiz.questions)) {
            const firstQuestion = savedQuiz.questions[0];
            if (firstQuestion && (firstQuestion.question || firstQuestion.correctAnswer)) {
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
        });
        
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
  
  // Get current book
  const currentBook = bookData[bookId] || bookData.default;
  const currentBookCategory = booksMetadata.find(book => book.id === bookId)?.category || null;
  
  // Handler cho category click trong sidebar
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) {
      navigate(`/level/${levelId}`);
      return;
    }

    const firstBookInCategory = booksMetadata.find(book => book.category === categoryName);
    
    if (firstBookInCategory) {
      navigate(`/level/${levelId}/${firstBookInCategory.id}`);
    } else {
      navigate(`/level/${levelId}`);
    }
  };
  
  // Toggle lesson completion
  const handleToggleCompletion = () => {
    const newStatus = !isLessonCompleted;
    setIsLessonCompleted(newStatus);
    setLessonCompletion(bookId, finalChapterId, finalLessonId, newStatus);
    
    // Update study streak if marking as completed
    if (newStatus) {
      updateStudyStreak(user);
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
    { name: currentBook?.title || bookId, link: `/level/${levelId}/${bookId}` },
    ...(finalChapterId !== finalLessonId ? [
      { name: currentChapter?.title || `Chapter ${finalChapterId}`, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}` }
    ] : []),
    { name: currentLesson?.title || `Lesson ${finalLessonId}`, link: `/level/${levelId}/${bookId}/chapter/${finalChapterId}/lesson/${finalLessonId}` }
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <DictionaryButton />
        <DictionaryPopup />
        <div className="w-full pr-0 md:pr-4">
          <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
            <Sidebar 
              selectedCategory={currentBookCategory}
              onCategoryClick={handleCategoryClick}
            />
            <div className="flex-1 min-w-0 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg flex flex-col min-h-app">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải bài học...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      {/* Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />
      
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar 
            selectedCategory={currentBookCategory}
            onCategoryClick={handleCategoryClick}
          />
          
          <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-24 h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden">
            {/* Breadcrumbs */}
            <div className="pt-3 px-5 pb-2 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            
            {/* Header */}
            <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <h2 className="text-xl font-black text-gray-900">
                {currentLesson?.title || `Bài ${finalLessonId}`}
              </h2>
              {currentLesson?.description && (
                <p className="text-sm text-gray-700 mt-1 font-medium">{currentLesson.description}</p>
              )}
            </div>
            
            {/* Tabs - Mobile Responsive */}
            <div className="px-5 py-3 border-b-[3px] border-black flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab(TABS.THEORY)}
                  className={`px-6 py-2 rounded-lg border-[3px] border-black font-black uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
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
                    className={`px-6 py-2 rounded-lg border-[3px] border-black font-black uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
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
            <div ref={contentRef} className="flex-1 overflow-y-auto">
              <div className="px-5 pt-4 pb-6 min-h-full flex flex-col">
                {activeTab === TABS.THEORY ? (
                  <div className="flex flex-col">
                  {pdfUrl ? (
                    <>
                      {/* PDF Viewer - Clean display without controls */}
                      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6 relative" style={{ minHeight: '80vh', height: '80vh' }}>
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
                      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6 p-6">
                        <div 
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                          style={{
                            fontSize: `${zoomLevel}%`,
                            lineHeight: '1.8'
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
                  <div className="mt-6 mb-5 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <label className="flex items-center gap-2 cursor-pointer bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 min-h-[48px]">
                      <input
                        type="checkbox"
                        checked={isLessonCompleted}
                        onChange={handleToggleCompletion}
                        className="w-5 h-5"
                      />
                      <span className="font-bold text-gray-800">✅ {t('lesson.completed')}</span>
                    </label>
                    
                    <div className="flex gap-2">
                      {currentQuiz && (
                        <button
                          onClick={() => setActiveTab(TABS.QUIZ)}
                          className="flex-1 sm:flex-initial px-6 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px]"
                        >
                          {t('lesson.doQuiz')} →
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/level/${levelId}/${bookId}/chapter/${finalChapterId}`)}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide min-h-[48px]"
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
