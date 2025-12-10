// src/pages/admin/ExportImportPage.jsx
// Trang quản lý Export/Import dữ liệu

import React, { useState } from 'react';
import Modal from '../../components/Modal.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { jlptExams } from '../../data/jlpt/jlptData.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import DatePicker from '../../components/admin/DatePicker.jsx';

function ExportImportPage() {
  const { t } = useLanguage();
  // Tab state
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'date-range'

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLevel, setExportLevel] = useState('all');
  const [exportType, setExportType] = useState('level'); // 'level' | 'series' | 'book' | 'chapter' | 'lesson' | 'quiz' | 'exam' | 'exam-year' | 'exam-section'
  const [exportItemId, setExportItemId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Date Range Export states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState(['all']);
  const [includeRelated, setIncludeRelated] = useState(false);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [includeUserPasswords, setIncludeUserPasswords] = useState(false);
  const [showUsersWarning, setShowUsersWarning] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLevel, setImportLevel] = useState('all');
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Data for item selection
  const [levels] = useState(['n1', 'n2', 'n3', 'n4', 'n5']);
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState({}); // { [bookId]: chapters[] }
  const [lessons, setLessons] = useState({}); // { [bookId_chapterId]: lessons[] }
  const [exams, setExams] = useState([]); // Exams for selected level
  const [years, setYears] = useState([]); // Years extracted from exams

  // Load data when export type or level changes
  React.useEffect(() => {
    const loadData = async () => {
      if (exportType === 'series' && exportLevel !== 'all') {
        const loadedSeries = await storageManager.getSeries(exportLevel);
        setSeries(loadedSeries || []);
      }
      if (exportType === 'book' && exportLevel !== 'all') {
        const loadedBooks = await storageManager.getBooks(exportLevel);
        setBooks(loadedBooks || []);
      }
      if (exportType === 'exam' || exportType === 'exam-year' || exportType === 'exam-section') {
        if (exportLevel !== 'all') {
          // Load exams from storage first, fallback to default data
          console.log(`🔍 Loading exams for level: ${exportLevel}, exportType: ${exportType}`);
          const loadedExams = await storageManager.getExams(exportLevel);
          console.log(`📦 Loaded exams from storage:`, loadedExams);
          
          if (loadedExams && loadedExams.length > 0) {
            setExams(loadedExams);
            // Extract unique years from exams (examId format: YYYY-MM)
            const uniqueYears = [...new Set(loadedExams.map(exam => exam.id.split('-')[0]))].sort().reverse();
            setYears(uniqueYears);
            console.log(`✅ Set ${loadedExams.length} exams, ${uniqueYears.length} years`);
          } else {
            // Fallback to default static data
            const defaultExams = jlptExams[exportLevel] || [];
            console.log(`📁 Using default exams:`, defaultExams);
            setExams(defaultExams);
            if (defaultExams.length > 0) {
              const uniqueYears = [...new Set(defaultExams.map(exam => exam.id.split('-')[0]))].sort().reverse();
              setYears(uniqueYears);
              console.log(`✅ Set ${defaultExams.length} default exams, ${uniqueYears.length} years`);
            } else {
              setYears([]);
              console.log(`⚠️ No exams found for level ${exportLevel}`);
            }
          }
        } else {
          // Level is 'all', reset exams
          setExams([]);
          setYears([]);
        }
      } else {
        // Reset exams and years when not in exam export mode
        setExams([]);
        setYears([]);
      }
    };
    loadData();
  }, [exportType, exportLevel]);

  // Load chapters when book is selected
  React.useEffect(() => {
    const loadChapters = async () => {
      if (exportType === 'chapter' && exportItemId) {
          const loadedChapters = await storageManager.getChapters(exportItemId, exportLevel);
        setChapters({ [exportItemId]: loadedChapters || [] });
      }
    };
    loadChapters();
  }, [exportType, exportItemId]);

  // Load lessons when chapter is selected
  React.useEffect(() => {
    const loadLessons = async () => {
      if (exportType === 'lesson' && exportItemId) {
        const [bookId, chapterId] = exportItemId.split('_');
        if (bookId && chapterId) {
            const loadedLessons = await storageManager.getLessons(bookId, chapterId, exportLevel);
          setLessons({ [exportItemId]: loadedLessons || [] });
        }
      }
    };
    loadLessons();
  }, [exportType, exportItemId]);

  // Helper function to generate filename with detailed timestamp
  const generateFilename = (prefix, suffix = '') => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    // Sanitize suffix (remove special characters that might cause issues)
    const cleanSuffix = suffix ? `-${suffix.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50)}` : '';
    return `${prefix}${cleanSuffix}-${dateStr}_${timeStr}.json`;
  };

  // Export functions
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data;
      let filename;

      if (exportType === 'level') {
        if (exportLevel === 'all') {
          data = await storageManager.exportAll();
          filename = generateFilename('elearning-backup-all');
        } else {
          data = await storageManager.exportLevel(exportLevel);
          filename = generateFilename('elearning-backup', exportLevel.toUpperCase());
        }
      } else if (exportType === 'series') {
        if (!exportItemId) {
          alert('Vui lòng chọn Series!');
          setIsExporting(false);
          return;
        }
        data = await storageManager.exportSeries(exportLevel, exportItemId);
        const seriesItem = series.find(s => s.id === exportItemId || s.name === exportItemId);
        filename = generateFilename('elearning-export-series', seriesItem?.name || exportItemId);
      } else if (exportType === 'book') {
        if (!exportItemId) {
          alert('Vui lòng chọn Book!');
          setIsExporting(false);
          return;
        }
        data = await storageManager.exportBook(exportLevel, exportItemId);
        const book = books.find(b => b.id === exportItemId);
        filename = generateFilename('elearning-export-book', book?.title || exportItemId);
      } else if (exportType === 'chapter') {
        if (!exportItemId) {
          alert('Vui lòng chọn Chapter!');
          setIsExporting(false);
          return;
        }
        const [bookId, chapterId] = exportItemId.split('_');
        data = await storageManager.exportChapter(bookId, chapterId);
        const chapter = chapters[bookId]?.find(ch => ch.id === chapterId);
        filename = generateFilename('elearning-export-chapter', chapter?.title || chapterId);
      } else if (exportType === 'lesson') {
        if (!exportItemId) {
          alert('Vui lòng chọn Lesson!');
          setIsExporting(false);
          return;
        }
        const [bookId, chapterId, lessonId] = exportItemId.split('_');
        data = await storageManager.exportLesson(bookId, chapterId, lessonId);
        const lesson = lessons[exportItemId]?.find(l => l.id === lessonId);
        filename = generateFilename('elearning-export-lesson', lesson?.title || lessonId);
      } else if (exportType === 'quiz') {
        if (!exportItemId) {
          alert('Vui lòng chọn Quiz!');
          setIsExporting(false);
          return;
        }
        const [bookId, chapterId, lessonId] = exportItemId.split('_');
        data = await storageManager.exportQuiz(bookId, chapterId, lessonId);
        filename = generateFilename('elearning-export-quiz');
      } else if (exportType === 'exam') {
        if (!exportItemId) {
          alert('Vui lòng chọn Exam!');
          setIsExporting(false);
          return;
        }
        console.log(`📤 Exporting exam: ${exportLevel}/${exportItemId}`);
        console.log(`📋 Available exams in state:`, exams);
        const selectedExamMeta = exams.find(e => e.id === exportItemId);
        console.log(`🔍 Selected exam metadata:`, selectedExamMeta);
        
        data = await storageManager.exportExam(exportLevel, exportItemId);
        console.log(`📦 Export result:`, data);
        
        if (!data) {
          // If export failed but we have metadata, create a basic export
          if (selectedExamMeta) {
            console.warn(`⚠️ Export failed but have metadata, creating basic export`);
            data = {
              timestamp: new Date().toISOString(),
              version: '2.0.0',
              type: 'exam',
              level: exportLevel,
              examId: exportItemId,
              exam: {
                title: selectedExamMeta.title,
                date: selectedExamMeta.date,
                status: selectedExamMeta.status,
                imageUrl: selectedExamMeta.imageUrl || '',
                knowledge: { sections: [] },
                listening: { sections: [] }
              },
              examMetadata: selectedExamMeta,
              warning: 'Exam chỉ có metadata từ danh sách, chưa có dữ liệu đầy đủ trong IndexedDB. Vui lòng nhập câu hỏi trong mục "Quản lý Đề thi".'
            };
          } else {
            alert(t('admin.backupRestore.messages.exportFailed'));
            setIsExporting(false);
            return;
          }
        }
        const exam = exams.find(e => e.id === exportItemId);
        filename = generateFilename('elearning-export-exam', exam?.title || exportItemId);
      } else if (exportType === 'exam-year') {
        if (!exportItemId) {
          alert(t('admin.backupRestore.messages.selectYear'));
          setIsExporting(false);
          return;
        }
        data = await storageManager.exportExamByYear(exportLevel, exportItemId);
        filename = generateFilename('elearning-export-exam-year', `${exportLevel.toUpperCase()}-${exportItemId}`);
      } else if (exportType === 'exam-section') {
        if (!exportItemId) {
          alert(t('admin.backupRestore.messages.selectExamSection'));
          setIsExporting(false);
          return;
        }
        const [examId, sectionType] = exportItemId.split('_');
        data = await storageManager.exportExamSection(exportLevel, examId, sectionType);
        const exam = exams.find(e => e.id === examId);
        filename = generateFilename('elearning-export-exam-section', `${exam?.title || examId}-${sectionType}`);
      }

      if (!data) {
        console.error('❌ Export failed: data is null');
        alert(t('admin.backupRestore.messages.exportFailedCheck'));
        setIsExporting(false);
        return;
      }
      
      // Check for warning in exam export
      if (data.warning) {
        const proceed = window.confirm(t('admin.backupRestore.messages.exportWarning', { warning: data.warning }));
        if (!proceed) {
          setIsExporting(false);
          return;
        }
      }

      // Create JSON blob
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(t('admin.backupRestore.messages.exportSuccess', { filename }));
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Lỗi khi export: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Import functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError(t('admin.backupRestore.messages.fileMustBeJSON'));
      return;
    }

    setImportFile(file);
    setImportError(null);

    // Preview file content
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target.result);
        
        // Validate basic structure
        if (!content || typeof content !== 'object') {
          setImportError(t('admin.backupRestore.messages.invalidJSON'));
          return;
        }

        // Check for valid data structure
        const hasContent = content.books || content.series || content.chapters || 
                          content.lessons || content.quizzes || content.exams || 
                          content.type || content.level;
        
        if (!hasContent) {
          setImportError(t('admin.backupRestore.messages.invalidFormat'));
          return;
        }

        // Clear error if valid
        setImportError(null);
        
        // Log preview info
        if (content.type) {
          console.log(`📋 Preview: Type=${content.type}, Level=${content.level || 'N/A'}`);
        } else if (content.level) {
          console.log(`📋 Preview: Level export for ${content.level.toUpperCase()}`);
        }
      } catch (error) {
        setImportError(t('admin.backupRestore.messages.invalidJSONCheck'));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError(t('admin.backupRestore.messages.selectFile'));
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);

          // Validate data structure
          if (!data || (typeof data !== 'object')) {
            throw new Error(t('admin.backupRestore.messages.invalidJSON'));
          }

          // Determine import level from data or selected level
          let targetLevel = importLevel;
          if (importLevel === 'all') {
            // If importing all, use importAll
            const confirmMessage = t('admin.backupRestore.messages.importWarning');
            if (!window.confirm(confirmMessage)) {
              setIsImporting(false);
              return;
            }

            const result = await storageManager.importAll(data);
            
            if (result.success) {
              alert(result.imported ? t('admin.backupRestore.messages.importSuccess', { count: result.imported }) : t('admin.backupRestore.messages.importSuccessAll'));
              setShowImportModal(false);
              setImportFile(null);
              setImportError(null);
              window.location.reload();
            } else {
              throw new Error(result.error || t('admin.backupRestore.messages.importErrorUnknown'));
            }
          } else {
            // If importing specific level, check if data has level field
            if (data.level && data.level !== importLevel) {
              const confirmChange = window.confirm(
                t('admin.backupRestore.messages.levelMismatch', { fileLevel: data.level.toUpperCase(), selectedLevel: importLevel.toUpperCase() })
              );
              if (confirmChange) {
                targetLevel = data.level;
              }
            }

            // Check if it's an item export (has type field)
            if (data.type) {
              // Build confirmation message based on type
              let confirmMessage = '';
              let itemName = '';
              
              if (data.type === 'exam') {
                itemName = `Bài thi "${data.examMetadata?.title || data.examId || 'N/A'}"`;
                confirmMessage = t('admin.backupRestore.messages.importWarningItem', { 
                  itemName, 
                  level: data.level?.toUpperCase() || 'N/A', 
                  examId: data.examId || 'N/A' 
                });
              } else if (data.type === 'exam-year') {
                const examCount = Object.keys(data.exams || {}).length;
                itemName = `${examCount} bài thi của năm ${data.year}`;
                confirmMessage = t('admin.backupRestore.messages.importWarningExams', { 
                  itemName, 
                  count: examCount, 
                  level: data.level?.toUpperCase() || 'N/A', 
                  year: data.year 
                });
              } else if (data.type === 'exam-section') {
                itemName = `Phần thi "${data.sectionType}" của "${data.examMetadata?.title || data.examId || 'N/A'}"`;
                confirmMessage = `Import ${itemName} sẽ cập nhật phần thi này!\n\nLevel: ${data.level?.toUpperCase() || 'N/A'}\nExam: ${data.examId || 'N/A'}\nSection: ${data.sectionType === 'knowledge' ? 'Knowledge' : 'Listening'}\n\nBạn có chắc chắn muốn tiếp tục?`;
              } else {
                itemName = data.type;
                confirmMessage = `Import ${itemName} này sẽ ghi đè dữ liệu hiện tại!\n\nBạn có chắc chắn muốn tiếp tục?`;
              }
              
              if (!window.confirm(confirmMessage)) {
                setIsImporting(false);
                return;
              }

              const result = await storageManager.importItem(data);
              
              if (result.success) {
                const successMessage = data.type === 'exam-year' 
                  ? t('admin.backupRestore.messages.importSuccessExams', { 
                      count: Object.keys(data.exams || {}).length, 
                      year: data.year, 
                      level: data.level?.toUpperCase() || 'N/A' 
                    })
                  : t('admin.backupRestore.messages.importSuccess', { count: itemName });
                alert(successMessage);
                setShowImportModal(false);
                setImportFile(null);
                setImportError(null);
                window.location.reload();
              } else {
                throw new Error(result.error || t('admin.backupRestore.messages.importErrorUnknown'));
              }
            } else {
              // Import specific level
              const confirmMessage = t('admin.backupRestore.messages.importWarning');
              if (!window.confirm(confirmMessage)) {
                setIsImporting(false);
                return;
              }

              const result = await storageManager.importLevel(targetLevel, data);
              
              if (result.success) {
                alert(result.imported ? t('admin.backupRestore.messages.importSuccessLevel', { level: targetLevel.toUpperCase(), count: result.imported }) : t('admin.backupRestore.messages.importSuccessLevelAll', { level: targetLevel.toUpperCase() }));
                setShowImportModal(false);
                setImportFile(null);
                setImportError(null);
                window.location.reload();
              } else {
                throw new Error(result.error || t('admin.backupRestore.messages.importErrorUnknown'));
              }
            }
          }
        } catch (error) {
          console.error('Import error:', error);
          setImportError(t('admin.backupRestore.messages.importError', { error: error.message }));
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('File read error:', error);
      setImportError(t('admin.backupRestore.messages.readFileError', { error: error.message }));
      setIsImporting(false);
    }
  };

  // Load books when series is selected for chapter/lesson/quiz export
  React.useEffect(() => {
    const loadBooksForSeries = async () => {
      if ((exportType === 'chapter' || exportType === 'lesson' || exportType === 'quiz') && exportLevel !== 'all') {
        const loadedBooks = await storageManager.getBooks(exportLevel);
        setBooks(loadedBooks || []);
      }
    };
    loadBooksForSeries();
  }, [exportType, exportLevel]);

  // Load chapters when book is selected for lesson/quiz export
  React.useEffect(() => {
    const loadChaptersForBook = async () => {
      if ((exportType === 'lesson' || exportType === 'quiz') && exportItemId && exportItemId.includes('_') === false) {
        const loadedChapters = await storageManager.getChapters(exportItemId, exportLevel);
        setChapters({ [exportItemId]: loadedChapters || [] });
      }
    };
    loadChaptersForBook();
  }, [exportType, exportItemId]);

  // Load lessons when chapter is selected for quiz export
  React.useEffect(() => {
    const loadLessonsForChapter = async () => {
      if (exportType === 'quiz' && exportItemId && exportItemId.includes('_')) {
        const [bookId, chapterId] = exportItemId.split('_');
        if (bookId && chapterId) {
          const loadedLessons = await storageManager.getLessons(bookId, chapterId);
          setLessons({ [exportItemId]: loadedLessons || [] });
        }
      }
    };
    loadLessonsForChapter();
  }, [exportType, exportItemId]);

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              💾 {t('admin.backupRestore.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('admin.backupRestore.subtitle')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6 bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 sm:p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 px-4 py-2 rounded-lg font-black transition-all uppercase text-sm ${
              activeTab === 'standard'
                ? 'bg-blue-500 text-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[2px] border-gray-300'
            }`}
          >
            {t('admin.backupRestore.standardTab')}
          </button>
          <button
            onClick={() => setActiveTab('date-range')}
            className={`flex-1 px-4 py-2 rounded-lg font-black transition-all uppercase text-sm ${
              activeTab === 'date-range'
                ? 'bg-blue-500 text-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[2px] border-gray-300'
            }`}
          >
            {t('admin.backupRestore.dateRangeTab')}
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'standard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Export Section */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('admin.backupRestore.exportTitle')}</h2>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm"
            >
              {t('admin.backupRestore.exportButton')}
            </button>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• {t('admin.backupRestore.exportOptions.byLevel')}</p>
            <p>• {t('admin.backupRestore.exportOptions.bySeries')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byBook')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byChapter')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byLesson')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byQuiz')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byExam')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byExamSection')}</p>
            <p>• {t('admin.backupRestore.exportOptions.byYear')}</p>
          </div>
        </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('admin.backupRestore.importTitle')}</h2>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm"
            >
              {t('admin.backupRestore.importButton')}
            </button>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• {t('admin.backupRestore.importOptions.byLevel')}</p>
            <p>• {t('admin.backupRestore.importOptions.byElement')}</p>
            <p>• {t('admin.backupRestore.importOptions.supportExport')}</p>
            <p>• {t('admin.backupRestore.importOptions.importExams')}</p>
            <p className="text-red-600 font-semibold">{t('admin.backupRestore.importWarning')}</p>
          </div>
          </div>
        </div>
        ) : (
        /* Date Range Backup Tab */
        <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.backupRestore.dateRange.title')}</h2>
        
        {/* Quick Options */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('admin.backupRestore.dateRange.quickOptions')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
              }}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {t('admin.backupRestore.dateRange.today')}
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monday = new Date(today);
                monday.setDate(today.getDate() - today.getDay() + 1); // Monday
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6); // Sunday
                setStartDate(monday.toISOString().split('T')[0]);
                setEndDate(sunday.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {t('admin.backupRestore.dateRange.thisWeek')}
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                setStartDate(firstDay.toISOString().split('T')[0]);
                setEndDate(lastDay.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {t('admin.backupRestore.dateRange.thisMonth')}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.backupRestore.dateRange.fromDate')}
            </label>
            <DatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={undefined}
              max={endDate || undefined}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.backupRestore.dateRange.toDate')}
            </label>
            <DatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={undefined}
              className="text-sm"
            />
          </div>
        </div>

        {/* Data Types Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('admin.backupRestore.dateRange.selectDataType')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'all', label: t('admin.backupRestore.dateRange.all') },
              { id: 'books', label: 'Books' },
              { id: 'series', label: 'Series' },
              { id: 'chapters', label: 'Chapters' },
              { id: 'lessons', label: 'Lessons' },
              { id: 'quizzes', label: 'Quizzes' },
              { id: 'exams', label: 'Exams' }
            ].map(type => (
              <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDataTypes.includes(type.id)}
                  onChange={(e) => {
                    if (type.id === 'all') {
                      setSelectedDataTypes(e.target.checked ? ['all'] : []);
                    } else {
                      setSelectedDataTypes(prev => {
                        const filtered = prev.filter(t => t !== 'all');
                        return e.target.checked
                          ? [...filtered, type.id]
                          : filtered.filter(t => t !== type.id);
                      });
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeRelated}
              onChange={(e) => setIncludeRelated(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {t('admin.backupRestore.dateRange.includeRelated')}
            </span>
          </label>
          
          <div className="space-y-2">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUsers}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIncludeUsers(true);
                    setShowUsersWarning(true);
                  } else {
                    setIncludeUsers(false);
                    setIncludeUserPasswords(false);
                    setShowUsersWarning(false);
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-700 font-semibold">
                  {t('admin.backupRestore.dateRange.includeUsers')}
                </span>
              </div>
            </label>
            
            {includeUsers && (
              <div className="ml-6 space-y-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUserPasswords}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Cảnh báo rất rõ ràng về bảo mật
                        const confirmed = window.confirm(
                          t('admin.backupRestore.dateRange.passwordWarningMessage')
                        );
                        if (confirmed) {
                          setIncludeUserPasswords(true);
                        }
                      } else {
                        setIncludeUserPasswords(false);
                      }
                    }}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">
                      {t('admin.backupRestore.dateRange.includePassword')}
                    </span>
                  </div>
                </label>
                
                {showUsersWarning && (
                  <div className={`p-2 border rounded text-xs ${
                    includeUserPasswords 
                      ? 'bg-red-50 border-red-200 text-red-800' 
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                    {includeUserPasswords ? (
                      <>
                        {t('admin.backupRestore.dateRange.passwordWarningWithPassword')}
                      </>
                    ) : (
                      <>
                        {t('admin.backupRestore.dateRange.passwordWarningWithoutPassword')}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Button */}
        <div className="mb-4">
          <button
            onClick={async () => {
              if (!startDate || !endDate) {
                alert(t('admin.backupRestore.messages.dateRangeSelectTime'));
                return;
              }
              if (selectedDataTypes.length === 0) {
                alert(t('admin.backupRestore.messages.dateRangeSelectDataType'));
                return;
              }
              
              setIsExporting(true);
              try {
                const data = await storageManager.exportByDateRange(
                  startDate,
                  endDate,
                  selectedDataTypes,
                  includeRelated,
                  includeUsers,
                  includeUserPasswords
                );
                setPreviewData(data);
                if (data && data.summary) {
                  let previewMsg = `Preview:\n\nBooks: ${data.summary.books}\nSeries: ${data.summary.series}\nChapters: ${data.summary.chapters}\nLessons: ${data.summary.lessons}\nQuizzes: ${data.summary.quizzes}\nExams: ${data.summary.exams}`;
                  if (includeUsers) {
                    if (includeUserPasswords) {
                      const usersWithPassword = data.users?.filter(u => u.password).length || 0;
                      const usersWithoutPassword = data.users?.filter(u => !u.password).length || 0;
                      previewMsg += `\nUsers: ${data.summary.users} (${usersWithPassword} with password, ${usersWithoutPassword} without password)`;
                      if (usersWithoutPassword > 0) {
                        previewMsg += `\n⚠️ ${usersWithoutPassword} users không có password (users mới hoặc đã đổi password)`;
                      }
                    } else {
                      previewMsg += `\nUsers: ${data.summary.users} (metadata only, no passwords)`;
                    }
                  }
                  alert(previewMsg);
                } else {
                  alert(t('admin.backupRestore.messages.dateRangeNoData'));
                }
              } catch (error) {
                console.error('Preview error:', error);
                alert(t('admin.backupRestore.messages.dateRangePreviewError', { error: error.message }));
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={!startDate || !endDate || selectedDataTypes.length === 0 || isExporting}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold mr-2"
          >
            {t('admin.backupRestore.dateRange.preview')}
          </button>
        </div>

        {/* Preview Summary */}
        {previewData && previewData.summary && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">{t('admin.backupRestore.dateRange.summaryTitle')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>Books: <span className="font-semibold">{previewData.summary.books}</span></div>
              <div>Series: <span className="font-semibold">{previewData.summary.series}</span></div>
              <div>Chapters: <span className="font-semibold">{previewData.summary.chapters}</span></div>
              <div>Lessons: <span className="font-semibold">{previewData.summary.lessons}</span></div>
              <div>Quizzes: <span className="font-semibold">{previewData.summary.quizzes}</span></div>
              <div>Exams: <span className="font-semibold">{previewData.summary.exams}</span></div>
              {includeUsers && previewData.summary.users > 0 && (
                <div className="col-span-2 md:col-span-3">
                  Users: <span className="font-semibold">{previewData.summary.users}</span>
                  {includeUserPasswords ? (
                    <>
                      <span className="text-xs text-red-700 ml-2">
                        ({previewData.users?.filter(u => u.password).length || 0} with password, {previewData.users?.filter(u => !u.password).length || 0} without)
                      </span>
                      {previewData.users?.filter(u => !u.password).length > 0 && (
                        <div className="text-xs text-yellow-700 mt-1">
                          ⚠️ {previewData.users.filter(u => !u.password).length} users không có password (users mới hoặc đã đổi password)
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-yellow-700 ml-2">(metadata only, no passwords)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              if (!startDate || !endDate) {
                alert(t('admin.backupRestore.messages.dateRangeSelectTime'));
                return;
              }
              if (selectedDataTypes.length === 0) {
                alert(t('admin.backupRestore.messages.dateRangeSelectDataType'));
                return;
              }
              
              setIsExporting(true);
              try {
                const data = await storageManager.exportByDateRange(
                  startDate,
                  endDate,
                  selectedDataTypes,
                  includeRelated,
                  includeUsers,
                  includeUserPasswords
                );
                
                if (!data) {
                  alert(t('admin.backupRestore.messages.dateRangeNoData'));
                  setIsExporting(false);
                  return;
                }

                // Generate filename
                const filename = generateFilename('elearning-backup-date-range', `${startDate}_to_${endDate}`);

                // Create JSON blob
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                let successMsg = t('admin.backupRestore.messages.dateRangeExportSuccess', {
                  filename,
                  books: data.summary?.books || 0,
                  series: data.summary?.series || 0,
                  chapters: data.summary?.chapters || 0,
                  lessons: data.summary?.lessons || 0,
                  quizzes: data.summary?.quizzes || 0,
                  exams: data.summary?.exams || 0
                });
                if (includeUsers && data.summary?.users > 0) {
                  if (includeUserPasswords) {
                    const usersWithPassword = data.users?.filter(u => u.password).length || 0;
                    const usersWithoutPassword = data.users?.filter(u => !u.password).length || 0;
                    successMsg += `\nUsers: ${data.summary.users} (${usersWithPassword} with password, ${usersWithoutPassword} without password)`;
                    successMsg += `\n\n${t('admin.backupRestore.messages.dateRangeExportWarningPassword')}`;
                    if (usersWithoutPassword > 0) {
                      successMsg += `\n⚠️ ${usersWithoutPassword} users không có password (users mới hoặc đã đổi password)`;
                    }
                  } else {
                    successMsg += `\nUsers: ${data.summary.users} (metadata only, no passwords)`;
                    successMsg += `\n\n${t('admin.backupRestore.messages.dateRangeExportWarningNoPassword')}`;
                  }
                }
                alert(successMsg);
              } catch (error) {
                console.error('Export error:', error);
                alert(`Lỗi khi export: ${error.message}`);
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={!startDate || !endDate || selectedDataTypes.length === 0 || isExporting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {isExporting ? t('admin.backupRestore.dateRange.exporting') : t('admin.backupRestore.dateRange.exportButton')}
          </button>
        </div>
      </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => {
          if (!isExporting) {
            setShowExportModal(false);
            setExportLevel('all');
            setExportType('level');
            setExportItemId('');
          }
        }}
          title={t('admin.backupRestore.exportModal.title')}
        maxWidth="48rem"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.backupRestore.exportModal.exportTypeLabel')}
            </label>
            <select
              value={exportType}
              onChange={(e) => {
                const newType = e.target.value;
                setExportType(newType);
                setExportItemId('');
                // Auto-set level to 'n1' if switching to exam types and level is 'all'
                if ((newType === 'exam' || newType === 'exam-year' || newType === 'exam-section') && exportLevel === 'all') {
                  setExportLevel('n1');
                  console.log(`🔄 Auto-set level to n1 for exam export type`);
                }
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <optgroup label={t('admin.backupRestore.exportModal.bookContentGroup')}>
                <option value="level">{t('admin.backupRestore.exportModal.exportTypeLevel')}</option>
                <option value="series">{t('admin.backupRestore.exportModal.exportTypeSeries')}</option>
                <option value="book">{t('admin.backupRestore.exportModal.exportTypeBook')}</option>
                <option value="chapter">{t('admin.backupRestore.exportModal.exportTypeChapter')}</option>
                <option value="lesson">{t('admin.backupRestore.exportModal.exportTypeLesson')}</option>
                <option value="quiz">{t('admin.backupRestore.exportModal.exportTypeQuiz')}</option>
              </optgroup>
              <optgroup label={t('admin.backupRestore.exportModal.jlptExamGroup')}>
                <option value="exam">{t('admin.backupRestore.exportModal.exportTypeExam')}</option>
                <option value="exam-section">{t('admin.backupRestore.exportModal.exportTypeExamSection')}</option>
                <option value="exam-year">{t('admin.backupRestore.exportModal.exportTypeExamYear')}</option>
              </optgroup>
            </select>
          </div>

          {exportType === 'level' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.backupRestore.exportModal.selectLevelLabel')}
              </label>
              <select
                value={exportLevel}
                onChange={(e) => setExportLevel(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">{t('admin.backupRestore.exportModal.allLevels')}</option>
                <option value="n1">{t('admin.backupRestore.exportModal.levelN1')}</option>
                <option value="n2">{t('admin.backupRestore.exportModal.levelN2')}</option>
                <option value="n3">{t('admin.backupRestore.exportModal.levelN3')}</option>
                <option value="n4">{t('admin.backupRestore.exportModal.levelN4')}</option>
                <option value="n5">{t('admin.backupRestore.exportModal.levelN5')}</option>
              </select>
            </div>
          )}

          {(exportType === 'series' || exportType === 'book' || exportType === 'chapter' || exportType === 'lesson' || exportType === 'quiz' || exportType === 'exam' || exportType === 'exam-year' || exportType === 'exam-section') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.backupRestore.exportModal.selectLevelLabel')}
              </label>
              <select
                value={exportLevel === 'all' ? 'n1' : exportLevel}
                onChange={(e) => {
                  const newLevel = e.target.value;
                  setExportLevel(newLevel);
                  setExportItemId('');
                  console.log(`🔄 Level changed to: ${newLevel}`);
                }}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
              >
                <option value="n1">N1 - Cao cấp</option>
                <option value="n2">N2 - Trung-Cao cấp</option>
                <option value="n3">N3 - Trung cấp</option>
                <option value="n4">N4 - Sơ-Trung cấp</option>
                <option value="n5">N5 - Sơ cấp</option>
              </select>
            </div>
          )}

          {exportType === 'series' && exportLevel !== 'all' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.backupRestore.exportModal.selectSeries')}
              </label>
              <select
                value={exportItemId}
                onChange={(e) => setExportItemId(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- {t('admin.backupRestore.exportModal.selectSeries')} --</option>
                {series.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {exportType === 'book' && exportLevel !== 'all' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('admin.backupRestore.exportModal.selectBook')}
              </label>
              <select
                value={exportItemId}
                onChange={(e) => setExportItemId(e.target.value)}
                disabled={isExporting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- {t('admin.backupRestore.exportModal.selectBook')} --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
          )}

          {exportType === 'chapter' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.selectBook')}
                </label>
                <select
                  value={exportItemId.split('_')[0] || ''}
                  onChange={(e) => {
                    const bookId = e.target.value;
                    setExportItemId(bookId);
                  }}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectBook')} --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              {exportItemId && chapters[exportItemId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectChapter')}
                  </label>
                  <select
                    value={exportItemId.includes('_') ? exportItemId.split('_')[1] : ''}
                    onChange={(e) => {
                      const chapterId = e.target.value;
                      setExportItemId(`${exportItemId.split('_')[0]}_${chapterId}`);
                    }}
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- {t('admin.backupRestore.exportModal.selectChapter')} --</option>
                    {chapters[exportItemId.split('_')[0]]?.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {exportType === 'lesson' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.selectBook')}
                </label>
                <select
                  value={exportItemId.split('_')[0] || ''}
                  onChange={(e) => {
                    const bookId = e.target.value;
                    setExportItemId(bookId);
                  }}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectBook')} --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              {exportItemId && chapters[exportItemId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectChapter')}
                  </label>
                    <select
                      value={exportItemId.includes('_') ? exportItemId.split('_')[1] : ''}
                      onChange={(e) => {
                        const chapterId = e.target.value;
                        setExportItemId(`${exportItemId.split('_')[0]}_${chapterId}`);
                      }}
                      disabled={isExporting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                    >
                      <option value="">-- {t('admin.backupRestore.exportModal.selectChapter')} --</option>
                      {chapters[exportItemId.split('_')[0]]?.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                </div>
              )}
              {exportItemId && exportItemId.includes('_') && lessons[exportItemId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectLesson')}
                  </label>
                  <select
                    value={exportItemId.includes('_') && exportItemId.split('_').length === 3 ? exportItemId.split('_')[2] : ''}
                    onChange={(e) => {
                      const lessonId = e.target.value;
                      const [bookId, chapterId] = exportItemId.split('_');
                      setExportItemId(`${bookId}_${chapterId}_${lessonId}`);
                    }}
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- {t('admin.backupRestore.exportModal.selectLesson')} --</option>
                    {lessons[exportItemId]?.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {exportType === 'quiz' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.selectBook')}
                </label>
                <select
                  value={exportItemId.split('_')[0] || ''}
                  onChange={(e) => {
                    const bookId = e.target.value;
                    setExportItemId(bookId);
                  }}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectBook')} --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              {exportItemId && chapters[exportItemId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectChapter')}
                  </label>
                  <select
                    value={exportItemId.includes('_') ? exportItemId.split('_')[1] : ''}
                    onChange={(e) => {
                      const chapterId = e.target.value;
                      setExportItemId(`${exportItemId.split('_')[0]}_${chapterId}`);
                    }}
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                  >
                    <option value="">-- {t('admin.backupRestore.exportModal.selectChapter')} --</option>
                    {chapters[exportItemId.split('_')[0]]?.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              )}
              {exportItemId && exportItemId.includes('_') && lessons[exportItemId] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectLesson')}
                  </label>
                  <select
                    value={exportItemId.includes('_') && exportItemId.split('_').length >= 2 ? exportItemId.split('_')[1] : ''}
                    onChange={(e) => {
                      const lessonId = e.target.value;
                      const [bookId, chapterId] = exportItemId.split('_');
                      setExportItemId(`${bookId}_${chapterId}_${lessonId}`);
                    }}
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                  >
                    <option value="">-- {t('admin.backupRestore.exportModal.selectLesson')} --</option>
                    {lessons[exportItemId]?.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}
              {exportItemId && exportItemId.split('_').length === 3 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.selectQuiz')}
                  </label>
                  <p className="text-sm text-gray-600">
                    {t('admin.backupRestore.exportModal.quizAutoExport')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Exam Export Options */}
          {exportType === 'exam' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-xs text-blue-800 font-semibold mb-1">Hierarchy: Level → Exam</p>
                <p className="text-xs text-blue-700">Đang export: <span className="font-semibold">{exportLevel.toUpperCase()}</span> → Chọn Exam</p>
                <p className="text-xs text-blue-600 mt-1">Exams loaded: {exams.length}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.selectExam')}
                </label>
                <select
                  value={exportItemId}
                  onChange={(e) => {
                    setExportItemId(e.target.value);
                    console.log(`📝 Selected exam: ${e.target.value}`);
                  }}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectExam')} --</option>
                  {exams.length === 0 ? (
                    <option disabled>{t('admin.backupRestore.exportModal.loadingExams')}</option>
                  ) : (
                    exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title} ({exam.date})
                      </option>
                    ))
                  )}
                </select>
                {exportItemId && (
                  <p className="mt-2 text-xs text-gray-500">
                    {t('admin.backupRestore.exportModal.exportFullExam')}
                  </p>
                )}
                {exams.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    {t('admin.backupRestore.exportModal.noExamInLevel', { level: exportLevel.toUpperCase() })}
                  </p>
                )}
              </div>
            </div>
          )}

          {exportType === 'exam-year' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-xs text-blue-800 font-semibold mb-1">{t('admin.backupRestore.exportModal.hierarchyLevelYear')}</p>
                <p className="text-xs text-blue-700">{t('admin.backupRestore.exportModal.exportingLevel')}: <span className="font-semibold">{exportLevel.toUpperCase()}</span> → {t('admin.backupRestore.exportModal.selectYear')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.selectYear')}
                </label>
                <select
                  value={exportItemId}
                  onChange={(e) => setExportItemId(e.target.value)}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectYear')} --</option>
                  {years.length === 0 ? (
                    <option disabled>{t('admin.backupRestore.exportModal.noExamsInLevel')}</option>
                  ) : (
                    years.map(year => {
                      const yearExams = exams.filter(e => e.id.startsWith(year));
                      return (
                        <option key={year} value={year}>
                          {year} ({yearExams.length} exams: {yearExams.map(e => e.date).join(', ')})
                        </option>
                      );
                    })
                  )}
                </select>
                {exportItemId && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-700 font-semibold mb-1">
                      {t('admin.backupRestore.exportModal.willExportExams', { count: exams.filter(e => e.id.startsWith(exportItemId)).length, year: exportItemId })}:
                    </p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {exams.filter(e => e.id.startsWith(exportItemId)).map(exam => (
                        <li key={exam.id}>{exam.title} ({exam.date})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {exportType === 'exam-section' && exportLevel !== 'all' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-xs text-blue-800 font-semibold mb-1">{t('admin.backupRestore.exportModal.hierarchyLevelExamSection')}</p>
                <p className="text-xs text-blue-700">{t('admin.backupRestore.exportModal.exportingLevel')}: <span className="font-semibold">{exportLevel.toUpperCase()}</span> → {t('admin.backupRestore.exportModal.selectExam')} → {t('admin.backupRestore.exportModal.selectSection')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('admin.backupRestore.exportModal.step1SelectExam')}
                </label>
                <select
                  value={exportItemId.split('_')[0] || ''}
                  onChange={(e) => {
                    const examId = e.target.value;
                    setExportItemId(examId);
                  }}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                >
                  <option value="">-- {t('admin.backupRestore.exportModal.selectExam')} --</option>
                  {exams.length === 0 ? (
                    <option disabled>{t('admin.backupRestore.exportModal.noExamsInLevel')}</option>
                  ) : (
                    exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title} ({exam.date})
                      </option>
                    ))
                  )}
                </select>
              </div>
              {exportItemId && !exportItemId.includes('_') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin.backupRestore.exportModal.step2SelectSection')}
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const sectionType = e.target.value;
                      const examId = exportItemId;
                      setExportItemId(`${examId}_${sectionType}`);
                    }}
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- {t('admin.backupRestore.exportModal.selectExamSection')} --</option>
                    <option value="knowledge">Knowledge (Kiến thức - 言語知識・読解)</option>
                    <option value="listening">Listening (Nghe - 聴解)</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    {t('admin.backupRestore.exportModal.exportOnlySection')}
                  </p>
                </div>
              )}
              {exportItemId && exportItemId.includes('_') && (
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800 font-semibold">
                    {t('admin.backupRestore.exportModal.selectedExam')}: {exams.find(e => e.id === exportItemId.split('_')[0])?.title || exportItemId.split('_')[0]} 
                    {' → '}
                    {exportItemId.split('_')[1] === 'knowledge' ? 'Knowledge' : 'Listening'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowExportModal(false);
                setExportLevel('all');
                setExportType('level');
                setExportItemId('');
              }}
              disabled={isExporting}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {t('admin.backupRestore.exportModal.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (exportType !== 'level' && !exportItemId)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center gap-2"
            >
              {isExporting ? (
                <span>{t('admin.backupRestore.exportModal.exporting')}</span>
              ) : (
                <span>{t('admin.backupRestore.exportModal.exportButton')}</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            if (!isImporting) {
              setShowImportModal(false);
              setImportFile(null);
              setImportError(null);
              setImportLevel('all');
            }
          }}
          title={t('admin.backupRestore.importModal.title')}
          maxWidth="42rem"
        >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-semibold">
              {t('admin.backupRestore.importModal.warning')}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              {t('admin.backupRestore.importModal.warningDesc')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.backupRestore.importModal.selectLevelLabel')}
            </label>
            <select
              value={importLevel}
              onChange={(e) => setImportLevel(e.target.value)}
              disabled={isImporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
            >
              <option value="all">{t('admin.backupRestore.importModal.allLevels')}</option>
              <option value="n1">{t('admin.backupRestore.importModal.levelN1')}</option>
              <option value="n2">{t('admin.backupRestore.importModal.levelN2')}</option>
              <option value="n3">{t('admin.backupRestore.importModal.levelN3')}</option>
              <option value="n4">{t('admin.backupRestore.importModal.levelN4')}</option>
              <option value="n5">{t('admin.backupRestore.importModal.levelN5')}</option>
            </select>
            <p className="text-xs text-gray-500 mb-3">
              {importLevel === 'all' 
                ? t('admin.backupRestore.importModal.importAllDesc')
                : t('admin.backupRestore.importModal.importLevelDesc', { level: importLevel.toUpperCase() })
              }
            </p>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('admin.backupRestore.importModal.selectFileLabel')}
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json,application/json"
                id="import-json-file-input"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => document.getElementById('import-json-file-input')?.click()}
                  disabled={isImporting}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.backupRestore.importModal.chooseFile')}
                </button>
                <span className="text-sm text-gray-600 flex-1">
                  {importFile ? importFile.name : t('admin.backupRestore.importModal.noFileChosen')}
                </span>
              </div>
            </div>
            {importFile && (
              <p className="mt-2 text-sm text-gray-600">
                {t('admin.backupRestore.importModal.fileSelected')}: <span className="font-semibold">{importFile.name}</span> ({(importFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {importError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-800">{importError}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportError(null);
                setImportLevel('all');
              }}
              disabled={isImporting}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {t('admin.backupRestore.importModal.cancel')}
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center gap-2"
            >
              {isImporting ? (
                <span>{t('admin.backupRestore.importModal.importing')}</span>
              ) : (
                <span>{t('admin.backupRestore.importModal.importButton')}</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}

export default ExportImportPage;

