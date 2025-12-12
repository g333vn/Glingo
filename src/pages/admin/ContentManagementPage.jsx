// src/pages/admin/ContentManagementPage.jsx
// Module quản lý nội dung - Quản lý sách, chapters, và đề thi

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import Modal from '../../components/Modal.jsx';
import storageManager from '../../utils/localStorageManager.js';
import * as contentService from '../../services/contentService.js';
import { n1BooksMetadata } from '../../data/level/n1/books-metadata.js';
import { n1Books } from '../../data/level/n1/books.js';
// ✅ NEW: Import components
import AllLevelsOverview from '../../components/admin/content/AllLevelsOverview.jsx';
import HierarchyView from '../../components/admin/content/HierarchyView.jsx';
// ✅ SRS INTEGRATION: Import Enhanced Lesson Modal
import EnhancedLessonModal from '../../components/admin/lessons/EnhancedLessonModal.jsx';
import { migrateLegacyLesson } from '../../types/lessonTypes.js';
import { cleanupInvalidQuizzes } from '../../utils/quizCleanup.js';

function ContentManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Helper để tạo message "lưu thành công" an toàn.
  // Nếu key i18n bị thiếu và t() trả về chính cái key, ta fallback sang message đơn giản.
  const getSaveSuccessMessage = (details) => {
    const key = 'contentManagement.success.saveSuccess';
    const translated = t(key, { details });

    if (translated === key) {
      const genericSuccess =
        t('notifications.type.success') ||
        t('common.success') ||
        'Saved successfully!';

      return `${genericSuccess}\n\n${details}`;
    }

    return translated;
  };
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('n1');
  
  // ✅ NEW: View mode - 'overview' (all levels) or 'level-detail' (single level)
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'level-detail'
  
  // ✅ NEW: Refresh trigger for AllLevelsOverview
  const [overviewRefreshTrigger, setOverviewRefreshTrigger] = useState(0);
  
  // ✅ Hierarchy navigation state - Track current selection path
  const [hierarchyPath, setHierarchyPath] = useState({
    level: 'n1',
    series: null,
    book: null,
    chapter: null,
    lesson: null
  });
  
  // ✅ NEW: Level Detail View states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'empty'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'newest' | 'most-books' | 'most-students' | 'highest-rated'
  const [viewType, setViewType] = useState('card'); // 'card' | 'table' | 'tree'
  const [seriesPage, setSeriesPage] = useState(1);
  const [expandedSeries, setExpandedSeries] = useState({}); // { [seriesId]: true/false }
  const itemsPerPage = 10;
  
  // Books management states
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  
  
  // ✅ NEW: Series/Category management states
  const [series, setSeries] = useState([]);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [seriesForm, setSeriesForm] = useState({
    id: '',
    name: '',
    description: ''
  });

  // Book form state
  const [bookForm, setBookForm] = useState({
    id: '',
    title: '',
    imageUrl: '',
    category: ''
  });

  // Chapter form state
  const [chapterForm, setChapterForm] = useState({
    id: '',
    title: ''
  });

  // ✅ NEW: Lesson management states
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    id: '',
    title: '',
    pdfUrl: '',           // ✅ NEW: PDF URL for theory
    content: '',          // ✅ NEW: HTML content for theory
    description: ''       // ✅ NEW: Short description
  });
  const [lessonsData, setLessonsData] = useState({}); // { [bookId_chapterId]: lessons[] }

  // ✅ NEW: Questions/Quiz management states
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    questions: [
      {
        id: 1,
        text: '',
        audioUrl: '', // ✅ NEW: Audio support cho listening questions
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ],
        correct: 'A',
        explanation: ''
      }
    ]
  });
  const [quizzesData, setQuizzesData] = useState({}); // { [bookId_chapterId_lessonId]: quiz }
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadingAudioIndex, setUploadingAudioIndex] = useState(-1);
  const audioInputRefs = React.useRef({});


  // Load books when level changes
  useEffect(() => {
    const loadData = async () => {
      // Helper functions inside useEffect to avoid dependency issues
      const getDefaultBooks = () => {
        switch(selectedLevel) {
          case 'n1': return n1BooksMetadata;
          // TODO: Add other levels
          default: return [];
        }
      };

      const getDefaultSeries = () => {
        const allBooks = getDefaultBooks();
        const uniqueCategories = [...new Set(allBooks.map(book => book.category).filter(Boolean))];
        return uniqueCategories.map((cat, index) => ({
          id: `series-${index + 1}`,
          name: cat,
          description: `Series: ${cat}`
        }));
      };

      // Load books
      const savedBooks = await storageManager.getBooks(selectedLevel);
      if (savedBooks && savedBooks.length > 0) {
        setBooks(savedBooks);
      } else {
        setBooks(getDefaultBooks());
      }
      
      // Load series
      const savedSeries = await storageManager.getSeries(selectedLevel);
      if (savedSeries && savedSeries.length > 0) {
        setSeries(savedSeries);
      } else {
        setSeries(getDefaultSeries());
      }
    };
    loadData();
  }, [selectedLevel]);

  const saveBooks = async (updatedBooks) => {
    // ✅ Sắp xếp books theo category, sau đó theo title
    const sortedBooks = [...updatedBooks].sort((a, b) => {
      const categoryA = a.category || '';
      const categoryB = b.category || '';
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      return (a.title || '').localeCompare(b.title || '');
    });
    setBooks(sortedBooks);
    
    // ✅ Save to Supabase if user is admin and has UUID
    const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
    console.log('[SAVE_BOOKS] userId:', userId, 'user:', user); // 🔍 DEBUG
    console.log('[SAVE_BOOKS] Saving', sortedBooks.length, 'books to level:', selectedLevel); // 🔍 DEBUG
    await storageManager.saveBooks(selectedLevel, sortedBooks, userId);
    console.log('[SAVE_BOOKS] ✅ Save completed'); // 🔍 DEBUG
  };

  // ✅ UPDATED: Save series (async) - Sắp xếp theo tên và thêm metadata, đồng bộ Supabase
  const saveSeries = async (updatedSeries) => {
    // ✅ Thêm metadata cho series mới
    const enrichedSeries = updatedSeries.map(s => {
      // Nếu là series mới (chưa có createdAt), thêm metadata
      if (!s.createdAt) {
        return {
          ...s,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.email || user?.name || 'Admin',
          status: s.status || (s.booksCount === 0 ? 'empty' : 'draft'),
          studentsCount: s.studentsCount || 0,
          rating: s.rating || 0
        };
      }
      // Nếu đã có, chỉ update updatedAt
      return {
        ...s,
        updatedAt: new Date().toISOString()
      };
    });
    
    // ✅ Sắp xếp series theo tên
    const sortedSeries = [...enrichedSeries].sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '');
    });
    setSeries(sortedSeries);

    // Lấy userId dạng UUID để lưu lên Supabase (nếu có)
    const userId =
      user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;

    await storageManager.saveSeries(selectedLevel, sortedSeries, userId);
  };

  // State for chapters data (async loading)
  const [chaptersData, setChaptersData] = useState({});

  // Load chapters for all books
  useEffect(() => {
    const loadChapters = async () => {
      const newChaptersData = {};
      for (const book of books) {
        const savedChapters = await storageManager.getChapters(book.id, selectedLevel);
        if (savedChapters && savedChapters.length > 0) {
          newChaptersData[book.id] = savedChapters;
        }
      }
      setChaptersData(newChaptersData);
    };
    if (books.length > 0) {
      loadChapters();
    }
  }, [books, selectedLevel]);

  // ✅ NEW: Load lessons for all chapters
  useEffect(() => {
    const loadLessons = async () => {
      const newLessonsData = {};
      for (const book of books) {
        const chapters = chaptersData[book.id] || [];
        for (const chapter of chapters) {
          const lessons = await storageManager.getLessons(book.id, chapter.id, selectedLevel);
          if (lessons && lessons.length > 0) {
            const key = `${book.id}_${chapter.id}`;
            newLessonsData[key] = lessons;
          }
        }
      }
      setLessonsData(newLessonsData);
    };
    if (books.length > 0 && Object.keys(chaptersData).length > 0) {
      loadLessons();
    }
  }, [books, chaptersData, selectedLevel]);

  // ✅ UPDATED: Load quizzes for all lessons (with lessonId) - Verify against Supabase
  useEffect(() => {
    const loadQuizzes = async () => {
      const newQuizzesData = {};
      for (const book of books) {
        const chapters = chaptersData[book.id] || [];
        for (const chapter of chapters) {
          const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
          for (const lesson of lessons) {
            const quiz = await storageManager.getQuiz(book.id, chapter.id, lesson.id, selectedLevel);
            if (quiz) {
              // ✅ Verify quiz exists in Supabase (if level is provided)
              let isValidQuiz = true;
              if (selectedLevel) {
                try {
                  const { contentService } = await import('../../services/contentService.js');
                  const { success, data } = await contentService.getQuiz(book.id, chapter.id, lesson.id, selectedLevel);
                  
                  // If quiz exists in local storage but NOT in Supabase, check if it's valid
                  if (!success || !data) {
                    // Check if quiz has valid content
                    const hasValidContent = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 &&
                      quiz.questions.some(q => {
                        const text = (q.text || q.question || '').trim();
                        const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0;
                        return text.length > 0 && hasOptions;
                      });
                    
                    if (!hasValidContent) {
                      // Quiz is ghost - exists in storage but not in Supabase and has no valid content
                      console.warn(`⚠️ [Load Quizzes] Found ghost quiz: ${book.id}/${chapter.id}/${lesson.id} - skipping`);
                      isValidQuiz = false;
                      
                      // Auto-cleanup ghost quiz
                      try {
                        await storageManager.deleteQuiz(book.id, chapter.id, lesson.id, selectedLevel);
                        console.log(`✅ [Load Quizzes] Auto-deleted ghost quiz: ${book.id}/${chapter.id}/${lesson.id}`);
                      } catch (err) {
                        console.error(`❌ [Load Quizzes] Error auto-deleting ghost quiz:`, err);
                      }
                    }
                  }
                } catch (err) {
                  console.warn(`⚠️ [Load Quizzes] Error verifying quiz in Supabase:`, err);
                  // Continue to show quiz if verification fails (network issue)
                }
              }
              
              if (isValidQuiz) {
                const key = `${book.id}_${chapter.id}_${lesson.id}`;
                newQuizzesData[key] = quiz;
              }
            }
          }
        }
      }
      setQuizzesData(newQuizzesData);
    };
    if (books.length > 0 && Object.keys(chaptersData).length > 0 && Object.keys(lessonsData).length > 0) {
      loadQuizzes();
    }
  }, [books, chaptersData, lessonsData, selectedLevel]);

  // Get book data (with chapters) - Now uses async chaptersData
  const getBookData = useCallback((bookId) => {
    // Try chaptersData first (from IndexedDB/localStorage)
    if (chaptersData[bookId] && chaptersData[bookId].length > 0) {
      return { contents: chaptersData[bookId] };
    }
    
    // Fallback to static data
    switch(selectedLevel) {
      case 'n1': return n1Books[bookId];
      default: return null;
    }
  }, [selectedLevel, chaptersData]);

  // Memoize books với chapters data và sắp xếp theo category
  const booksWithChapters = useMemo(() => {
    const booksWithData = books.map(book => {
      const bookData = getBookData(book.id);
      return {
        ...book,
        chapters: bookData?.contents || []
      };
    });
    
    // ✅ Sắp xếp theo category (series), sau đó theo title
    return booksWithData.sort((a, b) => {
      // Sắp xếp theo category trước
      const categoryA = a.category || '';
      const categoryB = b.category || '';
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      // Nếu cùng category, sắp xếp theo title
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [books, getBookData]);

  // ✅ Helper: Generate auto ID for books (with category suffix)
  const generateBookId = (category = '') => {
    if (books.length === 0) return 'book-001';
    
    // Extract category suffix (e.g., n5, n4, n1)
    const categorySuffix = category ? 
      `-${category.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';
    
    // Find max number for books with same category pattern
    const pattern = new RegExp(`book-(\\d+)${categorySuffix}`, 'i');
    const numbers = books
      .map(b => {
        const match = b.id.match(pattern);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = String(maxNum + 1).padStart(3, '0'); // 001, 002, 003...
    return `book-${nextNum}${categorySuffix}`;
  };

  // ✅ NEW: State for book form validation
  const [bookFormValidation, setBookFormValidation] = useState({
    idExists: false,
    titleExists: false,
    isValidating: false
  });
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = React.useRef(null);

  // Book CRUD operations
  // Note: Body scroll lock được xử lý bởi Modal component
  const handleAddBook = (seriesName = null) => {
    setEditingBook(null);
    const autoId = generateBookId(seriesName);
    
    // ✅ Find the series ID if adding book to a specific series
    let seriesId = null;
    if (seriesName) {
      const matchingSeries = series.find(s => s.name === seriesName);
      seriesId = matchingSeries?.id || null;
    }
    
    setBookForm({ 
      id: autoId, // ✅ Auto-generate ID with category suffix
      title: '', 
      imageUrl: '', 
      category: seriesName || '', // ✅ Auto-fill series name
      seriesId: seriesId // ✅ NEW: Store series ID for filtering
    });
    setBookFormValidation({ idExists: false, titleExists: false, isValidating: false });
    setShowBookForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      id: book.id,
      title: book.title,
      imageUrl: book.imageUrl,
      category: book.category || '',
      seriesId: book.seriesId || null // ✅ NEW: Preserve series ID when editing
    });
    setBookFormValidation({ idExists: false, titleExists: false, isValidating: false });
    setShowBookForm(true);
  };

  // ✅ NEW: Real-time title validation
  const validateBookTitle = (title) => {
    if (!title) {
      setBookFormValidation(prev => ({ ...prev, titleExists: false }));
      return;
    }
    
    const exists = books.some(b => 
      b.title.toLowerCase() === title.toLowerCase() && 
      (!editingBook || b.id !== editingBook.id)
    );
    
    setBookFormValidation(prev => ({ ...prev, titleExists: exists }));
  };

  // ✅ NEW: ID stepper handlers
  const handleBookIdIncrement = () => {
    const match = bookForm.id.match(/book-(\d+)(-.*)?/);
    if (match) {
      const currentNum = parseInt(match[1], 10);
      const suffix = match[2] || '';
      const newNum = String(currentNum + 1).padStart(3, '0');
      setBookForm({ ...bookForm, id: `book-${newNum}${suffix}` });
    }
  };

  const handleBookIdDecrement = () => {
    const match = bookForm.id.match(/book-(\d+)(-.*)?/);
    if (match) {
      const currentNum = parseInt(match[1], 10);
      if (currentNum > 1) {
        const suffix = match[2] || '';
        const newNum = String(currentNum - 1).padStart(3, '0');
        setBookForm({ ...bookForm, id: `book-${newNum}${suffix}` });
      }
    }
  };

  // ✅ NEW: Audio upload handler (for quiz questions) - Updated to use Supabase Storage
  const handleAudioUpload = async (file, questionIndex) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    if (!validTypes.includes(file.type)) {
      alert(t('contentManagement.upload.audioOnly'));
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t('contentManagement.upload.fileTooLarge', { size: (file.size / 1024 / 1024).toFixed(2), limit: '10' }));
      return;
    }
    
    setIsUploadingAudio(true);
    setUploadingAudioIndex(questionIndex);
    
    try {
      // ✅ Upload to Supabase Storage
      const { uploadAudio, generateFilePath } = await import('../../services/fileUploadService.js');
      // 📁 Đường dẫn có ngữ nghĩa: level / book / chapter / lesson / question
      const safeLevel = selectedLevel || 'unknown-level';
      const safeBook = selectedBook?.id || 'unknown-book';
      const safeChapter = selectedChapter?.id || 'unknown-chapter';
      const safeLesson = selectedLesson?.id || 'unknown-lesson';
      const safeQuestion = questionIndex != null ? `question-${questionIndex + 1}` : 'question-unknown';
      const prefix = `level-${safeLevel}/book-${safeBook}/chapter-${safeChapter}/lesson-${safeLesson}/${safeQuestion}`;
      const path = generateFilePath(prefix, file.name);
      
      const result = await uploadAudio(file, path);
      
      if (result.success) {
        // Update question audioUrl with Supabase URL
        const newQuestions = [...quizForm.questions];
        newQuestions[questionIndex].audioUrl = result.url;
        setQuizForm({ ...quizForm, questions: newQuestions });
        
        setIsUploadingAudio(false);
        setUploadingAudioIndex(-1);
        alert(t('contentManagement.upload.audioUploadSuccess', { name: file.name, size: (file.size / 1024).toFixed(2) }));
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('contentManagement.upload.audioUploadError') + ': ' + error.message);
      setIsUploadingAudio(false);
      setUploadingAudioIndex(-1);
    }
  };

  // ✅ NEW: Check duplicate questions
  const checkDuplicateQuestion = (questionText, currentIndex) => {
    if (!questionText || !quizForm.questions) return false;
    
    const normalizedText = questionText.toLowerCase().trim();
    return quizForm.questions.some((q, idx) => 
      idx !== currentIndex && 
      q.text && 
      q.text.toLowerCase().trim() === normalizedText
    );
  };

  // ✅ NEW: Image upload handler
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert(t('contentManagement.upload.imageOnly'));
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t('contentManagement.upload.imageTooLarge', { size: (file.size / 1024 / 1024).toFixed(2), limit: '5' }));
      return;
    }
    
    setIsUploadingImage(true);
    setUploadProgress(0);
    
    try {
      // ✅ Upload to Supabase Storage
      const { uploadImage, generateFilePath } = await import('../../services/fileUploadService.js');
      // 📁 Đường dẫn có ngữ nghĩa: level / book
      const safeLevel = selectedLevel || 'unknown-level';
      const safeBookId = bookForm.id || editingBook?.id || 'unknown-book';
      const prefix = `level-${safeLevel}/book-${safeBookId}`;
      const path = generateFilePath(prefix, file.name);
      
      // Simulate progress (Supabase doesn't provide progress events)
      setUploadProgress(50);
      
      const result = await uploadImage(file, path);
      
      if (result.success) {
        // Update form with Supabase URL
        setBookForm({ ...bookForm, imageUrl: result.url });
        
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploadingImage(false);
          setUploadProgress(0);
          alert(t('contentManagement.upload.imageUploadSuccess', { name: file.name, size: (file.size / 1024).toFixed(2), path: result.url }));
        }, 500);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('contentManagement.upload.imageUploadError') + ': ' + error.message);
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    
    // ✅ Enhanced validation
    if (!bookForm.id || !bookForm.title) {
      alert('⚠️ Vui lòng điền đầy đủ ID và Tên sách!');
      return;
    }
    
    if (!bookForm.category) {
      alert(t('contentManagement.alerts.selectCategory'));
      return;
    }
    
    // Check duplicate title
    if (bookFormValidation.titleExists) {
      alert(t('contentManagement.alerts.bookNameExists'));
      return;
    }

    setIsSavingBook(true);
    
    let updatedBooks;
    if (editingBook) {
      // Update existing book
      updatedBooks = books.map(b => 
        b.id === editingBook.id ? { ...bookForm } : b
      );
    } else {
      // Add new book
      if (books.find(b => b.id === bookForm.id)) {
        alert(t('contentManagement.messages.bookIdExists'));
        setIsSavingBook(false);
        return;
      }
      updatedBooks = [...books, { ...bookForm }];
    }
    
    try {
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      await saveBooks(updatedBooks);
      
      // Close modal first
      setShowBookForm(false);
      setIsSavingBook(false);
      
      // Success toast
      alert(getSaveSuccessMessage(t('contentManagement.success.bookDetails', {
          id: bookForm.id,
          title: bookForm.title,
          series: bookForm.category || t('contentManagement.empty.noCategory')
        })));
    } catch (error) {
      console.error('Error saving book:', error);
      setIsSavingBook(false);
      alert(t('contentManagement.messages.saveError', { item: t('common.book') }));
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm(t('contentManagement.confirm.deleteBook'))) return;

    // 1. Xóa sách + toàn bộ nội dung liên quan trên Supabase
    try {
      const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
      console.log('[ContentManagement] 🗑️ Deleting book from Supabase:', { bookId, level: selectedLevel, userId });
      const result = await contentService.deleteBookCascade(bookId, selectedLevel);
      if (!result.success) {
        console.warn('[ContentManagement] ⚠️ Failed to delete book from Supabase:', result.error);
      }
    } catch (err) {
      console.error('[ContentManagement] ❌ Unexpected error when deleting book from Supabase:', err);
    }

    // 2. Cập nhật state + cache local (books list)
    const updatedBooks = books.filter(b => b.id !== bookId);
    await saveBooks(updatedBooks);
    alert(t('contentManagement.messages.bookDeleted'));
  };

  // ✅ Helper: Generate auto ID for chapters
  const generateChapterId = (existingChapters) => {
    if (!existingChapters || existingChapters.length === 0) return 'chapter-1';
    const numbers = existingChapters
      .map(ch => {
        // Try multiple patterns: chapter-1, bai-1, unit-1, etc.
        const match = ch.id.match(/(?:chapter|bai|unit|ch)-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `chapter-${maxNum + 1}`;
  };

  // Chapter CRUD operations
  const handleAddChapter = async (book) => {
    setSelectedBook(book);
    setEditingChapter(null);
    
    // ✅ FIXED: Load existing chapters from storage (prioritize storage over static data)
    // This ensures chapters created by admin are visible when adding new chapters
    let existingChapters = await storageManager.getChapters(book.id, selectedLevel);
    
    // If no chapters in storage, try to get from static data
    if (!existingChapters || existingChapters.length === 0) {
      const bookData = getBookData(book.id);
      existingChapters = bookData?.contents || [];
    }
    
    // ✅ Auto-generate chapter ID
    const autoId = generateChapterId(existingChapters);
    setChapterForm({ id: autoId, title: '' });
    
    // ✅ Also update chaptersData state to ensure consistency
    setChaptersData(prev => ({
      ...prev,
      [book.id]: existingChapters
    }));
    
    // Store for preview
    setSelectedBook({ ...book, existingChapters: existingChapters });
    setShowChapterForm(true);
  };

  const handleEditChapter = async (book, chapter) => {
    setSelectedBook(book);
    setEditingChapter(chapter);
    setChapterForm({
      id: chapter.id,
      title: chapter.title || chapter.id
    });
    
    // ✅ FIXED: Load existing chapters from storage (prioritize storage over static data)
    // This ensures chapters created by admin are visible when editing with other accounts
    let existingChapters = await storageManager.getChapters(book.id, selectedLevel);
    
    // If no chapters in storage, try to get from static data
    if (!existingChapters || existingChapters.length === 0) {
      const bookData = getBookData(book.id);
      existingChapters = bookData?.contents || [];
    }
    
    // ✅ Also update chaptersData state to ensure consistency
    setChaptersData(prev => ({
      ...prev,
      [book.id]: existingChapters
    }));
    
    // Store for preview
    setSelectedBook({ ...book, existingChapters: existingChapters });
    setShowChapterForm(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.id || !chapterForm.title || !selectedBook) {
      alert(t('contentManagement.errors.fillAllInfo'));
      return;
    }

    // Get existing chapters from IndexedDB/localStorage or default data
    let chapters = await storageManager.getChapters(selectedBook.id, selectedLevel);
    
    // If no chapters in storage, try to get from static data
    if (!chapters || chapters.length === 0) {
      const bookData = getBookData(selectedBook.id);
      chapters = bookData?.contents || [];
    }

    if (editingChapter) {
      // Update existing chapter
      chapters = chapters.map(ch => 
        ch.id === editingChapter.id ? { ...chapterForm } : ch
      );
    } else {
      // Add new chapter
      if (chapters.find(ch => ch.id === chapterForm.id)) {
        alert(t('contentManagement.errors.chapterIdExists'));
        return;
      }
      chapters = [...chapters, { ...chapterForm }];
    }

    // ✅ Sắp xếp chapters theo ID (để đồng nhất với thứ tự)
    chapters.sort((a, b) => {
      // Extract numbers from IDs (e.g., "bai-1" -> 1, "unit-2" -> 2)
      const getNumber = (id) => {
        const match = id.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      const numA = getNumber(a.id);
      const numB = getNumber(b.id);
      if (numA !== numB) {
        return numA - numB;
      }
      // Nếu không có số, sắp xếp theo ID string
      return a.id.localeCompare(b.id);
    });

    // Save to IndexedDB (unlimited storage!) or localStorage
    const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
    const success = await storageManager.saveChapters(selectedBook.id, chapters, selectedLevel, userId);
    
    if (success) {
      // Update local state
      setChaptersData(prev => ({
        ...prev,
        [selectedBook.id]: chapters
      }));
      
      setShowChapterForm(false);
      setEditingChapter(null);
      setChapterForm({ id: '', title: '' });
      
      alert(getSaveSuccessMessage(
        t('contentManagement.success.chapterDetails', {
          action: editingChapter ? t('contentManagement.messages.chapterUpdated') : t('contentManagement.messages.chapterAdded'),
          id: chapterForm.id,
          title: chapterForm.title
        }) + `\n   - Sách: ${selectedBook.title}`
      ));
      
      // Refresh books to update chapter count
      loadBooks();
    } else {
      alert(t('contentManagement.messages.saveError', { item: t('common.chapter') }));
    }
  };

  const handleDeleteChapter = async (book, chapter) => {
    if (!confirm(t('contentManagement.confirm.deleteChapter', { title: chapter.title }))) {
      return;
    }

    let chapters = await storageManager.getChapters(book.id, selectedLevel);
    
    // If no chapters in storage, get from static data
    if (!chapters || chapters.length === 0) {
      const bookData = getBookData(book.id);
      chapters = bookData?.contents || [];
    }

    chapters = chapters.filter(ch => ch.id !== chapter.id);
      const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
      const success = await storageManager.saveChapters(book.id, chapters, selectedLevel, userId);
    
    if (success) {
      // Update local state
      setChaptersData(prev => ({
        ...prev,
        [book.id]: chapters
      }));
      
      // ✅ NEW: Also delete lessons and quizzes for this chapter
      const lessonsKey = `${book.id}_${chapter.id}`;
      await storageManager.deleteLessons(book.id, chapter.id);
      setLessonsData(prev => {
        const newData = { ...prev };
        delete newData[lessonsKey];
        return newData;
      });
      
      alert(t('contentManagement.messages.chapterDeleted', { title: chapter.title }));
      loadBooks(); // Refresh
    } else {
      alert(t('contentManagement.errors.deleteChapter'));
    }
  };

  // ✅ Helper: Generate auto ID for lessons
  const generateLessonId = (existingLessons) => {
    if (!existingLessons || existingLessons.length === 0) return 'lesson-1';
    const numbers = existingLessons
      .map(l => {
        const match = l.id.match(/lesson-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `lesson-${maxNum + 1}`;
  };

  // ✅ NEW: Lesson CRUD operations
  const handleAddLesson = async (book, chapter) => {
    setSelectedBook(book);
    setEditingLesson(null);
    
    // Load existing lessons
    let existingLessons = await storageManager.getLessons(book.id, chapter.id, selectedLevel);
    if (!existingLessons) existingLessons = [];
    
    // ✅ Auto-generate lesson ID
    const autoId = generateLessonId(existingLessons);
    setLessonForm({ 
      id: autoId, 
      title: '',
      pdfUrl: '',
      content: '',
      description: ''
    });
    
    setSelectedChapter({ ...chapter, existingLessons });
    setShowLessonForm(true);
  };

  // ✅ SRS INTEGRATION: Enhanced edit handler (auto-migrate old lessons)
  const handleEditLesson = async (book, chapter, lesson) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    
    // ✅ NEW: Auto-migrate old lessons to new format
    const isNewFormat = lesson.contentType !== undefined;
    const migratedLesson = isNewFormat ? lesson : migrateLegacyLesson(lesson);
    
    setEditingLesson(migratedLesson);
    
    // Also update old lessonForm for backward compat (if using old modal)
    setLessonForm({
      id: lesson.id,
      title: lesson.title || lesson.id,
      description: lesson.description || '',
      pdfUrl: lesson.pdfUrl || '',
      content: lesson.content || ''
    });
    
    // Load existing lessons to avoid duplicate
    let existingLessons = await storageManager.getLessons(book.id, chapter.id, selectedLevel);
    if (!existingLessons) existingLessons = [];
    
    setSelectedChapter({ ...chapter, existingLessons });
    setShowLessonForm(true);
    
    // Log migration for debugging
    if (!isNewFormat) {
      console.log('📦 Auto-migrated old lesson to new format:', {
        id: lesson.id,
        oldFormat: { pdfUrl: lesson.pdfUrl, content: lesson.content },
        newFormat: { 
          contentType: migratedLesson.contentType,
          theory: migratedLesson.theory,
          srs: migratedLesson.srs
        }
      });
    }
  };

  // ✅ SRS INTEGRATION: Enhanced save handler (backward compatible)
  const handleSaveLesson = async (lessonData) => {
    // Support both old form (event) and new modal (lessonData object)
    const isEventObject = lessonData?.preventDefault;
    
    if (isEventObject) {
      // Old form submission - prevent default and use lessonForm state
      lessonData.preventDefault();
      lessonData = { ...lessonForm };
    }
    
    // Validate
    if (!lessonData.id || !lessonData.title || !selectedBook || !selectedChapter) {
      alert(t('contentManagement.errors.fillAllInfo'));
      return;
    }

    try {
      // ✅ NEW: Auto-detect format and migrate if needed
      const isNewFormat = lessonData.contentType !== undefined;
      const finalLessonData = isNewFormat ? lessonData : migrateLegacyLesson(lessonData);
      
      console.log('💾 Saving lesson:', {
        format: isNewFormat ? 'NEW (SRS-enabled)' : 'OLD (migrated)',
        id: finalLessonData.id,
        contentType: finalLessonData.contentType,
        hasSRS: finalLessonData.srs?.enabled
      });

      let lessons = await storageManager.getLessons(selectedBook.id, selectedChapter.id, selectedLevel);
      if (!lessons) lessons = [];

      if (editingLesson) {
        // Edit existing
        lessons = lessons.map(l => 
          l.id === finalLessonData.id ? finalLessonData : l
        );
      } else {
        // Create new
        if (lessons.find(l => l.id === finalLessonData.id)) {
          alert(t('contentManagement.errors.lessonIdExists'));
          return;
        }
        lessons = [...lessons, finalLessonData];
      }

      // Sort lessons by ID
      lessons.sort((a, b) => {
        const getNumber = (id) => {
          const match = id.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        const numA = getNumber(a.id);
        const numB = getNumber(b.id);
        if (numA !== numB) {
          return numA - numB;
        }
        return a.id.localeCompare(b.id);
      });

      const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
      const success = await storageManager.saveLessons(selectedBook.id, selectedChapter.id, lessons, selectedLevel, userId);
      
      if (success) {
        const key = `${selectedBook.id}_${selectedChapter.id}`;
        setLessonsData(prev => ({
          ...prev,
          [key]: lessons
        }));
        
        setShowLessonForm(false);
        setEditingLesson(null);
        setLessonForm({ id: '', title: '', pdfUrl: '', content: '', description: '' });
        
        // Refresh overview
        setOverviewRefreshTrigger(prev => prev + 1);
        
        alert(getSaveSuccessMessage(
          t('contentManagement.success.lessonDetails', {
            action: editingLesson ? t('contentManagement.messages.lessonUpdated') : t('contentManagement.messages.lessonAdded'),
            id: finalLessonData.id,
            title: finalLessonData.title,
            type: finalLessonData.contentType || 'grammar'
          }) + `\n   - SRS: ${finalLessonData.srs?.enabled ? 'BẬT ✅' : 'TẮT'}\n   - Sách: ${selectedBook.title}\n   - Chapter: ${selectedChapter.title}`
        ));
      } else {
        alert(t('contentManagement.messages.saveError', { item: 'lesson' }));
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert(t('contentManagement.errors.general', { message: error.message }));
    }
  };

  const handleDeleteLesson = async (book, chapter, lesson) => {
    if (!confirm(t('contentManagement.confirm.deleteLesson', { title: lesson.title }))) {
      return;
    }

    let lessons = await storageManager.getLessons(book.id, chapter.id, selectedLevel);
    if (!lessons) lessons = [];

    lessons = lessons.filter(l => l.id !== lesson.id);
    const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
    const success = await storageManager.saveLessons(book.id, chapter.id, lessons, selectedLevel, userId);
    
    if (success) {
      const key = `${book.id}_${chapter.id}`;
      setLessonsData(prev => ({
        ...prev,
        [key]: lessons
      }));
      
      // Also delete quiz for this lesson (từ Supabase và local storage)
      await storageManager.deleteQuiz(book.id, chapter.id, lesson.id, selectedLevel);
      const quizKey = `${book.id}_${chapter.id}_${lesson.id}`;
      setQuizzesData(prev => {
        const newData = { ...prev };
        delete newData[quizKey];
        return newData;
      });
      
      alert(t('contentManagement.messages.lessonDeleted', { title: lesson.title }));
    } else {
      alert(t('contentManagement.errors.deleteLesson'));
    }
  };

  // ✅ NEW: Quiz/Questions CRUD operations
  const handleAddQuiz = async (book, chapter, lesson) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSelectedLesson(lesson);
    setEditingQuiz(null);
    setQuizForm({
      title: lesson.title || lesson.id,
      questions: [
        {
          id: 1,
          text: '',
          audioUrl: '', // ✅ NEW: Audio support
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' }
          ],
          correct: 'A',
          explanation: ''
        }
      ]
    });
    setShowQuizForm(true);
  };

  const handleEditQuiz = async (book, chapter, lesson) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSelectedLesson(lesson);
    
    const quiz = await storageManager.getQuiz(book.id, chapter.id, lesson.id, selectedLevel);
    if (quiz) {
      setEditingQuiz(quiz);
      // ✅ Ensure all questions have audioUrl field
      const questionsWithAudio = (quiz.questions || []).map(q => ({
        ...q,
        audioUrl: q.audioUrl || ''
      }));
      setQuizForm({
        title: quiz.title || lesson.title || lesson.id,
        questions: questionsWithAudio
      });
    } else {
      // If no quiz exists, create new one
      setEditingQuiz(null);
      setQuizForm({
        title: lesson.title || lesson.id,
        questions: [
          {
            id: 1,
            text: '',
            audioUrl: '', // ✅ NEW: Audio support
            options: [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
              { label: 'D', text: '' }
            ],
            correct: 'A',
            explanation: ''
          }
        ]
      });
    }
    setShowQuizForm(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title || !selectedBook || !selectedChapter || !selectedLesson) {
      alert(t('contentManagement.errors.fillAllInfo'));
      return;
    }

    if (!quizForm.questions || quizForm.questions.length === 0) {
      alert(t('contentManagement.alerts.addAtLeastOneQuestion'));
      return;
    }

    // Validate questions
    if (quizForm.questions && Array.isArray(quizForm.questions)) {
      for (const q of quizForm.questions) {
        if (!q.text || !q.text.trim()) {
          alert(t('contentManagement.alerts.fillAllQuestions'));
          return;
        }
        if (q.options && Array.isArray(q.options)) {
          for (const opt of q.options) {
            if (!opt.text || !opt.text.trim()) {
              alert(t('contentManagement.messages.fillAllAnswers'));
              return;
            }
          }
        }
        if (!q.explanation || !q.explanation.trim()) {
          alert(t('contentManagement.alerts.fillAllExplanations'));
          return;
        }
      }
    }

    const quizData = {
      bookId: selectedBook?.id,
      chapterId: selectedChapter?.id,
      lessonId: selectedLesson?.id,
      title: quizForm.title,
      questions: quizForm.questions
    };

    const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
    const success = await storageManager.saveQuiz(
      selectedBook?.id,
      selectedChapter?.id,
      selectedLesson?.id,
      quizData,
      selectedLevel,
      userId
    );
    
    if (success) {
      const key = `${selectedBook?.id}_${selectedChapter?.id}_${selectedLesson?.id}`;
      setQuizzesData(prev => ({
        ...prev,
        [key]: quizData
      }));
      
      setShowQuizForm(false);
      setEditingQuiz(null);
      
      alert(getSaveSuccessMessage(
        t('contentManagement.success.quizDetails', {
          action: editingQuiz ? t('contentManagement.messages.quizUpdated') : t('contentManagement.messages.quizAdded'),
          title: quizForm.title,
          count: quizForm.questions?.length || 0
        }) + `\n   - Sách: ${selectedBook?.title}\n   - Chapter: ${selectedChapter?.title}\n   - Lesson: ${selectedLesson?.title || selectedLesson?.id}`
      ));
    } else {
      alert(t('contentManagement.messages.saveError', { item: t('common.quiz') }));
    }
  };

  const handleDeleteQuiz = async (book, chapter, lesson) => {
    if (!confirm(t('contentManagement.confirm.deleteQuiz', { title: lesson.title }) || `⚠️ Bạn có chắc muốn xóa quiz cho "${lesson.title}"?\n\nQuiz sẽ bị xóa khỏi cả IndexedDB, localStorage và Supabase.`)) {
      return;
    }

    console.log(`🗑️ [Delete Quiz] Starting deletion: ${book.id}/${chapter.id}/${lesson.id}`);
    
    try {
      // ✅ Step 1: Xóa từ Supabase trước (nếu có)
      if (selectedLevel) {
        try {
          const { supabase } = await import('../../services/supabaseClient.js');
          const { error } = await supabase
            .from('quizzes')
            .delete()
            .eq('book_id', book.id)
            .eq('chapter_id', chapter.id)
            .eq('lesson_id', lesson.id)
            .eq('level', selectedLevel);
          
          if (error) {
            console.warn('⚠️ [Delete Quiz] Supabase delete error (may not exist):', error);
          } else {
            console.log('✅ [Delete Quiz] Deleted from Supabase');
          }
        } catch (err) {
          console.warn('⚠️ [Delete Quiz] Error deleting from Supabase:', err);
        }
      }
      
      // ✅ Step 2: Xóa từ storage (IndexedDB + localStorage)
      const success = await storageManager.deleteQuiz(book.id, chapter.id, lesson.id, selectedLevel);
      
      if (success) {
        const key = `${book.id}_${chapter.id}_${lesson.id}`;
        setQuizzesData(prev => {
          const newData = { ...prev };
          delete newData[key];
          return newData;
        });
        
        console.log('✅ [Delete Quiz] Successfully deleted from all storage');
        alert(t('contentManagement.messages.quizDeleted') || '✅ Đã xóa quiz thành công!');
      } else {
        // Even if storage delete fails, remove from UI if Supabase delete succeeded
        const key = `${book.id}_${chapter.id}_${lesson.id}`;
        setQuizzesData(prev => {
          const newData = { ...prev };
          delete newData[key];
          return newData;
        });
        console.warn('⚠️ [Delete Quiz] Storage delete failed, but removed from UI');
        alert('⚠️ Đã xóa quiz khỏi Supabase, nhưng có thể còn trong local storage. Vui lòng refresh trang.');
      }
    } catch (error) {
      console.error('❌ [Delete Quiz] Error:', error);
      alert(`❌ Lỗi khi xóa quiz: ${error.message}`);
    }
  };

  // ✅ NEW: Cleanup invalid quizzes
  const handleCleanupQuizzes = async () => {
    if (!confirm(t('contentManagement.confirm.cleanupQuizzes') || '⚠️ Bạn có chắc muốn dọn dẹp tất cả quiz không hợp lệ?\n\nQuiz không hợp lệ sẽ bị xóa khỏi storage.')) {
      return;
    }
    
    try {
      console.log('🧹 [Cleanup] Starting cleanup process...');
      const result = await cleanupInvalidQuizzes(selectedLevel);
      const message = result.cleaned > 0
        ? `✅ Đã dọn dẹp ${result.cleaned} quiz không hợp lệ${result.errors > 0 ? `\n⚠️ ${result.errors} lỗi xảy ra` : ''}`
        : `✅ Không tìm thấy quiz nào cần dọn dẹp${result.errors > 0 ? `\n⚠️ ${result.errors} lỗi xảy ra` : ''}`;
      
      alert(message);
      
      // Refresh quizzes data
      const loadQuizzes = async () => {
        const newQuizzesData = {};
        for (const book of books) {
          const chapters = chaptersData[book.id] || [];
          for (const chapter of chapters) {
            const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
            for (const lesson of lessons) {
              const quiz = await storageManager.getQuiz(book.id, chapter.id, lesson.id, selectedLevel);
              if (quiz) {
                // ✅ Verify quiz exists in Supabase before adding
                let isValidQuiz = true;
                if (selectedLevel) {
                  try {
                    const { contentService } = await import('../../services/contentService.js');
                    const { success, data } = await contentService.getQuiz(book.id, chapter.id, lesson.id, selectedLevel);
                    
                    if (!success || !data) {
                      const hasValidContent = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 &&
                        quiz.questions.some(q => {
                          const text = (q.text || q.question || '').trim();
                          const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0;
                          return text.length > 0 && hasOptions;
                        });
                      
                      if (!hasValidContent) {
                        isValidQuiz = false;
                      }
                    }
                  } catch (err) {
                    console.warn(`⚠️ [Cleanup] Error verifying quiz:`, err);
                  }
                }
                
                if (isValidQuiz) {
                  const key = `${book.id}_${chapter.id}_${lesson.id}`;
                  newQuizzesData[key] = quiz;
                }
              }
            }
          }
        }
        setQuizzesData(newQuizzesData);
      };
      await loadQuizzes();
      
      // Refresh overview
      setOverviewRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error cleaning up quizzes:', error);
      alert(`❌ Lỗi khi dọn dẹp quiz: ${error.message}`);
    }
  };

  // ✅ NEW: Export data to JSON file (by level or all)

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              📚 {t('contentManagement.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('contentManagement.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCleanupQuizzes}
              className="px-3 py-2 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black transition-all uppercase tracking-wide text-xs flex items-center gap-2"
              title={t('contentManagement.actions.cleanupQuizzes') || 'Dọn dẹp quiz không hợp lệ'}
            >
              🧹 <span className="hidden sm:inline">{t('contentManagement.actions.cleanupQuizzes') || 'Dọn dẹp Quiz'}</span>
            </button>
          </div>
        </div>

        {/* ✅ Breadcrumb Navigation */}
        {(hierarchyPath.series || hierarchyPath.book || hierarchyPath.chapter || hierarchyPath.lesson) && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-[3px] border-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">📍 {t('contentManagement.breadcrumb.viewing')}</span>
              <button
                onClick={() => {
                  setHierarchyPath({ level: selectedLevel, series: null, book: null, chapter: null, lesson: null });
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
              >
                {t('contentManagement.breadcrumb.level')} {selectedLevel.toUpperCase()}
              </button>
              {(hierarchyPath.series || hierarchyPath.book || hierarchyPath.chapter || hierarchyPath.lesson) && (
                <span className="text-gray-400">→</span>
              )}
              {hierarchyPath.series && (
                <>
                  <button
                    onClick={() => {
                      setHierarchyPath({ ...hierarchyPath, series: hierarchyPath.series, book: null, chapter: null, lesson: null });
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
                  >
                    {t('contentManagement.breadcrumb.series')} {series.find(s => s.id === hierarchyPath.series || s.name === hierarchyPath.series)?.name || hierarchyPath.series}
                  </button>
                  {(hierarchyPath.book || hierarchyPath.chapter || hierarchyPath.lesson) && (
                    <span className="text-gray-400">→</span>
                  )}
                </>
              )}
              {hierarchyPath.book && (
                <>
                  <button
                    onClick={() => {
                      setHierarchyPath({ ...hierarchyPath, book: hierarchyPath.book, chapter: null, lesson: null });
                    }}
                    className="px-2 py-1 bg-purple-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
                  >
                    {t('contentManagement.breadcrumb.book')} {booksWithChapters.find(b => b.id === hierarchyPath.book)?.title || hierarchyPath.book}
                  </button>
                  {(hierarchyPath.chapter || hierarchyPath.lesson) && (
                    <span className="text-gray-400">→</span>
                  )}
                </>
              )}
              {hierarchyPath.chapter && (
                <>
                  <button
                    onClick={() => {
                      setHierarchyPath({ ...hierarchyPath, chapter: hierarchyPath.chapter, lesson: null });
                    }}
                    className="px-2 py-1 bg-orange-500 text-white rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 uppercase"
                  >
                    {t('contentManagement.breadcrumb.chapter')} {hierarchyPath.chapter}
                  </button>
                  {hierarchyPath.lesson && (
                    <span className="text-gray-400">→</span>
                  )}
                </>
              )}
              {hierarchyPath.lesson && (
                <span className="px-2 py-1 bg-red-500 text-white rounded font-medium">
                  {t('contentManagement.breadcrumb.lesson')} {hierarchyPath.lesson}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ✅ NEW: View Mode Toggle */}
        <div className="mb-4 bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 flex gap-2">
          <button
            onClick={() => {
              setViewMode('overview');
              setHierarchyPath({ level: null, series: null, book: null, chapter: null, lesson: null });
              // ✅ Trigger refresh khi quay lại overview để cập nhật stats mới nhất
              setOverviewRefreshTrigger(prev => prev + 1);
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-black transition-all uppercase text-sm ${
              viewMode === 'overview'
                ? 'bg-blue-500 text-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[2px] border-gray-300'
            }`}
          >
            📊 {t('contentManagement.tabs.overview')}
          </button>
          <button
            onClick={() => {
              setViewMode('level-detail');
              setHierarchyPath({ level: selectedLevel, series: null, book: null, chapter: null, lesson: null });
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-black transition-all uppercase text-sm ${
              viewMode === 'level-detail'
                ? 'bg-blue-500 text-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[2px] border-gray-300'
            }`}
          >
            📚 {t('contentManagement.tabs.levelDetail')}
          </button>
        </div>

        {/* ✅ NEW: All Levels Overview */}
        {viewMode === 'overview' ? (
          <AllLevelsOverview
            onLevelClick={(level) => {
              setSelectedLevel(level);
              setViewMode('level-detail');
              setHierarchyPath({ level, series: null, book: null, chapter: null, lesson: null });
              setSeriesPage(1);
            }}
            refreshTrigger={overviewRefreshTrigger}
          />
        ) : (
        /* Level Detail View */
        <div className="space-y-4 sm:space-y-6">
          {/* Level Header with Back Button */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setViewMode('overview')}
                  className="mb-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  ← {t('contentManagement.backToOverview')}
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  📚 JLPT {selectedLevel.toUpperCase()}
                </h2>
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setHierarchyPath({ level: e.target.value, series: null, book: null, chapter: null, lesson: null });
                  setSeriesPage(1);
                }}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="n1">N1</option>
                <option value="n2">N2</option>
                <option value="n3">N3</option>
                <option value="n4">N4</option>
                <option value="n5">N5</option>
              </select>
            </div>
          </div>

          {/* ✅ NEW: Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`🔍 ${t('contentManagement.searchPlaceholder')}`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSeriesPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSeriesPage(1);
                }}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="all">{t('contentManagement.filters.all')}</option>
                <option value="published">🟢 {t('contentManagement.filters.published')}</option>
                <option value="draft">🟡 {t('contentManagement.filters.draft')}</option>
                <option value="empty">🔴 {t('contentManagement.filters.empty')}</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setSeriesPage(1);
                }}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="name">{t('contentManagement.sortOptions.name')}</option>
                <option value="newest">{t('contentManagement.sortOptions.newest')}</option>
                <option value="most-books">{t('contentManagement.sortOptions.mostBooks')}</option>
              </select>
              
              {/* View Type Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('card')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewType === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                  }`}
                  title={t('contentManagement.viewTypes.card')}
                >
                  📇
                </button>
                <button
                  onClick={() => setViewType('table')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewType === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                  }`}
                  title={t('contentManagement.viewTypes.table')}
                >
                  📊
                </button>
                <button
                  onClick={() => setViewType('tree')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewType === 'tree' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                  }`}
                  title={t('contentManagement.viewTypes.tree')}
                >
                  🌲
                </button>
              </div>
            </div>
          </div>

          {/* Hierarchy View */}
          <HierarchyView
            selectedLevel={selectedLevel}
            hierarchyPath={{ ...hierarchyPath, level: hierarchyPath.level || selectedLevel }}
            setHierarchyPath={setHierarchyPath}
            books={books}
            series={series}
            chaptersData={chaptersData}
            lessonsData={lessonsData}
            quizzesData={quizzesData}
            booksWithChapters={booksWithChapters}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            sortBy={sortBy}
            viewType={viewType}
            seriesPage={seriesPage}
            setSeriesPage={setSeriesPage}
            itemsPerPage={itemsPerPage}
            expandedSeries={expandedSeries}
            setExpandedSeries={setExpandedSeries}
            onAddSeries={() => {
              // ✅ Auto-generate series ID
              const seriesNumbers = series
                .map(s => {
                  const match = s.id.match(/series-(\d+)/i);
                  return match ? parseInt(match[1], 10) : 0;
                })
                .filter(n => n > 0);
              const maxNum = seriesNumbers.length > 0 ? Math.max(...seriesNumbers) : 0;
              const autoId = `series-${maxNum + 1}`;
              
              setSeriesForm({ id: autoId, name: '', description: '' });
              setEditingSeries(null);
              setShowSeriesForm(true);
            }}
            onAddBook={handleAddBook}
            onAddChapter={handleAddChapter}
            onAddLesson={handleAddLesson}
            onAddQuiz={handleAddQuiz}
            onEditSeries={(s) => {
              setEditingSeries(s);
              setSeriesForm({ id: s.id, name: s.name, description: s.description || '' });
              setShowSeriesForm(true);
            }}
            onEditBook={handleEditBook}
            onEditChapter={handleEditChapter}
            onEditLesson={handleEditLesson}
            onEditQuiz={handleEditQuiz}
              onDeleteSeries={async (seriesId) => {
                const seriesToDelete = series.find(s => s.id === seriesId);
                if (!seriesToDelete) return;
                
                if (!confirm(t('contentManagement.confirm.deleteSeries'))) return;

                // 1. Xóa series + tất cả books, chapters, lessons, quizzes liên quan trên Supabase
                try {
                  const userId = user && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
                  console.log('[ContentManagement] 🗑️ Deleting series from Supabase:', { seriesId, level: selectedLevel, userId });
                  const result = await contentService.deleteSeriesCascade(seriesId, selectedLevel);
                  if (!result.success) {
                    console.warn('[ContentManagement] ⚠️ Failed to delete series from Supabase:', result.error);
                    alert(t('contentManagement.messages.deleteSeriesError') || `Lỗi khi xóa series trên Supabase: ${result.error?.message || 'Unknown error'}`);
                  } else {
                    console.log('[ContentManagement] ✅ Deleted', result.deletedBooks || 0, 'books from Supabase');
                  }
                } catch (err) {
                  console.error('[ContentManagement] ❌ Unexpected error when deleting series from Supabase:', err);
                  alert(t('contentManagement.messages.deleteSeriesError') || `Lỗi khi xóa series: ${err.message}`);
                }

                // 2. Xóa tất cả books thuộc series này khỏi local state
                const seriesName = seriesToDelete.name;
                const updatedBooks = books.filter(book => {
                  // Xóa books có seriesId khớp hoặc category khớp với series name
                  return book.seriesId !== seriesId && book.category !== seriesName;
                });

                // 3. Xóa series khỏi list
                const updatedSeries = series.filter(s => s.id !== seriesId);

                // 4. Lưu lại state đã cập nhật
                await saveSeries(updatedSeries);
                await saveBooks(updatedBooks);

                // 5. Xóa chapters, lessons, quizzes của các books đã xóa khỏi local storage
                const deletedBookIds = books
                  .filter(book => book.seriesId === seriesId || book.category === seriesName)
                  .map(book => book.id);
                
                for (const bookId of deletedBookIds) {
                  await storageManager.deleteChapters(bookId);
                  // Delete lessons for all chapters of this book
                  const bookChapters = chaptersData[bookId] || [];
                  for (const chapter of bookChapters) {
                    await storageManager.deleteLessons(bookId, chapter.id);
                    // ✅ FIXED: Truyền level để xóa quiz từ Supabase
                    await storageManager.deleteQuiz(bookId, chapter.id, null, selectedLevel);
                  }
                }

                // ✅ Trigger refresh AllLevelsOverview stats
                setOverviewRefreshTrigger(prev => prev + 1);
                
                alert(t('contentManagement.messages.seriesDeleted', { 
                  seriesName, 
                  count: deletedBookIds.length 
                }) || `Đã xóa series "${seriesName}" và ${deletedBookIds.length} sách liên quan`);
              }}
            onDeleteBook={handleDeleteBook}
            onDeleteChapter={handleDeleteChapter}
            onDeleteLesson={handleDeleteLesson}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </div>
      )}

      {/* Book Form Modal - Responsive */}
      <Modal 
        isOpen={showBookForm} 
        onClose={() => setShowBookForm(false)} 
        title={editingBook ? t('contentManagement.forms.editBook') : t('contentManagement.forms.addBook')}
        maxWidth="56rem"
      >
        <form onSubmit={handleSaveBook} className="space-y-3 sm:space-y-4 min-w-0 overflow-x-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* ✅ ENHANCED: ID Field with Stepper */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('contentManagement.forms.bookId')}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={bookForm.id}
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2 border-2 border-blue-300 rounded-lg bg-blue-50 text-sm sm:text-base font-mono font-semibold text-blue-900 cursor-not-allowed"
                />
                {!editingBook && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleBookIdDecrement}
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
                      title={t('contentManagement.forms.decreaseNumber')}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={handleBookIdIncrement}
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded font-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center"
                      title={t('contentManagement.forms.increaseNumber')}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <span>✅</span>
                <span>{t('contentManagement.messages.autoIdBySeries')}</span>
              </p>
              {bookForm.id && books.some(b => b.id === bookForm.id && (!editingBook || b.id !== editingBook.id)) && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{t('contentManagement.alerts.idExists')}</span>
                </p>
              )}
            </div>
            {/* ✅ ENHANCED: Category Dropdown with Auto-ID Trigger */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('contentManagement.forms.bookCategory')}
              </label>
              {bookForm.category && !editingBook ? (
                // ✅ Nếu đã có category (chỉ khi thêm mới), hiển thị readonly
                <div className="space-y-2">
                  <div className="px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-blue-300 bg-blue-50 rounded-lg text-sm sm:text-base font-semibold text-blue-800">
                    📦 {bookForm.category}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Reset ID khi change category
                      const newId = generateBookId('');
                      setBookForm({ ...bookForm, id: newId, category: '' });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('contentManagement.messages.changeSeries')}
                  </button>
                  <p className="text-xs text-blue-600 mt-1">
                    {t('contentManagement.messages.autoIdBySeries')}
                  </p>
                </div>
              ) : (
                // ✅ Nếu chưa có category, hiển thị dropdown
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={bookForm.category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        // ✅ Trigger auto-ID update khi change category (chỉ khi thêm mới)
                        if (!editingBook && newCategory) {
                          const newId = generateBookId(newCategory);
                          setBookForm({ ...bookForm, id: newId, category: newCategory });
                        } else {
                          setBookForm({ ...bookForm, category: newCategory });
                        }
                      }}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white min-h-[44px] sm:min-h-0"
                      required
                    >
                      <option value="">-- {t('contentManagement.forms.selectSeriesPlaceholder')} --</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setSeriesForm({ id: '', name: '', description: '' });
                        setEditingSeries(null);
                        setShowSeriesForm(true);
                      }}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center justify-center"
                      title={t('contentManagement.forms.createNewSeries')}
                    >
                      ➕ {t('contentManagement.messages.new')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('contentManagement.forms.selectSeries')}
                  </p>
                </div>
              )}
                </div>
                {/* ✅ ENHANCED: Title Field with Realtime Duplicate Check */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contentManagement.forms.bookName')}
                  </label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => {
                      setBookForm({ ...bookForm, title: e.target.value });
                      // ✅ Realtime validation
                      validateBookTitle(e.target.value);
                    }}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-colors ${
                      bookFormValidation.titleExists
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder={t('contentManagement.forms.bookNamePlaceholder')}
                  />
                  {bookFormValidation.titleExists && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                      <span>⚠️</span>
                      <span>{t('contentManagement.alerts.bookNameExistsSuggestion')}</span>
                    </p>
                  )}
                  {!bookFormValidation.titleExists && bookForm.title && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✅</span>
                      <span>{t('contentManagement.messages.validBookName')}</span>
                    </p>
                  )}
                </div>
                
                {/* ✅ ENHANCED: Preview existing books with Search & Copy */}
                <div className="sm:col-span-2">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <span>📚</span>
                        <span>{t('contentManagement.forms.booksInLevel')} {selectedLevel.toUpperCase()}</span>
                      </h4>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {books.filter(b => !bookForm.category || b.category === bookForm.category).length} {t('contentManagement.messages.books')}
                      </span>
                    </div>
                    
                    {/* ✅ Search Bar */}
                    <div className="mb-3">
                      <input
                        type="text"
                        value={bookSearchQuery}
                        placeholder={t('contentManagement.forms.searchBookPlaceholder')}
                        onChange={(e) => setBookSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                    
                    {books.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2" id="booksList">
                        {(() => {
                          // ✅ Filter books theo search query và category
                          const filteredBooks = books.filter(b => {
                            const matchesSearch = !bookSearchQuery || 
                              b.id.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                              (b.title && b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()));
                            const matchesCategory = !bookForm.category || b.category === bookForm.category;
                            return matchesSearch && matchesCategory;
                          });
                          
                          // ✅ Nhóm books theo category
                          const groupedBooks = filteredBooks.reduce((acc, book) => {
                            const category = book.category || t('contentManagement.forms.noCategory');
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(book);
                            return acc;
                          }, {});
                          
                          // Sắp xếp categories
                          const sortedCategories = Object.keys(groupedBooks).sort();
                          
                          if (sortedCategories.length === 0) {
                            return (
                              <p className="text-xs text-gray-500 text-center py-4 italic">
                                {t('contentManagement.messages.noBooksFound')}
                              </p>
                            );
                          }
                          
                          return sortedCategories.map((category) => (
                            <div key={category} className="space-y-1">
                              <div className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-1 rounded flex items-center justify-between">
                                <span>📦 {category}</span>
                                <span className="text-blue-600 font-normal">({groupedBooks[category].length})</span>
                              </div>
                              {groupedBooks[category].map((book) => (
                                <div 
                                  key={book.id}
                                  className={`text-xs px-2 py-1.5 rounded ml-2 flex items-center justify-between group hover:bg-gray-50 transition-colors ${
                                    book.id === bookForm.id && !editingBook
                                      ? 'bg-red-100 text-red-800 border border-red-300'
                                      : 'bg-white text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  <span className="flex-1 truncate">
                                    <span className="font-mono font-semibold">{book.id}</span>
                                    {book.title && <span className="ml-2">- {book.title}</span>}
                                  </span>
                                  {/* ✅ Copy Buttons */}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(book.id);
                                        alert(`✅ ${t('contentManagement.forms.copiedId', { id: book.id })}`);
                                      }}
                                      className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-bold hover:bg-blue-600"
                                      title={t('contentManagement.forms.copyId')}
                                    >
                                      📋 ID
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(book.title || book.id);
                                        alert(t('contentManagement.copy.nameCopied', { name: book.title || book.id }));
                                      }}
                                      className="px-2 py-0.5 bg-green-500 text-white rounded text-[10px] font-bold hover:bg-green-600"
                                      title={t('contentManagement.forms.copyName')}
                                    >
                                      📋 {t('contentManagement.forms.copyNameLabel')}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">{t('contentManagement.empty.noBooks')}</p>
                    )}
                  </div>
                </div>
                {/* ✅ ENHANCED: Image Upload with Device Support */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🖼️ {t('contentManagement.forms.coverImage')}
                  </label>
                  
                  {/* Tab-like buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('urlTab').classList.remove('hidden')}
                      className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded bg-blue-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      🔗 {t('contentManagement.forms.enterUrl')}
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                    >
                      📤 {t('contentManagement.forms.uploadFromDevice')}
                    </button>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  
                  {/* URL Input (always visible) */}
                  <div id="urlTab" className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bookForm.imageUrl}
                        onChange={(e) => setBookForm({ ...bookForm, imageUrl: e.target.value })}
                        className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="/book_card/n1/shinkanzen/shinkanzen_n1_bunbo.jpg"
                      />
                      {bookForm.imageUrl ? (
                        <img
                          src={bookForm.imageUrl}
                          alt="Preview"
                          className="w-16 h-20 object-cover rounded border-2 border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.nextElementSibling;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-16 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center text-2xl text-gray-500 border-2 border-gray-400 ${bookForm.imageUrl ? 'hidden' : ''}`}
                        style={{ display: bookForm.imageUrl ? 'none' : 'flex' }}
                      >
                        📚
                      </div>
                    </div>
                    
                    {/* Upload Progress */}
                    {isUploadingImage && (
                      <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-black text-xs transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          {uploadProgress}%
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      💡 {t('contentManagement.forms.coverImageHint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                {/* ✅ ENHANCED: Submit Button with Loading State */}
                <button
                  type="submit"
                  disabled={isSavingBook || bookFormValidation.titleExists}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 ${
                    isSavingBook || bookFormValidation.titleExists
                      ? 'opacity-60 cursor-not-allowed hover:translate-x-0 hover:translate-y-0'
                      : ''
                  }`}
                >
                  {isSavingBook ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>{t('contentManagement.forms.saving')}</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>{editingBook ? t('contentManagement.messages.saveChanges') : t('contentManagement.forms.addBook')}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {t('contentManagement.chapter.cancel')}
                </button>
              </div>
            </form>
      </Modal>

      {/* Chapter Form Modal - Responsive */}
      <Modal 
        isOpen={showChapterForm && !!selectedBook} 
        onClose={() => setShowChapterForm(false)} 
        title={`${editingChapter ? t('contentManagement.forms.editChapter') : t('contentManagement.forms.addChapter')} - ${selectedBook?.title || 'N/A'}`}
        maxWidth="28rem"
      >
        <form onSubmit={handleSaveChapter} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contentManagement.chapter.idLabel')} {t('contentManagement.chapter.idExample')}
                </label>
                <input
                  type="text"
                  value={chapterForm.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setChapterForm({ ...chapterForm, id: newId });
                  }}
                  required
                  disabled={!!editingChapter}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    !editingChapter ? 'bg-blue-50 border-blue-300 cursor-not-allowed' : 'bg-white'
                  } ${
                    editingChapter && chapterForm.id && selectedBook?.existingChapters?.some(ch => ch.id === chapterForm.id && ch.id !== editingChapter.id)
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
                  placeholder="bai-1"
                />
                <p className="text-xs text-gray-500 mt-1">{t('contentManagement.forms.chapterIdHint')}</p>
                {chapterForm.id && selectedBook?.existingChapters?.some(ch => ch.id === chapterForm.id && (!editingChapter || ch.id !== editingChapter.id)) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{t('contentManagement.alerts.idExists')}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contentManagement.forms.chapterName')}
                </label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder={t('contentManagement.forms.chapterNamePlaceholder')}
                />
              </div>

              {/* ✅ NEW: Preview existing chapters and quizzes */}
              {selectedBook && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>📋</span>
                    <span>{t('contentManagement.messages.currentBookData', { title: selectedBook.title })}</span>
                  </h4>
                  
                  {/* Existing Chapters - Show ALL chapters with scroll */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-blue-800 mb-1.5">
                      {t('contentManagement.messages.allChaptersOfBook', { count: selectedBook.existingChapters?.length || 0 })}
                    </p>
                    {selectedBook.existingChapters && selectedBook.existingChapters.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                        {(() => {
                          // ✅ Sắp xếp chapters theo ID trước khi hiển thị
                          const sortedChapters = [...selectedBook.existingChapters].sort((a, b) => {
                            const getNumber = (id) => {
                              const match = id.match(/(\d+)/);
                              return match ? parseInt(match[1], 10) : 0;
                            };
                            const numA = getNumber(a.id);
                            const numB = getNumber(b.id);
                            if (numA !== numB) {
                              return numA - numB;
                            }
                            return a.id.localeCompare(b.id);
                          });
                          
                          return sortedChapters.map((ch, idx) => (
                            <div 
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                ch.id === chapterForm.id && !editingChapter
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-white text-gray-700 border border-gray-200'
                              }`}
                            >
                              <span className="font-mono font-semibold">{ch.id}</span>
                              {ch.title && <span className="ml-2">- {ch.title}</span>}
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">{t('contentManagement.empty.noChapters')}</p>
                    )}
                  </div>

                  {/* Existing Quizzes - Show ALL quizzes for this book */}
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1.5">
                      {t('contentManagement.messages.existingQuizzes')}
                    </p>
                    {selectedBook.existingChapters && selectedBook.existingChapters.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                        {selectedBook.existingChapters
                          .filter(ch => quizzesData && quizzesData[ch.id]) // Only show chapters with quizzes
                          .map((ch, idx) => {
                            const quiz = quizzesData[ch.id];
                            return (
                              <div 
                                key={idx}
                                className="text-xs px-2 py-1 rounded bg-green-50 text-green-800 border border-green-200"
                              >
                                <span className="font-mono font-semibold">{ch.id}</span>
                                {ch.title && <span className="ml-2">- {ch.title}</span>}
                                <span className="ml-2 font-semibold">{t('contentManagement.info.questionsCount', { count: quiz.questions?.length || 0 })}</span>
                              </div>
                            );
                          })}
                        {selectedBook.existingChapters.filter(ch => quizzesData && quizzesData[ch.id]).length === 0 && (
                          <p className="text-xs text-gray-600 italic">{t('contentManagement.empty.noQuizzesForChapters')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">{t('contentManagement.empty.noQuizzes')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  {t('contentManagement.chapter.note')} <strong>{t('contentManagement.chapter.noteSave')}</strong>
                  <br />
                  {t('contentManagement.chapter.noteAfterAdd')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {editingChapter ? t('contentManagement.messages.saveChanges') : t('contentManagement.forms.addChapter')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {t('contentManagement.chapter.cancel')}
                </button>
              </div>
            </form>
      </Modal>

      {/* ✅ NEW: Series Form Modal - Responsive */}
      <Modal 
        isOpen={showSeriesForm} 
        onClose={() => setShowSeriesForm(false)} 
        title={editingSeries ? t('contentManagement.forms.editSeries') : t('contentManagement.forms.addSeries')}
        maxWidth="28rem"
      >
        <form onSubmit={async (e) => {
              e.preventDefault();
              if (!seriesForm.name) {
                alert('⚠️ Vui lòng điền tên bộ sách!');
                return;
              }

              let updatedSeries;
              if (editingSeries) {
                // Update existing series - KHÔNG cho phép thay đổi tên
                const oldName = editingSeries.name;
                updatedSeries = series.map(s => 
                  s.id === editingSeries.id ? { 
                    ...s, // Giữ nguyên tất cả properties cũ
                    ...seriesForm, // Update với form data
                    name: oldName // ✅ FORCE giữ nguyên tên cũ
                  } : s
                );
                // Update books: change category name if series name changed
                if (oldName !== seriesForm.name) {
                  const updatedBooks = books.map(b => 
                    b.category === oldName ? { ...b, category: seriesForm.name } : b
                  );
                  await saveBooks(updatedBooks);
                }
              } else {
                // Add new series
                if (series.find(s => s.name === seriesForm.name)) {
                  alert(t('contentManagement.messages.seriesNameExists'));
                  return;
                }
                const newId = `series-${Date.now()}`;
                updatedSeries = [...series, { ...seriesForm, id: newId }];
            }
            
            await saveSeries(updatedSeries);
            setShowSeriesForm(false);
            
            alert(t('contentManagement.success.saveSuccess', {
              details: `${editingSeries ? t('contentManagement.messages.seriesUpdated') : t('contentManagement.messages.seriesAdded')}\n   - ID: ${editingSeries ? editingSeries.id : 'series-' + Date.now()}\n   - Tên: ${seriesForm.name}\n   - Mô tả: ${seriesForm.description || 'Chưa có'}`
            }));
            
            // ✅ Trigger refresh AllLevelsOverview stats
            setOverviewRefreshTrigger(prev => prev + 1);
              
            // ✅ Auto-select new series in book form if it was opened from book form
            if (!editingSeries && showBookForm && !bookForm.category) {
              setBookForm({ ...bookForm, category: seriesForm.name });
            }
          }} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contentManagement.forms.seriesName')}
                </label>
                <input
                  type="text"
                  value={seriesForm.name}
                  onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                  required
                  disabled={!!editingSeries}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm sm:text-base ${
                    seriesForm.name && series.some(s => s.name === seriesForm.name && (!editingSeries || s.id !== editingSeries.id))
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="新完全マスター"
                />
                <p className={`text-xs mt-1 ${editingSeries ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                  {editingSeries 
                    ? t('contentManagement.messages.seriesNameCannotChange') 
                    : t('contentManagement.messages.seriesNameCannotChangeHint')}
                </p>
                {seriesForm.name && series.some(s => s.name === seriesForm.name && (!editingSeries || s.id !== editingSeries.id)) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{t('contentManagement.messages.seriesNameExistsChooseOther')}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contentManagement.forms.seriesDescription')}
                </label>
                <textarea
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-y"
                  placeholder={t('contentManagement.forms.seriesDescriptionPlaceholder')}
                />
              </div>
              
              {/* ✅ NEW: Preview existing series - Show ALL series with scroll */}
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>📦</span>
                    <span>{t('contentManagement.messages.allSeriesInLevel', { level: selectedLevel.toUpperCase(), count: series.length })}</span>
                  </h4>
                  {series.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                      {series.map((s) => (
                        <div 
                          key={s.id}
                          className={`text-xs px-2 py-1 rounded ${
                            s.name === seriesForm.name && !editingSeries
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          <span className="font-semibold">{s.name}</span>
                          {s.description && <span className="ml-2 text-gray-600">- {s.description}</span>}
                          <span className="ml-2 text-blue-600">
                            ({books.filter(b => b.category === s.name).length} {t('contentManagement.messages.books')})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 italic">{t('contentManagement.empty.noSeries')}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {editingSeries ? t('contentManagement.messages.saveChanges') : t('contentManagement.messages.addSeries')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSeriesForm(false)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
                >
                  {t('contentManagement.chapter.cancel')}
                </button>
              </div>
            </form>
      </Modal>

      {/* ✅ SRS INTEGRATION: Enhanced Lesson Modal */}
      <EnhancedLessonModal
        isOpen={showLessonForm && !!selectedBook && !!selectedChapter}
        onClose={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
        }}
        onSave={handleSaveLesson}
        initialLesson={editingLesson}
        chapterInfo={{
          levelId: selectedLevel,
          title: selectedChapter?.title,
          bookTitle: selectedBook?.title,
          bookId: selectedBook?.id,
          chapterId: selectedChapter?.id,
          existingLessons: selectedChapter?.existingLessons || []
        }}
      />

      {/* ✅ NEW: Quiz Form Modal */}
      <Modal 
        isOpen={showQuizForm && !!selectedBook && !!selectedChapter && !!selectedLesson} 
        onClose={() => setShowQuizForm(false)} 
        title={`${editingQuiz ? t('contentManagement.forms.editQuiz') : t('contentManagement.forms.addQuiz')} - ${selectedLesson?.title || 'N/A'}`}
        maxWidth="56rem"
      >
        <form onSubmit={handleSaveQuiz} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contentManagement.forms.quizTitle')}
            </label>
            <input
              type="text"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder={t('contentManagement.forms.lessonNamePlaceholder')}
            />
          </div>

          {/* ✅ NEW: Existing Questions Display */}
          {quizForm.questions && quizForm.questions.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                <span>{t('contentManagement.forms.questionsList', { count: quizForm.questions.length })}</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {quizForm.questions.map((q, idx) => {
                  const isDuplicate = checkDuplicateQuestion(q.text, idx);
                  return (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded-lg border-2 text-sm ${
                        isDuplicate 
                          ? 'bg-red-100 border-red-400' 
                          : q.text 
                            ? 'bg-white border-blue-200' 
                            : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-800 min-w-[3rem]">{t('contentManagement.forms.questionLabel')} {idx + 1}:</span>
                        <div className="flex-1">
                          <p className={`${q.text ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                            {q.text || t('contentManagement.forms.notEntered')}
                          </p>
                          {q.audioUrl && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-purple-700">
                              <span>🎧</span>
                              <span>{t('contentManagement.forms.hasAudioFile')}</span>
                            </div>
                          )}
                          {isDuplicate && (
                            <p className="text-xs text-red-600 mt-1 font-semibold">
                              {t('contentManagement.forms.duplicateWarning')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-blue-600 mt-3">
                {t('contentManagement.forms.checkDuplicates')}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('contentManagement.forms.questionLabel')} ({quizForm.questions?.length || 0})
              </label>
              <button
                type="button"
                onClick={() => {
                  const newId = quizForm.questions && quizForm.questions.length > 0 
                    ? Math.max(...quizForm.questions.map(q => q.id), 0) + 1
                    : 1;
                  setQuizForm({
                    ...quizForm,
                    questions: [
                      ...(quizForm.questions || []),
                      {
                        id: newId,
                        text: '',
                        audioUrl: '', // ✅ NEW: Audio support
                        options: [
                          { label: 'A', text: '' },
                          { label: 'B', text: '' },
                          { label: 'C', text: '' },
                          { label: 'D', text: '' }
                        ],
                        correct: 'A',
                        explanation: ''
                      }
                    ]
                  });
                }}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                {t('contentManagement.forms.addQuestion')}
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {quizForm.questions && Array.isArray(quizForm.questions) && quizForm.questions.map((question, qIdx) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{t('contentManagement.forms.questionsCount', { count: qIdx + 1 })}</h4>
                    {quizForm.questions && quizForm.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizForm({
                            ...quizForm,
                            questions: quizForm.questions.filter((_, idx) => idx !== qIdx)
                          });
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        🗑️ {t('contentManagement.forms.delete')}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contentManagement.forms.question')}
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[qIdx].text = e.target.value;
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                        required
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
                          checkDuplicateQuestion(question.text, qIdx)
                            ? 'border-red-500 bg-red-50 focus:ring-red-300'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder={t('contentManagement.forms.questionPlaceholder')}
                      />
                      {/* ✅ Duplicate Warning */}
                      {checkDuplicateQuestion(question.text, qIdx) && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-pulse">
                          <span>⚠️</span>
                          <span>{t('contentManagement.alerts.questionExists')}</span>
                        </p>
                      )}
                    </div>

                    {/* ✅ NEW: Audio Upload for Listening Questions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎧 {t('contentManagement.forms.audioFile')}
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={question.audioUrl || ''}
                          onChange={(e) => {
                            const newQuestions = [...quizForm.questions];
                            newQuestions[qIdx].audioUrl = e.target.value;
                            setQuizForm({ ...quizForm, questions: newQuestions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder={t('contentManagement.forms.audioUrlPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!audioInputRefs.current[qIdx]) {
                              audioInputRefs.current[qIdx] = document.createElement('input');
                              audioInputRefs.current[qIdx].type = 'file';
                              audioInputRefs.current[qIdx].accept = 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4';
                              audioInputRefs.current[qIdx].onchange = (e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAudioUpload(file, qIdx);
                              };
                            }
                            audioInputRefs.current[qIdx].click();
                          }}
                          disabled={isUploadingAudio && uploadingAudioIndex === qIdx}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all"
                        >
                          {isUploadingAudio && uploadingAudioIndex === qIdx ? '⏳' : '📤'}
                        </button>
                      </div>
                      {question.audioUrl && (
                        <div className="mt-2">
                          <audio controls className="w-full h-8">
                            <source src={question.audioUrl} />
                            {t('contentManagement.forms.browserNotSupportAudio')}
                          </audio>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('contentManagement.forms.audioUrlHint')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contentManagement.forms.answerPlaceholder', { label: 'A' })}
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => (
                          <div key={option.label} className="flex items-center gap-2">
                            <span className="w-8 text-sm font-semibold text-gray-700">{option.label}:</span>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => {
                                const newQuestions = [...quizForm.questions];
                                newQuestions[qIdx].options[optIdx].text = e.target.value;
                                setQuizForm({ ...quizForm, questions: newQuestions });
                              }}
                              required
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder={t('contentManagement.forms.answerPlaceholder', { label: option.label })}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = [...quizForm.questions];
                                newQuestions[qIdx].correct = option.label;
                                setQuizForm({ ...quizForm, questions: newQuestions });
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                question.correct === option.label
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {question.correct === option.label ? t('contentManagement.forms.correct') : t('contentManagement.forms.select')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contentManagement.forms.explanation')}
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[qIdx].explanation = e.target.value;
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder={t('contentManagement.forms.explanationPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ NEW: Smart Suggestion - Switch to Quiz Editor */}
          {quizForm.questions && quizForm.questions.length >= 3 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900 mb-1">
                    {t('contentManagement.forms.quizHasQuestions', { count: quizForm.questions.length })}
                  </p>
                  <p className="text-xs text-purple-700 mb-3">
                    {t('contentManagement.forms.quizEditorComplex')}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      // Save draft first (if valid)
                      if (quizForm.title && selectedBook && selectedChapter && selectedLesson) {
                        try {
                          const userId = user?.id && typeof user.id === 'string' && user.id.length > 20 ? user.id : null;
                          await storageManager.saveQuiz(
                            selectedBook.id,
                            selectedChapter.id,
                            selectedLesson.id,
                            {
                              title: quizForm.title,
                              questions: quizForm.questions || [],
                              bookId: selectedBook.id,
                              chapterId: selectedChapter.id,
                              lessonId: selectedLesson.id
                            },
                            selectedLevel,
                            userId
                          );
                        } catch (error) {
                          console.error('Error saving draft:', error);
                        }
                      }
                      
                      // Navigate to Quiz Editor with context
                      const params = new URLSearchParams({
                        level: selectedLevel,
                        book: selectedBook.id,
                        chapter: selectedChapter.id,
                        lesson: selectedLesson?.id || ''
                      });
                      if (selectedBook.category) {
                        params.set('series', selectedBook.category);
                      }
                      navigate(`/admin/quiz-editor?${params.toString()}`);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold text-sm transition-all"
                  >
                    {t('contentManagement.forms.switchToQuizEditor')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Link to Quiz Editor (Always available) */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-900">
                  {t('contentManagement.forms.needMoreQuestions')}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {t('contentManagement.forms.quizEditorSupport')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams({
                    level: selectedLevel,
                    book: selectedBook.id,
                    chapter: selectedChapter.id,
                    lesson: selectedLesson?.id || ''
                  });
                  if (selectedBook.category) {
                    params.set('series', selectedBook.category);
                  }
                  navigate(`/admin/quiz-editor?${params.toString()}`);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs whitespace-nowrap"
              >
                📝 {t('contentManagement.forms.openQuizEditor')}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="submit"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              {editingQuiz ? t('contentManagement.messages.saveChanges') : t('contentManagement.forms.addQuiz')}
            </button>
            <button
              type="button"
              onClick={() => setShowQuizForm(false)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
        </div>
      </div>
    </div>
  );
}

// ✅ REMOVED: AllLevelsOverview và HierarchyView đã được tách ra thành components riêng
// Xem: src/components/admin/content/AllLevelsOverview.jsx
// Xem: src/components/admin/content/HierarchyView.jsx

export default ContentManagementPage;

