'use client'

import { ColorGrid } from './ColorGrid';
import { ThemeSelector } from './ThemeSelector';

interface MobileColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
}

export function MobileColorPicker({
  selectedColor,
  onColorChange,
  activeThemeId,
  onThemeChange
}: MobileColorPickerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <ColorGrid
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        activeThemeId={activeThemeId}
      />
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-4" />
      <ThemeSelector
        activeThemeId={activeThemeId}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}