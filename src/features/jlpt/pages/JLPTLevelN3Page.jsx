// trang đề n3
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Breadcrumbs from '../../../components/Breadcrumbs.jsx';
import { jlptExams, jlptLevelInfo } from '../../../data/jlpt/jlptData.js';
import storageManager from '../../../utils/localStorageManager.js';
import UpcomingExamModal from '../../../components/UpcomingExamModal.jsx';
import { useLanguage } from '../../../contexts/LanguageContext.jsx';
// ✅ PHASE 2: Import memoized ExamCard component
import ExamCard from '../components/ExamCard.jsx';

const examsPerPage = 10;

const STATUS_BADGE_STYLES = {
    upcoming: 'bg-blue-500 text-white',
    finished: 'bg-gray-100 text-gray-600',
    available: 'bg-green-500 text-white'
};

const STATUS_KEYWORDS = {
    upcoming: ['sắp diễn ra', 'upcoming', 'coming soon', 'soon', 'đang chuẩn bị', '準備中', 'まもなく', 'sắp diễn'],
    finished: ['đã kết thúc', 'kết thúc', 'finished', 'ended', 'closed', 'over', '終了', '完了'],
    available: ['có sẵn', 'available', 'open', 'ready', 'mở', '利用可', '利用可能']
};

const getStatusType = (status = '') => {
    const normalized = status?.toString().trim().toLowerCase();
    if (!normalized) return 'available';

    if (STATUS_KEYWORDS.upcoming.some(keyword => normalized.includes(keyword))) {
        return 'upcoming';
    }
    if (STATUS_KEYWORDS.finished.some(keyword => normalized.includes(keyword))) {
        return 'finished';
    }
    if (STATUS_KEYWORDS.available.some(keyword => normalized.includes(keyword))) {
        return 'available';
    }
    return 'available';
};

// ✅ PHASE 2: ExamCard đã được extract và memoized trong ExamCard.jsx

