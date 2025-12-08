// src/components/VirtualGrid.jsx
// ✅ PHASE 5: Virtual Scrolling Component for Large Lists
// Only renders visible items + buffer for smooth scrolling

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * VirtualGrid Component
 * 
 * Renders only visible items in a grid layout for better performance with large lists
 * 
 * @param {Array} items - Array of items to render
 * @param {Function} renderItem - Function to render each item (item, index) => ReactNode
 * @param {number} itemHeight - Estimated height of each item (for calculation)
 * @param {number} itemWidth - Estimated width of each item
 * @param {number} columns - Number of columns in grid
 * @param {number} overscan - Number of items to render outside viewport (default: 2)
 * @param {string} className - Additional CSS classes
 */
function VirtualGrid({
  items = [],
  renderItem,
  itemHeight = 300,
  itemWidth = 200,
  columns = 5,
  overscan = 2,
  className = '',
  ...props
}) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(items.length, columns * 3) });
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate rows and total height
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * itemHeight;

  // Update visible range based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate which rows are visible
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(
      rows - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    // Convert rows to item indices
    const start = startRow * columns;
    const end = Math.min(items.length, (endRow + 1) * columns);

    setVisibleRange({ start, end });
  }, [itemHeight, rows, columns, items.length, overscan]);

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Setup scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  // Calculate offset for positioning
  const offsetY = Math.floor(visibleRange.start / columns) * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%' }}
      {...props}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: offsetY }} />

      {/* Visible items grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1.5rem'
        }}
      >
        {visibleItems.map(({ item, index }) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Spacer for items after visible range */}
      <div style={{ height: Math.max(0, totalHeight - offsetY - (visibleItems.length / columns) * itemHeight) }} />
    </div>
  );
}

export default VirtualGrid;
