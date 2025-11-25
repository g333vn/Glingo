// src/components/dashboard/KPICard.jsx
// KPI Card Component for Dashboard

import React from 'react';
import InfoTooltip from './InfoTooltip.jsx';

function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  trend = null,
  trendLabel = '',
  onClick = null,
  tooltip = null
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <div
      onClick={onClick}
      className={`h-full flex flex-col bg-gradient-to-br ${colorClasses[color]} rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 text-white ${
        onClick ? 'cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]' : ''
      } transition-all duration-200`}
    >
      {/* Title Section - Fixed at top with consistent height */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0" style={{ minHeight: '3.5rem' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold opacity-90 uppercase tracking-wide break-words leading-tight">
              {title}
            </p>
            {tooltip && (
              <InfoTooltip content={tooltip} position="top" />
            )}
          </div>
        </div>
        <div className="text-3xl sm:text-4xl lg:text-5xl opacity-80 flex-shrink-0 ml-2">
          {icon}
        </div>
      </div>

      {/* Value Section - Fixed height middle section */}
      <div className="flex-1 flex flex-col justify-center mb-4 flex-shrink-0" style={{ minHeight: '4rem' }}>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-black">
            {value}
          </p>
          {trend !== null && (
            <span className={`text-sm sm:text-base font-bold ${trendColor} flex items-center gap-1 flex-shrink-0`}>
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div style={{ minHeight: '1.25rem' }}>
          {trendLabel ? (
            <p className="text-xs font-semibold opacity-80 break-words">
              {trendLabel}
            </p>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Subtitle Section - Fixed at bottom with consistent height */}
      <div className="mt-auto flex-shrink-0" style={{ minHeight: '2.5rem' }}>
        {subtitle ? (
          <div className="text-xs sm:text-sm font-semibold opacity-90 bg-white/10 px-2 py-1.5 rounded border border-white/20 break-words">
            {subtitle}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default KPICard;

