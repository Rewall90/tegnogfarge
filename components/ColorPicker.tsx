'use client'
import React, { useState, useCallback } from 'react'

interface ColorPickerProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorSelect,
  selectedColor,
  suggestedColors = [],
  className = ''
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onColorSelect(e.target.value)
  }, [onColorSelect])

  const togglePicker = useCallback(() => {
    setShowPicker(prev => !prev)
  }, [])

  return (
    <div className={`flex flex-col gap-4 p-4 bg-white border-r border-gray-200 ${className}`}>
      {/* Fargevelger */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Velg farge</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePicker}
            className="w-10 h-10 rounded border border-gray-300"
            style={{ backgroundColor: selectedColor }}
            aria-label="Velg farge"
          />
          <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className={`w-0 h-0 opacity-0 ${showPicker ? 'block' : 'hidden'}`}
          />
          <span className="text-sm text-gray-600">{selectedColor}</span>
        </div>
      </div>

      {/* Foreslåtte farger */}
      {suggestedColors.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Foreslåtte farger</label>
          <div className="grid grid-cols-4 gap-2">
            {suggestedColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => onColorSelect(color.hex)}
                className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Velg ${color.name}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPicker 