// src/components/settings/SettingsSection.jsx
// ✨ NEO BRUTALISM Settings Section Component

import React, { useState } from 'react';

function SettingsSection({ 
  title, 
  icon, 
  description,
  children,
  defaultOpen = true 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-b-[4px] border-black flex items-center justify-between hover:from-yellow-500 hover:to-orange-500 transition-all"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon with consistent size */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl">
            {icon}
          </div>
          
          <div className="text-left flex-1 min-w-0">
            <h2 
              className="text-lg sm:text-xl font-black text-black uppercase tracking-wide truncate"
              style={{ fontFamily: "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', sans-serif" }}
              title={title}
            >
              {title}
            </h2>
            {description && (
              <p 
                className="text-xs sm:text-sm text-black font-semibold mt-0.5 truncate"
                style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" }}
                title={description}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        
        <span className={`flex-shrink-0 ml-3 text-2xl font-black text-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default SettingsSection;

