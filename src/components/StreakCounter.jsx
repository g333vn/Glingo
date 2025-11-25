// src/components/StreakCounter.jsx
// 🔥 Streak Counter Component - Display study streak in header

import React, { useState, useEffect } from 'react';
import { getStudyStreak } from '../utils/lessonProgressTracker.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function StreakCounter() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { t } = useLanguage();
  
  useEffect(() => {
    let dailyInterval = null;
    
    const loadStreak = () => {
      if (!user) {
        setStreak(0);
        return;
      }
      
      const result = getStudyStreak(user);
      setStreak(result.streak);
      
      // Show notification if streak was reset
      if (result.wasReset && result.oldStreak > 0) {
        const daysText = result.oldStreak === 1 ? t('streak.day') : t('streak.days');
        setNotificationMessage(
          t('streak.brokenNotification', { 
            oldStreak: result.oldStreak,
            days: daysText
          }) || `💔 Streak bị ngắt quãng! Bạn đã bỏ lỡ ${result.oldStreak} ${daysText}. Hãy học ngay hôm nay để bắt đầu lại!`
        );
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    };
    
    // Load immediately on mount
    loadStreak();
    
    // Update every minute to check if streak changed
    const interval = setInterval(loadStreak, 60000);
    
    // Also check when date changes (midnight check)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;
    
    const midnightTimeout = setTimeout(() => {
      loadStreak();
      // Then check every 24 hours
      dailyInterval = setInterval(loadStreak, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
      if (dailyInterval) clearInterval(dailyInterval);
    };
  }, [t, user]);
  
  return (
    <div className="relative">
      {/* Notification when streak is broken */}
      {showNotification && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-red-100 border-[3px] border-red-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 z-50 animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-2xl">💔</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">{notificationMessage}</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
      {/* Streak Display - Ultra compact */}
      <div className={`flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 rounded-full border-[2px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 ${
        streak === 0 
          ? 'bg-gradient-to-r from-gray-300 to-gray-400'
          : 'bg-gradient-to-r from-orange-400 to-red-500'
      }`}>
        <span className="text-sm md:text-base lg:text-lg">{streak === 0 ? '💤' : '🔥'}</span>
        <span className="font-black text-white text-[10px] md:text-xs lg:text-sm whitespace-nowrap">
          {streak}<span className="hidden lg:inline"> {streak === 1 ? t('streak.day') : t('streak.days')}</span>
        </span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{streak === 0 ? '💤' : '🔥'}</span>
            <span className="font-black text-gray-800">
              {streak === 0 ? t('streak.startTitle') : t('streak.title')}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {streak === 0 ? (
              <>{t('streak.startMessage')}</>
            ) : (
              <>
                {t('streak.continuousMessage', { count: streak })}
                {streak < 7 && ` ${t('streak.keepGoing')}`}
                {streak >= 7 && streak < 30 && ` ${t('streak.great')}`}
                {streak >= 30 && ` ${t('streak.amazing')}`}
              </>
            )}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default StreakCounter;

