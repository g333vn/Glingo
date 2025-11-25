// src/components/dashboard/LineChart.jsx
// Simple Line Chart Component (No external library)

import React from 'react';

function LineChart({ data, color = '#3B82F6', height = 200, showGrid = true }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded border-[2px] border-gray-300">
        <p className="text-gray-500 font-semibold">Không có dữ liệu</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Calculate points for SVG path
  const padding = 20;
  const chartWidth = 100; // percentage
  const chartHeight = height - padding * 2;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding;
    const y = padding + (1 - (d.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  // Create SVG path
  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Area fill path
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full">
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
        preserveAspectRatio="none"
        className="rounded border-[2px] border-black bg-white"
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map(percent => {
              const y = padding + (percent / 100) * chartHeight;
              return (
                <line
                  key={percent}
                  x1={padding}
                  y1={y}
                  x2={chartWidth + padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-400"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaData}
          fill={color}
          opacity="0.1"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
            <title>{`${p.label}: ${p.value}`}</title>
          </g>
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 px-4">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i} className="text-xs font-semibold text-gray-600">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default LineChart;

