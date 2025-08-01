'use client'

import { getThemeById } from '../colorConstants';
import Image from 'next/image';

interface ColorGridProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  activeThemeId: string;
  showMobileTools: boolean;
  onToggleTools: () => void;
}

export function ColorGrid({ 
  selectedColor, 
  onColorChange, 
  activeThemeId,
  showMobileTools,
  onToggleTools
}: ColorGridProps) {
  const currentTheme = getThemeById(activeThemeId);
  
  return (
    <div className="h-12 flex items-center px-4">
      <div className="flex items-center gap-1.5 w-full">
        {/* Tools Toggle Button - Moved to far left */}
        <button
          onClick={onToggleTools}
          className={`w-8 h-8 rounded-full border transition-all hover:scale-105 flex items-center justify-center ${
            showMobileTools 
              ? 'border-2 border-green-600 bg-green-50 scale-110 shadow-sm' 
              : 'border border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
          aria-label="Toggle tools menu"
        >
          <div className="transform transition-transform duration-300" style={{
            transform: showMobileTools ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <Image
              src="/images/mobiltoolbar/micon.svg"
              alt="Tools menu"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </div>
        </button>

        {/* Color buttons - now shows all colors */}
        <div className="grid grid-cols-9 gap-1.5 flex-1">
          {currentTheme.colors.slice(0, -1).map((color: string, index: number) => (
            <button
              key={`${activeThemeId}-${index}-${color}`}
              onClick={() => onColorChange(color)}
              className={`w-7 h-7 rounded-full border transition-all ${
                selectedColor === color 
                  ? 'border-2 border-gray-800 scale-110 shadow-sm' 
                  : 'border border-gray-300 hover:border-gray-400 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}