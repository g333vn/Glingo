// src/pages/admin/QuizEditorPage.jsx
// Tool nhập liệu quiz - Dễ dàng tạo quiz mới và export ra JSON
// ⚠️ PROTECTED: Chỉ admin mới có thể truy cập (bảo vệ bằng ProtectedRoute)

import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { n1BooksMetadata } from '../../data/level/n1/books-metadata.js';
import { n1Books } from '../../data/level/n1/books.js';
// TODO: Import các level khác khi có data
// import { n2BooksMetadata } from '../../data/level/n2/books-metadata.js';
// import { n2Books } from '../../data/level/n2/books.js';
// 🔒 SECURITY: Import error handler
import { getErrorMessage } from '../../utils/uiErrorHandler.js';

function QuizEditorPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // ✅ NEW: Location selection states
  const [selectedLevel, setSelectedLevel] = useState('n1');
  const [selectedSeries, setSelectedSeries] = useState(''); // ✅ NEW: Series (Bộ sách)
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
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
  ]);

  const [exportedJSON, setExportedJSON] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [showImportTemplate, setShowImportTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For quiz preview
  const [showQuestionPreview, setShowQuestionPreview] = useState({}); // Per question preview
  const [isImporting, setIsImporting] = useState(false); // ✅ NEW: Flag to prevent auto-reload during import
  const [justImported, setJustImported] = useState(false); // ✅ NEW: Flag to prevent loading old quiz after import
  const importInputRef = React.useRef(null);
  const importedMetadataRef = React.useRef(null); // ✅ Store imported metadata to compare with current selection

  // ✅ DEBUG: Watch questions changes
  useEffect(() => {
    console.log('🔍 [Questions State Changed]', {
      count: questions.length,
      firstQuestionText: questions[0]?.text?.substring(0, 50),
      isImporting,
      justImported
    });
  }, [questions, isImporting, justImported]);
  
  // ✅ NEW: Lưu directory handle để tự động lưu vào đúng thư mục
  const [savedDirectoryHandle, setSavedDirectoryHandle] = useState(null);
  
  // ✅ NEW: Audio upload states
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadingAudioIndex, setUploadingAudioIndex] = useState(-1);
  const audioInputRefs = React.useRef({});
  
  // ✅ NEW: Image upload and textarea enhancement states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(-1);
  const [uploadingImageField, setUploadingImageField] = useState(''); // 'text' or 'explanation'
  const imageInputRefs = React.useRef({});
  const textareaRefs = React.useRef({});
  const explanationTextareaRefs = React.useRef({});

  // ✅ UPDATED: Get books by level (check IndexedDB/localStorage first, fallback to default)
  const getBooksByLevel = async (levelId) => {
    // ✅ Load from IndexedDB/localStorage first (via storageManager)
    const savedBooks = await storageManager.getBooks(levelId);
    if (savedBooks && savedBooks.length > 0) {
      return savedBooks;
    }
    
    // Fallback to default data
    switch(levelId) {
      case 'n1': return n1BooksMetadata;
      // TODO: Thêm các level khác
      // case 'n2': return n2BooksMetadata;
      // case 'n3': return n3BooksMetadata;
      // case 'n4': return n4BooksMetadata;
      // case 'n5': return n5BooksMetadata;
      default: return [];
    }
  };

  // ✅ NEW: Get book data by level and bookId
  const getBookData = (levelId, bookId) => {
    switch(levelId) {
      case 'n1': return n1Books[bookId];
      // TODO: Thêm các level khác
      default: return null;
    }
  };

  // ✅ NEW: Available series for selected level
  const [availableSeries, setAvailableSeries] = useState([]);
  
  useEffect(() => {
    const loadSeries = async () => {
      if (!selectedLevel) {
        setAvailableSeries([]);
        return;
      }
      
      // Load from storage first
      const savedSeries = await storageManager.getSeries(selectedLevel);
      if (savedSeries && savedSeries.length > 0) {
        setAvailableSeries(savedSeries);
      } else {
        // Fallback: Extract unique categories from books
        const books = await getBooksByLevel(selectedLevel);
        const uniqueCategories = [...new Set(books.map(book => book.category).filter(Boolean))];
        const defaultSeries = uniqueCategories.map((cat, index) => ({
          id: `series-${index + 1}`,
          name: cat,
          description: `Series: ${cat}`
        }));
        setAvailableSeries(defaultSeries);
      }
    };
    loadSeries();
  }, [selectedLevel]);

  // ✅ UPDATED: Available books for selected level and series (async load)
  const [availableBooks, setAvailableBooks] = useState([]);
  
  useEffect(() => {
    const loadBooks = async () => {
      const books = await getBooksByLevel(selectedLevel);
      let enrichedBooks = books || [];

      // ✅ Đồng bộ category dựa trên seriesId nếu thiếu
      if (Array.isArray(enrichedBooks) && enrichedBooks.length > 0 && availableSeries.length > 0) {
        const seriesMap = {};
        availableSeries.forEach(s => {
          if (s && s.id) {
            seriesMap[s.id] = s.name || s.id;
          }
        });

        enrichedBooks = enrichedBooks.map(book => {
          if (book.category && book.category.length > 0) return book;
          const seriesName = book.seriesId ? seriesMap[book.seriesId] : null;
          return {
            ...book,
            category: seriesName || book.category || null
          };
        });
      }

      // Filter by series if selected
      let filteredBooks = enrichedBooks;
      if (selectedSeries && availableSeries.length > 0) {
        const series = availableSeries.find(s => s.id === selectedSeries || s.name === selectedSeries);
        if (series) {
          filteredBooks = enrichedBooks.filter(book => book.category === series.name);
        }
      }

      setAvailableBooks(filteredBooks);
    };
    loadBooks();
  }, [selectedLevel, selectedSeries, availableSeries]);

  // ✅ FIXED: Available chapters for selected book (load from storage first)
  const [availableChapters, setAvailableChapters] = useState([]);
  
  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedBook || !selectedLevel) {
        setAvailableChapters([]);
        return;
      }
      
      // ✅ Load from storage first (prioritize storage over static data)
      let chapters = await storageManager.getChapters(selectedBook, selectedLevel);
      
      // If no chapters in storage, try to get from static data
      if (!chapters || chapters.length === 0) {
        const bookData = getBookData(selectedLevel, selectedBook);
        chapters = bookData?.contents || [];
      }
      
      setAvailableChapters(chapters);
    };
    
    loadChapters();
  }, [selectedBook, selectedLevel]);

  // ✅ NEW: Available lessons for selected chapter
  const [availableLessons, setAvailableLessons] = useState([]);
  
  useEffect(() => {
    const loadLessons = async () => {
      if (!selectedBook || !selectedChapter) {
        setAvailableLessons([]);
        return;
      }
      
      // ✅ Load from storage first
      let lessons = await storageManager.getLessons(selectedBook, selectedChapter, selectedLevel);
      
      // If no lessons in storage, use chapters as lessons (backward compatibility)
      if (!lessons || lessons.length === 0) {
        // Fallback: use chapter itself as a lesson
        lessons = [{ id: selectedChapter, title: `Bài ${selectedChapter}` }];
      }
      
      setAvailableLessons(lessons);
    };
    
    loadLessons();
  }, [selectedBook, selectedChapter, selectedLevel]);

  // ✅ NEW: Reset series, book, chapter, and lesson when level changes
  useEffect(() => {
    // ✅ CRITICAL: NEVER reset if justImported - imported data is sacred
    if (isImporting || justImported) {
      console.log('🛑 [useEffect Level] BLOCKED by protection flags', { isImporting, justImported });
      return;
    }
    
    console.log('🔄 [useEffect Level] User changed level manually, resetting location');
    setSelectedSeries('');
    setSelectedBook('');
    setSelectedChapter('');
    setSelectedLesson('');
  }, [selectedLevel, isImporting, justImported]);

  // ✅ NEW: Reset book, chapter, and lesson when series changes
  useEffect(() => {
    // ✅ CRITICAL: NEVER reset if justImported - imported data is sacred
    if (isImporting || justImported) {
      console.log('🛑 [useEffect Series] BLOCKED by protection flags', { isImporting, justImported });
      return;
    }
    
    console.log('🔄 [useEffect Series] User changed series manually, resetting location');
    setSelectedBook('');
    setSelectedChapter('');
    setSelectedLesson('');
  }, [selectedSeries, isImporting, justImported]);

  // ✅ NEW: Reset chapter and lesson when book changes
  useEffect(() => {
    // ✅ CRITICAL: NEVER reset if justImported - imported data is sacred
    if (isImporting || justImported) {
      console.log('🛑 [useEffect Book] BLOCKED by protection flags', { isImporting, justImported });
      return;
    }
    
    console.log('🔄 [useEffect Book] User changed book manually, resetting location');
    setSelectedChapter('');
    setSelectedLesson('');
  }, [selectedBook, isImporting, justImported]);

  // ✅ NEW: Reset lesson when chapter changes
  useEffect(() => {
    // ✅ CRITICAL: NEVER reset if justImported - imported data is sacred
    if (isImporting || justImported) {
      console.log('🛑 [useEffect Chapter] BLOCKED by protection flags', { isImporting, justImported });
      return;
    }
    
    console.log('🔄 [useEffect Chapter] User changed chapter manually, resetting lesson');
    setSelectedLesson('');
  }, [selectedChapter, isImporting, justImported]);

  // ✅ NEW: Track loaded quiz and prevent redundant fetches
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [loadedQuizKey, setLoadedQuizKey] = useState('');

  useEffect(() => {
    const loadExistingQuiz = async () => {
      console.log('🔄 [useEffect loadExistingQuiz] Triggered', {
        selectedBook,
        selectedChapter,
        selectedLesson,
        isImporting,
        justImported,
        isUploadingAudio,
        currentQuestionsCount: questions.length
      });
      
      // ✅ CRITICAL: Check import flags FIRST before any other logic
      // This prevents questions from being reset during import
      if (isImporting) {
        console.log('🛑 JSON import in progress, skipping quiz reload to preserve imported data');
        return;
      }
      
      if (isUploadingAudio) {
        console.log('🛑 Audio upload in progress, skipping quiz reload');
        return;
      }
      
      // ✅ Track current selection to prevent unnecessary reloads
      const currentKey = `${selectedBook}_${selectedChapter}_${selectedLesson}`;
      
      // ✅ NEW: Only prevent reload if we just imported AND location matches
      // If user selected a different location, we MUST load the quiz for that location
      if (justImported && currentKey === loadedQuizKey && loadedQuizKey !== '') {
        console.log('✅ Just imported JSON for this location, skipping reload to keep imported data');
        console.log(`  - Questions count: ${questions.length}`);
        console.log(`  - Location key: ${currentKey}`);
        return;
      }
      
      // ⚠️ IMPORTANT: Only skip if same selection AND not uploading audio
      // This allows manual refresh to work
      if (currentKey === loadedQuizKey && !isLoadingQuiz && !isUploadingAudio) {
        console.log('✅ Quiz already loaded for this selection, skipping reload');
        console.log(`  - Current questions: ${questions.length}`);
        return;
      }
      
      console.log(`🔄 Loading quiz for: ${currentKey}`);
      
      if (!selectedBook || (!selectedChapter && !selectedLesson)) {
        // ✅ CRITICAL: If just imported, keep the imported questions even if location is not set
        // This allows importing JSON without metadata and selecting location later
        if (justImported) {
          console.log('🛑 [PROTECTION] No location but justImported=true; KEEPING imported questions');
          console.log(`  - Questions count: ${questions.length}`);
          console.log(`  - First question: ${questions[0]?.text?.substring(0, 50)}`);
          return; // Keep questions, don't reset
        }
        
        // ✅ ADDITIONAL CHECK: If questions have actual content, don't reset
        if (questions.length > 1 || (questions.length === 1 && questions[0].text !== '')) {
          console.log('🛑 [PROTECTION] No location but questions have content; KEEPING questions');
          console.log(`  - Questions count: ${questions.length}`);
          return; // Keep questions, don't reset
        }
        
        setExistingQuiz(null);
        setLoadedQuizKey('');
        console.log('🔄 No location and no content, can reset to empty safely');
        setQuestions([{
          id: 1,
          text: '',
          audioUrl: '',
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' }
          ],
          correct: 'A',
          explanation: ''
        }]);
        return;
      }
      
      // ✅ IMPORTANT: If location changed, clear flags to allow loading new quiz
      if (currentKey !== loadedQuizKey && loadedQuizKey !== '') {
        console.log('🔄 Location changed, clearing import flags and loadedQuizKey');
        console.log(`  - Old key: ${loadedQuizKey}`);
        console.log(`  - New key: ${currentKey}`);
        setJustImported(false);
        setLoadedQuizKey(''); // Clear to force reload for new location
        // Continue to load quiz for new location
      }

      setIsLoadingQuiz(true);
      try {
        const finalLessonId = selectedLesson || selectedChapter;
        const quiz = await storageManager.getQuiz(selectedBook, selectedChapter, finalLessonId, selectedLevel);
        
        if (quiz) {
          setExistingQuiz(quiz);
          setQuizTitle(quiz.title || '');
          
          if (quiz.questions && quiz.questions.length > 0) {
            const convertedQuestions = quiz.questions.map(q => ({
              id: q.id,
              text: q.question || q.text || '',
              audioUrl: q.audioUrl || '',
              audioPath: q.audioPath || '',
              audioName: q.audioName || '',
              options: q.options || [
                { label: 'A', text: '' },
                { label: 'B', text: '' },
                { label: 'C', text: '' },
                { label: 'D', text: '' }
              ],
              correct: q.correctAnswer || q.correct || 'A', // ✅ Fix: correctAnswer first
              explanation: q.explanation || ''
            }));
            console.log(`📥 Loaded ${convertedQuestions.length} questions from database`);
            setQuestions(convertedQuestions);
          } else {
            console.log('📥 Quiz found but no questions, resetting to empty');
            setQuestions([{
              id: 1,
              text: '',
              audioUrl: '',
              options: [
                { label: 'A', text: '' },
                { label: 'B', text: '' },
                { label: 'C', text: '' },
                { label: 'D', text: '' }
              ],
              correct: 'A',
              explanation: ''
            }]);
          }
          
          // ✅ Mark this location as loaded
          setLoadedQuizKey(currentKey);
          console.log(`✅ [LoadQuiz] Set loadedQuizKey: ${currentKey}`);
        } else {
          setExistingQuiz(null);
          // ✅ IMPORTANT: If location changed or no quiz found, ALWAYS reset questions
          // Only keep questions if we just imported for THIS exact location
          const shouldKeepQuestions = justImported && currentKey === loadedQuizKey && loadedQuizKey !== '';
          
          if (!shouldKeepQuestions) {
            console.log('🔄 [LoadQuiz] No quiz found, resetting questions to empty');
            setQuestions([{
              id: 1,
              text: '',
              audioUrl: '',
              options: [
                { label: 'A', text: '' },
                { label: 'B', text: '' },
                { label: 'C', text: '' },
                { label: 'D', text: '' }
              ],
              correct: 'A',
              explanation: ''
            }]);
          } else {
            console.log('✅ [LoadQuiz] Just imported for this location, keeping imported questions:', questions.length);
          }
          
          // ✅ Mark this location as loaded (even if no quiz found)
          setLoadedQuizKey(currentKey);
          console.log(`✅ [LoadQuiz] Set loadedQuizKey (no quiz found): ${currentKey}`);
        }
      } catch (error) {
        console.error('Error loading existing quiz:', error);
        setExistingQuiz(null);
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    loadExistingQuiz();
  }, [selectedBook, selectedChapter, selectedLesson, isUploadingAudio, isImporting, justImported]);

  // ✅ NEW: Auto-fill quiz title from lesson or chapter (only if no existing quiz)
  useEffect(() => {
    if (existingQuiz) return; // Don't auto-fill if quiz exists
    
    if (selectedLesson && availableLessons.length > 0 && !quizTitle) {
      const lesson = availableLessons.find(l => l.id === selectedLesson);
      if (lesson?.title) {
        setQuizTitle(lesson.title);
      }
    } else if (selectedChapter && availableChapters.length > 0 && !quizTitle) {
      const chapter = availableChapters.find(ch => ch.id === selectedChapter);
      if (chapter?.title) {
        setQuizTitle(chapter.title);
      }
    }
  }, [selectedLesson, selectedChapter, availableLessons, availableChapters, quizTitle, existingQuiz]);

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text' || field === 'correct' || field === 'explanation') {
      newQuestions[index][field] = value;
    } else if (field.startsWith('option-')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex].text = value;
    }
    setQuestions(newQuestions);
  };

  // ✅ UPDATED: Add new question with auto-increment ID (avoid duplicates)
  const addQuestion = () => {
    // Find the highest question ID
    const maxId = questions.length > 0 
      ? Math.max(...questions.map(q => q.id || 0))
      : 0;
    
    // New question ID is maxId + 1 (not questions.length + 1)
    const newQuestion = {
      id: maxId + 1,
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
    };
    setQuestions([...questions, newQuestion]);
  };

  // ✅ NEW: Audio upload handler (Supabase Storage)
  const handleAudioUpload = async (file, questionIndex) => {
    if (!file) return;
    
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Chỉ hỗ trợ audio: MP3, WAV, OGG, M4A');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`❌ File quá lớn!\n\nKích thước: ${(file.size / 1024 / 1024).toFixed(2)}MB\nGiới hạn: 10MB`);
      return;
    }
    
    setIsUploadingAudio(true);
    setUploadingAudioIndex(questionIndex);
    
    try {
      const { uploadAudio, generateFilePath } = await import('../../services/fileUploadService.js');
      
      // 📁 Đường dẫn có ngữ nghĩa: level / book / chapter / lesson / question
      const safeLevel = selectedLevel || 'unknown-level';
      const safeBook = selectedBook || 'unknown-book';
      const safeChapter = selectedChapter || 'unknown-chapter';
      const safeLesson = selectedLesson || 'unknown-lesson';
      const safeQuestion = questionIndex != null ? `question-${questionIndex + 1}` : 'question-unknown';
      const prefix = `level-${safeLevel}/book-${safeBook}/chapter-${safeChapter}/lesson-${safeLesson}/${safeQuestion}`;
      const path = generateFilePath(prefix, file.name);
      
      const result = await uploadAudio(file, path);
      
      if (!result.success) {
        console.error('[QuizEditor] ❌ Error uploading audio to Supabase:', result.error);
        alert(t('quizEditor.validation.audioUploadError'));
      } else {
        console.log('[QuizEditor] ✅ Audio uploaded to Supabase:', result.url);
        
        const newQuestions = [...questions];
        newQuestions[questionIndex].audioUrl = result.url;   // URL public trên Supabase
        newQuestions[questionIndex].audioPath = path;        // Đường dẫn trong bucket
        newQuestions[questionIndex].audioName = file.name;   // Tên file gốc
        setQuestions(newQuestions);
        
        alert(`✅ Upload audio thành công!\n\nFile: ${file.name}`);
      }
    } catch (error) {
      console.error('[QuizEditor] ❌ Unexpected error during audio upload:', error);
      alert(t('quizEditor.validation.audioUploadError'));
    } finally {
      setIsUploadingAudio(false);
      setUploadingAudioIndex(-1);
    }
  };

  // ✅ NEW: Image upload handler (Supabase Storage + Insert into textarea)
  const handleImageUpload = async (file, questionIndex, field = 'text') => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Chỉ hỗ trợ ảnh: JPEG, PNG, WEBP, GIF');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`❌ Ảnh quá lớn!\n\nKích thước: ${(file.size / 1024 / 1024).toFixed(2)}MB\nGiới hạn: 5MB`);
      return;
    }
    
    setIsUploadingImage(true);
    setUploadingImageIndex(questionIndex);
    setUploadingImageField(field);
    
    try {
      const { uploadImage, generateFilePath } = await import('../../services/fileUploadService.js');
      
      // 📁 Đường dẫn có ngữ nghĩa: level / book / chapter / lesson / question
      const safeLevel = selectedLevel || 'unknown-level';
      const safeBook = selectedBook || 'unknown-book';
      const safeChapter = selectedChapter || 'unknown-chapter';
      const safeLesson = selectedLesson || 'unknown-lesson';
      const safeQuestion = questionIndex != null ? `question-${questionIndex + 1}` : 'question-unknown';
      const prefix = `level-${safeLevel}/book-${safeBook}/chapter-${safeChapter}/lesson-${safeLesson}/${safeQuestion}`;
      const path = generateFilePath(prefix, file.name);
      
      const result = await uploadImage(file, path);
      
      if (!result.success) {
        console.error('[QuizEditor] ❌ Error uploading image to Supabase:', result.error);
        alert('❌ Lỗi upload ảnh!');
      } else {
        console.log('[QuizEditor] ✅ Image uploaded to Supabase:', result.url);
        
        // Insert <img> tag vào textarea tại vị trí cursor
        const textarea = field === 'explanation' 
          ? explanationTextareaRefs.current[questionIndex]
          : textareaRefs.current[questionIndex];
          
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = field === 'explanation'
            ? questions[questionIndex].explanation || ''
            : questions[questionIndex].text || '';
          
          const imgTag = `<img src="${result.url}" alt="${field === 'explanation' ? 'Explanation image' : 'Question image'}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          
          const newValue = 
            currentValue.substring(0, start) + 
            imgTag + 
            currentValue.substring(end);
          
          const newQuestions = [...questions];
          if (field === 'explanation') {
            newQuestions[questionIndex].explanation = newValue;
          } else {
            newQuestions[questionIndex].text = newValue;
          }
          setQuestions(newQuestions);
          
          // Restore cursor position
          setTimeout(() => {
            textarea.focus();
            const newPos = start + imgTag.length;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
        
        alert(`✅ Upload ảnh thành công!\n\nFile: ${file.name}`);
      }
    } catch (error) {
      console.error('[QuizEditor] ❌ Unexpected error during image upload:', error);
      alert('❌ Lỗi upload ảnh!');
    } finally {
      setIsUploadingImage(false);
      setUploadingImageIndex(-1);
      setUploadingImageField('');
    }
  };

  // ✅ NEW: Process pasted HTML (clean up, convert formatting, furigana)
  const processPastedHTML = (html) => {
    if (!html || !html.trim()) return '';
    
    // Create temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Convert <b> to <strong>
    tempDiv.querySelectorAll('b').forEach(el => {
      const strong = document.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.replaceWith(strong);
    });
    
    // Convert <i> to <em>
    tempDiv.querySelectorAll('i').forEach(el => {
      const em = document.createElement('em');
      em.innerHTML = el.innerHTML;
      el.replaceWith(em);
    });
    
    // Convert <p> to preserve line breaks
    tempDiv.querySelectorAll('p').forEach(el => {
      if (el.textContent.trim()) {
        el.outerHTML = el.innerHTML + '<br/>';
      } else {
        el.remove();
      }
    });
    
    // Convert <div> to <br/> if it's a line break
    tempDiv.querySelectorAll('div').forEach(el => {
      if (el.textContent.trim() && !el.querySelector('p, div, h1, h2, h3, h4, h5, h6')) {
        el.outerHTML = el.innerHTML + '<br/>';
      }
    });
    
    // Remove empty tags
    tempDiv.querySelectorAll('*').forEach(el => {
      if (!el.textContent.trim() && !el.querySelector('img, br')) {
        el.remove();
      }
    });
    
    // Detect furigana pattern: 渋谷(しぶや) → <ruby>渋谷<rt>しぶや</rt></ruby>
    let processed = tempDiv.innerHTML;
    const furiganaPattern = /([\u4E00-\u9FAF]+)\(([\u3040-\u309F\u30A0-\u30FF]+)\)/g;
    processed = processed.replace(furiganaPattern, '<ruby>$1<rt>$2</rt></ruby>');
    
    return processed;
  };

  // ✅ NEW: Paste handler (detect image or text/HTML)
  const handlePaste = async (e, questionIndex, field = 'text') => {
    const items = e.clipboardData.items;
    let hasImage = false;
    
    // Check for images first
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await handleImageUpload(file, questionIndex, field);
        }
        return;
      }
    }
    
    // No image → Process text/HTML
    if (!hasImage) {
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      
      if (html && html.trim()) {
        e.preventDefault();
        
        // Process HTML: clean up, convert formatting
        const processed = processPastedHTML(html);
        
        // Insert into textarea
        const textarea = field === 'explanation'
          ? explanationTextareaRefs.current[questionIndex]
          : textareaRefs.current[questionIndex];
          
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = field === 'explanation'
            ? questions[questionIndex].explanation || ''
            : questions[questionIndex].text || '';
          
          const newValue = 
            currentValue.substring(0, start) + 
            processed + 
            currentValue.substring(end);
          
          const newQuestions = [...questions];
          if (field === 'explanation') {
            newQuestions[questionIndex].explanation = newValue;
          } else {
            newQuestions[questionIndex].text = newValue;
          }
          setQuestions(newQuestions);
          
          // Restore cursor position
          setTimeout(() => {
            textarea.focus();
            const newPos = start + processed.length;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
      }
    }
  };

  // ✅ NEW: Toolbar functions (format text)
  const insertTextAtCursor = (questionIndex, beforeText, afterText = '', field = 'text') => {
    const textarea = field === 'explanation'
      ? explanationTextareaRefs.current[questionIndex]
      : textareaRefs.current[questionIndex];
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = field === 'explanation'
      ? questions[questionIndex].explanation || ''
      : questions[questionIndex].text || '';
    const selectedText = currentValue.substring(start, end);
    
    const newValue = 
      currentValue.substring(0, start) + 
      beforeText + selectedText + afterText + 
      currentValue.substring(end);
    
    const newQuestions = [...questions];
    if (field === 'explanation') {
      newQuestions[questionIndex].explanation = newValue;
    } else {
      newQuestions[questionIndex].text = newValue;
    }
    setQuestions(newQuestions);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + beforeText.length + selectedText.length + afterText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleFormatBold = (questionIndex, field = 'text') => {
    insertTextAtCursor(questionIndex, '<strong>', '</strong>', field);
  };

  const handleFormatItalic = (questionIndex, field = 'text') => {
    insertTextAtCursor(questionIndex, '<em>', '</em>', field);
  };

  const handleInsertLineBreak = (questionIndex, field = 'text') => {
    insertTextAtCursor(questionIndex, '<br/>', '', field);
  };

  // ✅ NEW: Auto-resize textarea
  const handleTextareaResize = (questionIndex, field = 'text') => {
    const textarea = field === 'explanation'
      ? explanationTextareaRefs.current[questionIndex]
      : textareaRefs.current[questionIndex];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // ✅ NEW: Toggle preview for question
  const toggleQuestionPreview = (questionIndex, field = 'text') => {
    const key = `${questionIndex}_${field}`;
    setShowQuestionPreview(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ✅ NEW: Check duplicate questions
  const checkDuplicateQuestion = (questionText, currentIndex) => {
    if (!questionText || !questions) return false;
    
    const normalizedText = questionText.toLowerCase().trim();
    return questions.some((q, idx) => 
      idx !== currentIndex && 
      q.text && 
      q.text.toLowerCase().trim() === normalizedText
    );
  };

  // Remove question
  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      alert(t('quizEditor.validation.minQuestions'));
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    // Re-number questions
    const renumberedQuestions = newQuestions.map((q, i) => ({
      ...q,
      id: i + 1
    }));
    setQuestions(renumberedQuestions);
  };

  // ✅ UPDATED: Duplicate question with auto-increment ID and audio
  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    // Find the highest question ID
    const maxId = questions.length > 0 
      ? Math.max(...questions.map(q => q.id || 0))
      : 0;
    
    const newQuestion = {
      ...questionToDuplicate,
      id: maxId + 1,
      text: questionToDuplicate.text + ' (Copy)',
      audioUrl: questionToDuplicate.audioUrl || '', // ✅ Copy audio URL
      options: questionToDuplicate.options.map(opt => ({ ...opt }))
    };
    setQuestions([...questions, newQuestion]);
  };

  // Generate JSON
  const generateJSON = () => {
    const quizData = {
      title: quizTitle || 'Untitled Quiz',
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options.map(opt => ({
          label: opt.label,
          text: opt.text
        })),
        correct: q.correct,
        explanation: q.explanation,
        audioUrl: q.audioUrl || '', // ✅ Include audio in export
        audioPath: q.audioPath || '',
        audioName: q.audioName || ''
      }))
    };

    return JSON.stringify(quizData, null, 2);
  };

  // ✅ NEW: Normalize options to 4 choices (A-D) to fit editor structure
  const normalizeOptions = (options = []) => {
    const defaultLabels = ['A', 'B', 'C', 'D'];
    const safeOptions = Array.isArray(options) ? options : [];

    const normalized = safeOptions.map((opt, idx) => {
      const label = opt?.label || defaultLabels[idx] || `Option ${idx + 1}`;
      const text =
        typeof opt === 'string'
          ? opt
          : opt?.text || opt?.value || opt?.answer || '';
      return { label, text };
    });

    // Pad to 4 options for compatibility with the editor UI
    while (normalized.length < 4) {
      const idx = normalized.length;
      normalized.push({ label: defaultLabels[idx] || `Option ${idx + 1}`, text: '' });
    }

    // Ensure only 4 options are kept (UI supports 4)
    return normalized.slice(0, 4);
  };

  // ✅ NEW: Apply imported quiz JSON into editor state
  const applyImportedQuiz = (data, sourceName = 'JSON file') => {
    console.log('📥 [Import] Starting...', { sourceName, dataKeys: Object.keys(data || {}) });
    console.log('📥 [Import] Raw data:', JSON.stringify(data).substring(0, 500));
    
    // ✅ CRITICAL: Set importing flag FIRST before any other state changes
    // This prevents useEffect from triggering and resetting questions
    console.log('🔒 [Import] Setting isImporting = true to prevent useEffect from resetting questions');
    setIsImporting(true);
    setLoadedQuizKey(''); // Clear loaded key to allow fresh data
    setExistingQuiz(null); // Clear existing quiz to prevent conflicts
    
    if (!data) {
      console.error('❌ [Import] Data is null/undefined');
      setIsImporting(false);
      alert(t('quizEditor.actions.importEmpty', 'File JSON trống hoặc không hợp lệ.'));
      return;
    }

    // Hỗ trợ nhiều kiểu JSON:
    // - Mảng thuần: [{...}]
    // - { questions: [...] }
    // - { quiz: { questions: [...] } }
    // - { data: { questions: [...] } }
    // - { items: [...] }
    const questionsPayload = (() => {
      if (Array.isArray(data)) {
        console.log('✅ [Import] Found array format, length:', data.length);
        return data;
      }
      if (Array.isArray(data.questions)) {
        console.log('✅ [Import] Found data.questions, length:', data.questions.length);
        return data.questions;
      }
      if (Array.isArray(data.items)) {
        console.log('✅ [Import] Found data.items, length:', data.items.length);
        return data.items;
      }
      if (data.quiz && Array.isArray(data.quiz.questions)) {
        console.log('✅ [Import] Found data.quiz.questions, length:', data.quiz.questions.length);
        return data.quiz.questions;
      }
      if (data.data && Array.isArray(data.data.questions)) {
        console.log('✅ [Import] Found data.data.questions, length:', data.data.questions.length);
        return data.data.questions;
      }
      
      console.warn('⚠️ [Import] No valid questions array found. Data structure:', Object.keys(data));
      console.warn('⚠️ [Import] Sample data:', JSON.stringify(data).substring(0, 200));
      return [];
    })();

    console.log('📋 [Import] Questions payload length:', questionsPayload.length);
    if (questionsPayload.length > 0) {
      console.log('📋 [Import] First question sample:', questionsPayload[0]);
    }

    const normalizedQuestions = questionsPayload.map((q, idx) => {
      const options = normalizeOptions(q?.options || q?.answers || []);
      const defaultCorrect = options[0]?.label || 'A';
      const correctCandidate = q?.correct || q?.correctAnswer || q?.answer || q?.answersKey || defaultCorrect;
      const correct = options.some(opt => opt.label === correctCandidate) ? correctCandidate : defaultCorrect;

      // ✅ Convert \n to <br/> in explanation for proper display in textarea/HTML
      let explanation = q?.explanation || q?.explain || '';
      if (explanation && typeof explanation === 'string') {
        // Replace \n with <br/> for HTML display
        explanation = explanation.replace(/\n/g, '<br/>');
        // Also handle escaped newlines \\n
        explanation = explanation.replace(/\\n/g, '<br/>');
      }

      const normalized = {
        id: q?.id || idx + 1,
        text: q?.text || q?.question || '',
        options,
        correct,
        explanation: explanation,
        audioUrl: q?.audioUrl || '',
        audioPath: q?.audioPath || '',
        audioName: q?.audioName || ''
      };
      
      if (idx === 0) {
        console.log('📝 [Import] First normalized question:', {
          id: normalized.id,
          text: normalized.text?.substring(0, 50) + '...',
          optionsCount: normalized.options.length,
          correct: normalized.correct
        });
      }
      
      return normalized;
    });

    if (normalizedQuestions.length === 0) {
      console.error('❌ [Import] No questions after normalization. Original data:', data);
      setIsImporting(false);
      alert(t('quizEditor.actions.importNoQuestions', 'File JSON không chứa danh sách câu hỏi hợp lệ. Vui lòng kiểm tra Console (F12) để xem chi tiết.'));
      setImportStatus('');
      return;
    }

    console.log('✅ [Import] Normalized', normalizedQuestions.length, 'questions');
    console.log('📋 [Import] Sample normalized question:', normalizedQuestions[0]);
    
    // ✅ IMPORTANT: Set ALL state in correct order to prevent conflicts
    const meta = !Array.isArray(data) ? (data.metadata || data.meta || {}) : {};
    const title = !Array.isArray(data) ? (data.title || '') : '';
    
    console.log('📋 [Import] Extracted metadata:', meta);
    console.log('📋 [Import] Extracted title:', title);
    
    // ✅ Step 1: Calculate final location values FIRST (before setting any state)
    const finalLessonId = meta.lessonId || meta.chapterId || selectedLesson || selectedChapter;
    const finalBookId = meta.bookId || selectedBook;
    const finalChapterId = meta.chapterId || selectedChapter;
    const importKey = (finalBookId && finalChapterId) 
      ? `${finalBookId}_${finalChapterId}_${finalLessonId || ''}` 
      : '';
    
    console.log('📋 [Import] Final location values:', {
      finalBookId,
      finalChapterId,
      finalLessonId,
      importKey,
      hasMetadata: Object.keys(meta).length > 0
    });
    
    // ✅ Step 2: Prepare questions data BEFORE setting any state that might trigger useEffect
    const questionsToSet = normalizedQuestions.map(q => {
      // ✅ Ensure explanation has <br/> instead of \n for proper display
      let explanation = q.explanation || '';
      if (explanation && typeof explanation === 'string') {
        // Replace \n with <br/> for HTML display (if not already converted)
        if (!explanation.includes('<br/>')) {
          explanation = explanation.replace(/\n/g, '<br/>');
          explanation = explanation.replace(/\\n/g, '<br/>');
        }
      }
      
      return {
        id: q.id,
        text: q.text || '',
        audioUrl: q.audioUrl || '',
        audioPath: q.audioPath || '',
        audioName: q.audioName || '',
        options: q.options.map(opt => ({ label: opt.label, text: opt.text || '' })),
        correct: q.correct || 'A',
        explanation: explanation
      };
    });
    
    console.log('💾 [Import] Questions to set:', questionsToSet.length);
    console.log('💾 [Import] First question in array:', {
      id: questionsToSet[0]?.id,
      text: questionsToSet[0]?.text?.substring(0, 50),
      optionsCount: questionsToSet[0]?.options?.length
    });
    
    // ✅ Step 3: Set flags and loadedQuizKey FIRST to prevent any reloads
    // This must be done BEFORE setting metadata to prevent useEffect from running
    console.log('🔒 [Import] Setting protection flags BEFORE metadata');
    setJustImported(true);
    setIsImporting(true);
    setExistingQuiz(null);
    
    // ✅ Store imported metadata for comparison
    importedMetadataRef.current = {
      level: meta.level || selectedLevel,
      bookId: meta.bookId || selectedBook,
      chapterId: meta.chapterId || selectedChapter,
      lessonId: meta.lessonId || selectedLesson
    };
    console.log('💾 [Import] Stored imported metadata:', importedMetadataRef.current);
    
    // ✅ IMPORTANT: Set loadedQuizKey with final values (even if undefined) to prevent reset
    const finalImportKey = importKey || `${selectedBook || 'temp'}_${selectedChapter || 'temp'}_${selectedLesson || 'temp'}`;
    setLoadedQuizKey(finalImportKey);
    console.log('✅ [Import] Set loadedQuizKey FIRST to prevent reload:', finalImportKey);
    
    // ✅ FIXED: Step 4: Set location metadata ONLY if file has metadata
    // If file doesn't have metadata, keep current selection (don't reset)
    setTimeout(() => {
      console.log('📍 [Import] Now setting metadata (flags are active)...');
      console.log('📍 [Import] File metadata:', meta);
      console.log('📍 [Import] Current selection:', {
        level: selectedLevel,
        book: selectedBook,
        chapter: selectedChapter,
        lesson: selectedLesson
      });
      
      // ✅ FIXED: Only update if file has metadata, otherwise keep current selection
      const hasMetadata = meta && Object.keys(meta).length > 0;
      
      if (hasMetadata) {
        // File has metadata - use it
        if (meta.level) {
          console.log('📍 [Import] Setting level from file:', meta.level);
          setSelectedLevel(meta.level);
        }
        if (meta.bookId) {
          console.log('📍 [Import] Setting bookId from file:', meta.bookId);
          setSelectedBook(meta.bookId);
        }
        if (meta.chapterId) {
          console.log('📍 [Import] Setting chapterId from file:', meta.chapterId);
          setSelectedChapter(meta.chapterId);
        }
        if (meta.lessonId) {
          console.log('📍 [Import] Setting lessonId from file:', meta.lessonId);
          setSelectedLesson(meta.lessonId);
        }
        
        // Update loadedQuizKey with actual values after metadata is set
        if (importKey) {
          setTimeout(() => {
            setLoadedQuizKey(importKey);
            console.log('✅ [Import] Updated loadedQuizKey with file metadata:', importKey);
          }, 100);
        }
      } else {
        // File doesn't have metadata - keep current selection
        console.log('📍 [Import] File has no metadata - keeping current selection');
        console.log('📍 [Import] Current selection will be used:', {
          level: selectedLevel,
          book: selectedBook,
          chapter: selectedChapter,
          lesson: selectedLesson || selectedChapter
        });
        
        // Use current selection for loadedQuizKey
        const currentKey = (selectedBook && selectedChapter) 
          ? `${selectedBook}_${selectedChapter}_${selectedLesson || selectedChapter}` 
          : '';
        if (currentKey) {
          setTimeout(() => {
            setLoadedQuizKey(currentKey);
            console.log('✅ [Import] Updated loadedQuizKey with current selection:', currentKey);
          }, 100);
        }
      }
    }, 50); // Small delay to ensure flags are applied first
    
    // Set title
    console.log('📌 [Import] Setting title:', title);
    setQuizTitle(title);
    
    // ✅ Step 5: Set questions IMMEDIATELY - React will batch all state updates
    console.log('💾 [Import] Setting questions state with', questionsToSet.length, 'items');
    console.log('💾 [Import] First question text:', questionsToSet[0]?.text?.substring(0, 50));
    console.log('💾 [Import] All questions data:', JSON.stringify(questionsToSet).substring(0, 500));
    setQuestions(questionsToSet);
    
    // ✅ Verify questions were set
    setTimeout(() => {
      console.log('🔍 [Import] Verification after 100ms - checking questions state...');
    }, 100);
    
    // ✅ Step 7: Set status and preview
    setImportStatus(`${sourceName} • ${normalizedQuestions.length} câu hỏi`);
    setShowPreview(true);
    
    console.log('✅ [Import] Completed successfully!');
    alert(t('quizEditor.actions.importSuccess', `✅ Đã tải ${normalizedQuestions.length} câu hỏi vào editor!\n\nHãy kiểm tra danh sách câu hỏi bên dưới và lưu lại.`));
    
    // ✅ Step 8: Clear isImporting after short delay, but KEEP justImported FOREVER
    // justImported protects data from being reset and only clears when user manually changes location
    console.log('🔒 [Import] Keeping protection flags:');
    console.log('   - isImporting: will clear after 3 seconds (allow useEffect to settle)');
    console.log('   - justImported: will NEVER auto-clear (only cleared by user action)');
    
    // Clear isImporting after short delay to allow other features to work
    setTimeout(() => {
      console.log('🔓 [Import] Clearing isImporting flag...');
      setIsImporting(false);
      console.log('🔒 [Import] BUT justImported=true remains ACTIVE to protect data');
    }, 3000); // 3 seconds - enough for all state updates
    
    // justImported will NEVER be cleared automatically
    // It will only be cleared when user manually changes location (handled in useEffect)
  };

  // ✅ NEW: Handle upload JSON to create quizzes in bulk
  const handleImportFile = (event) => {
    const inputEl = event.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        applyImportedQuiz(parsed, file.name);
      } catch (error) {
        console.error('❌ Failed to parse JSON file', error);
        alert(t('quizEditor.actions.importInvalidJSON', 'Không đọc được file JSON. Vui lòng kiểm tra nội dung.'));
        setImportStatus('');
      } finally {
        // Reset so the same file can be re-selected
        inputEl.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleImportClick = () => {
    if (importInputRef.current) {
      importInputRef.current.value = '';
      importInputRef.current.click();
    }
  };

  // Export JSON (chỉ export, không lưu vào hệ thống)
  const handleExport = () => {
    if (!isValid()) {
      alert(t('quizEditor.validation.fillAllInfoBeforeExport'));
      return;
    }
    const json = generateJSON();
    setExportedJSON(json);
    alert(t('quizEditor.saveMessages.exportInfo', { 
      count: questions.length,
      title: quizTitle
    }));
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportedJSON || generateJSON());
    alert(t('quizEditor.validation.copySuccess'));
  };

  // ✅ NEW: Save to IndexedDB/localStorage ONLY (không export JSON)
  const handleSaveOnly = async () => {
    console.log(`💾 handleSaveOnly called`);
    console.log(`   - selectedLevel: ${selectedLevel}`);
    console.log(`   - selectedBook: ${selectedBook}`);
    console.log(`   - selectedChapter: ${selectedChapter}`);
    console.log(`   - quizTitle: ${quizTitle}`);
    console.log(`   - user object:`, user);
    console.log(`   - user.id:`, user?.id);
    console.log(`   - user type:`, typeof user?.id);
    console.log(`   - questions count: ${questions.length}`);
    
    if (!isValid()) {
      console.error('❌ Validation failed!');
      alert(t('quizEditor.validation.fillAllInfoBeforeSave'));
      return;
    }

    console.log(`✅ Validation passed, preparing quiz data...`);

    // Use lessonId if selected, otherwise use chapterId (backward compatibility)
    const finalLessonId = selectedLesson || selectedChapter;
    
    const quizData = {
      title: quizTitle,
      questions: questions.map(q => ({
        id: q.id,
        question: q.text,
        options: q.options.map(o => ({ label: o.label, text: o.text })),
        correctAnswer: q.correct,
        explanation: q.explanation,
        audioUrl: q.audioUrl || '',
        audioPath: q.audioPath || '',
        audioName: q.audioName || ''
      })),
      metadata: {
        level: selectedLevel,
        bookId: selectedBook,
        chapterId: selectedChapter,
        lessonId: finalLessonId,
        createdAt: new Date().toISOString(),
        questionCount: questions.length
      }
    };

    console.log(`📦 Quiz data prepared:`, {
      title: quizData.title,
      questionsCount: quizData.questions.length,
      bookId: quizData.metadata.bookId,
      chapterId: quizData.metadata.chapterId,
      lessonId: quizData.metadata.lessonId
    });

    // Save to Supabase + IndexedDB/localStorage
    // ✅ FIXED: Try to get userId from user object or session
    let userId = null;
    if (user && typeof user.id === 'string' && user.id.length > 20) {
      userId = user.id;
      console.log(`[QuizEditor] ✅ Got userId from user object: ${userId}`);
    } else {
      // Try to get userId from Supabase session
      try {
        const { supabase } = await import('../../services/supabaseClient.js');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          userId = session.user.id;
          console.log(`[QuizEditor] ✅ Got userId from session: ${userId}`);
        } else {
          console.warn('[QuizEditor] ⚠️ No session found');
        }
      } catch (err) {
        console.error('[QuizEditor] ❌ Error getting userId from session:', err);
      }
    }
    
    // ✅ VALIDATION: Kiểm tra selectedLevel và userId trước khi save
    console.log(`[QuizEditor] 📋 Save validation:`, {
      selectedLevel,
      userId: userId ? `${userId.substring(0, 8)}...` : 'NULL',
      selectedBook,
      selectedChapter,
      finalLessonId
    });
    
    if (!selectedLevel) {
      alert('⚠️ Vui lòng chọn Level trước khi lưu quiz!');
      console.error('[QuizEditor] ❌ selectedLevel is empty!');
      return;
    }
    
    if (!userId) {
      const confirmSave = confirm(
        '⚠️ KHÔNG TÌM THẤY USER ID!\n\n' +
        'Quiz sẽ chỉ được lưu vào thiết bị này (local storage) và KHÔNG được sync lên Supabase.\n\n' +
        'Điều này có nghĩa là:\n' +
        '- Quiz sẽ không hiển thị trên thiết bị khác\n' +
        '- Quiz sẽ không hiển thị trong trình duyệt ẩn danh\n\n' +
        'Bạn có muốn tiếp tục lưu quiz vào local storage không?\n\n' +
        '- OK: Lưu vào local storage (chỉ thiết bị này)\n' +
        '- Cancel: Hủy, đăng nhập lại và thử lại'
      );
      if (!confirmSave) {
        console.warn('[QuizEditor] ⚠️ User cancelled save - no userId');
        return;
      }
      console.warn('[QuizEditor] ⚠️ No userId available - quiz will be saved locally only, not to Supabase');
      console.warn('[QuizEditor] ⚠️ User must be logged in to sync quiz across devices');
    }

    console.log(`💾 Calling storageManager.saveQuiz(${selectedBook}, ${selectedChapter}, ${finalLessonId}, level=${selectedLevel}, userId=${userId ? userId.substring(0, 8) + '...' : 'NULL'})...`);
    const success = await storageManager.saveQuiz(
      selectedBook,
      selectedChapter,
      finalLessonId,
      quizData,
      selectedLevel,
      userId
    );
    console.log(`📦 storageManager.saveQuiz result: ${success ? 'SUCCESS' : 'FAILED'}`);
    
    if (success) {
      // Storage type is determined automatically (IndexedDB if available, localStorage otherwise)
      console.log(`✅ Quiz saved successfully!`);
      
      // ✅ NEW: Verify quiz was saved to Supabase (if userId and level provided)
      let savedToSupabase = false;
      if (selectedLevel && userId) {
        try {
          console.log(`🔍 Verifying quiz was saved to Supabase...`);
          // Wait a bit for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { contentService } = await import('../../services/contentService.js');
          const { success: verifySuccess, data: verifyData } = await contentService.getQuiz(
            selectedBook,
            selectedChapter,
            finalLessonId,
            selectedLevel
          );
          
          if (verifySuccess && verifyData) {
            savedToSupabase = true;
            console.log(`✅ VERIFIED: Quiz is now in Supabase!`);
            console.log(`   - Quiz ID: ${verifyData.id}`);
            console.log(`   - Title: ${verifyData.title}`);
            console.log(`   - Questions: ${verifyData.questions?.length || 0}`);
          } else {
            console.warn(`⚠️ Quiz may not be in Supabase yet (or verification failed)`);
            console.warn(`   - verifySuccess: ${verifySuccess}`);
            console.warn(`   - verifyData:`, verifyData);
          }
        } catch (err) {
          console.warn(`⚠️ Error verifying quiz in Supabase:`, err);
        }
      }
      
      // ✅ IMPORTANT: Reset loadedQuizKey to force reload next time
      setLoadedQuizKey('');
      console.log('🔄 Reset loadedQuizKey to allow fresh reload');
      
      const location = `${selectedLevel.toUpperCase()} / ${selectedBook} / ${selectedChapter}${selectedLesson ? ` / ${selectedLesson}` : ''}`;
      
      // ✅ NEW: Show success message with Supabase status
      if (savedToSupabase) {
        alert(
          `✅ Quiz đã được lưu thành công!\n\n` +
          `📦 Đã lưu vào:\n` +
          `   - Supabase (cloud) ✅\n` +
          `   - Local storage (thiết bị này) ✅\n\n` +
          `📍 Vị trí: ${location}\n` +
          `📝 Tiêu đề: ${quizTitle}\n` +
          `❓ Số câu hỏi: ${questions.length}\n\n` +
          `✅ Quiz sẽ hiển thị trên tất cả thiết bị và KHÔNG BỊ MẤT!`
        );
      } else if (selectedLevel && userId) {
        alert(
          `⚠️ Quiz đã được lưu vào local storage!\n\n` +
          `📦 Đã lưu vào:\n` +
          `   - Local storage (thiết bị này) ✅\n` +
          `   - Supabase (cloud) ⚠️ Chưa xác nhận\n\n` +
          `📍 Vị trí: ${location}\n` +
          `📝 Tiêu đề: ${quizTitle}\n` +
          `❓ Số câu hỏi: ${questions.length}\n\n` +
          `💡 Vui lòng kiểm tra Console để xem chi tiết.\n` +
          `Nếu có lỗi, quiz vẫn được lưu trong local storage.`
        );
      } else {
        alert(
          `⚠️ Quiz đã được lưu vào local storage!\n\n` +
          `📦 Đã lưu vào:\n` +
          `   - Local storage (thiết bị này) ✅\n` +
          `   - Supabase (cloud) ❌ Chưa lưu\n\n` +
          `📍 Vị trí: ${location}\n` +
          `📝 Tiêu đề: ${quizTitle}\n` +
          `❓ Số câu hỏi: ${questions.length}\n\n` +
          `⚠️ LƯU Ý: Quiz chỉ hiển thị trên thiết bị này.\n` +
          `Để sync lên Supabase, vui lòng đăng nhập và lưu lại.`
        );
      }
      alert(t('quizEditor.saveMessages.savedSuccess', {
        title: quizTitle,
        count: questions.length,
        location: location
      }));
      
      // ✅ Force reload quiz from database to confirm save
      setTimeout(() => {
        setLoadedQuizKey(''); // Clear to trigger reload
      }, 500);
    } else {
      console.error(`❌ Failed to save quiz!`);
      alert(t('quizEditor.validation.saveError'));
    }
  };

  // ✅ UPDATED: Save to IndexedDB AND auto-export JSON (for backward compatibility)
  const handleSaveToLocal = async () => {
    console.log(`💾 handleSaveToLocal called (Save + Export)`);
    console.log(`   - selectedLevel: ${selectedLevel}`);
    console.log(`   - selectedBook: ${selectedBook}`);
    console.log(`   - selectedChapter: ${selectedChapter}`);
    console.log(`   - quizTitle: ${quizTitle}`);
    console.log(`   - questions count: ${questions.length}`);
    
    if (!isValid()) {
      console.error('❌ Validation failed!');
      alert(t('quizEditor.validation.fillAllInfoBeforeSave'));
      return;
    }

    console.log(`✅ Validation passed, preparing quiz data...`);

    // Use lessonId if selected, otherwise use chapterId (backward compatibility)
    const finalLessonId = selectedLesson || selectedChapter;
    
    const quizData = {
      title: quizTitle,
      questions: questions.map(q => ({
        id: q.id,
        question: q.text,
        options: q.options.map(o => ({ label: o.label, text: o.text })),
        correctAnswer: q.correct,
        explanation: q.explanation,
        audioUrl: q.audioUrl || '',
        audioPath: q.audioPath || '',
        audioName: q.audioName || ''
      })),
      metadata: {
        level: selectedLevel,
        bookId: selectedBook,
        chapterId: selectedChapter,
        lessonId: finalLessonId,
        createdAt: new Date().toISOString(),
        questionCount: questions.length
      }
    };

    console.log(`📦 Quiz data prepared:`, {
      title: quizData.title,
      questionsCount: quizData.questions.length,
      bookId: quizData.metadata.bookId,
      chapterId: quizData.metadata.chapterId,
      lessonId: quizData.metadata.lessonId
    });

    // Save to IndexedDB (unlimited storage!) or localStorage
    console.log(`💾 Calling storageManager.saveQuiz(${selectedBook}, ${selectedChapter}, ${finalLessonId})...`);
    const success = await storageManager.saveQuiz(selectedBook, selectedChapter, finalLessonId, quizData);
    console.log(`📦 storageManager.saveQuiz result: ${success ? 'SUCCESS' : 'FAILED'}`);
    
    if (success) {
      // Storage type is determined automatically (IndexedDB if available, localStorage otherwise)
      console.log(`✅ Quiz saved successfully!`);
      
      // ✅ TỰ ĐỘNG EXPORT JSON (download + copy clipboard)
      const exportInfo = await autoExportJSON();
      
      if (exportInfo) {
        if (exportInfo.savedDirectly) {
          // File đã được lưu trực tiếp vào thư mục đã chọn
          if (exportInfo.autoSaved) {
            // Tự động lưu vào cấu trúc project
            const bookFolder = selectedBook === 'skm-n1-bunpou' ? 'shinkanzen-n1-bunpou' : selectedBook;
            const fullPath = `src/data/level/${selectedLevel}/${bookFolder}/quizzes/${exportInfo.filename}`;
            
            let message = `✅ ĐÃ LƯU THÀNH CÔNG!\n\n` +
                  `📝 Đã lưu quiz:\n` +
                  `   - Tên: ${quizTitle}\n` +
                  `   - Số câu hỏi: ${questions.length}\n` +
                  `   - Level: ${selectedLevel.toUpperCase()}\n` +
                  `   - Book: ${selectedBook}\n` +
                  `   - Chapter: ${selectedChapter}\n` +
                  (selectedLesson ? `   - Lesson: ${selectedLesson}\n` : '') +
                  `\n💾 Dữ liệu đã được lưu vào hệ thống!\n\n` +
                  `✅ ĐÃ TỰ ĐỘNG:\n` +
                  `- ✅ Tạo cấu trúc thư mục: ${exportInfo.savedPath || `src/data/level/${selectedLevel}/${bookFolder}/quizzes/`}\n` +
                  `- ✅ Lưu file: ${exportInfo.filename}\n` +
                  `- ✅ Copy JSON vào clipboard\n\n`;
            
            if (exportInfo.fileExisted) {
              message += `⚠️ Lưu ý: File đã tồn tại và đã được ghi đè.\n\n`;
            }
            
            message += `📁 Đường dẫn đầy đủ:\n${fullPath}\n\n` +
                  `🎉 Hoàn tất! File đã được lưu tự động vào đúng vị trí.\n` +
                  `💡 Lần sau chỉ cần click "💾 Lưu Quiz" → Tự động lưu vào đúng vị trí!`;
            
            alert(message);
          } else {
            // Lưu thủ công (cần chọn thư mục)
            alert(`✅ ĐÃ LƯU THÀNH CÔNG!\n\n` +
                  `📝 Đã lưu quiz:\n` +
                  `   - Tên: ${quizTitle}\n` +
                  `   - Số câu hỏi: ${questions.length}\n` +
                  `   - Level: ${selectedLevel.toUpperCase()}\n` +
                  `   - Book: ${selectedBook}\n` +
                  `   - Chapter: ${selectedChapter}\n` +
                  (selectedLesson ? `   - Lesson: ${selectedLesson}\n` : '') +
                  `\n💾 Dữ liệu đã được lưu vào hệ thống!\n\n` +
                  `✅ Đã lưu quiz và tự động lưu file JSON!\n\n` +
                  `📍 Location:\n` +
                  `- Level: ${selectedLevel}\n` +
                  `- Book: ${selectedBook}\n` +
                  `- Chapter: ${selectedChapter}\n\n` +
                  `📊 Stats:\n` +
                  `- Questions: ${questions.length}\n\n` +
                  `✅ ĐÃ TỰ ĐỘNG:\n` +
                  `- ✅ Lưu file: ${exportInfo.filename} (vào thư mục đã chọn)\n` +
                  `- ✅ Copy JSON vào clipboard\n\n` +
                  `🎉 Hoàn tất! File đã được lưu vào project code.`);
          }
        } else {
          // File download về thư mục Downloads, cần copy vào project
          alert(`✅ ĐÃ LƯU THÀNH CÔNG!\n\n` +
                `📝 Đã lưu quiz:\n` +
                `   - Tên: ${quizTitle}\n` +
                `   - Số câu hỏi: ${questions.length}\n` +
                `   - Level: ${selectedLevel.toUpperCase()}\n` +
                `   - Book: ${selectedBook}\n` +
                `   - Chapter: ${selectedChapter}\n` +
                (selectedLesson ? `   - Lesson: ${selectedLesson}\n` : '') +
                `\n💾 Dữ liệu đã được lưu vào hệ thống!\n\n` +
                `✅ Đã lưu quiz và tự động export JSON!\n\n` +
                `📍 Location:\n` +
                `- Level: ${selectedLevel}\n` +
                `- Book: ${selectedBook}\n` +
                `- Chapter: ${selectedChapter}\n\n` +
                `📊 Stats:\n` +
                `- Questions: ${questions.length}\n\n` +
                `✅ ĐÃ TỰ ĐỘNG:\n` +
                `- ✅ Download file: ${exportInfo.filename} (về thư mục Downloads)\n` +
                `- ✅ Copy JSON vào clipboard\n\n` +
                `📝 BƯỚC TIẾP THEO (CHỈ 1 BƯỚC):\n` +
                `1. Mở file: ${exportInfo.filePath}\n` +
                `2. Paste (Ctrl+V) nội dung JSON đã copy\n` +
                `3. Lưu file → Xong! ✅\n\n` +
                `💡 JSON đã được copy sẵn, chỉ cần paste vào file!\n` +
                `💡 Hoặc copy file từ Downloads vào thư mục project.`);
        }
      } else {
        alert(`✅ ĐÃ LƯU THÀNH CÔNG!\n\n` +
              `📝 Đã lưu quiz:\n` +
              `   - Tên: ${quizTitle}\n` +
              `   - Số câu hỏi: ${questions.length}\n` +
              `   - Level: ${selectedLevel.toUpperCase()}\n` +
              `   - Book: ${selectedBook}\n` +
              `   - Chapter: ${selectedChapter}\n` +
              (selectedLesson ? `   - Lesson: ${selectedLesson}\n` : '') +
              `\n💾 Dữ liệu đã được lưu vào hệ thống (IndexedDB)!\n` +
              `💡 Quiz sẽ hiển thị ngay tại trang chi tiết lesson!\n\n` +
              `⚠️ Lưu ý: Vui lòng Export JSON thủ công để backup!`);
      }
    } else {
      console.error(`❌ Failed to save quiz!`);
      alert(t('quizEditor.validation.saveError'));
    }
  };

  // ✅ Helper: Kiểm tra thư mục có phải là project root không
  const verifyProjectRoot = async (directoryHandle) => {
    try {
      // Kiểm tra có file package.json (dấu hiệu của project root)
      try {
        await directoryHandle.getFileHandle('package.json');
        console.log('✅ Tìm thấy package.json - Đây là project root');
        return { isValid: true, type: 'root' };
      } catch (e) {
        // Không có package.json, kiểm tra xem có phải là thư mục src/data/level không
      }
      
      // Kiểm tra có thư mục src/data/level không
      try {
        const srcHandle = await directoryHandle.getDirectoryHandle('src');
        const dataHandle = await srcHandle.getDirectoryHandle('data');
        const levelHandle = await dataHandle.getDirectoryHandle('level');
        console.log('✅ Tìm thấy src/data/level - Đây là project root');
        return { isValid: true, type: 'root' };
      } catch (e) {
        // Không có src/data/level
      }
      
      // Kiểm tra có phải là thư mục src/data/level không (user chọn trực tiếp)
      try {
        const dataHandle = await directoryHandle.getDirectoryHandle('data');
        const levelHandle = await dataHandle.getDirectoryHandle('level');
        console.log('✅ Tìm thấy data/level - Đây là thư mục src/data/level');
        return { isValid: true, type: 'src_data_level', parent: 'src' };
      } catch (e) {
        // Không phải
      }
      
      // Kiểm tra có phải là thư mục level không (user chọn trực tiếp src/data/level)
      try {
        // Thử list các thư mục con để xem có n1, n2, n3... không
        const entries = [];
        for await (const entry of directoryHandle.values()) {
          entries.push(entry.name);
        }
        if (entries.some(name => ['n1', 'n2', 'n3', 'n4', 'n5'].includes(name.toLowerCase()))) {
          console.log('✅ Tìm thấy level folders - Đây là thư mục src/data/level');
          return { isValid: true, type: 'level', parent: 'src/data' };
        }
      } catch (e) {
        // Không phải
      }
      
      console.warn('⚠️ Không tìm thấy dấu hiệu của project root');
      return { isValid: false, type: 'unknown' };
    } catch (err) {
      console.error('❌ Lỗi khi kiểm tra project root:', err);
      return { isValid: false, type: 'error', error: err };
    }
  };

  // ✅ Helper: Tự động tạo cấu trúc thư mục và lưu file
  const saveToProjectStructure = async (rootHandle, level, book, chapter, json) => {
    try {
      // Kiểm tra thư mục có phải là project root không
      const verification = await verifyProjectRoot(rootHandle);
      
      if (!verification.isValid) {
        throw new Error('Thư mục đã chọn không phải là project root. Vui lòng chọn thư mục gốc của project (có chứa package.json hoặc src/data/level/).');
      }
      
      // Map bookId to folder name (một số sách có cấu trúc thư mục khác)
      let bookFolder = book;
      if (book === 'skm-n1-bunpou') {
        bookFolder = 'shinkanzen-n1-bunpou';
      }
      
      // Xác định đường dẫn dựa trên loại thư mục đã chọn
      let pathParts;
      if (verification.type === 'root') {
        // Thư mục gốc: src/data/level/{level}/{book}/quizzes/
        pathParts = ['src', 'data', 'level', level, bookFolder, 'quizzes'];
      } else if (verification.type === 'src_data_level') {
        // Thư mục src/data/level: {level}/{book}/quizzes/
        pathParts = [level, bookFolder, 'quizzes'];
      } else if (verification.type === 'level') {
        // Thư mục level: {book}/quizzes/
        pathParts = [bookFolder, 'quizzes'];
      } else {
        // Mặc định: src/data/level/{level}/{book}/quizzes/
        pathParts = ['src', 'data', 'level', level, bookFolder, 'quizzes'];
      }
      
      // Navigate và tạo các thư mục con
      let currentHandle = rootHandle;
      for (const folderName of pathParts) {
        try {
          // Thử lấy thư mục con (nếu đã tồn tại)
          currentHandle = await currentHandle.getDirectoryHandle(folderName, { create: true });
        } catch (err) {
          console.error(`❌ Lỗi khi tạo thư mục "${folderName}":`, err);
          throw err;
        }
      }
      
      // Kiểm tra file đã tồn tại chưa (tránh ghi đè nhầm)
      const filename = `${chapter}.json`;
      let fileExists = false;
      try {
        await currentHandle.getFileHandle(filename);
        fileExists = true;
      } catch (e) {
        // File chưa tồn tại, OK
      }
      
      if (fileExists) {
        const confirm = window.confirm(
          `⚠️ File "${filename}" đã tồn tại trong thư mục này!\n\n` +
          `Bạn có muốn ghi đè file cũ không?\n\n` +
          `- OK: Ghi đè file cũ\n` +
          `- Cancel: Hủy, không lưu`
        );
        if (!confirm) {
          console.log('⚠️ User đã hủy, không ghi đè file');
          throw new Error('User cancelled - file already exists');
        }
      }
      
      // Lưu file vào thư mục quizzes
      const fileHandle = await currentHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      
      console.log(`✅ Đã lưu file "${filename}" vào ${pathParts.join('/')}/`);
      return { success: true, fileExists: fileExists, path: pathParts.join('/') };
    } catch (err) {
      console.error('❌ Lỗi khi lưu file vào cấu trúc project:', err);
      throw err;
    }
  };

  // ✅ AUTO EXPORT: Tự động export JSON (download + copy clipboard)
  const autoExportJSON = async () => {
    if (!selectedLevel || !selectedBook || !selectedChapter) {
      return null; // Không export nếu thiếu thông tin
    }

    const json = generateJSON();
    const filename = `${selectedChapter}.json`;
    const filePath = getFilePath();
    
    // 1. Tự động copy vào clipboard (quan trọng nhất - dùng để paste vào file)
    try {
      await navigator.clipboard.writeText(json);
      console.log('✅ JSON đã được copy vào clipboard');
    } catch (err) {
      console.warn('⚠️ Không thể copy vào clipboard:', err);
    }

    // 2. Thử sử dụng File System Access API để lưu trực tiếp vào project (Chrome/Edge)
    if ('showDirectoryPicker' in window) {
      try {
        let rootDirectoryHandle = savedDirectoryHandle;
        
        // Nếu chưa có root directory handle, hỏi user chọn thư mục GỐC project (chỉ lần đầu)
        if (!rootDirectoryHandle) {
          const result = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents' // Đề xuất thư mục Documents
          });
          
          // Lưu root directory handle để dùng lại lần sau
          rootDirectoryHandle = result;
          setSavedDirectoryHandle(rootDirectoryHandle);
          console.log('✅ Đã lưu root directory handle, sẽ tự động dùng lại lần sau');
        }
        
        // Tự động tạo cấu trúc thư mục và lưu file vào đúng vị trí
        const saveResult = await saveToProjectStructure(
          rootDirectoryHandle,
          selectedLevel,
          selectedBook,
          selectedChapter,
          json
        );
        
        console.log(`✅ Đã lưu file "${filename}" tự động vào cấu trúc project`);
        return { 
          filename, 
          filePath, 
          savedDirectly: true, 
          autoSaved: true,
          fileExisted: saveResult.fileExists,
          savedPath: saveResult.path
        };
      } catch (err) {
        // User có thể đã cancel, hoặc lỗi khác
        if (err.name === 'AbortError') {
          console.log('⚠️ User đã cancel chọn thư mục');
          // Xóa directory handle nếu user cancel
          setSavedDirectoryHandle(null);
        } else if (err.name === 'NotFoundError' || err.name === 'InvalidStateError') {
          // Directory handle không còn hợp lệ, xóa và hỏi lại lần sau
          console.warn('⚠️ Directory handle không còn hợp lệ, sẽ hỏi lại lần sau:', err);
          setSavedDirectoryHandle(null);
        } else {
          console.warn('⚠️ File System Access API failed:', err);
          // Fallback về download nếu có lỗi
        }
      }
    } else if ('showSaveFilePicker' in window) {
      // Fallback: Sử dụng showSaveFilePicker (vẫn cần chọn thư mục mỗi lần)
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(json);
        await writable.close();
        
        console.log('✅ Đã lưu file trực tiếp vào thư mục đã chọn');
        return { filename, filePath, savedDirectly: true, autoSaved: false };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('⚠️ File System Access API failed, using download fallback:', err);
        }
      }
    }

    // 3. Fallback: Tự động download file (về thư mục Downloads)
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { filename, filePath, savedDirectly: false, autoSaved: false };
  };

  // ✅ NEW: Chọn lại thư mục GỐC project
  const handleSelectDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const directoryHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        
        // Kiểm tra thư mục có phải là project root không
        const verification = await verifyProjectRoot(directoryHandle);
        
        if (!verification.isValid) {
          const confirm = window.confirm(
            '⚠️ CẢNH BÁO: Thư mục đã chọn không phải là project root!\n\n' +
            'Thư mục project root phải chứa:\n' +
            '- File package.json, HOẶC\n' +
            '- Thư mục src/data/level/\n\n' +
            'Nếu tiếp tục, có thể tạo dữ liệu trùng lặp hoặc lưu sai vị trí.\n\n' +
            'Bạn có muốn tiếp tục không?'
          );
          
          if (!confirm) {
            console.log('⚠️ User đã hủy chọn thư mục');
            return;
          }
        }
        
        setSavedDirectoryHandle(directoryHandle);
        
        let message = '✅ Đã chọn thư mục project!\n\n';
        if (verification.type === 'root') {
          message += '📁 Loại: Thư mục gốc project\n';
        } else if (verification.type === 'src_data_level') {
          message += '📁 Loại: Thư mục src/data/level\n';
        } else if (verification.type === 'level') {
          message += '📁 Loại: Thư mục level\n';
        }
        
        message += '\nHệ thống sẽ tự động:\n' +
                   '- Tạo cấu trúc thư mục: src/data/level/{level}/{book}/quizzes/\n' +
                   '- Lưu file vào đúng vị trí theo level/book/chapter\n' +
                   '- Kiểm tra file đã tồn tại trước khi lưu (tránh ghi đè nhầm)\n' +
                   '- Không cần chọn lại thư mục cho các bài khác!';
        
        alert(message);
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('❌ Lỗi khi chọn thư mục: ' + getErrorMessage(err, 'Select Folder'));
        }
      }
    } else {
      alert(t('quizEditor.directory.browserNotSupported'));
    }
  };

  // ✅ OPTIONAL: Download JSON file (backup option)
  const handleDownload = () => {
    if (!isValid()) {
      alert(t('quizEditor.validation.fillAllInfoBeforeExport'));
      return;
    }

    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // ✅ NEW: Generate filename based on location
    let filename = 'quiz.json';
    if (selectedChapter) {
      filename = `${selectedChapter}.json`;
    } else if (selectedBook) {
      filename = `${selectedBook}-quiz.json`;
    } else {
      filename = `bai-${questions[0]?.id || 'X'}.json`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ Đã download file "${filename}"!\n\nFile backup đã được tải về máy.`);
  };

  // ✅ NEW: Get file path for display
  const getFilePath = () => {
    const finalLessonId = selectedLesson || selectedChapter;
    if (!selectedLevel || !selectedBook || !selectedChapter) {
      return 'Chưa chọn đầy đủ thông tin';
    }
    
    // Map bookId to folder name (some books have different folder structure)
    let bookFolder = selectedBook;
    if (selectedBook === 'skm-n1-bunpou') {
      bookFolder = 'shinkanzen-n1-bunpou';
    }
    
    return `src/data/level/${selectedLevel}/${bookFolder}/quizzes/${finalLessonId}.json`;
  };

  // ✅ NEW: Extract lesson number from lessonId for title generation
  const getLessonNumber = (lessonId) => {
    if (!lessonId || lessonId === 'chưa-chọn') return null;
    
    // Format: lesson-1-7 → extract 7
    const match = lessonId.match(/lesson-(\d+)-(\d+)/);
    if (match && match[2]) {
      return parseInt(match[2], 10);
    }
    
    // Format: lesson-1 → extract 1
    const simpleMatch = lessonId.match(/lesson-(\d+)/);
    if (simpleMatch && simpleMatch[1]) {
      return parseInt(simpleMatch[1], 10);
    }
    
    // Try to extract any number from the end
    const numberMatch = lessonId.match(/(\d+)$/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10);
    }
    
    return null;
  };

  // Validate form
  const isValid = () => {
    console.log('🔍 Validating quiz:', {
      hasTitle: !!quizTitle.trim(),
      hasLevel: !!selectedLevel,
      hasBook: !!selectedBook,
      hasChapter: !!selectedChapter,
      questionsCount: questions.length
    });
    
    if (!quizTitle.trim()) {
      console.log('❌ No title');
      return false;
    }
    if (!selectedLevel || !selectedBook || !selectedChapter) {
      console.log('❌ Missing location:', { selectedLevel, selectedBook, selectedChapter });
      return false;
    }
    
    // Check each question
    const allQuestionsValid = questions.every((q, idx) => {
      const hasText = q.text.trim();
      const allOptionsValid = q.options.every(opt => opt.text.trim());
      
      if (!hasText || !allOptionsValid) {
        console.log(`❌ Question ${q.id} invalid:`, {
          hasText,
          allOptionsValid,
          optionsValues: q.options.map(o => o.text)
        });
      }
      
      return hasText && allOptionsValid;
    });
    
    console.log('✅ Validation result:', allQuestionsValid);
    return allQuestionsValid;
  };
  
  // ✅ NEW: Get validation errors (for debugging)
  const getValidationErrors = () => {
    const errors = [];
    if (!quizTitle.trim()) errors.push(t('quizEditor.validation.quizTitleRequired'));
    if (!selectedLevel) errors.push(t('quizEditor.validation.notSelectedLevel'));
    if (!selectedBook) errors.push(t('quizEditor.validation.notSelectedBook'));
    if (!selectedChapter) errors.push(t('quizEditor.validation.notSelectedChapter'));
    
    questions.forEach((q, idx) => {
      if (!q.text.trim()) errors.push(t('quizEditor.validation.questionNotEntered', { id: q.id }));
      q.options.forEach((opt, optIdx) => {
        if (!opt.text.trim()) errors.push(t('quizEditor.validation.answerNotEntered', { id: q.id, label: opt.label }));
      });
    });
    
    return errors;
  };

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
          📝 {t('quizEditor.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-semibold">
          {t('quizEditor.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form Input - 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* ✅ NEW: Location Selection */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
              📍 {t('quizEditor.locationSelection.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Level Selection */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {t('quizEditor.locationSelection.levelRequired')}
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    // Clear justImported when user manually changes location
                    if (justImported) {
                      console.log('👤 [User Action] Clearing justImported - user changed level manually');
                      setJustImported(false);
                      importedMetadataRef.current = null;
                    }
                    setSelectedLevel(e.target.value);
                  }}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
                  required
                >
                  <option value="n1">N1</option>
                  <option value="n2">N2</option>
                  <option value="n3">N3</option>
                  <option value="n4">N4</option>
                  <option value="n5">N5</option>
                </select>
              </div>

              {/* ✅ NEW: Series Selection */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {t('quizEditor.locationSelection.seriesRequired')}
                </label>
                <select
                  value={selectedSeries}
                  onChange={(e) => {
                    if (justImported) {
                      console.log('👤 [User Action] Clearing justImported - user changed series manually');
                      setJustImported(false);
                      importedMetadataRef.current = null;
                    }
                    setSelectedSeries(e.target.value);
                  }}
                  disabled={!selectedLevel || availableSeries.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t('quizEditor.locationSelection.allSeries')}</option>
                  {availableSeries.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.name}
                    </option>
                  ))}
                </select>
                {availableSeries.length === 0 && selectedLevel && (
                  <p className="mt-1 text-xs text-gray-500 font-semibold">
                    {t('quizEditor.locationSelection.noSeries')}
                  </p>
                )}
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {t('quizEditor.locationSelection.bookRequired')}
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    if (justImported) {
                      console.log('👤 [User Action] Clearing justImported - user changed book manually');
                      setJustImported(false);
                      importedMetadataRef.current = null;
                    }
                    setSelectedBook(e.target.value);
                  }}
                  disabled={!selectedLevel || availableBooks.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">{t('quizEditor.locationSelection.selectBook')}</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {t('quizEditor.locationSelection.chapterRequired')}
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    if (justImported) {
                      console.log('👤 [User Action] Clearing justImported - user changed chapter manually');
                      setJustImported(false);
                      importedMetadataRef.current = null;
                    }
                    setSelectedChapter(e.target.value);
                  }}
                  disabled={!selectedBook || availableChapters.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">{t('quizEditor.locationSelection.selectChapter')}</option>
                  {availableChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title || chapter.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Selection */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  {availableLessons.length > 0 ? t('quizEditor.locationSelection.lessonRequired') : t('quizEditor.locationSelection.lessonOptional')}
                </label>
                <select
                  value={selectedLesson}
                  onChange={(e) => {
                    if (justImported) {
                      console.log('👤 [User Action] Clearing justImported - user changed lesson manually');
                      setJustImported(false);
                      importedMetadataRef.current = null;
                    }
                    setSelectedLesson(e.target.value);
                  }}
                  disabled={!selectedChapter || availableLessons.length === 0}
                  className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t('quizEditor.locationSelection.selectLesson')}</option>
                  {availableLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title || lesson.id}
                    </option>
                  ))}
                </select>
                {availableLessons.length === 0 && selectedChapter && (
                  <p className="mt-1 text-xs text-gray-500 font-semibold">
                    {t('quizEditor.locationSelection.noLessons')}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ NEW: Breadcrumb Navigation */}
            {(selectedLevel || selectedSeries || selectedBook || selectedChapter || selectedLesson) && (
              <div className="mt-4 p-3 bg-white rounded-lg border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs text-gray-600 mb-2 font-black">📍 {t('quizEditor.locationSelection.hierarchyPath')}</p>
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  {selectedLevel && (
                    <>
                      <span className="font-black text-blue-700">{t('quizEditor.locationSelection.levelLabel')} {selectedLevel.toUpperCase()}</span>
                      {(selectedSeries || selectedBook || selectedChapter || selectedLesson) && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedSeries && availableSeries.length > 0 && (
                    <>
                      <span className="font-black text-green-700">
                        {t('quizEditor.locationSelection.seriesLabel')} {availableSeries.find(s => s.id === selectedSeries)?.name || selectedSeries}
                      </span>
                      {(selectedBook || selectedChapter || selectedLesson) && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedBook && availableBooks.length > 0 && (
                    <>
                      <span className="font-black text-purple-700">
                        {t('quizEditor.locationSelection.bookLabel')} {availableBooks.find(b => b.id === selectedBook)?.title || selectedBook}
                      </span>
                      {(selectedChapter || selectedLesson) && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedChapter && availableChapters.length > 0 && (
                    <>
                      <span className="font-black text-orange-700">
                        {t('quizEditor.locationSelection.chapterLabel')} {availableChapters.find(ch => ch.id === selectedChapter)?.title || selectedChapter}
                      </span>
                      {selectedLesson && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedLesson && availableLessons.length > 0 && (
                    <span className="font-black text-red-700">
                      {t('quizEditor.locationSelection.lessonLabel')} {availableLessons.find(l => l.id === selectedLesson)?.title || selectedLesson}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ✅ NEW: Display file path */}
            {selectedLevel && selectedBook && selectedChapter && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
                <p className="text-xs text-gray-600 mb-1">{t('quizEditor.questionForm.filePathWillBeSaved')}</p>
                <p className="text-sm font-mono text-blue-700 break-all">
                  {getFilePath()}
                </p>
              </div>
            )}
          </div>

          {/* Quiz Title */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
              📚 {t('quizEditor.quizTitle.required')}
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder={t('quizEditor.quizTitle.placeholder')}
              className="w-full px-3 sm:px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-sm sm:text-base bg-white font-bold"
              required
            />
            {selectedChapter && availableChapters.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {t('quizEditor.questionForm.autoFilledFromChapter')}
              </p>
            )}
          </div>

          {/* ✅ NEW: Quiz Info - Display existing quiz information */}
          {selectedBook && (selectedChapter || selectedLesson) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6">
              {isLoadingQuiz ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">{t('quizEditor.quizInfo.loading')}</span>
                </div>
              ) : existingQuiz ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✅</span>
                    <h3 className="text-base sm:text-lg font-semibold text-green-800">
                      {t('quizEditor.quizInfo.existingQuiz')}
                    </h3>
                  </div>
                  {/* Lesson Info */}
                  {selectedLesson && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-300 rounded">
                      <p className="text-xs font-semibold text-green-700">{t('quizEditor.quizInfo.lesson')}</p>
                      <p className="text-sm text-green-900 font-medium">{selectedLesson}</p>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700">{t('quizEditor.quizInfo.numberOfQuestions')}</span>
                      <span className="text-blue-900 font-bold text-lg">{questions.length} {t('quizEditor.quizInfo.questions')}</span>
                    </div>
                    {questions.length > 0 && (
                      <div className="p-2 bg-white rounded border border-blue-200">
                        <span className="font-semibold text-blue-700 text-xs block mb-1">{t('quizEditor.quizInfo.questionIdList')}</span>
                        <div className="flex flex-wrap gap-1">
                          {questions.map(q => q.id).sort((a, b) => a - b).map(id => (
                            <span key={id} className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                              #{id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {questions.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded">
                        <span className="text-xs text-yellow-800">
                          💡 <strong>{t('quizEditor.quizInfo.nextQuestion')}</strong>{' '}
                          <strong className="text-yellow-900">
                            {t('quizEditor.questionForm.questionHeader', { id: Math.max(...questions.map(q => q.id || 0)) + 1 })}
                          </strong>
                        </span>
                      </div>
                    )}
                    <p className="text-xs mt-2 text-green-600 font-medium">
                      {t('quizEditor.quizInfo.dataLoaded')}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✨</span>
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800">
                      {t('quizEditor.quizInfo.newQuiz')}
                    </h3>
                  </div>
                  {/* Lesson Info */}
                  {selectedLesson && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-300 rounded">
                      <p className="text-xs font-semibold text-blue-700">{t('quizEditor.quizInfo.lesson')}</p>
                      <p className="text-sm text-blue-900 font-medium">{selectedLesson}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 mb-2">
                    {t('quizEditor.quizInfo.noQuizForLesson')}
                  </p>
                  {questions.length > 0 && (
                    <div className="p-2 bg-blue-50 border border-blue-300 rounded">
                      <p className="text-xs text-blue-800">
                        {t('quizEditor.quizInfo.hasQuestions', { count: questions.length })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ NEW: Existing Questions Display */}
          {questions && questions.length > 0 && (
            <div className="bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg p-4 sm:p-6">
              <h4 className="text-sm sm:text-base font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <span>📋</span>
                <span>{t('quizEditor.questions.title')} ({questions.length})</span>
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {questions.map((q, idx) => {
                  const isDuplicate = checkDuplicateQuestion(q.text, idx);
                  return (
                    <div 
                      key={q.id} 
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        isDuplicate 
                          ? 'bg-red-100 border-red-400 shadow-md' 
                          : q.text 
                            ? 'bg-white border-blue-200 hover:border-blue-400' 
                            : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-black text-gray-900 min-w-[4rem] flex-shrink-0">
                          {t('quizEditor.questions.questionNumber', { number: q.id })}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`break-words font-semibold ${q.text ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                            {q.text || t('quizEditor.questions.notEntered')}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {q.audioUrl && (
                              <span className="text-xs text-purple-700 font-black flex items-center gap-1">
                                <span>🎧</span>
                                <span>{t('quizEditor.questions.hasAudio', 'Has audio file')}</span>
                              </span>
                            )}
                            {q.correct && (
                              <span className="text-xs text-green-700 font-black">
                                {t('quizEditor.questions.correct')} {q.correct}
                              </span>
                            )}
                          </div>
                          {isDuplicate && (
                            <p className="text-xs text-red-600 mt-1 font-black animate-pulse">
                              ⚠️ {t('quizEditor.validation.duplicateQuestion')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                <span>💡</span>
                <span>{t('quizEditor.questionForm.helpCheckDuplicates')}</span>
              </p>
            </div>
          )}

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {t('quizEditor.questionForm.questionHeader', { id: question.id })}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500">
                    ({t('quizEditor.questionForm.order', { current: qIndex + 1, total: questions.length })})
                  </span>
                  {question.text ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                      {t('quizEditor.questionForm.entered')}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">
                      {t('quizEditor.questionForm.notEntered')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={question.correct}
                    onChange={(e) => updateQuestion(qIndex, 'correct', e.target.value)}
                    className="px-2 sm:px-3 py-1 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black text-xs sm:text-sm font-bold"
                  >
                    <option value="A">{t('quizEditor.questions.correctAnswer')}: A</option>
                    <option value="B">{t('quizEditor.questions.correctAnswer')}: B</option>
                    <option value="C">{t('quizEditor.questions.correctAnswer')}: C</option>
                    <option value="D">{t('quizEditor.questions.correctAnswer')}: D</option>
                  </select>
                  <button
                    onClick={() => duplicateQuestion(qIndex)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium"
                    title={t('quizEditor.questionForm.duplicateQuestion')}
                  >
                    📋 <span className="hidden sm:inline">{t('quizEditor.questionForm.copy')}</span>
                  </button>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium"
                    title={t('quizEditor.questionForm.deleteQuestion')}
                    disabled={questions.length <= 1}
                  >
                    🗑️ <span className="hidden sm:inline">{t('quizEditor.questionForm.delete')}</span>
                  </button>
                  </div>
                </div>

                {/* ✅ ENHANCED: Question Text with Full Features (Paste, Upload, Format, Preview) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wide">
                      {t('quizEditor.questions.questionText')}
                    </label>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFormatBold(qIndex)}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatItalic(qIndex)}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors italic"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertLineBreak(qIndex)}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Line Break"
                      >
                        ⏎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!imageInputRefs.current[qIndex]) {
                            imageInputRefs.current[qIndex] = document.createElement('input');
                            imageInputRefs.current[qIndex].type = 'file';
                            imageInputRefs.current[qIndex].accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
                            imageInputRefs.current[qIndex].onchange = (e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, qIndex);
                            };
                          }
                          imageInputRefs.current[qIndex].click();
                        }}
                        disabled={isUploadingImage && uploadingImageIndex === qIndex}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          isUploadingImage && uploadingImageIndex === qIndex
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Upload Image"
                      >
                        {isUploadingImage && uploadingImageIndex === qIndex ? '⏳' : '📷'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleQuestionPreview(qIndex, 'text')}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          showQuestionPreview[`${qIndex}_text`]
                            ? 'bg-green-500 text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        title="Toggle Preview"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={(el) => {
                      if (el) textareaRefs.current[qIndex] = el;
                    }}
                    value={question.text}
                    onChange={(e) => {
                      updateQuestion(qIndex, 'text', e.target.value);
                      handleTextareaResize(qIndex);
                    }}
                    onPaste={(e) => handlePaste(e, qIndex)}
                    onInput={() => handleTextareaResize(qIndex)}
                    placeholder={t('quizEditor.questions.questionTextPlaceholder') || 'Nhập nội dung câu hỏi... (Có thể paste từ Word/Google Docs hoặc paste ảnh)'}
                    rows={6}
                    style={{ minHeight: '150px', resize: 'vertical' }}
                    className={`w-full px-4 py-2 border-[3px] rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-colors font-mono text-sm ${
                      checkDuplicateQuestion(question.text, qIndex)
                        ? 'border-red-500 bg-red-50 focus:border-red-500'
                        : 'border-black focus:border-black'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Paste từ Word/Google Docs sẽ tự động format. Paste ảnh (Ctrl+V) sẽ tự động upload và chèn vào.
                  </p>
                  {/* Preview Panel */}
                  {showQuestionPreview[`${qIndex}_text`] && question.text && (
                    <div className="mt-3 p-3 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-2">📺 Preview:</p>
                      <div 
                        className="prose prose-sm max-w-none text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.text }}
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      />
                    </div>
                  )}
                  {/* ✅ Duplicate Warning */}
                  {checkDuplicateQuestion(question.text, qIndex) && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-pulse font-black">
                      <span>⚠️</span>
                      <span>{t('quizEditor.validation.duplicateQuestion')}</span>
                    </p>
                  )}
                </div>

                {/* ✅ NEW: Audio Upload for Listening Questions */}
                <div className="mb-4">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    🎧 {t('quizEditor.questions.audioUpload')}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={question.audioUrl || ''}
                      onChange={(e) => updateQuestion(qIndex, 'audioUrl', e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      placeholder={t('quizEditor.questions.audioUrlPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!audioInputRefs.current[qIndex]) {
                          audioInputRefs.current[qIndex] = document.createElement('input');
                          audioInputRefs.current[qIndex].type = 'file';
                          audioInputRefs.current[qIndex].accept = 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4';
                          audioInputRefs.current[qIndex].onchange = (e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAudioUpload(file, qIndex);
                          };
                        }
                        audioInputRefs.current[qIndex].click();
                      }}
                      disabled={isUploadingAudio && uploadingAudioIndex === qIndex}
                      className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 transition-all"
                      title={t('quizEditor.questions.uploadAudio')}
                    >
                      {isUploadingAudio && uploadingAudioIndex === qIndex ? '⏳' : `📤 ${t('quizEditor.questions.uploadAudio')}`}
                    </button>
                  </div>
                  {question.audioUrl && (
                    <div className="mt-3 p-3 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-gray-900">🎧 {t('quizEditor.questions.audioPreview')}</p>
                        {question.audioName && (
                          <p className="text-xs text-purple-700">📁 {question.audioName}</p>
                        )}
                      </div>
                      <audio controls className="w-full" style={{ height: '40px' }}>
                        <source src={question.audioUrl} type={question.audioUrl.startsWith('data:') ? 'audio/mpeg' : undefined} />
                        {t('quizEditor.questions.browserNotSupportAudio')}
                      </audio>
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        {t('quizEditor.questions.clickToPlayAudio')}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('quizEditor.questions.audioUploadHint')}
                  </p>
                </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex}>
                      <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wide">
                        {t('quizEditor.questions.optionLabel', { label: option.label })}:
                      </label>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateQuestion(qIndex, `option-${optIndex}`, e.target.value)}
                        placeholder={t('quizEditor.questions.optionLabel', { label: option.label })}
                        className={`w-full px-3 py-2 border-[3px] rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold ${
                          question.correct === option.label ? 'border-green-500 bg-green-50 focus:border-green-500' : 'border-black focus:border-black'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* ✅ ENHANCED: Explanation with Full Features (Paste, Upload, Format, Preview) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wide">
                      {t('quizEditor.questions.explanation')}:
                    </label>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFormatBold(qIndex, 'explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatItalic(qIndex, 'explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors italic"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertLineBreak(qIndex, 'explanation')}
                        className="px-2 py-1 text-xs font-black rounded border-[2px] border-black bg-white hover:bg-gray-100 transition-colors"
                        title="Line Break"
                      >
                        ⏎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const key = `explanation_${qIndex}`;
                          if (!imageInputRefs.current[key]) {
                            imageInputRefs.current[key] = document.createElement('input');
                            imageInputRefs.current[key].type = 'file';
                            imageInputRefs.current[key].accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
                            imageInputRefs.current[key].onchange = (e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, qIndex, 'explanation');
                            };
                          }
                          imageInputRefs.current[key].click();
                        }}
                        disabled={isUploadingImage && uploadingImageIndex === qIndex && uploadingImageField === 'explanation'}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          isUploadingImage && uploadingImageIndex === qIndex && uploadingImageField === 'explanation'
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Upload Image"
                      >
                        {isUploadingImage && uploadingImageIndex === qIndex && uploadingImageField === 'explanation' ? '⏳' : '📷'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleQuestionPreview(qIndex, 'explanation')}
                        className={`px-2 py-1 text-xs font-black rounded border-[2px] border-black transition-colors ${
                          showQuestionPreview[`${qIndex}_explanation`]
                            ? 'bg-green-500 text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        title="Toggle Preview"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={(el) => {
                      if (el) explanationTextareaRefs.current[qIndex] = el;
                    }}
                    value={question.explanation}
                    onChange={(e) => {
                      updateQuestion(qIndex, 'explanation', e.target.value);
                      handleTextareaResize(qIndex, 'explanation');
                    }}
                    onPaste={(e) => handlePaste(e, qIndex, 'explanation')}
                    onInput={() => handleTextareaResize(qIndex, 'explanation')}
                    placeholder={t('quizEditor.questions.explanationPlaceholder') || 'Nhập giải thích... (Có thể paste từ Word/Google Docs hoặc paste ảnh)'}
                    rows={4}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Paste từ Word/Google Docs sẽ tự động format. Paste ảnh (Ctrl+V) sẽ tự động upload và chèn vào.
                  </p>
                  {/* Preview Panel */}
                  {showQuestionPreview[`${qIndex}_explanation`] && question.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-2">📺 Preview:</p>
                      <div 
                        className="prose prose-sm max-w-none text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.explanation }}
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Save Current Quiz Button */}
              <button
                onClick={async () => {
                  if (!isValid()) {
                    const errors = getValidationErrors();
                    alert(t('quizEditor.validation.cannotSave', { errors: errors.join('\n') }));
                    return;
                  }
                  await handleSaveOnly();
                  alert(t('quizEditor.validation.savedSuccessfully'));
                }}
                disabled={!isValid()}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold text-base flex items-center justify-center gap-2"
                title={isValid() ? t('quizEditor.questionForm.saveCurrentQuiz') : t('quizEditor.questionForm.fillAllInfoRequired')}
              >
                <span className="text-xl">💾</span>
                <span>{t('quizEditor.questionForm.saveQuiz')}</span>
              </button>
              
              {/* Save & Add New Question Button */}
              <button
                onClick={async () => {
                  if (isValid()) {
                    await handleSaveOnly();
                  }
                  addQuestion();
                }}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-base flex items-center justify-center gap-2"
                title={t('quizEditor.questionForm.saveAndAddNewTitle')}
              >
                <span className="text-xl">➕</span>
                <span>{t('quizEditor.questionForm.saveAndAddNew')}</span>
              </button>
            </div>
            <p className="text-center text-gray-500 text-xs mt-3">
              {questions.length > 0 ? (
                <>{t('quizEditor.questionForm.currentlyHas', { count: questions.length })}</>
              ) : (
                <>{t('quizEditor.questionForm.noQuestions')}</>
              )}
            </p>
          </div>
          </div>

        {/* Sidebar - Preview & Export */}
        <div className="space-y-4 sm:space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 sticky top-6 z-40">
              <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">{t('quizEditor.actions.title')}</h2>
              
              <div className="space-y-3">
                {/* ✅ FIXED: Save button - Chỉ lưu vào hệ thống (KHÔNG export JSON) */}
                <div className="border-[3px] border-black rounded-lg p-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={handleSaveOnly}
                    disabled={!isValid()}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-black text-base flex items-center justify-center gap-2"
                    title={t('quizEditor.actions.saveToSystem')}
                  >
                    <span className="text-xl">💾</span>
                    <span>{t('quizEditor.actions.saveQuiz')}</span>
                  </button>
                  <p className="text-xs text-gray-600 mt-2 text-center font-black">
                    💾 {t('quizEditor.actions.saveToSystem')}
                  </p>
                  {isValid() ? (
                    <p className="text-xs text-green-600 mt-1 text-center font-black">
                      ✅ {t('quizEditor.actions.readyToSave', 'Ready to save - Click "Save Quiz" button to save data to system')}
                    </p>
                  ) : (
                    <div className="mt-2 p-2 bg-red-50 border-[3px] border-red-500 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-xs text-red-700 font-black mb-1">⚠️ {t('quizEditor.actions.cannotSave')}</p>
                      <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside font-semibold">
                        {!quizTitle.trim() && <li>{t('quizEditor.actions.requiredQuizTitle')}</li>}
                        {!selectedLevel && <li>{t('quizEditor.locationSelection.levelRequired')}</li>}
                        {!selectedBook && <li>{t('quizEditor.actions.requiredBook')}</li>}
                        {!selectedChapter && <li>{t('quizEditor.actions.requiredChapter')}</li>}
                        {questions.some(q => !q.text.trim()) && <li>{t('quizEditor.actions.requiredQuestions')}</li>}
                        {questions.some(q => q.options.some(opt => !opt.text.trim())) && <li>{t('quizEditor.actions.requiredAnswers')}</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ✅ NEW: Nút chọn thư mục GỐC project (chỉ hiện trên Chrome/Edge) */}
                {('showDirectoryPicker' in window) && (
                  <button
                    onClick={handleSelectDirectory}
                    className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                    title={t('quizEditor.directory.selectRootTitle')}
                  >
                    <span>📁</span>
                    <span>{savedDirectoryHandle ? t('quizEditor.directory.changeRoot') : t('quizEditor.directory.selectRoot')}</span>
                  </button>
                )}
                {savedDirectoryHandle && (
                  <p className="text-xs text-green-600 text-center mt-1">
                    {t('quizEditor.directory.selectedRoot')}
                  </p>
                )}

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black"
                >
                  {showPreview ? `👁️ ${t('quizEditor.actions.hidePreview', 'Hide Preview')}` : `👁️ ${t('quizEditor.actions.viewPreview')}`}
                </button>

                {/* ✅ NEW: Import JSON to create/update quiz quickly */}
                <input
                  type="file"
                  accept="application/json"
                  ref={importInputRef}
                  className="hidden"
                  onChange={handleImportFile}
                />
                <div className="border-[3px] border-black rounded-lg p-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={handleImportClick}
                    className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-black"
                    title={t('quizEditor.actions.importDescription', 'Tải file JSON có sẵn để điền nhanh quiz')}
                  >
                    📥 {t('quizEditor.actions.importJSON', 'Upload JSON')}
                  </button>
                  <p className="text-xs text-gray-600 mt-1 text-center font-black">
                    📥 {t('quizEditor.actions.importDescription', 'Upload file JSON để tạo quiz hàng loạt (không lưu tự động)')}
                  </p>
                  {importStatus && (
                    <p className="text-xs text-green-600 mt-1 text-center font-black">
                      ✅ {importStatus}
                    </p>
                  )}

                  <button
                    onClick={() => setShowImportTemplate(!showImportTemplate)}
                    className="mt-2 w-full text-xs font-semibold text-blue-700 underline"
                  >
                    {showImportTemplate ? 'Ẩn cấu trúc mẫu JSON' : 'Xem cấu trúc mẫu JSON'}
                  </button>
                  {showImportTemplate && (() => {
                    // ✅ FIXED: Always use current selection for template
                    const finalLessonId = selectedLesson || selectedChapter || 'chưa-chọn';
                    const finalLevel = selectedLevel || 'n5';
                    const finalBookId = selectedBook || 'chưa-chọn';
                    const finalChapterId = selectedChapter || 'chưa-chọn';
                    const lessonNumber = getLessonNumber(finalLessonId);
                    const titleSuffix = lessonNumber ? `Bài ${lessonNumber}` : (quizTitle || 'Nhập tên quiz');
                    
                    // ✅ Show current selection status
                    const hasLocation = selectedLevel && selectedBook && selectedChapter;
                    const locationStatus = hasLocation 
                      ? `✅ Đã chọn: ${finalLevel.toUpperCase()} / ${finalBookId} / ${finalChapterId}${selectedLesson ? ` / ${selectedLesson}` : ''}`
                      : `⚠️ Chưa chọn đầy đủ đường dẫn - Template sẽ dùng giá trị mặc định`;
                    
                    const jsonTemplate = `{
  "title": "Trắc nghiệm mẫu - Trắc nghiệm Từ vựng Minna no Nihongo - ${titleSuffix}",
  "questions": [
    {
      "id": 1,
      "text": "Từ nào sau đây có nghĩa là \\"Tôi\\"?",
      "options": [
        { "label": "A", "text": "わたし" },
        { "label": "B", "text": "あなた" },
        { "label": "C", "text": "あのひと" },
        { "label": "D", "text": "みなさん" }
      ],
      "correct": "A",
      "explanation": "A: わたし (watashi) có nghĩa là Tôi
B: あなた (anata) có nghĩa là Bạn
C: あのひと (anohito) có nghĩa là Người kia
D: みなさん (minasan) có nghĩa là Mọi người",
      "audioUrl": ""
    },
    {
      "id": 2,
      "text": "Từ \\"がくせい\\" có nghĩa là gì?",
      "options": [
        { "label": "A", "text": "Giáo viên" },
        { "label": "B", "text": "Học sinh, sinh viên" },
        { "label": "C", "text": "Nhân viên công ty" },
        { "label": "D", "text": "Bác sĩ" }
      ],
      "correct": "B",
      "explanation": "B: がくせい (gakusei) nghĩa là học sinh/sinh viên
A: せんせい (sensei) nghĩa là giáo viên
C: かいしゃいん (kaishain) nghĩa là nhân viên công ty
D: いしゃ (isha) nghĩa là bác sĩ",
      "audioUrl": ""
    }
  ],
  "metadata": {
    "level": "${finalLevel}",
    "bookId": "${finalBookId}",
    "chapterId": "${finalChapterId}",
    "lessonId": "${finalLessonId}"
  }
}`;
                    return (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2 text-[11px] leading-relaxed font-mono text-gray-800 overflow-x-auto">
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 font-semibold">
                          ✨ Metadata tự động cập nhật theo location bạn chọn ở trên!
                        </div>
                        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-[10px]">
                          📍 {locationStatus}
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-[10px] leading-relaxed font-mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>{jsonTemplate}</pre>
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-[10px]">
                          <p className="font-bold mb-1">💡 LƯU Ý VỀ EXPLANATION:</p>
                          <p className="mb-1">Trong JSON, dùng <code className="bg-white px-1 rounded">\\n</code> để xuống dòng. Khi hiển thị sẽ tự động format:</p>
                          <div className="bg-white p-2 rounded border border-green-300 font-mono text-[9px] whitespace-pre-line">
                            A: わたし (watashi) có nghĩa là Tôi{'\n'}
                            B: あなた (anata) có nghĩa là Bạn{'\n'}
                            C: あのひと (anohito) có nghĩa là Người kia{'\n'}
                            D: みなさん (minasan) có nghĩa là Mọi người
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-[10px]">
                          <p className="font-bold mb-1">⚠️ QUAN TRỌNG VỀ EXPLANATION:</p>
                          <p className="mb-2 text-[9px]">Trong JSON file thực tế, bạn có thể:</p>
                          <div className="bg-white p-2 rounded border border-yellow-300 mb-2">
                            <p className="font-bold text-[9px] mb-1">Cách 1: Dùng \\n (khuyến nghị):</p>
                            <pre className="font-mono text-[8px] whitespace-pre-wrap break-words">"explanation": "A: わたし (watashi) có nghĩa là Tôi\\nB: あなた (anata) có nghĩa là Bạn\\nC: あのひと (anohito) có nghĩa là Người kia\\nD: みなさん (minasan) có nghĩa là Mọi người"</pre>
                          </div>
                          <div className="bg-white p-2 rounded border border-yellow-300">
                            <p className="font-bold text-[9px] mb-1">Cách 2: Xuống dòng thực sự (như mẫu trên):</p>
                            <pre className="font-mono text-[8px] whitespace-pre-wrap break-words">"explanation": "A: わたし (watashi) có nghĩa là Tôi
B: あなた (anata) có nghĩa là Bạn
C: あのひと (anohito) có nghĩa là Người kia
D: みなさん (minasan) có nghĩa là Mọi người"</pre>
                          </div>
                          <p className="mt-2 text-[9px] font-semibold">✅ Khi hiển thị trong app, mỗi đáp án sẽ tự động xuống dòng riêng.</p>
                        </div>
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                          <p className="font-bold mb-1">📝 GHI CHÚ:</p>
                          {!selectedBook || !selectedChapter 
                            ? <p>⚠️ Vui lòng CHỌN LOCATION ở trên để metadata tự động cập nhật!</p>
                            : <p>✅ Metadata đã được cập nhật theo location bạn chọn!</p>
                          }
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Đường dẫn sẽ lưu vào: <code className="bg-gray-100 px-1 rounded">{getFilePath()}</code></li>
                            <li>Copy JSON này và thay thế phần "questions" bằng câu hỏi của bạn</li>
                            <li>Giữ nguyên phần "metadata" để tự động set location khi import</li>
                            <li>Trong "explanation", mỗi đáp án xuống dòng riêng (như mẫu trên)</li>
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ✅ Export JSON - Chỉ export, không lưu vào hệ thống */}
                <div className="border-[3px] border-black rounded-lg p-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={handleExport}
                    disabled={!isValid()}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-black"
                    title={t('quizEditor.actions.exportDescription')}
                  >
                    📤 {t('quizEditor.actions.exportJSON')}
                  </button>
                  <p className="text-xs text-gray-600 mt-1 text-center font-black">
                    📤 {t('quizEditor.actions.exportDescription')}
                  </p>
                  {isValid() ? (
                    <p className="text-xs text-green-600 mt-1 text-center font-black">
                      ✅ {t('quizEditor.actions.readyToExport', 'Ready to export - Click to export JSON file')}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 mt-1 text-center font-black">
                      ⚠️ {t('quizEditor.actions.fillAllInfoBeforeExport')}
                    </p>
                  )}
                </div>

                {exportedJSON && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                    >
                      📋 {t('quizEditor.actions.copyJSON', 'Copy JSON')}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                      💾 Download File
                    </button>
                  </>
                )}
              </div>

              {/* Validation Status */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className={`text-sm font-medium ${isValid() ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid() ? t('quizEditor.validation.formValid', '✅ Form valid') : t('quizEditor.validation.fillAllInfoBeforeSave')}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {t('quizEditor.quizInfo.numberOfQuestions')}: <strong>{questions.length}</strong>
                </p>
                {/* ✅ NEW: Location validation */}
                {(!selectedLevel || !selectedBook || !selectedChapter) && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ {t('quizEditor.validation.selectComplete')}
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mt-4 sm:mt-6 sticky top-6 z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                <h2 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">📺 {t('quizEditor.actions.preview', 'Preview')}</h2>
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="p-3 bg-blue-50 border-[2px] border-blue-200 rounded-lg">
                    <p className="font-bold text-blue-800 text-lg">{quizTitle || 'Untitled Quiz'}</p>
                  </div>
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border-[2px] border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">
                        <span className="text-blue-600">{t('quizEditor.questionForm.questionHeader', { id: q.id })}:</span>{' '}
                        {q.text ? (
                          <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '') }} />
                        ) : (
                          <span className="text-yellow-600 italic">{t('quizEditor.questions.notEntered')}</span>
                        )}
                      </p>
                      <div className="space-y-1 text-sm mt-2">
                        {q.options.map((opt) => (
                          <p
                            key={opt.label}
                            className={`p-2 rounded ${
                              q.correct === opt.label 
                                ? 'text-green-700 font-bold bg-green-100 border-[2px] border-green-300' 
                                : 'text-gray-600 bg-white border border-gray-200'
                            }`}
                          >
                            <span className="font-bold">{opt.label}.</span> {opt.text || t('quizEditor.questions.answerNotEntered', 'No answer')}
                          </p>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                          <p className="font-semibold text-purple-800 mb-1">💡 {t('quizEditor.questions.explanation')}:</p>
                          <p className="text-purple-700" dangerouslySetInnerHTML={{ __html: q.explanation.substring(0, 150) + (q.explanation.length > 150 ? '...' : '') }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exported JSON */}
            {exportedJSON && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Exported JSON</h2>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
                  {exportedJSON}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Link to Content Management */}
        {selectedLevel && selectedBook && selectedChapter && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-green-800">
                  🔗 Quản lý trong Content Management
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Xem và quản lý toàn bộ hierarchy: Level → Series → Book → Chapter → Lesson → Quiz
                </p>
              </div>
              <button
                onClick={() => {
                  // Navigate to Content Management with context
                  const params = new URLSearchParams({
                    level: selectedLevel,
                    book: selectedBook,
                    chapter: selectedChapter
                  });
                  if (selectedSeries) params.set('series', selectedSeries);
                  if (selectedLesson) params.set('lesson', selectedLesson);
                  navigate(`/admin/content?${params.toString()}`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm whitespace-nowrap"
              >
                📚 Mở Content Management
              </button>
            </div>
          </div>
        )}


        </div>
      </div>
    </div>
  );
}

export default QuizEditorPage;

