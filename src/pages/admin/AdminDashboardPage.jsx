// src/pages/admin/AdminDashboardPage.jsx
// ENTERPRISE ANALYTICS & TRACKING DASHBOARD
// NEO BRUTALISM DESIGN

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import storageManager from '../../utils/localStorageManager.js';
import { getUsers } from '../../data/users.js';
import { getAnalyticsData, calculateKPIs, getRetentionData } from '../../utils/analyticsTracker.js';
import KPICard from '../../components/dashboard/KPICard.jsx';
import LineChart from '../../components/dashboard/LineChart.jsx';
import ActivityFeed from '../../components/dashboard/ActivityFeed.jsx';
import InfoTooltip from '../../components/dashboard/InfoTooltip.jsx';

function AdminDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [storageInfo, setStorageInfo] = useState(null);
  const [systemData, setSystemData] = useState({
    users: [],
    books: [],
    exams: [],
    quizzes: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    activities: [],
    progress: [],
    logs: [],
    dailyMetrics: {}
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', '90d'

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Load system data
        const allUsers = getUsers();
        const booksData = localStorage.getItem('books');
        const books = booksData ? JSON.parse(booksData) : [];
        const examsData = localStorage.getItem('examData');
        const exams = examsData ? JSON.parse(examsData) : {};
        const examsList = Object.values(exams).flat();
        
        let quizCount = 0;
        books.forEach(book => {
          if (book.chapters) {
            book.chapters.forEach(chapter => {
              if (chapter.lessons) {
                quizCount += chapter.lessons.length;
              }
            });
          }
        });
        
        setSystemData({
          users: allUsers,
          books,
          exams: examsList,
          quizzes: quizCount
        });
        
        // 2. Load analytics tracking data
        const analytics = getAnalyticsData();
        setAnalyticsData(analytics);
        
        // 3. Load storage info
        const info = await storageManager.getStorageInfo();
        setStorageInfo(info);
        
        console.log('[DASHBOARD] Data loaded:', {
          users: allUsers.length,
          books: books.length,
          exams: examsList.length,
          quizzes: quizCount,
          activities: analytics.activities.length,
          progress: analytics.progress.length
        });
      } catch (error) {
        console.error('[DASHBOARD] Error loading data:', error);
      }
    };
    
    loadAllData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(analyticsData, systemData.users);
  }, [analyticsData, systemData.users]);

  // Calculate retention
  const retention = useMemo(() => {
    return getRetentionData(analyticsData);
  }, [analyticsData]);

  // Prepare user growth chart data (last 30 days)
  const userGrowthData = useMemo(() => {
    const days = 30;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayMetrics = analyticsData.dailyMetrics[dateStr];
      
      data.push({
        label: i === 0 ? 'Today' : i === days - 1 ? `${days}d ago` : i % 5 === 0 ? `${i}d` : '',
        value: dayMetrics ? (Array.isArray(dayMetrics.users) ? dayMetrics.users.length : 0) : 0,
        date: dateStr
      });
    }
    
    return data;
  }, [analyticsData.dailyMetrics]);

  // User role distribution
  const roleDistribution = useMemo(() => {
    return systemData.users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, { admin: 0, editor: 0, user: 0 });
  }, [systemData.users]);

  const quickActions = [
    {
      label: t('adminDashboard.quickActions.createQuiz'),
      icon: '➕',
      path: '/admin/quiz-editor',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: t('adminDashboard.quickActions.createQuizDesc')
    },
    {
      label: t('adminDashboard.quickActions.manageUsers'),
      icon: '👥',
      path: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600',
      description: t('adminDashboard.quickActions.manageUsersDesc')
    },
    {
      label: t('adminDashboard.quickActions.manageLessons'),
      icon: '📚',
      path: '/admin/content',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: t('adminDashboard.quickActions.manageLessonsDesc')
    },
    {
      label: t('adminDashboard.quickActions.manageExams'),
      icon: '📋',
      path: '/admin/exams',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: t('adminDashboard.quickActions.manageExamsDesc')
    }
  ];

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {/* Header with Refresh */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide break-words">
            📊 {t('adminDashboard.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-semibold break-words">
            👋 {t('adminDashboard.welcome', { name: user?.name || user?.username })} {t('adminDashboard.lastUpdated', { time: new Date().toLocaleTimeString('vi-VN') })}
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-sm uppercase flex items-center gap-2 whitespace-nowrap flex-shrink-0"
        >
          <span>🔄</span>
          <span className="hidden sm:inline">{t('adminDashboard.refreshNow')}</span>
        </button>
      </div>

      {/* Getting Started Guide */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-[32px] border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl flex-shrink-0">📖</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-black mb-2 sm:mb-3 uppercase tracking-wide break-words">
                🎓 {t('adminDashboard.gettingStarted.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="min-w-0">
                  <p className="font-black text-black mb-2 break-words">📊 {t('adminDashboard.gettingStarted.mainSections')}</p>
                  <ul className="text-black space-y-1.5 text-xs font-semibold ml-4 list-disc break-words">
                    <li className="break-words"><strong>KPIs:</strong> {t('adminDashboard.gettingStarted.kpis')}</li>
                    <li className="break-words"><strong>System Overview:</strong> {t('adminDashboard.gettingStarted.systemOverview')}</li>
                    <li className="break-words"><strong>User Analytics:</strong> {t('adminDashboard.gettingStarted.userAnalytics')}</li>
                    <li className="break-words"><strong>Learning Analytics:</strong> {t('adminDashboard.gettingStarted.learningAnalytics')}</li>
                  </ul>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-black mb-2 break-words">💡 {t('adminDashboard.gettingStarted.tips')}</p>
                  <ul className="text-black space-y-1.5 text-xs font-semibold ml-4 list-disc break-words">
                    <li className="break-words">{t('adminDashboard.gettingStarted.tip1')}</li>
                    <li className="break-words">{t('adminDashboard.gettingStarted.tip2')}</li>
                    <li className="break-words">{t('adminDashboard.gettingStarted.tip3')}</li>
                    <li className="break-words">{t('adminDashboard.gettingStarted.tip4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 1. KPI DASHBOARD (Top Priority Metrics) ========== */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            🎯 {t('adminDashboard.kpis.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.kpis.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border-[3px] border-blue-400 rounded-lg overflow-hidden">
          <p className="text-xs sm:text-sm font-bold text-blue-900 mb-1.5 sm:mb-2 break-words">
            📖 <strong>{t('adminDashboard.kpis.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1 ml-4 list-disc break-words">
            <li className="break-words"><strong>DAU/MAU:</strong> {t('adminDashboard.kpis.dauMau')}</li>
            <li className="break-words"><strong>Completion Rate:</strong> {t('adminDashboard.kpis.completionRate')}</li>
            <li className="break-words"><strong>JLPT Pass Rate:</strong> {t('adminDashboard.kpis.jlptPassRate')}</li>
            <li className="break-words"><strong>Avg Session:</strong> {t('adminDashboard.kpis.avgSession')}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
          <KPICard
            title={t('adminDashboard.kpis.dauMauTitle')}
            value={`${kpis.dau} / ${kpis.mau}`}
            subtitle={t('adminDashboard.kpis.engagementRate', { ratio: kpis.dauMauRatio })}
            icon="👥"
            color="green"
            trend={kpis.growthRate}
            trendLabel={t('adminDashboard.kpis.vsLastWeek', { rate: `${kpis.growthRate > 0 ? '+' : ''}${kpis.growthRate}` })}
            onClick={() => navigate('/admin/users')}
            tooltip={t('adminDashboard.kpis.dauMauTooltip')}
          />
          <KPICard
            title={t('adminDashboard.kpis.completionRateTitle')}
            value={`${kpis.completionRate}%`}
            subtitle={t('adminDashboard.kpis.lessonsCompleted', { count: kpis.totalLessons })}
            icon="✅"
            color="blue"
            onClick={() => navigate('/admin/content')}
            tooltip={t('adminDashboard.kpis.completionRateTooltip')}
          />
          <KPICard
            title={t('adminDashboard.kpis.jlptPassRateTitle')}
            value={`${kpis.jlptPassRate}%`}
            subtitle={t('adminDashboard.kpis.examsTaken', { count: kpis.totalExams })}
            icon="🎓"
            color="purple"
            onClick={() => navigate('/admin/exams')}
            tooltip={t('adminDashboard.kpis.jlptPassRateTooltip')}
          />
          <KPICard
            title={t('adminDashboard.kpis.avgSessionTitle')}
            value={`${kpis.avgSessionLength}m`}
            subtitle={t('adminDashboard.kpis.averageSessionLength')}
            icon="⏱️"
            color="orange"
            tooltip={t('adminDashboard.kpis.avgSessionTooltip')}
          />
        </div>
      </div>

      {/* ========== 2. SYSTEM OVERVIEW ========== */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            📈 {t('adminDashboard.systemOverview.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.systemOverview.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-purple-50 border-[3px] border-purple-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
            📖 <strong>{t('adminDashboard.systemOverview.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-purple-800 space-y-1 ml-4 list-disc">
            <li><strong>Total Users:</strong> {t('adminDashboard.systemOverview.totalUsers')}</li>
            <li><strong>Total Lessons:</strong> {t('adminDashboard.systemOverview.totalLessons')}</li>
            <li><strong>JLPT Exams:</strong> {t('adminDashboard.systemOverview.jlptExams')}</li>
            <li><strong>Storage Used:</strong> {t('adminDashboard.systemOverview.storageUsed')}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
          <KPICard
            title={t('adminDashboard.systemOverview.totalUsersTitle')}
            value={systemData.users.length.toString()}
            subtitle={`Admin: ${roleDistribution.admin} | Editor: ${roleDistribution.editor} | User: ${roleDistribution.user}`}
            icon="👥"
            color="green"
            onClick={() => navigate('/admin/users')}
            tooltip={t('adminDashboard.systemOverview.totalUsersTooltip')}
          />
          <KPICard
            title={t('adminDashboard.systemOverview.totalLessonsTitle')}
            value={systemData.quizzes.toString()}
            subtitle={t('adminDashboard.systemOverview.fromBooks', { count: systemData.books.length })}
            icon="📚"
            color="blue"
            onClick={() => navigate('/admin/content')}
            tooltip={t('adminDashboard.systemOverview.totalLessonsTooltip')}
          />
          <KPICard
            title={t('adminDashboard.systemOverview.jlptExamsTitle')}
            value={systemData.exams.length.toString()}
            subtitle={t('adminDashboard.systemOverview.mockTestsAvailable')}
            icon="📋"
            color="purple"
            onClick={() => navigate('/admin/exams')}
            tooltip={t('adminDashboard.systemOverview.jlptExamsTooltip')}
          />
          <KPICard
            title={t('adminDashboard.systemOverview.storageUsedTitle')}
            value={storageInfo ? storageInfo.percentUsed + '%' : '...'}
            subtitle={storageInfo ? storageInfo.totalSize : 'Loading...'}
            icon="💾"
            color={storageInfo && storageInfo.percentUsed > 80 ? 'red' : storageInfo && storageInfo.percentUsed > 50 ? 'yellow' : 'cyan'}
            tooltip={t('adminDashboard.systemOverview.storageUsedTooltip')}
          />
        </div>
      </div>

      {/* Storage Monitoring */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
              💾 {storageInfo?.indexedDB ? t('adminDashboard.storage.title') : t('adminDashboard.storage.titleLocalOnly')}
            </h2>
            <InfoTooltip 
              content={t('adminDashboard.storage.explanation')}
              position="bottom"
            />
          </div>
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gray-50 border-[3px] border-gray-400 rounded-lg">
            <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3">
              📖 <strong>{t('adminDashboard.storage.explanationTitle')}</strong>
            </p>
            <ul className="text-[10px] sm:text-xs text-gray-800 space-y-1.5 ml-4 list-disc break-words">
              <li className="break-words"><strong>IndexedDB:</strong> {t('adminDashboard.storage.indexedDB')}</li>
              <li className="break-words"><strong>localStorage:</strong> {t('adminDashboard.storage.localStorage')}</li>
              <li className="break-words"><strong>Usage %:</strong> {t('adminDashboard.storage.usagePercent')}</li>
              <li className="break-words"><strong>Export All Data:</strong> {t('adminDashboard.storage.exportAll')}</li>
            </ul>
          </div>
          {storageInfo?.indexedDB && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-400 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs sm:text-sm text-blue-800 break-words">
                {t('adminDashboard.storage.indexedDBActive')}
              </p>
            </div>
          )}
          {storageInfo && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('adminDashboard.storage.totalSize')}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">{storageInfo.totalSize}</p>
                </div>
                <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('adminDashboard.storage.items')}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700">{storageInfo.itemCount}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2">{t('adminDashboard.storage.localStorageKeys')}</p>
                </div>
                <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 rounded-lg ${
                  storageInfo.percentUsed > 80 ? '' :
                  storageInfo.percentUsed > 50 ? '' :
                  ''
                }`}>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('adminDashboard.storage.usage')}</p>
                  <p className={`text-lg sm:text-xl md:text-2xl font-bold ${
                    storageInfo.percentUsed > 80 ? 'text-red-700' :
                    storageInfo.percentUsed > 50 ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {storageInfo.percentUsed}%
                  </p>
                </div>
                <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('adminDashboard.storage.limit')}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-purple-700 mt-2">{storageInfo.limit}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-2">
                  <span>
                    {storageInfo.indexedDB 
                      ? t('adminDashboard.storage.localStorageUsage') 
                      : t('adminDashboard.storage.localStorageUsageOnly')}
                  </span>
                  <span>
                    {storageInfo.totalSize} / {
                      storageInfo.indexedDB 
                        ? t('adminDashboard.storage.backupOnly') 
                        : t('adminDashboard.storage.limitMB')
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
                  <div 
                    className={`h-5 sm:h-6 rounded-full transition-all duration-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white ${
                      storageInfo.percentUsed > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                      storageInfo.percentUsed > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
                  >
                    {storageInfo.percentUsed > 10 && `${storageInfo.percentUsed}%`}
                  </div>
                </div>
                {storageInfo.percentUsed > 80 && (
                  <p className="text-[10px] sm:text-xs text-red-600 mt-1.5 sm:mt-2">
                    {t('adminDashboard.storage.warning')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 bg-blue-50 border-[2px] border-blue-400 rounded">
                  <p className="text-[10px] sm:text-xs font-bold text-blue-900 mb-1.5 sm:mb-2">
                    💡 <strong>{t('adminDashboard.storage.functions')}</strong>
                  </p>
                  <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1 ml-4 list-disc">
                    <li><strong>Export All Data:</strong> {t('adminDashboard.storage.exportAllDesc')}</li>
                    <li><strong>Clear All Admin Data:</strong> {t('adminDashboard.storage.clearAllDesc')}</li>
                    <li><strong>Refresh:</strong> {t('adminDashboard.storage.refreshDesc')}</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <button 
                    onClick={async () => {
                      const data = await storageManager.exportAll();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `elearning-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      alert(t('adminDashboard.storage.exportSuccess'));
                    }}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    title={t('adminDashboard.storage.exportAllDesc')}
                  >
                    <span>📥</span>
                    <span>{t('adminDashboard.storage.exportAll')}</span>
                  </button>
                  
                  <button 
                    onClick={async () => {
                      if (confirm(t('adminDashboard.storage.clearConfirm'))) {
                        const count = await storageManager.clearAllAdminData();
                        alert(t('adminDashboard.storage.clearSuccess', { count }));
                        const info = await storageManager.getStorageInfo();
                        setStorageInfo(info);
                      }
                    }}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    title={t('adminDashboard.storage.clearAllDesc')}
                  >
                    <span>🗑️</span>
                    <span>{t('adminDashboard.storage.clearAll')}</span>
                  </button>

                  <button 
                    onClick={async () => {
                      const info = await storageManager.getStorageInfo();
                      setStorageInfo(info);
                      alert(t('adminDashboard.storage.refreshSuccess'));
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-[#2D2D2D] text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    title={t('adminDashboard.storage.refreshDesc')}
                  >
                    <span>🔄</span>
                    <span>{t('adminDashboard.storage.refresh')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== 3. USER ANALYTICS ========== */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            👥 {t('adminDashboard.userAnalytics.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.userAnalytics.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border-[3px] border-green-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-green-900 mb-1.5 sm:mb-2">
            📖 <strong>{t('adminDashboard.userAnalytics.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-green-800 space-y-1 ml-4 list-disc">
            <li><strong>User Growth:</strong> {t('adminDashboard.userAnalytics.userGrowth')}</li>
            <li><strong>D1/D7/D30 Retention:</strong> {t('adminDashboard.userAnalytics.retention')}</li>
            <li><strong>Role Distribution:</strong> {t('adminDashboard.userAnalytics.roleDistribution')}</li>
          </ul>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-black text-gray-800 uppercase tracking-wide">
              📈 {t('adminDashboard.userAnalytics.userGrowthTitle')}
            </h3>
            <InfoTooltip 
              content={t('adminDashboard.userAnalytics.userGrowthTooltip')}
              position="right"
            />
          </div>
          <LineChart 
            data={userGrowthData}
            color="#10B981"
            height={200}
          />
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1.5 sm:mb-2 uppercase">{t('adminDashboard.userAnalytics.retentionRates')}</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="text-center p-1.5 sm:p-2 bg-green-100 rounded border-[2px] border-green-400">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <p className="text-[10px] sm:text-xs font-bold text-green-900">{t('adminDashboard.userAnalytics.d1Retention')}</p>
                  <InfoTooltip 
                    content={t('adminDashboard.userAnalytics.d1Tooltip')}
                    position="top"
                  />
                </div>
                <p className="text-base sm:text-lg font-black text-green-700">{retention.d1}%</p>
              </div>
              <div className="text-center p-1.5 sm:p-2 bg-blue-100 rounded border-[2px] border-blue-400">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <p className="text-[10px] sm:text-xs font-bold text-blue-900">{t('adminDashboard.userAnalytics.d7Retention')}</p>
                  <InfoTooltip 
                    content={t('adminDashboard.userAnalytics.d7Tooltip')}
                    position="top"
                  />
                </div>
                <p className="text-base sm:text-lg font-black text-blue-700">{retention.d7}%</p>
              </div>
              <div className="text-center p-1.5 sm:p-2 bg-purple-100 rounded border-[2px] border-purple-400">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <p className="text-[10px] sm:text-xs font-bold text-purple-900">{t('adminDashboard.userAnalytics.d30Retention')}</p>
                  <InfoTooltip 
                    content={t('adminDashboard.userAnalytics.d30Tooltip')}
                    position="top"
                  />
                </div>
                <p className="text-base sm:text-lg font-black text-purple-700">{retention.d30}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-black text-gray-800 uppercase tracking-wide">
              👥 {t('adminDashboard.userAnalytics.roleDistributionTitle')}
            </h3>
            <InfoTooltip 
              content={t('adminDashboard.userAnalytics.roleDistributionTooltip')}
              position="right"
            />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {/* Info Note */}
            <div className="p-2 sm:p-3 bg-yellow-100 border-[2px] border-yellow-400 rounded">
              <p className="text-[10px] sm:text-xs font-bold text-yellow-900 mb-0.5 sm:mb-1">
                💡 <strong>{t('adminDashboard.userAnalytics.importantNote')}</strong>
              </p>
              <p className="text-[10px] sm:text-xs text-yellow-800">
                {t('adminDashboard.userAnalytics.noteText')}
              </p>
            </div>
            
            {['admin', 'editor', 'user'].map(role => {
              const count = systemData.users.filter(u => u.role === role).length;
              const percentage = systemData.users.length > 0 ? Math.round((count / systemData.users.length) * 100) : 0;
              const colors = {
                admin: { bg: 'bg-red-500', text: 'text-red-700' },
                editor: { bg: 'bg-blue-500', text: 'text-blue-700' },
                user: { bg: 'bg-green-500', text: 'text-green-700' }
              };
              
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-700 capitalize flex items-center gap-1.5 sm:gap-2">
                      <span className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${colors[role].bg}`}></span>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`text-xs sm:text-sm font-black ${colors[role].text}`}>{count} {t('adminDashboard.userAnalytics.people')}</span>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden border-[2px] border-black">
                    <div 
                      className={`h-full ${colors[role].bg} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== 4. LEARNING ANALYTICS ========== */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            📚 {t('adminDashboard.learningAnalytics.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.learningAnalytics.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-orange-50 border-[3px] border-orange-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-orange-900 mb-1.5 sm:mb-2">
            📖 <strong>{t('adminDashboard.learningAnalytics.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-orange-800 space-y-1 ml-4 list-disc">
            <li><strong>Lesson Completion:</strong> {t('adminDashboard.learningAnalytics.lessonCompletion')}</li>
            <li><strong>JLPT Pass Rate:</strong> {t('adminDashboard.learningAnalytics.jlptPassRate')}</li>
            <li><strong>Avg Session Time:</strong> {t('adminDashboard.learningAnalytics.avgSessionTime')}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 flex flex-col h-full">
            {/* Title - Fixed at top with consistent height */}
            <h3 className="text-xs sm:text-sm font-black text-gray-600 uppercase mb-4 flex-shrink-0" style={{ minHeight: '1.5rem' }}>{t('adminDashboard.learningAnalytics.lessonCompletionTitle')}</h3>
            {/* Value Section - Fixed height middle */}
            <div className="flex-1 flex flex-col justify-center text-center mb-4 flex-shrink-0" style={{ minHeight: '5rem' }}>
              <p className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">{kpis.completionRate}%</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">{t('adminDashboard.kpis.lessonsCompleted', { count: kpis.totalLessons })}</p>
            </div>
            {/* Progress Bar - Fixed at bottom with consistent height */}
            <div className="mt-auto w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden border-[2px] border-black flex-shrink-0">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${kpis.completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 flex flex-col h-full">
            {/* Title - Fixed at top with consistent height */}
            <h3 className="text-xs sm:text-sm font-black text-gray-600 uppercase mb-4 flex-shrink-0" style={{ minHeight: '1.5rem' }}>{t('adminDashboard.learningAnalytics.jlptPassRateTitle')}</h3>
            {/* Value Section - Fixed height middle */}
            <div className="flex-1 flex flex-col justify-center text-center mb-4 flex-shrink-0" style={{ minHeight: '5rem' }}>
              <p className="text-3xl sm:text-4xl font-black text-purple-600 mb-2">{kpis.jlptPassRate}%</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">{t('adminDashboard.kpis.examsTaken', { count: kpis.totalExams })}</p>
            </div>
            {/* Progress Bar - Fixed at bottom with consistent height */}
            <div className="mt-auto w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden border-[2px] border-black flex-shrink-0">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                style={{ width: `${kpis.jlptPassRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 flex flex-col h-full">
            {/* Title - Fixed at top with consistent height */}
            <h3 className="text-xs sm:text-sm font-black text-gray-600 uppercase mb-4 flex-shrink-0" style={{ minHeight: '1.5rem' }}>{t('adminDashboard.learningAnalytics.avgSessionTimeTitle')}</h3>
            {/* Value Section - Fixed height middle */}
            <div className="flex-1 flex flex-col justify-center text-center mb-4 flex-shrink-0" style={{ minHeight: '5rem' }}>
              <p className="text-3xl sm:text-4xl font-black text-orange-600 mb-2">{kpis.avgSessionLength}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">{t('adminDashboard.learningAnalytics.minutesPerSession')}</p>
            </div>
            {/* Info Box - Fixed at bottom with consistent height */}
            <div className="mt-auto p-2 sm:p-3 bg-orange-100 rounded border-[2px] border-orange-400 flex-shrink-0" style={{ minHeight: '2.5rem' }}>
              <p className="text-[10px] sm:text-xs font-bold text-orange-900 text-center break-words">
                {t('adminDashboard.learningAnalytics.usersSpendAvg', { minutes: kpis.avgSessionLength })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide">⚡ {t('adminDashboard.quickActions.title')}</h2>
          <InfoTooltip 
            content={t('adminDashboard.quickActions.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-indigo-50 border-[2px] border-indigo-400 rounded">
          <p className="text-[10px] sm:text-xs font-bold text-indigo-900">
            💡 <strong>{t('adminDashboard.quickActions.tip')}</strong>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => !action.comingSoon && navigate(action.path)}
                disabled={action.comingSoon}
                className={`w-full bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-2.5 sm:p-3 md:p-4 flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                title={action.description}
              >
                <span className="text-2xl sm:text-3xl">{action.icon}</span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-center">{action.label}</span>
              </button>
              {action.description && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-yellow-400 text-black text-xs font-semibold px-3 py-2 rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                    {action.description}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-t-yellow-400 border-l-transparent border-r-transparent border-b-transparent border-[6px]"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== 5. RECENT ACTIVITY FEED ========== */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            📋 {t('adminDashboard.recentActivity.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.recentActivity.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-cyan-50 border-[3px] border-cyan-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-cyan-900 mb-1.5 sm:mb-2">
            📖 <strong>{t('adminDashboard.recentActivity.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-cyan-800 space-y-1 ml-4 list-disc">
            <li><strong>Real-time Feed:</strong> {t('adminDashboard.recentActivity.realtimeFeed')}</li>
            <li><strong>Activity Types:</strong> {t('adminDashboard.recentActivity.activityTypes')}</li>
            <li><strong>Timestamps:</strong> {t('adminDashboard.recentActivity.timestamps')}</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
          <ActivityFeed activities={analyticsData.activities} maxItems={10} />
        </div>
      </div>

      {/* ========== 6. SYSTEM MONITORING & ALERTS ========== */}
      <div className="mb-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            🔔 {t('adminDashboard.systemStatus.title')}
          </h2>
          <InfoTooltip 
            content={t('adminDashboard.systemStatus.explanation')}
            position="bottom"
          />
        </div>
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border-[3px] border-red-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-red-900 mb-1.5 sm:mb-2">
            📖 <strong>{t('adminDashboard.systemStatus.explanationTitle')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-red-800 space-y-1 ml-4 list-disc">
            <li><strong>System Health:</strong> {t('adminDashboard.systemStatus.systemHealth')}</li>
            <li><strong>Alerts:</strong> {t('adminDashboard.systemStatus.alerts')}</li>
            <li><strong>Error Logs:</strong> {t('adminDashboard.systemStatus.errorLogs')}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* System Health */}
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-black text-gray-600 uppercase mb-3 sm:mb-4">{t('adminDashboard.systemStatus.systemHealthTitle')}</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-green-100 rounded border-[2px] border-green-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900">{t('adminDashboard.systemStatus.database')}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-green-700">{t('adminDashboard.systemStatus.online')}</span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-green-100 rounded border-[2px] border-green-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900">{t('adminDashboard.systemStatus.authentication')}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-green-700">{t('adminDashboard.systemStatus.active')}</span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-green-100 rounded border-[2px] border-green-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900">{t('adminDashboard.systemStatus.storage')}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-green-700">{storageInfo?.indexedDB ? t('adminDashboard.systemStatus.indexedDB') : t('adminDashboard.systemStatus.local')}</span>
              </div>
            </div>
          </div>

          {/* Alerts & Warnings */}
          <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-black text-gray-600 uppercase mb-3 sm:mb-4">{t('adminDashboard.systemStatus.alertsTitle')}</h3>
            <div className="space-y-1.5 sm:space-y-2">
              {storageInfo && storageInfo.percentUsed > 80 && (
                <div className="p-2 sm:p-3 bg-red-100 border-[2px] border-red-400 rounded flex items-start gap-1.5 sm:gap-2">
                  <span className="text-red-600 text-base sm:text-lg flex-shrink-0">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-red-900">{t('adminDashboard.systemStatus.storageAlmostFull')}</p>
                    <p className="text-[10px] sm:text-xs text-red-700">{t('adminDashboard.systemStatus.storageAlmostFullDesc', { percent: storageInfo.percentUsed })}</p>
                  </div>
                </div>
              )}
              {systemData.users.length === 0 && (
                <div className="p-2 sm:p-3 bg-yellow-100 border-[2px] border-yellow-400 rounded flex items-start gap-1.5 sm:gap-2">
                  <span className="text-yellow-600 text-base sm:text-lg flex-shrink-0">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-yellow-900">{t('adminDashboard.systemStatus.noUsers')}</p>
                    <p className="text-[10px] sm:text-xs text-yellow-700">{t('adminDashboard.systemStatus.noUsersDesc')}</p>
                  </div>
                </div>
              )}
              {analyticsData.logs.filter(l => l.level === 'error').slice(0, 3).map((log, i) => (
                <div key={i} className="p-2 sm:p-3 bg-red-100 border-[2px] border-red-400 rounded flex items-start gap-1.5 sm:gap-2">
                  <span className="text-red-600 text-base sm:text-lg flex-shrink-0">❌</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-red-900 truncate">{log.message}</p>
                    <p className="text-[10px] sm:text-xs text-red-700">{new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))}
              {storageInfo && storageInfo.percentUsed < 50 && systemData.users.length > 0 && analyticsData.logs.filter(l => l.level === 'error').length === 0 && (
                <div className="p-2 sm:p-3 bg-green-100 border-[2px] border-green-400 rounded flex items-center gap-1.5 sm:gap-2">
                  <span className="text-green-600 text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="font-bold text-xs sm:text-sm text-green-900">{t('adminDashboard.systemStatus.allSystemsOperational')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