function JLPTLevelN3Page() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // State cho Modal "Sắp diễn ra"
    const [showUpcomingModal, setShowUpcomingModal] = useState(false);

    // ✅ UPDATED: Load exams from IndexedDB/localStorage (admin added exams) or default data
    const [jlptN3Exams, setJlptN3Exams] = useState([]);

    // ✅ FIX: Helper function để extract năm từ exam ID hoặc date
    const extractYear = (exam) => {
        // Thử extract từ ID (format: YYYY-MM hoặc YYYY-MM-DD)
        const idMatch = exam.id?.match(/^(\d{4})/);
        if (idMatch) return parseInt(idMatch[1]);

        // Thử extract từ date (format: YYYY/MM hoặc YYYY-MM)
        const dateMatch = exam.date?.match(/^(\d{4})/);
        if (dateMatch) return parseInt(dateMatch[1]);

        // Fallback: return 0 để đẩy xuống cuối
        return 0;
    };

    // ✅ FIX: Sort exams theo năm mới nhất trước
    const sortExamsByYear = (examsList) => {
        return [...examsList].sort((a, b) => {
            const yearA = extractYear(a);
            const yearB = extractYear(b);

            // Nếu cùng năm, sort theo ID (mới nhất trước)
            if (yearA === yearB) {
                return b.id.localeCompare(a.id);
            }

            // Năm mới nhất trước
            return yearB - yearA;
        });
    };

    useEffect(() => {
        const loadExams = async () => {
            // ✅ Load from IndexedDB/localStorage first (via storageManager)
            const savedExams = await storageManager.getExams('n3');
            // ✅ Load from static file as well
            const defaultExams = jlptExams.n3 || [];

            // ✅ FIX: Merge exams from storage and static file, remove duplicates by ID
            const examMap = new Map();

            // Add static exams first (as base)
            defaultExams.forEach(exam => {
                examMap.set(exam.id, exam);
            });

            // Add/override with saved exams (admin created exams take priority)
            if (savedExams && savedExams.length > 0) {
                savedExams.forEach(exam => {
                    examMap.set(exam.id, exam);
                });
            }

            // Convert map to array and sort
            const mergedExams = Array.from(examMap.values());
            setJlptN3Exams(sortExamsByYear(mergedExams));
            console.log(`✅ Loaded ${mergedExams.length} exams (${savedExams?.length || 0} from storage + ${defaultExams.length} from static file) for N3 (sorted by year)`);
        };

        loadExams();
    }, []);

    // ✅ PHASE 2: Memoize pagination calculations
    const paginationData = useMemo(() => {
        const startIndex = (currentPage - 1) * examsPerPage;
        const endIndex = startIndex + examsPerPage;
        const currentExams = jlptN3Exams.slice(startIndex, endIndex);
        const totalPages = Math.ceil(jlptN3Exams.length / examsPerPage);
        return { startIndex, endIndex, currentExams, totalPages };
    }, [jlptN3Exams, currentPage]);

    const { currentExams, totalPages } = paginationData;

    // ✅ PHASE 2: Memoize helper functions
    const getMemeImage = useCallback((indexInPage) => {
        const memeNumber = String((indexInPage % 10) + 1).padStart(2, '0');
        return `/jlpt/meme/${memeNumber}.png`;
    }, []);

    const getStatusDisplay = useCallback((status) => {
        const statusType = getStatusType(status);
        const statusLabel = t(`jlpt.status.${statusType}`) || status || '';
        return { statusType, statusLabel };
    }, [t]);

    // ✅ PHASE 2: Memoize render function
    const renderExamCard = useCallback((exam, index) => {
        const { statusType, statusLabel } = getStatusDisplay(exam.status);
        return (
            <ExamCard
                title={exam.title}
                date={exam.date}
                statusType={statusType}
                statusLabel={statusLabel}
                memeImage={getMemeImage(index)}
            />
        );
    }, [getStatusDisplay, getMemeImage]);

    // ✅ PHASE 2: Memoize event handlers
    const handleExamClick = useCallback((examId) => {
        const exam = jlptN3Exams.find(e => e.id === examId);

        if (exam && getStatusType(exam.status) === 'upcoming') {
            setShowUpcomingModal(true);
            return;
        }

        navigate(`/jlpt/n3/${examId}`);
    }, [jlptN3Exams, navigate]);

    const handlePageChange = useCallback((newPage) => {
        setIsTransitioning(true);
        setCurrentPage(newPage);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 150);
    }, []);

    // ✅ PHASE 2: Memoize breadcrumb paths
    const breadcrumbPaths = useMemo(() => [
        { name: t('common.home') || 'Home', link: '/' },
        { name: t('common.jlpt') || 'JLPT', link: '/jlpt' },
        { name: t('jlpt.n3Title') || 'N3', link: '/jlpt/n3' }
    ], [t]);

    // ✅ PHASE 2: Memoize grid items
    const gridItems = useMemo(() => {
        return Array.from({ length: examsPerPage }, (_, i) => currentExams[i] || null);
    }, [currentExams]);

    const GridPagination = ({ total, current, onChange }) => {
        // Logic để tạo page numbers với ellipsis
        const getPageNumbers = () => {
            const pages = [];

            if (total <= 5) {
                // Nếu ít hơn 5 trang, hiển thị tất cả
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                // Luôn hiển thị trang 1
                pages.push(1);

                if (current > 3) {
                    pages.push('...');
                }

                // Hiển thị trang hiện tại và các trang xung quanh
                const start = Math.max(2, current - 1);
                const end = Math.min(total - 1, current + 1);

                for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) {
                        pages.push(i);
                    }
                }

                if (current < total - 2) {
                    pages.push('...');
                }

                // Luôn hiển thị trang cuối
                if (!pages.includes(total)) {
                    pages.push(total);
                }
            }

            return pages;
        };

        const pageNumbers = getPageNumbers();

        return totalPages > 1 && (
            <div className="flex justify-end items-center gap-2">
                <button
                    onClick={() => onChange(Math.max(1, current - 1))}
                    className="min-w-[100px] h-[40px] px-4 py-2 border-[3px] border-black bg-white rounded-md text-sm text-black font-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center"
                    disabled={current === 1}
                    aria-label="Previous page"
                >&lt;&lt; {t('pagination.previous')}</button>

                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="min-w-[40px] h-[40px] px-3 py-2 flex items-center justify-center text-black font-black"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onChange(page)}
                            className={`min-w-[40px] h-[40px] px-3 py-2 border-[3px] rounded-md text-sm transition-all duration-200 font-black flex items-center justify-center ${current === page
                                ? 'border-black bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                : 'border-black bg-white text-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                            aria-label={`Page ${page}`}
                            aria-current={current === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onChange(Math.min(total, current + 1))}
                    className="min-w-[100px] h-[40px] px-4 py-2 border-[3px] border-black bg-white rounded-md text-sm text-black font-black hover:bg-yellow-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center"
                    disabled={current === total}
                    aria-label="Next page"
                >{t('pagination.next')} &gt;&gt;</button>
            </div>
        );
    };


    return (
        <div className="w-full pr-0 md:pr-4">
            {/* ✅ Modal "Sắp diễn ra" - NEO BRUTALISM */}
            <UpcomingExamModal
                isOpen={showUpcomingModal}
                onClose={() => setShowUpcomingModal(false)}
            />

            <div className="flex flex-col md:flex-row gap-0 md:gap-6 items-start mt-4">

                <Sidebar />

                <div className="flex-1 min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full md:sticky md:top-24 md:h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)] md:overflow-hidden">
                    {/* Breadcrumbs - Fixed at top */}
                    <div className="pt-3 px-3 sm:px-4 md:pt-4 md:px-6 pb-2 flex-shrink-0">
                        <Breadcrumbs paths={breadcrumbPaths} />
                    </div>

                    {/* Fixed content area - No scroll */}
                    <div className="flex-1 md:overflow-hidden overflow-y-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        {jlptN3Exams.length === 0 ? (
                            // Empty state
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-lg font-medium">{t('jlpt.emptyState.title')}</p>
                                <p className="text-sm mt-2">{t('jlpt.emptyState.subtitle')}</p>
                            </div>
                        ) : (
                            <div
                                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 h-full transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'
                                    }`}
                            >
                                {gridItems.map((exam, index) => (
                                    <div key={exam?.id || `empty-${index}`} className="h-full">
                                        {exam ? (
                                            <div
                                                onClick={() => handleExamClick(exam.id)}
                                                className="cursor-pointer w-full h-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                                                role="button"
                                                tabIndex={0}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        handleExamClick(exam.id);
                                                    }
                                                }}
                                                aria-label={t('jlpt.openExam', { title: exam.title }) || `Open ${exam.title}`}
                                            >
                                                {renderExamCard(exam, index)}
                                            </div>
                                        ) : (
                                            <div className="w-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination - Fixed at bottom */}
                    <div className="px-6 py-4 border-t border-gray-300">
                        <GridPagination
                            total={totalPages}
                            current={currentPage}
                            onChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JLPTLevelN3Page;
