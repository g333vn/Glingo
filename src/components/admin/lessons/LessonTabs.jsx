// src/components/admin/lessons/LessonTabs.jsx
// 🎯 Lesson Tabs - Tab system cho modal lesson (Theory/Flashcard/Quiz)

import React from 'react';

/**
 * LessonTabs Component
 * Neo-Brutalism style tabs
 * 
 * @param {array} tabs - Array of tab objects: [{ id: 'theory', label: 'Lý thuyết', icon: '📖' }, ...]
 * @param {string} activeTab - Current active tab ID
 * @param {function} onTabChange - Callback khi đổi tab
 */
function LessonTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b-4 border-black mb-6">
      <div className="flex flex-wrap gap-2 -mb-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 font-black text-sm uppercase tracking-wide
                border-[3px] border-black rounded-t-lg
                transition-all duration-200
                ${isActive 
                  ? `bg-${tab.color || 'yellow'}-400 text-black shadow-none translate-y-1` 
                  : 'bg-white text-gray-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={tab.disabled}
              style={{
                backgroundColor: isActive ? getColorValue(tab.color) : undefined
              }}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {tab.badge && (
                <span className={`
                  ml-2 px-2 py-0.5 text-xs rounded
                  ${isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Get color hex value for inline styles
 */
function getColorValue(colorName) {
  const colorMap = {
    blue: '#60A5FA',    // blue-400
    purple: '#C084FC',  // purple-400
    green: '#4ADE80',   // green-400
    yellow: '#FACC15',  // yellow-400
    red: '#F87171',     // red-400
    teal: '#2DD4BF',    // teal-400
    indigo: '#818CF8'   // indigo-400
  };
  
  return colorMap[colorName] || colorMap.yellow;
}

/**
 * TabPanel Component - Container cho nội dung tab
 */
export function TabPanel({ children, isActive, className = '' }) {
  if (!isActive) return null;
  
  return (
    <div className={`
      p-6 
      border-[3px] border-black rounded-lg rounded-tl-none
      bg-white
      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      ${className}
    `}>
      {children}
    </div>
  );
}

export default LessonTabs;

