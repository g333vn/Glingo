// src/components/admin/MonthPicker.jsx
// Custom Month Picker Component với i18n support

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function MonthPicker({ value, onChange, className = '', required = false }) {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (value) {
      const match = value.match(/^(\d{4})[\/\-](\d{1,2})/);
      return match ? parseInt(match[1]) : new Date().getFullYear();
    }
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (value) {
      const match = value.match(/^(\d{4})[\/\-](\d{1,2})/);
      return match ? parseInt(match[2]) : new Date().getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  });
  const pickerRef = useRef(null);

  // Month names based on language
  const monthNames = {
    vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };

  const monthAbbrs = {
    vi: ['Thg1', 'Thg2', 'Thg3', 'Thg4', 'Thg5', 'Thg6', 'Thg7', 'Thg8', 'Thg9', 'Thg10', 'Thg11', 'Thg12'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };

  // Recalculate when language changes
  const months = React.useMemo(() => monthAbbrs[currentLanguage] || monthAbbrs.vi, [currentLanguage]);
  const fullMonths = React.useMemo(() => monthNames[currentLanguage] || monthNames.vi, [currentLanguage]);

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

  // Update selected year/month when value prop changes
  useEffect(() => {
    if (value) {
      const match = value.match(/^(\d{4})[\/\-](\d{1,2})/);
      if (match) {
        setSelectedYear(parseInt(match[1]));
        setSelectedMonth(parseInt(match[2]));
      }
    }
  }, [value]);

  const handleMonthClick = (month) => {
    const newValue = `${selectedYear}-${String(month).padStart(2, '0')}`;
    const formattedValue = newValue.replace('-', '/');
    setSelectedMonth(month);
    onChange({ target: { value: newValue } });
    setIsOpen(false);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value) || selectedYear;
    setSelectedYear(year);
    if (selectedMonth) {
      const newValue = `${year}-${String(selectedMonth).padStart(2, '0')}`;
      onChange({ target: { value: newValue } });
    }
  };

  const handleClear = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(null);
    onChange({ target: { value: '' } });
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    setSelectedYear(year);
    setSelectedMonth(month);
    const newValue = `${year}-${String(month).padStart(2, '0')}`;
    onChange({ target: { value: newValue } });
    setIsOpen(false);
  };

  // Recalculate displayValue when language or value changes
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    const match = value.match(/^(\d{4})[\/\-](\d{1,2})/);
    if (match) {
      const year = match[1];
      const month = parseInt(match[2]);
      return `${fullMonths[month - 1]} ${year}`;
    }
    return '';
  }, [value, fullMonths]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="relative" ref={pickerRef}>
      <input
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white text-base ${className}`}
        placeholder={t('examManagement.examForm.datePickerTitle')}
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 min-w-[280px]">
          {/* Year Input */}
          <div className="mb-4">
            <input
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              min="2000"
              max="2100"
              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg"
            />
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {months.map((month, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleMonthClick(index + 1)}
                className={`px-3 py-2 border-2 rounded-lg font-semibold text-sm transition-all ${
                  selectedMonth === index + 1
                    ? 'bg-blue-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-2 border-t-2 border-gray-300">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              {t('examManagement.examForm.clear')}
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="px-3 py-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              {t('examManagement.examForm.thisMonth')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthPicker;

