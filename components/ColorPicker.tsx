import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  showCustomPicker?: boolean;
  className?: string;
}

export default function ColorPicker({
  selectedColor,
  onChange,
  presetColors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
    '#008000', // Dark Green
    '#808080', // Gray
    '#FFC0CB', // Pink
    '#ADD8E6', // Light Blue
  ],
  showCustomPicker = true,
  className = '',
}: ColorPickerProps) {
  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-full border ${
              selectedColor === color ? 'border-gray-900 shadow-lg' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Velg farge: ${color}`}
          />
        ))}
      </div>
      
      {showCustomPicker && (
        <div className="mt-3">
          <label htmlFor="custom-color" className="block text-sm font-medium text-gray-700 mb-1">
            Egendefinert farge
          </label>
          <div className="flex items-center">
            <input
              type="color"
              id="custom-color"
              value={selectedColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 p-0 border-0"
            />
            <span className="ml-2 text-sm text-gray-600">{selectedColor}</span>
          </div>
        </div>
      )}
    </div>
  );
} 