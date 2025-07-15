'use client'

import { getThemeById } from '../colorConstants';

interface ColorGridProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  activeThemeId: string;
}

export function ColorGrid({ 
  selectedColor, 
  onColorChange, 
  activeThemeId
}: ColorGridProps) {
  const currentTheme = getThemeById(activeThemeId);
  
  return (
    <div className="h-12 flex items-center px-4">
      <div className="grid grid-cols-10 gap-1.5 w-full">
        {currentTheme.colors.map((color: string, index: number) => (
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
  );
}