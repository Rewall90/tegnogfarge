'use client'
import { useState } from 'react'

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  suggestedColors?: Array<{ name: string; hex: string }>
}

export default function ColorPalette({
  selectedColor,
  onColorSelect,
  suggestedColors
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const defaultColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
    '#0000FF', '#4B0082', '#9400D3', '#FF1493',
    '#00CED1', '#FFD700', '#8B4513', '#000000',
    '#808080', '#FFFFFF', '#FFC0CB', '#87CEEB'
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg mb-4">Fargepalett</h3>
        
        {/* Foreslåtte farger */}
        {suggestedColors && suggestedColors.length > 0 && (
          <div className="mb-6">
            <h4 className="font-display text-sm font-medium text-gray-700 mb-3">Foreslåtte farger</h4>
            <div className="grid grid-cols-4 gap-2">
              {suggestedColors.map((color, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedColor === color.hex ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorSelect(color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard farger */}
        <div className="mb-6">
          <h4 className="font-display text-sm font-medium text-gray-700 mb-3">Standard farger</h4>
          <div className="grid grid-cols-4 gap-2">
            {defaultColors.map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedColor === color ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onColorSelect(color)}
              />
            ))}
          </div>
        </div>

        {/* Egendefinert farge */}
        <div>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="text-button w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg transition-colors"
          >
            Egendefinert farge
          </button>
          
          {showCustomPicker && (
            <div className="mt-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-full h-12 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Valgt farge */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-body text-sm text-gray-600 mb-2">Valgt farge:</div>
          <div 
            className="w-full h-16 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="text-xs text-gray-600 mt-2 text-center font-mono">
            {selectedColor.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
} 