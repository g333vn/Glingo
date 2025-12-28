// src/features/jlpt/pages/ExamAnswersPage.jsx
// ✅ UPDATED: Thêm tính năng tra từ điển

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { getExamById } from '../../../data/jlpt/jlptData.js';
import { getExamQuestions } from '../../../data/jlpt/examQuestionsData.js';
import { getListeningQuestions } from '../../../data/jlpt/listeningQuestionsData.js';
import storageManager from '../../../utils/localStorageManager.js';
import ReactModal from 'react-modal';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

// ✅ NEW: Import dictionary components
import { DictionaryButton, DictionaryPopup, useDictionaryDoubleClick } from '../../../components/api_translate/index.js';

ReactModal.setAppElement('#root');

// Quick Answer Key component
const QuickAnswerKey = ({ knowledgeQuestions, listeningQuestions, knowledgeAnswers, listeningAnswers }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();

  const indexToLetter = (index) => {
    const letters = ['A', 'B', 'C', 'D'];
    return letters[index] || '?';
  };

  const AnswerItem = ({ questionId, correctAnswer, userAnswer }) => {
    const isCorrect = userAnswer === correctAnswer;
    const userLetter = userAnswer !== undefined ? indexToLetter(userAnswer) : '-';
    const correctLetter = indexToLetter(correctAnswer);

    return (
      <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
        userAnswer === undefined 
          ? 'bg-gray-200 text-gray-600'
          : isCorrect 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {questionId}-{userLetter}
        {!isCorrect && userAnswer !== undefined && (
          <span className="text-xs ml-1">({correctLetter})</span>
        )}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 sm:mb-5 md:mb-6 overflow-hidden flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-500 text-white px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between border-b-[3px] border-black hover:bg-[#FF5722] transition-all duration-200 font-black uppercase tracking-wide text-sm sm:text-base"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="text-left">
            <h2 className="text-xl font-bold">{t('jlpt.answersPage.quickKeyTitle')}</h2>
            <p className="text-sm opacity-90">{t('jlpt.answersPage.quickKeySubtitle')}</p>
          </div>
        </div>
        <svg 
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 md:p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Part 1: Knowledge/Reading */}
            <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-blue-700 flex items-center gap-2 flex-wrap">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase">
                  {t('jlpt.answersPage.part1Label')}
                </span>
                {t('jlpt.answersPage.part1Title')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {knowledgeQuestions.map((q) => (
                  <AnswerItem
                    key={q.id}
                    questionId={q.id}
                    correctAnswer={q.correctAnswer}
                    userAnswer={knowledgeAnswers[q.id]}
                  />
                ))}
              </div>
            </div>

            {/* Part 2: Listening */}
            <div className="bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-purple-700 flex items-center gap-2 flex-wrap">
                <span className="bg-purple-500 text-white px-2 py-1 rounded-md border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase">
                  {t('jlpt.answersPage.part2Label')}
                </span>
                {t('jlpt.answersPage.part2Title')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {listeningQuestions.map((q) => {
                  const questionKey = `${q.sectionId}-${q.number}`;
                  return (
                    <AnswerItem
                      key={questionKey}
                      questionId={q.number}
                      correctAnswer={q.correctAnswer}
                      userAnswer={listeningAnswers[questionKey]}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-md border-[2px] border-black bg-green-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1-A</span>
              <span className="text-gray-600">{t('jlpt.answersPage.legendCorrect', { id: '1', option: 'A' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-md border-[2px] border-black bg-red-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2-B (A)</span>
              <span className="text-gray-600">{t('jlpt.answersPage.legendWrong', { id: '2', option: 'B', answer: 'A' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-md border-[2px] border-black bg-gray-300 text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3--</span>
              <span className="text-gray-600">{t('jlpt.answersPage.legendUnanswered', { id: '3' })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component hiển thị một câu hỏi với đáp án
const AnswerCard = ({ question, userAnswer, index, section }) => {
  // ✅ UPDATED: Ref cho TOÀN BỘ card để tra từ mọi nơi (sau khi xem đáp án)
  const cardRef = useRef(null);
  useDictionaryDoubleClick(cardRef);
  const { t } = useLanguage();

  const isCorrect = userAnswer === question.correctAnswer;
  const isListening = section === 'listening';
  
  return (
    // ✅ UPDATED: Wrap toàn bộ card với ref và select-text
    <div 
      ref={cardRef}
      className={`bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 select-text flex-shrink-0 ${
        isCorrect ? 'border-green-500' : 'border-red-500'
      }`}
    >
      {/* Header với số câu và trạng thái */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-white text-sm sm:text-base md:text-lg border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {index}
          </div>
          <span className="text-gray-600 text-sm">
            {isListening
              ? t('jlpt.answersPage.listeningQuestionLabel', { number: question.number, sub: question.subNumber || question.number })
              : t('jlpt.answersPage.knowledgeQuestionLabel', { number: question.id })}
          </span>
        </div>
        <div className={`px-4 py-1 rounded-md border-[2px] border-black text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isCorrect ? t('jlpt.answersPage.statusCorrect') : t('jlpt.answersPage.statusIncorrect')}
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="mb-4">
        {question.passage && (
          <div className="bg-gray-50 p-4 rounded mb-3 text-sm leading-relaxed">
            {question.passage}
          </div>
        )}
        <div 
          className="text-base sm:text-lg font-semibold mb-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: question.question || question.instruction }}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
          }}
        />
        {question.text && (
          <div className="text-base mb-3 prose prose-sm max-w-none">
            {question.underline ? (
              <span>
                {question.text.split(question.underline)[0]}
                <span className="underline decoration-2 decoration-gray-600 font-bold">
                  {question.underline}
                </span>
                {question.text.split(question.underline)[1]}
              </span>
            ) : (
              <span 
                dangerouslySetInnerHTML={{ __html: question.text }}
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Đáp án */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, idx) => {
          const isUserChoice = userAnswer === idx;
          const isCorrectAnswer = question.correctAnswer === idx;
          
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 ${
                isCorrectAnswer
                  ? 'border-green-500 bg-green-50'
                  : isUserChoice
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCorrectAnswer
                    ? 'bg-green-500 text-white'
                    : isUserChoice
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <span className={`${
                  isCorrectAnswer || isUserChoice ? 'font-semibold' : ''
                }`}>
                  {option}
                </span>
                {isCorrectAnswer && (
                  <span className="ml-auto text-green-600 font-bold">{t('jlpt.answersPage.statusCorrect')}</span>
                )}
                {isUserChoice && !isCorrectAnswer && (
                  <span className="ml-auto text-red-600 font-bold">{t('jlpt.answersPage.userAnswerLabel')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ UPDATED: Giải thích không cần ref riêng nữa, đã có ref toàn card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-blue-800">{t('jlpt.answersPage.explanationLabel')}</span>
        </div>
        <div 
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: question.explanation || t('jlpt.answersPage.explanationMissing') }}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap' // ✅ FIX: Preserve line breaks from <br/> tags
          }}
        />
      </div>
    </div>
  );
};

// Component thống kê tổng quan
const ScoreSummary = ({ knowledgeScore, listeningScore, totalQuestions, correctAnswers }) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const { t } = useLanguage();
  
  return (
    <div className="bg-blue-500 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 text-white flex-shrink-0">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('jlpt.answersPage.scoreHeading')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white/20 rounded-lg border-[2px] border-white/30 p-3 sm:p-4 backdrop-blur-sm">
          <div className="text-xs sm:text-sm opacity-90 mb-1">{t('jlpt.answersPage.scoreCorrect')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">{correctAnswers}/{totalQuestions}</div>
        </div>
        <div className="bg-white/20 rounded-lg border-[2px] border-white/30 p-3 sm:p-4 backdrop-blur-sm">
          <div className="text-xs sm:text-sm opacity-90 mb-1">{t('jlpt.answersPage.scoreAccuracy')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">{percentage}%</div>
        </div>
        <div className="bg-white/20 rounded-lg border-[2px] border-white/30 p-3 sm:p-4 backdrop-blur-sm">
          <div className="text-xs sm:text-sm opacity-90 mb-1">{t('jlpt.answersPage.scoreKnowledge')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">
            {t('jlpt.answersPage.scoreValue', { score: knowledgeScore })}
          </div>
        </div>
        <div className="bg-white/20 rounded-lg border-[2px] border-white/30 p-3 sm:p-4 backdrop-blur-sm">
          <div className="text-xs sm:text-sm opacity-90 mb-1">{t('jlpt.answersPage.scoreListening')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">
            {t('jlpt.answersPage.scoreValue', { score: listeningScore })}
          </div>
        </div>
      </div>
    </div>
  );
};

function ExamAnswersPage() {
  const { levelId, examId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // ✅ UPDATED: Load exam data từ storage trước, fallback về static file
  const [currentExam, setCurrentExam] = useState(null);
  const [knowledgeData, setKnowledgeData] = useState(null);
  const [listeningData, setListeningData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [knowledgeAnswers, setKnowledgeAnswers] = useState({});
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState('');

  // ✅ UPDATED: Load exam data từ storage hoặc static file
  useEffect(() => {
    const loadExamData = async () => {
      setIsLoading(true);
      try {
        // 1. Thử load từ storage trước (admin created exams)
        const savedExam = await storageManager.getExam(levelId, examId);
        
        if (savedExam) {
          // Có dữ liệu trong storage
          console.log('✅ ExamAnswersPage: Loaded exam from storage:', savedExam);
          
          // Extract exam metadata từ savedExam
          const examMetadata = {
            id: examId,
            title: savedExam.title || `JLPT ${examId}`,
            date: savedExam.date || examId,
            status: savedExam.status || 'Có sẵn',
            imageUrl: savedExam.imageUrl || `/jlpt/${levelId}/${examId}.jpg`,
            level: savedExam.level || levelId
          };
          
          setCurrentExam(examMetadata);
          
          // ✅ FIX: Transform knowledge data (bao gồm cả reading sections)
          if (savedExam.knowledge && savedExam.knowledge.sections) {
            // ✅ Kết hợp knowledge và reading sections (theo format JLPT: 言語知識・読解)
            const knowledgeSections = savedExam.knowledge.sections || [];
            const readingSections = savedExam.reading?.sections || [];
            
            // ✅ FIX: Ensure sections have proper title and instruction format + Clean HTML artifacts
            const cleanHTML = (html) => {
              if (!html || typeof html !== 'string') return html || '';
              // Remove HTML comment tags (StartFragment, EndFragment, etc.)
              return html
                .replace(/<!--\s*StartFragment\s*-->/gi, '')
                .replace(/<!--\s*EndFragment\s*-->/gi, '')
                .replace(/<!--[^>]*-->/g, '') // Remove all HTML comments
                .trim();
            };
            
            const normalizeSection = (section) => {
              // Clean HTML artifacts from title and instruction
              let cleanTitle = cleanHTML(section.title || '');
              let cleanInstruction = cleanHTML(section.instruction || '');
              
              // If instruction contains both title and instruction (combined format)
              // Try to detect and split if needed
              if (cleanInstruction && !cleanTitle && cleanInstruction.includes('\n\n')) {
                const lines = cleanInstruction.split('\n');
                const firstLine = lines[0]?.trim() || '';
                const rest = lines.slice(1).join('\n').trim();
                if (firstLine && rest) {
                  return {
                    ...section,
                    title: firstLine,
                    instruction: rest
                  };
                }
              }
              // If title contains instruction (backward compatibility)
              if (cleanTitle && !cleanInstruction && cleanTitle.includes('\n\n')) {
                const lines = cleanTitle.split('\n');
                const firstLine = lines[0]?.trim() || '';
                const rest = lines.slice(1).join('\n').trim();
                if (firstLine && rest) {
                  return {
                    ...section,
                    title: firstLine,
                    instruction: rest
                  };
                }
              }
              // Return with cleaned values
              return {
                ...section,
                title: cleanTitle || section.title,
                instruction: cleanInstruction || section.instruction
              };
            };
            
            const normalizedKnowledgeSections = knowledgeSections.map(normalizeSection);
            const normalizedReadingSections = readingSections.map(normalizeSection);
            const combinedSections = [...normalizedKnowledgeSections, ...normalizedReadingSections];
            
            console.log('📊 ExamAnswersPage: Loading sections:', {
              knowledgeSectionsCount: knowledgeSections.length,
              readingSectionsCount: readingSections.length,
              totalSections: combinedSections.length,
              knowledgeQuestions: knowledgeSections.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
              readingQuestions: readingSections.reduce((acc, s) => acc + (s.questions?.length || 0), 0)
            });
            
            setKnowledgeData({
              knowledge: {
                sections: combinedSections // ✅ Kết hợp cả 2 loại sections
              }
            });
          }
          
          // Transform listening data
          if (savedExam.listening && savedExam.listening.sections) {
            // ✅ FIX: Normalize section title and instruction + Clean HTML artifacts
            const cleanHTML = (html) => {
              if (!html || typeof html !== 'string') return html || '';
              // Remove HTML comment tags (StartFragment, EndFragment, etc.)
              return html
                .replace(/<!--\s*StartFragment\s*-->/gi, '')
                .replace(/<!--\s*EndFragment\s*-->/gi, '')
                .replace(/<!--[^>]*-->/g, '') // Remove all HTML comments
                .trim();
            };
            
            const normalizeSection = (section) => {
              // Clean HTML artifacts from title and instruction
              let cleanTitle = cleanHTML(section.title || '');
              let cleanInstruction = cleanHTML(section.instruction || '');
              
              // If instruction contains both title and instruction (combined format)
              if (cleanInstruction && !cleanTitle && cleanInstruction.includes('\n\n')) {
                const lines = cleanInstruction.split('\n');
                const firstLine = lines[0]?.trim() || '';
                const rest = lines.slice(1).join('\n').trim();
                if (firstLine && rest) {
                  return {
                    ...section,
                    title: firstLine,
                    instruction: rest
                  };
                }
              }
              // If title contains instruction (backward compatibility)
              if (cleanTitle && !cleanInstruction && cleanTitle.includes('\n\n')) {
                const lines = cleanTitle.split('\n');
                const firstLine = lines[0]?.trim() || '';
                const rest = lines.slice(1).join('\n').trim();
                if (firstLine && rest) {
                  return {
                    ...section,
                    title: firstLine,
                    instruction: rest
                  };
                }
              }
              // Return with cleaned values
              return {
                ...section,
                title: cleanTitle || section.title,
                instruction: cleanInstruction || section.instruction
              };
            };
            
            setListeningData({
              sections: savedExam.listening.sections.map(section => {
                const normalized = normalizeSection(section);
                return {
                  id: normalized.id,
                  title: normalized.title,
                  instruction: normalized.instruction || '',
                  timeLimit: normalized.timeLimit || 0,
                  questions: (normalized.questions || []).map(q => ({
                    number: q.number || String(q.id).padStart(2, '0'),
                    subNumber: q.subNumber || q.id,
                    category: q.category || 'listening',
                    audioUrl: q.audioUrl || '',
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || ''
                  }))
                };
              })
            });
          }
        } else {
          // 2. Fallback về static file
          console.log('📁 ExamAnswersPage: Loading exam from static file...');
          const staticExam = getExamById(levelId, examId);
          const staticKnowledgeData = getExamQuestions(levelId, examId);
          const staticListeningData = getListeningQuestions(levelId, examId);
          
          if (staticExam && staticKnowledgeData && staticListeningData) {
            setCurrentExam(staticExam);
            setKnowledgeData(staticKnowledgeData);
            setListeningData(staticListeningData);
          } else {
            // Không tìm thấy ở cả 2 nơi
            setCurrentExam(null);
            setKnowledgeData(null);
            setListeningData(null);
          }
        }
      } catch (error) {
        console.error('❌ ExamAnswersPage: Error loading exam data:', error);
        // Fallback về static file
        const staticExam = getExamById(levelId, examId);
        const staticKnowledgeData = getExamQuestions(levelId, examId);
        const staticListeningData = getListeningQuestions(levelId, examId);
        setCurrentExam(staticExam || null);
        setKnowledgeData(staticKnowledgeData || null);
        setListeningData(staticListeningData || null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExamData();
  }, [levelId, examId]);

  // Load user answers và scores
  useEffect(() => {
    const savedKnowledgeAnswers = localStorage.getItem(`exam-${levelId}-${examId}-knowledge`);
    const savedListeningAnswers = localStorage.getItem(`exam-${levelId}-${examId}-listening`);
    const savedKnowledgeScore = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-score`);
    const savedListeningScore = localStorage.getItem(`exam-${levelId}-${examId}-listening-score`);
    
    if (savedKnowledgeAnswers) setKnowledgeAnswers(JSON.parse(savedKnowledgeAnswers));
    if (savedListeningAnswers) setListeningAnswers(JSON.parse(savedListeningAnswers));
    if (savedKnowledgeScore) setKnowledgeScore(parseInt(savedKnowledgeScore));
    if (savedListeningScore) setListeningScore(parseInt(savedListeningScore));
  }, [levelId, examId]);

  // Loading state
  if (isLoading) {
    return (
      <LoadingSpinner
        label={t('jlpt.commonTexts.loading')}
        icon="📝"
      />
    );
  }

  // Not found state
  if (!currentExam || !knowledgeData || !listeningData) {
    return (
      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden p-4 sm:p-6 md:p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{t('jlpt.commonTexts.notFoundTitle')}</h1>
            <p className="text-gray-600 mb-4">
              {t('jlpt.commonTexts.notFoundDesc', { examId, level: levelId.toUpperCase() })}
            </p>
            <button onClick={() => navigate(`/jlpt/${levelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide">
              {t('jlpt.commonTexts.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Keep sections structure instead of flattening
  const knowledgeSections = knowledgeData.knowledge.sections || [];
  const listeningSections = listeningData.sections || [];
  
  // For backward compatibility, still create flat arrays for quick access
  const knowledgeQuestions = knowledgeSections.flatMap(s => s.questions || []);
  const listeningQuestions = listeningSections.flatMap(s => 
    (s.questions || []).map(q => ({ ...q, sectionId: s.id, sectionTitle: s.title, instruction: s.instruction }))
  );
  const allQuestions = [...knowledgeQuestions, ...listeningQuestions];
  
  // Calculate correct answers
  let correctCount = 0;
  
  knowledgeQuestions.forEach(q => {
    if (knowledgeAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });
  
  listeningQuestions.forEach(q => {
    const key = `${q.sectionId}-${q.number}`;
    if (listeningAnswers[key] === q.correctAnswer) {
      correctCount++;
    }
  });

  const handleNavigateWithConfirm = (path) => {
    setPendingPath(path);
    setShowExitModal(true);
  };

  const handleExitConfirmed = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
      }
    });
    setShowExitModal(false);
    navigate(pendingPath);
  };

  const handleRetakeConfirmed = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`exam-${levelId}-${examId}`)) {
        localStorage.removeItem(key);
      }
    });
    setShowConfirmModal(false);
    navigate(`/jlpt/${levelId}/${examId}`);
  };

  const breadcrumbPaths = [
    { name: t('common.home') || 'Home', onClick: () => handleNavigateWithConfirm('/') },
    { name: t('common.jlpt') || 'JLPT', onClick: () => handleNavigateWithConfirm('/jlpt') },
    { name: levelId.toUpperCase(), onClick: () => handleNavigateWithConfirm(`/jlpt/${levelId}`) },
    { name: currentExam.title, onClick: () => handleNavigateWithConfirm(`/jlpt/${levelId}/${examId}`) },
    { name: t('jlpt.answersPage.breadcrumbResult'), onClick: () => navigate(`/jlpt/${levelId}/${examId}/result`) },
    { name: t('jlpt.answersPage.breadcrumbAnswers') }
  ];

  return (
    <>
      {/* ✅ NEW: Dictionary components */}
      <DictionaryButton />
      <DictionaryPopup />

      <div className="w-full pr-0 md:pr-4">
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">
          <Sidebar />
          
          <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] overflow-hidden">
            <div className="pt-3 sm:pt-4 px-3 sm:px-4 md:p-5 md:px-6 pb-2 sm:pb-3 border-b border-gray-300 flex-shrink-0">
              <Breadcrumbs paths={breadcrumbPaths} />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-2 sm:mt-3 md:mt-4 break-words">
                {`${currentExam.title} ${t('jlpt.answersPage.titleSuffix')}`}
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 md:px-6">
              <div className="max-w-4xl mx-auto">
                <ScoreSummary
                  knowledgeScore={knowledgeScore}
                  listeningScore={listeningScore}
                  totalQuestions={allQuestions.length}
                  correctAnswers={correctCount}
                />

                <QuickAnswerKey
                  knowledgeQuestions={knowledgeQuestions}
                  listeningQuestions={listeningQuestions}
                  knowledgeAnswers={knowledgeAnswers}
                  listeningAnswers={listeningAnswers}
                />

                <div className="mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base">
                      {t('jlpt.answersPage.part1Label')}
                    </span>
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl">{t('jlpt.answersPage.part1Title')}</span>
                  </h2>
                  
                  {/* ✅ NEW: Group questions by section - Display section header once, then all questions */}
                  {knowledgeSections.map((section, sectionIdx) => {
                    const sectionQuestions = section.questions || [];
                    let questionIndexOffset = 0;
                    
                    // Calculate offset: sum of questions in previous sections
                    for (let i = 0; i < sectionIdx; i++) {
                      questionIndexOffset += (knowledgeSections[i].questions?.length || 0);
                    }
                    
                    return (
                      <div key={section.id || sectionIdx} className="mb-6 sm:mb-8">
                        {/* Section Header - Display once */}
                        {(section.title || section.instruction) && (
                          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-4">
                            {section.title && (
                              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                {section.title}
                              </h3>
                            )}
                            {section.instruction && (
                              <p 
                                className={`text-sm sm:text-base text-gray-700 ${section.title ? 'mt-2' : ''}`}
                                dangerouslySetInnerHTML={{ __html: section.instruction }}
                                style={{
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word'
                                }}
                              />
                            )}
                          </div>
                        )}
                        
                        {/* Questions in this section */}
                        {sectionQuestions.map((q, qIdx) => (
                          <AnswerCard
                            key={q.id}
                            question={q}
                            userAnswer={knowledgeAnswers[q.id]}
                            index={questionIndexOffset + qIdx + 1}
                            section="knowledge"
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                    <span className="bg-purple-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base">
                      {t('jlpt.answersPage.part2Label')}
                    </span>
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl">{t('jlpt.answersPage.part2Title')}</span>
                  </h2>
                  
                  {/* ✅ NEW: Group questions by section - Display section header once, then all questions */}
                  {listeningSections.map((section, sectionIdx) => {
                    const sectionQuestions = section.questions || [];
                    let questionIndexOffset = knowledgeQuestions.length;
                    
                    // Calculate offset: sum of questions in previous listening sections
                    for (let i = 0; i < sectionIdx; i++) {
                      questionIndexOffset += (listeningSections[i].questions?.length || 0);
                    }
                    
                    return (
                      <div key={section.id || sectionIdx} className="mb-6 sm:mb-8">
                        {/* Section Header - Display once */}
                        {(section.title || section.instruction) && (
                          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-4">
                            {section.title && (
                              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                {section.title}
                              </h3>
                            )}
                            {section.instruction && (
                              <p 
                                className={`text-sm sm:text-base text-gray-700 ${section.title ? 'mt-2' : ''}`}
                                dangerouslySetInnerHTML={{ __html: section.instruction }}
                                style={{
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word'
                                }}
                              />
                            )}
                          </div>
                        )}
                        
                        {/* Questions in this section */}
                        {sectionQuestions.map((q, qIdx) => {
                          const questionKey = `${section.id}-${q.number}`;
                          return (
                            <AnswerCard
                              key={questionKey}
                              question={q}
                              userAnswer={listeningAnswers[questionKey]}
                              index={questionIndexOffset + qIdx + 1}
                              section="listening"
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8 pb-2 sm:pb-4 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/jlpt/${levelId}/${examId}/result`)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[48px]"
                  >
                    {t('jlpt.answersPage.buttons.backToResults')}
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[48px]"
                  >
                    {t('jlpt.answersPage.buttons.retake')}
                  </button>
                  <button
                    onClick={() => handleNavigateWithConfirm(`/jlpt/${levelId}`)}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[48px]"
                  >
                    {t('jlpt.answersPage.buttons.examList')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận thoát */}
      <ReactModal
        isOpen={showExitModal}
        onRequestClose={() => setShowExitModal(false)}
        shouldCloseOnOverlayClick={true}
        className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md mx-4 md:mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            {t('jlpt.modals.confirmTitle')}
          </h2>
        </div>
        <p className="mb-6 text-gray-800 font-semibold">{t('jlpt.modals.exitMessage')}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowExitModal(false)} 
            className="px-4 py-2 bg-white text-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.cancel')}
          </button>
          <button 
            onClick={handleExitConfirmed} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.confirm')}
          </button>
        </div>
      </ReactModal>

      {/* Modal xác nhận làm lại */}
      <ReactModal
        isOpen={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        shouldCloseOnOverlayClick={true}
        className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md mx-4 md:mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            {t('jlpt.modals.confirmTitle')}
          </h2>
        </div>
        <p className="mb-6 text-gray-800 font-semibold">{t('jlpt.modals.retakeMessage')}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowConfirmModal(false)} 
            className="px-4 py-2 bg-white text-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.cancel')}
          </button>
          <button 
            onClick={handleRetakeConfirmed} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.confirm')}
          </button>
        </div>
      </ReactModal>
    </>
  );
}

export default ExamAnswersPage;
