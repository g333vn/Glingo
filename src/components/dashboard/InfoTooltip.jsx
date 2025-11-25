// src/components/dashboard/InfoTooltip.jsx
// Info Tooltip Component for Dashboard explanations

import React, { useState } from 'react';

function InfoTooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 transition-all cursor-help"
        aria-label="Thông tin"
      >
        ?
      </button>
      
      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3 bg-yellow-400 text-black text-xs font-semibold rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${positionClasses[position]}`}
          role="tooltip"
        >
          <div className="font-black mb-1 uppercase tracking-wide">💡 Giải thích:</div>
          <div>{content}</div>
          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-yellow-400 border-l-transparent border-r-transparent border-b-transparent border-[8px]' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-yellow-400 border-l-transparent border-r-transparent border-t-transparent border-[8px]' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-yellow-400 border-t-transparent border-b-transparent border-r-transparent border-[8px]' :
            'right-full top-1/2 -translate-y-1/2 border-r-yellow-400 border-t-transparent border-b-transparent border-l-transparent border-[8px]'
          }`}></div>
        </div>
      )}
      
      {children}
    </div>
  );
}

export default InfoTooltip;

