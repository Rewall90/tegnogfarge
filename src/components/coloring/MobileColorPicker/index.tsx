'use client'

import { ColorGrid } from './ColorGrid';
import { ThemeSelector } from './ThemeSelector';

interface MobileColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
  showMobileTools: boolean;
  onToggleTools: () => void;
}

export function MobileColorPicker({
  selectedColor,
  onColorChange,
  activeThemeId,
  onThemeChange,
  showMobileTools,
  onToggleTools
}: MobileColorPickerProps) {
  return (
    <div className="py-2 space-y-1">
      {/* Color Grid Row */}
      <ColorGrid
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        activeThemeId={activeThemeId}
        showMobileTools={showMobileTools}
        onToggleTools={onToggleTools}
      />
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-4" />
      
      {/* Theme Selector Row - Slidable */}
      <div className="h-14 flex items-center">
        <ThemeSelector
          activeThemeId={activeThemeId}
          onThemeChange={onThemeChange}
        />
      </div>
    </div>
  );
}