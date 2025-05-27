'use client'
import React, { useState } from 'react'

interface ColorPaletteProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}

export default function ColorPalette({ 
  onColorSelect, 
  selectedColor, 
  suggestedColors,
  className = ''
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  // Standard fargepalett - organisert i kategorier
  const colorCategories = {
    basic: {
      title: 'Grunnfarger',
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
    },
    skin: {
      title: 'Hudtoner',
      colors: ['#FDBCB4', '#EAA985', '#D1A167', '#B08D57', '#8D6A42', '#654321']
    },
    pastels: {
      title: 'Pastellfarger',
      colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFEFD5']
    },
    neutral: {
      title: 'Nøytrale',
      colors: ['#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969', '#000000']
    }
  }

  return (
    <div className={`w-64 bg-white border-r border-gray-200 h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Fargepalett</h3>
        
        {/* Foreslåtte farger fra Sanity */}
        {suggestedColors && suggestedColors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Foreslåtte farger</h4>
            <div className="grid grid-cols-4 gap-2">
              {suggestedColors.map((color, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedColor === color.hex ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorSelect(color.hex)}
                  title={color.name}
                  aria-label={`Velg farge: ${color.name}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard farger organisert i kategorier */}
        {Object.entries(colorCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{category.title}</h4>
            <div className="grid grid-cols-4 gap-2">
              {category.colors.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedColor === color ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={color}
                  aria-label={`Velg farge: ${color}`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Custom color picker */}
        <div className="mb-4">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
          >
            🎨 Egendefinert farge
          </button>
          
          {showCustomPicker && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-full h-12 rounded border cursor-pointer"
                aria-label="Velg egendefinert farge"
              />
              <div className="text-xs text-gray-600 mt-2 text-center font-mono">
                {selectedColor.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Valgt farge display */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2 font-medium">Valgt farge:</div>
          <div 
            className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor: selectedColor }}
            title={selectedColor}
          />
          <div className="text-xs text-gray-600 mt-2 text-center font-mono">
            {selectedColor.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
} 