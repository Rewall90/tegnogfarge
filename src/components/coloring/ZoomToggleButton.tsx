'use client'

import React from 'react';
import { ViewportMode } from '@/core/viewport/ToggleModeManager';

interface ZoomToggleButtonProps {
  currentMode: ViewportMode;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ZoomToggleButton: React.FC<ZoomToggleButtonProps> = ({ 
  currentMode, 
  onToggle, 
  className = '',
  size = 'md'
}) => {
  const isZoomMode = currentMode === 'zoom';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    zoom-toggle
    flex items-center gap-2
    border-2 border-gray-300
    rounded-md
    font-medium
    cursor-pointer
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    hover:shadow-md
    ${sizeClasses[size]}
    ${className}
  `;

  const modeClasses = isZoomMode
    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';

  return (
    <button
      className={`${baseClasses} ${modeClasses}`}
      onClick={onToggle}
      aria-label={isZoomMode ? 'Switch to draw mode' : 'Switch to zoom mode'}
      title={isZoomMode ? 'Switch to draw mode' : 'Switch to zoom mode'}
    >
      {isZoomMode ? (
        <>
          <DrawIcon className="w-4 h-4" />
          <span>Draw</span>
        </>
      ) : (
        <>
          <ZoomIcon className="w-4 h-4" />
          <span>Zoom</span>
        </>
      )}
    </button>
  );
};

// Icon components
const ZoomIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
      clipRule="evenodd" 
    />
    <path 
      fillRule="evenodd" 
      d="M5 8a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" 
      clipRule="evenodd" 
    />
  </svg>
);

const DrawIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default ZoomToggleButton; 