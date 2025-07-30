'use client'
import { useState } from 'react'
import ColorWheelPicker from './ColorWheelPicker'

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
  // Tool size controls
  drawingMode?: 'pencil' | 'fill' | 'eraser'
  pencilSize?: number
  onPencilSizeChange?: (size: number) => void
  eraserSize?: number
  onEraserSizeChange?: (size: number) => void
}

// Function to calculate color brightness and determine optimal dot color
function getOptimalDotColor(backgroundColor: string): 'white' | 'black' {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Use black dot for bright colors (luminance > 0.7), white for dark colors
  return luminance > 0.7 ? 'black' : 'white'
}

// Reusable Color Button Component
interface ColorButtonProps {
  color: string
  isSelected: boolean
  onSelect: (color: string) => void
  ariaLabel?: string
}

// Reusable Section Header Component
interface SectionHeaderProps {
  title: string
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h4 className="font-display font-medium mb-3" style={{ color: '#274653', fontSize: '20px' }}>
      {title}
    </h4>
  )
}

function ColorButton({ color, isSelected, onSelect, ariaLabel }: ColorButtonProps) {
  const isColorWheel = color === 'colorwheel'
  
  return (
    <button
      onClick={() => isColorWheel ? onSelect('colorwheel') : onSelect(color)}
      aria-pressed={isSelected}
      className={`w-12 h-12 rounded-full relative transition-all duration-200
        flex items-center justify-center
        ${isSelected 
          ? 'scale-125' 
          : 'hover:scale-110'
        }`}
    >
      <div
        className="w-10 h-10 rounded-full"
        style={isColorWheel ? {
          background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)'
        } : {
          backgroundColor: color
        }}
        aria-label={ariaLabel || (isColorWheel ? 'Select custom color' : `Select ${color}`)}
      />

      {isSelected && (
        <div 
          className={`absolute w-4 h-4 rounded-full drop-shadow top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
            isColorWheel ? 'bg-white' : (getOptimalDotColor(color) === 'white' ? 'bg-white' : 'bg-black')
          }`} 
        />
      )}
    </button>
  )
}

