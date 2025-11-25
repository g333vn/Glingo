// src/components/admin/DatePicker.jsx
// Custom Date Picker Component với i18n support

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function DatePicker({ value, onChange, className = '', required = false, min, max }) {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    if (value) {
      const date = new Date(value);
      return { year: date.getFullYear(), month: date.getMonth() };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const pickerRef = useRef(null);

  // Month names based on language
  const monthNames = useMemo(() => ({
    vi: ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }), []);

  // Day names (abbreviated)
  const dayNames = useMemo(() => ({
    vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ja: ['日', '月', '火', '水', '木', '金', '土']
  }), []);

  // Full day names for Vietnamese
  const fullDayNames = useMemo(() => ({
    vi: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  }), []);

  const months = monthNames[currentLanguage] || monthNames.vi;
  const days = dayNames[currentLanguage] || dayNames.vi;

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update currentView when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentView({ year: date.getFullYear(), month: date.getMonth() });
    }
  }, [value]);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const { year, month } = currentView;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const handleDateClick = (day) => {
    const date = new Date(day.year, day.month, day.date);
    const formattedDate = date.toISOString().split('T')[0];
    onChange({ target: { value: formattedDate } });
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentView(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentView(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value) || currentView.year;
    setCurrentView(prev => ({ ...prev, year }));
  };

  const handleClear = () => {
    onChange({ target: { value: '' } });
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    onChange({ target: { value: formattedDate } });
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    if (!value) return '';
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${months[month]} ${year}`;
  }, [value, months]);

  const selectedDate = value ? new Date(value) : null;
  const calendarDays = getCalendarDays();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Check if date is disabled
  const isDateDisabled = (day) => {
    const date = new Date(day.year, day.month, day.date);
    const dateStr = date.toISOString().split('T')[0];
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <input
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white text-base ${className}`}
        placeholder={t('admin.backupRestore.dateRange.selectDate')}
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 w-[280px]">
          {/* Header with Month/Year and Navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <select
                value={currentView.month}
                onChange={(e) => setCurrentView(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="px-2 py-1 border-2 border-black rounded font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <input
                type="number"
                value={currentView.year}
                onChange={handleYearChange}
                min="2000"
                max="2100"
                className="w-16 px-1.5 py-1 border-2 border-black rounded font-semibold text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center border-2 border-black rounded hover:bg-gray-100 active:bg-gray-200 transition-colors text-xs font-bold"
                title={t('admin.backupRestore.dateRange.prevMonth')}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center border-2 border-black rounded hover:bg-gray-100 active:bg-gray-200 transition-colors text-xs font-bold"
                title={t('admin.backupRestore.dateRange.nextMonth')}
              >
                →
              </button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-0.5 mb-1.5">
            {days.map((day, index) => (
              <div key={index} className="text-center text-[10px] font-semibold text-gray-600 py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-3">
            {calendarDays.map((day, index) => {
              const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
              const isSelected = selectedDate && 
                selectedDate.getDate() === day.date &&
                selectedDate.getMonth() === day.month &&
                selectedDate.getFullYear() === day.year;
              const isToday = new Date().toDateString() === new Date(day.year, day.month, day.date).toDateString();
              const isDisabled = isDateDisabled(day);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleDateClick(day)}
                  disabled={isDisabled}
                  className={`w-9 h-9 flex items-center justify-center border-2 rounded text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : isToday
                      ? 'bg-yellow-200 text-gray-800 border-yellow-400'
                      : day.isCurrentMonth
                      ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                >
                  {day.date}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-2 border-t border-gray-300">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium text-xs transition-colors"
            >
              {t('admin.backupRestore.dateRange.clear')}
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium text-xs transition-colors"
            >
              {t('admin.backupRestore.dateRange.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;

