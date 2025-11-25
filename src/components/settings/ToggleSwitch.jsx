// src/components/settings/ToggleSwitch.jsx
// ✨ NEO BRUTALISM Toggle Switch Component

import React from 'react';

function ToggleSwitch({ 
  checked, 
  onChange, 
  label, 
  description,
  disabled = false 
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <label 
          className="font-bold text-gray-800 text-sm cursor-pointer block"
          style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" }}
          title={label}
        >
          {label}
        </label>
        {description && (
          <p 
            className="text-xs text-gray-600 mt-1"
            style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" }}
            title={description}
          >
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full 
          border-[3px] border-black transition-all duration-200
          ${checked ? 'bg-green-500' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}
        `}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full 
            bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
            {checked ? '✓' : ''}
          </span>
        </span>
      </button>
    </div>
  );
}

export default ToggleSwitch;