export default function ColorPalette({
  selectedColor,
  onColorSelect,
  suggestedColors,
  className = "",
  drawingMode,
  pencilSize,
  onPencilSizeChange,
  eraserSize,
  onEraserSizeChange
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [showColorWheel, setShowColorWheel] = useState(false)
  
  const handleColorSelect = (color: string) => {
    if (color === 'custom') {
      setShowCustomPicker(true)
    } else if (color === 'colorwheel') {
      setShowColorWheel(true)
    } else {
      onColorSelect(color)
    }
  }

  const defaultColors = [
    // Custom color wheel
    'colorwheel',
    // Reds and pinks
    '#FF0000', '#FF1493', '#FFB6C1', '#FFC0CB',
    // Oranges and yellows
    '#FF7F00', '#FFFF00',
    // Greens and blues
    '#00FF00', '#00CED1', '#4682B4', '#0000FF',
    // Purples
    '#4B0082', '#9400D3',
    // Browns and grays
    '#2F1810', '#222222', '#808080'
  ]

  const skinTones = [
    // Light to dark progression
    '#FFEEDD', // Very light
    '#FFE4CC', // Light
    '#FFDAB9', // Fair
    '#FFC193', // Medium light
    '#F4A460', // Medium
    '#E89654', // Medium dark
    '#D2691E', // Dark
    '#A0522D', // Dark brown
    '#CD853F', // Very dark
    '#654321'  // Deep brown
  ]

  const hairColors = [
    // Natural browns and blacks
    '#3B2F2F', // Dark brown-black
    '#5D4037', // Brown
    '#8D6E63', // Light brown
    // Blondes
    '#D7CCC8', // Blonde
    '#FFD700', // Golden blonde
    // Reds and oranges
    '#FFA500', // Orange/Red
    '#FF4500', // Bright red
    '#8B0000', // Dark red
    '#FF6347', // Tomato
    // Unnatural colors
    '#9370DB', // Purple
    '#4169E1', // Blue
    '#32CD32'  // Green
  ]

  const eyeColors = [
    // Browns
    '#2F1810', // Dark brown
    '#8B4513', // Brown
    '#D2691E', // Light brown
    // Blues
    '#87CEEB', // Light blue
    '#1E90FF', // Dodger blue
    '#00CED1', // Dark turquoise
    // Greens
    '#228B22', // Forest green
    // Unusual colors
    '#8A2BE2', // Purple
    '#FFD700', // Amber
    '#FFA500', // Orange
    '#FF69B4', // Hot pink
    '#FF1493'  // Deep pink
  ]

  const lipColors = [
    // Pinks
    '#FFC0CB', // Pink
    '#FFB6C1', // Light pink
    '#FF69B4', // Hot pink
    // Reds
    '#DC143C', // Crimson
    '#B22222', // Fire brick
    '#A52A2A', // Brown red
    '#FF6B35', // Orange red
    '#FF8C69', // Light tomato
    // Corals and nudes
    '#FF7F50', // Coral
    '#FFA07A', // Light salmon
    '#D2B48C', // Tan
    '#DEB887'  // Burlywood
  ]

  const skyColors = [
    // Light blues and grays
    '#B0E0E6', // Powder blue
    '#ADD8E6', // Light blue
    '#87CEEB', // Sky blue
    '#C0C0C0', // Silver
    '#F5F5F5', // White smoke
    '#708090', // Slate gray
    // Deep blues
    '#5F9EA0', // Cadet blue
    '#1E90FF', // Dodger blue
    '#4169E1', // Royal blue
    '#000080', // Navy blue
    // Sunset colors
    '#FFD700', // Golden (sunset)
    '#FF8C00'  // Dark orange (sunset)
  ]

  const forestColors = [
    // Bright greens and yellows
    '#7CFC00', // Lawn green
    '#00FF00', // Bright green
    '#ADFF2F', // Chartreuse
    '#E7E044', // Bright yellow
    '#90EE90', // Light green
    // Natural greens
    '#228B22', // Forest green
    '#556B2F', // Olive green
    '#006400', // Dark forest green
    '#9CAF88', // Sage green
    // Earth tones
    '#A0522D', // Sienna
    '#654321', // Dark brown
    '#FFE4B5'  // Light peach
  ]


  return (
    <div className={`w-64 lg:w-64 md:w-48 sm:w-40 flex-shrink-0 h-screen max-h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-display font-semibold text-lg">Fargepalett</h3>
      </div>

      {/* Scrollable Color Sections Container */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                 {/* Foreslåtte farger */}
         {suggestedColors && suggestedColors.length > 0 && (
           <div className="mb-6">
             <SectionHeader title="Foreslåtte farger" />
             <div className="grid grid-cols-4 gap-2">
               {suggestedColors.map((color, index) => (
                 <ColorButton
                   key={index}
                   color={color.hex}
                   isSelected={selectedColor === color.hex}
                   onSelect={handleColorSelect}
                   ariaLabel={`Select ${color.name || color.hex}`}
                 />
               ))}
             </div>
           </div>
         )}

                         {/* Standard farger */}
         <div className="mb-6">
           <SectionHeader title="Standard farger" />
           <div className="grid grid-cols-4 gap-2">
             {defaultColors.map((color) => (
               <ColorButton
                 key={color}
                 color={color}
                 isSelected={selectedColor === color}
                 onSelect={handleColorSelect}
               />
             ))}
           </div>
         </div>


                                   {/* Hudfarger */}
         <div className="mb-6">
           <SectionHeader title="Hudfarger" />
           <div className="grid grid-cols-4 gap-2">
             {skinTones.map((color) => (
               <ColorButton
                 key={color}
                 color={color}
                 isSelected={selectedColor === color}
                 onSelect={handleColorSelect}
                 ariaLabel={`Select skin tone ${color}`}
               />
             ))}
           </div>
         </div>


                   {/* Hår Farge */}
          <div className="mb-6">
            <SectionHeader title="Hår Farge" />
            <div className="grid grid-cols-4 gap-2">
              {hairColors.map((color) => (
                <ColorButton
                  key={color}
                  color={color}
                  isSelected={selectedColor === color}
                  onSelect={handleColorSelect}
                  ariaLabel={`Select hair color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Øye Farge */}
          <div className="mb-6">
            <SectionHeader title="Øye Farge" />
            <div className="grid grid-cols-4 gap-2">
              {eyeColors.map((color) => (
                <ColorButton
                  key={color}
                  color={color}
                  isSelected={selectedColor === color}
                  onSelect={handleColorSelect}
                  ariaLabel={`Select eye color ${color}`}
                />
              ))}
            </div>
          </div>

                     {/* Leppe Farge */}
           <div className="mb-6">
             <SectionHeader title="Leppe Farge" />
             <div className="grid grid-cols-4 gap-2">
               {lipColors.map((color) => (
                 <ColorButton
                   key={color}
                   color={color}
                   isSelected={selectedColor === color}
                   onSelect={handleColorSelect}
                   ariaLabel={`Select lip color ${color}`}
                 />
               ))}
             </div>
           </div>

                       {/* Himmel Farger */}
            <div className="mb-6">
              <SectionHeader title="Himmel Farger" />
              <div className="grid grid-cols-4 gap-2">
                {skyColors.map((color) => (
                  <ColorButton
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    onSelect={handleColorSelect}
                    ariaLabel={`Select sky color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Skog Farger */}
            <div className="mb-6">
              <SectionHeader title="Skog Farger" />
              <div className="grid grid-cols-4 gap-2">
                {forestColors.map((color) => (
                  <ColorButton
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    onSelect={handleColorSelect}
                    ariaLabel={`Select forest color ${color}`}
                  />
                ))}
              </div>
            </div>

         </div>

       {/* Fixed Bottom Section */}
       <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 min-h-fit">
         {/* Egendefinert farge */}
         <div className="mb-4">
           <button
             onClick={() => setShowCustomPicker(!showCustomPicker)}
             className="text-button w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg transition-colors"
           >
             Egendefinert farge
           </button>
           
           {showCustomPicker && (
             <div className="mt-3">
               <div className="text-sm text-gray-600 mb-2">1. Pick a color</div>
               <div className="relative w-full h-12 rounded-lg overflow-hidden border-2 border-gray-300">
                 <input
                   type="color"
                   value={selectedColor}
                   onChange={(e) => onColorSelect(e.target.value)}
                   className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
                 />
                 <div 
                   className="w-full h-full rounded-lg"
                   style={{ 
                     background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)',
                     border: '2px solid #124d49'
                   }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: selectedColor }} />
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* Tool Size Control - Single input for both brush and pencil */}
         {drawingMode !== 'eraser' && (
           <div className="flex items-center gap-2 mb-4">
             <label className="text-sm text-gray-600">Størrelse:</label>
             <input
               type="range"
               min="1"
               max="20"
               value={pencilSize || 16}
               onChange={(e) => onPencilSizeChange?.(Number(e.target.value))}
               className="w-24"
             />
             <span className="text-sm text-gray-600">{pencilSize || 16}px</span>
           </div>
         )}
         
         {/* Eraser Size - Only show when eraser is active */}
         {drawingMode === 'eraser' && (
           <div className="flex items-center gap-2 mb-4">
             <label className="text-sm text-gray-600">Viskelærstørrelse:</label>
             <input
               type="range"
               min="5"
               max="50"
               value={eraserSize || 20}
               onChange={(e) => onEraserSizeChange?.(Number(e.target.value))}
               className="w-24"
             />
             <span className="text-sm text-gray-600">{eraserSize || 20}px</span>
           </div>
         )}
       </div>
      
      {/* Color Wheel Picker Modal */}
      {showColorWheel && (
        <ColorWheelPicker
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onClose={() => setShowColorWheel(false)}
        />
      )}
    </div>
  )
} 