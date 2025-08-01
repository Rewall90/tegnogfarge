'use client'

import { COLOR_THEMES } from '../colorConstants';

interface ThemeSelectorProps {
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ 
  activeThemeId, 
  onThemeChange 
}: ThemeSelectorProps) {
  // Create circular color palette for each theme
  const createColorWheel = (theme: any) => {
    // Take first 6 colors for the wheel arrangement
    const colors = theme.colors.slice(0, 6);
    
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Overlapping color circles arranged in a circular pattern */}
        {colors.map((color: string, index: number) => {
          // Calculate position for circular arrangement
          const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
          const radius = 14; // Distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`${theme.id}-${index}-${color}`}
              className="absolute w-5 h-5 rounded-full border border-white shadow-sm transition-all duration-200"
              style={{
                backgroundColor: color,
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 6 - index, // Stack in order
              }}
            />
          );
        })}
        
        {/* Central selected indicator */}
        {activeThemeId === theme.id && (
          <div 
            className="absolute inset-0 rounded-full border-2 flex items-center justify-center z-10"
            style={{ 
              borderColor: theme.displayColor,
              backgroundColor: `${theme.displayColor}20` // 20 is hex for ~12.5% opacity
            }}
          >
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: theme.displayColor }}
            />
          </div>
        )}
        
        {/* Theme icon in center when not selected */}
        {activeThemeId !== theme.id && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-xs bg-white bg-opacity-80 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {theme.icon}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide px-4">
      {COLOR_THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={`flex-shrink-0 transition-all duration-300 hover:scale-105 rounded-xl p-1 ${
            activeThemeId === theme.id 
              ? 'scale-110 shadow-md' 
              : 'hover:bg-gray-50'
          }`}
          style={{
            backgroundColor: activeThemeId === theme.id ? `${theme.displayColor}10` : undefined // 10 is hex for ~6% opacity
          }}
          aria-label={`Select ${theme.name} theme`}
          title={theme.name}
        >
          {createColorWheel(theme)}
        </button>
      ))}
    </div>
  );
}