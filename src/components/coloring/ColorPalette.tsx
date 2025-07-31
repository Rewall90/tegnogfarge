'use client'
import { useState } from 'react'
import ColorWheelPicker from './ColorWheelPicker'
import ToolSizeControl from './ToolSizeControl'

interface ColorPaletteProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
  // Tool size controls
  drawingMode?: 'pencil' | 'fill' | 'eraser'
  onDrawingModeChange?: (mode: 'pencil' | 'fill' | 'eraser') => void
  pencilSize?: number
  onPencilSizeChange?: (size: number) => void
  eraserSize?: number
  onEraserSizeChange?: (size: number) => void
  // Action handlers
  onUndo?: () => void
  onRedo?: () => void
  onReset?: () => void
  onDownload?: () => void
  onToggleZoom?: () => void
  currentMode?: 'draw' | 'zoom'
  canUndo?: boolean
  canRedo?: boolean
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
  onDrawingModeChange,
  pencilSize,
  onPencilSizeChange,
  eraserSize,
  onEraserSizeChange,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  onToggleZoom,
  currentMode,
  canUndo,
  canRedo
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [showColorWheel, setShowColorWheel] = useState(false)
  const [colorWheelPosition, setColorWheelPosition] = useState({ x: 0, y: 0 })
  const [colorWheelSize, setColorWheelSize] = useState({ width: 320, height: 450 })
  // Add state for popup
  const [showToolSizePopup, setShowToolSizePopup] = useState(false)
  const [toolSizePosition, setToolSizePosition] = useState({ x: 330, y: 550 }) // Start with correct position
  const [toolSizeSize, setToolSizeSize] = useState({ width: 200, height: 150 })
  
  // Fixed positioning - ToolSizeControl always opens at consistent position
  const getInitialToolSizePosition = () => {
    // Always use same positioning logic as ColorWheelPicker area
    // ToolSizeControl should always appear at x: 330, y: around 550 (under ColorWheelPicker area)
    return { 
      x: 330,     // Same x as ColorWheelPicker base position
      y: 550      // Fixed y position underneath ColorWheelPicker area
    }
  }
  
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
    <div className={`w-64 lg:w-64 md:w-48 hidden sm:flex flex-shrink-0 h-full bg-[#FEFAF6] border-r border-gray-200 grid overflow-hidden ${className}`}
         style={{
           display: 'grid',
           gridTemplateRows: 'auto 1fr auto auto auto',
           height: '100%'
         }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-display font-semibold text-lg">Fargepalett</h3>
      </div>

      {/* Scrollable Color Sections Container */}
      <div className="overflow-y-auto p-2 md:p-4" style={{ minHeight: 0 }}>
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

       {/* Tool Selection Section */}
       <div className="p-4 border-t border-gray-200 bg-[#FEFAF6]">
         <div className="flex items-center justify-between mb-2">
           <label className="text-sm text-gray-600">Verktøy:</label>
         </div>
         <div className="flex flex-wrap items-center gap-2">
           {/* Pencil Tool */}
           <button
             onClick={() => onDrawingModeChange?.('pencil')}
             className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
               drawingMode === 'pencil' 
                 ? 'border-blue-600 scale-110' 
                 : 'border-[#E5E7EB] hover:border-gray-300'
             }`}
           >
             <img 
               className="w-full h-full rounded-full" 
               src="/images/pencil-flood-eraser/pencil.png" 
               alt="Pencil tool"
             />
           </button>
           
           {/* Flood Fill Tool */}
           <button
             onClick={() => onDrawingModeChange?.('fill')}
             className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
               drawingMode === 'fill' 
                 ? 'border-green-600 scale-110' 
                 : 'border-[#E5E7EB] hover:border-gray-300'
             }`}
           >
             <img 
               className="w-full h-full rounded-full" 
               src="/images/pencil-flood-eraser/floodandfill.png" 
               alt="Flood fill tool"
             />
           </button>
           
           {/* Eraser Tool */}
           <button
             onClick={() => onDrawingModeChange?.('eraser')}
             className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
               drawingMode === 'eraser' 
                 ? 'border-red-600 scale-110' 
                 : 'border-[#E5E7EB] hover:border-gray-300'
             }`}
           >
             <img 
               className="w-full h-full rounded-full" 
               src="/images/pencil-flood-eraser/eraser.png" 
               alt="Eraser tool"
             />
           </button>
         </div>
       </div>

       {/* Action Tools Section */}
       <div className="p-4 border-t border-gray-200 bg-[#FEFAF6]">
         <div className="flex items-center justify-between mb-2">
           <label className="text-sm text-gray-600">Handlinger:</label>
         </div>
         <div className="flex flex-wrap items-center gap-2">
           {/* Zoom Tool */}
           <button 
            onClick={onToggleZoom}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              currentMode === 'zoom'
                ? 'border-blue-600 bg-blue-50 scale-110'
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5ZM10.5 7V14M7 10.5H14" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
           
           {/* Undo Tool */}
           <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              !canUndo 
                ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M20.0723 15.5117C20.0723 16.6895 19.8262 17.7148 19.334 18.5879C18.8418 19.4609 18.1299 20.1377 17.1982 20.6182C16.2725 21.0986 15.1533 21.3389 13.8408 21.3389H11.7314C11.4443 21.3389 11.21 21.2451 11.0283 21.0576C10.8467 20.8701 10.7559 20.6416 10.7559 20.3721C10.7559 20.1084 10.8467 19.8828 11.0283 19.6953C11.21 19.5078 11.4443 19.4141 11.7314 19.4141H13.7793C14.7227 19.4141 15.5195 19.2412 16.1699 18.8955C16.8262 18.5498 17.3213 18.0781 17.6553 17.4805C17.9951 16.8828 18.165 16.2031 18.165 15.4414C18.165 14.6797 17.9951 14.0059 17.6553 13.4199C17.3213 12.834 16.8262 12.377 16.1699 12.0488C15.5195 11.7148 14.7227 11.5479 13.7793 11.5479H8.18945L5.22754 11.416L5.5 10.915L7.69727 12.7695L9.95605 14.9668C10.0381 15.0488 10.1055 15.1455 10.1582 15.2568C10.2109 15.3682 10.2373 15.4941 10.2373 15.6348C10.2373 15.9043 10.1494 16.127 9.97363 16.3027C9.80371 16.4785 9.5752 16.5664 9.28809 16.5664C9.02441 16.5664 8.7959 16.4668 8.60254 16.2676L3.54883 11.3018C3.44922 11.2021 3.37305 11.0908 3.32031 10.9678C3.26758 10.8447 3.24121 10.7188 3.24121 10.5898C3.24121 10.4551 3.26758 10.3262 3.32031 10.2031C3.37305 10.0742 3.44922 9.96289 3.54883 9.86914L8.60254 4.90332C8.7959 4.69824 9.02441 4.5957 9.28809 4.5957C9.5752 4.5957 9.80371 4.68359 9.97363 4.85938C10.1494 5.03516 10.2373 5.26074 10.2373 5.53613C10.2373 5.67676 10.2109 5.80273 10.1582 5.91406C10.1055 6.01953 10.0381 6.11621 9.95605 6.2041L7.69727 8.41016L5.5 10.2646L5.22754 9.75488L8.18945 9.61426H13.7266C15.0566 9.61426 16.1963 9.86621 17.1455 10.3701C18.0947 10.8682 18.8184 11.5596 19.3164 12.4443C19.8203 13.3291 20.0723 14.3516 20.0723 15.5117Z" fill="#4E5969"/>
             </svg>
           </button>
           
           {/* Redo Tool */}
           <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              !canRedo 
                ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M3.24121 15.5117C3.24121 14.3516 3.49316 13.3291 3.99707 12.4443C4.50098 11.5596 5.22461 10.8682 6.16797 10.3701C7.11719 9.86621 8.25684 9.61426 9.58691 9.61426H15.124L18.0859 9.75488L17.8135 10.2646L15.6162 8.41016L13.3574 6.2041C13.2695 6.11621 13.1992 6.01953 13.1465 5.91406C13.0996 5.80273 13.0762 5.67676 13.0762 5.53613C13.0762 5.26074 13.1611 5.03516 13.3311 4.85938C13.5068 4.68359 13.7354 4.5957 14.0166 4.5957C14.2861 4.5957 14.5205 4.69824 14.7197 4.90332L19.7646 9.86914C19.8643 9.96289 19.9404 10.0742 19.9932 10.2031C20.0459 10.3262 20.0723 10.4551 20.0723 10.5898C20.0723 10.7188 20.0459 10.8447 19.9932 10.9678C19.9404 11.0908 19.8643 11.2021 19.7646 11.3018L14.7197 16.2676C14.5205 16.4668 14.2861 16.5664 14.0166 16.5664C13.7354 16.5664 13.5068 16.4785 13.3311 16.3027C13.1611 16.127 13.0762 15.9043 13.0762 15.6348C13.0762 15.4941 13.0996 15.3682 13.1465 15.2568C13.1992 15.1455 13.2695 15.0488 13.3574 14.9668L15.6162 12.7695L17.8135 10.915L18.0859 11.416L15.124 11.5479H9.54297C8.59375 11.5479 7.79395 11.7148 7.14355 12.0488C6.49316 12.377 5.99805 12.834 5.6582 13.4199C5.31836 14.0059 5.14844 14.6797 5.14844 15.4414C5.14844 16.2031 5.31836 16.8828 5.6582 17.4805C5.99805 18.0781 6.49316 18.5498 7.14355 18.8955C7.79395 19.2412 8.59375 19.4141 9.54297 19.4141H11.582C11.8691 19.4141 12.1035 19.5078 12.2852 19.6953C12.4727 19.8828 12.5664 20.1084 12.5664 20.3721C12.5664 20.6416 12.4727 20.8701 12.2852 21.0576C12.1035 21.2451 11.8691 21.3389 11.582 21.3389H9.47266C8.16016 21.3389 7.03809 21.0986 6.10645 20.6182C5.18066 20.1377 4.47168 19.4609 3.97949 18.5879C3.4873 17.7148 3.24121 16.6895 3.24121 15.5117Z" fill="#4E5969"/>
             </svg>
           </button>
           
           {/* Download Tool */}
           <button 
            onClick={onDownload}
            className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer border-[#E5E7EB] hover:border-gray-300"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
           
           {/* Clear Tool */}
           <button 
            onClick={onReset}
            className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer border-[#E5E7EB] hover:border-gray-300"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M11.6523 21.2334C10.3984 21.2334 9.22363 20.9961 8.12793 20.5215C7.03223 20.0527 6.06543 19.4023 5.22754 18.5703C4.39551 17.7441 3.74512 16.7832 3.27637 15.6875C2.80762 14.5859 2.57324 13.4082 2.57324 12.1543C2.57324 10.9004 2.80762 9.72559 3.27637 8.62988C3.74512 7.52832 4.39551 6.56152 5.22754 5.72949C6.06543 4.89746 7.03223 4.24707 8.12793 3.77832C9.22363 3.30957 10.3984 3.0752 11.6523 3.0752C12.9062 3.0752 14.0811 3.30957 15.1768 3.77832C16.2783 4.24707 17.2451 4.89746 18.0771 5.72949C18.9092 6.56152 19.5596 7.52832 20.0283 8.62988C20.4971 9.72559 20.7314 10.9004 20.7314 12.1543H18.9385C18.9385 11.1465 18.751 10.2031 18.376 9.32422C18.001 8.43945 17.4766 7.66602 16.8027 7.00391C16.1348 6.33594 15.3613 5.81445 14.4824 5.43945C13.6035 5.05859 12.6602 4.86816 11.6523 4.86816C10.6445 4.86816 9.69824 5.05859 8.81348 5.43945C7.93457 5.81445 7.16113 6.33594 6.49316 7.00391C5.83105 7.66602 5.30957 8.43945 4.92871 9.32422C4.55371 10.2031 4.36621 11.1465 4.36621 12.1543C4.36621 13.1621 4.55371 14.1055 4.92871 14.9844C5.30957 15.8633 5.83105 16.6367 6.49316 17.3047C7.16113 17.9727 7.93457 18.4941 8.81348 18.8691C9.69824 19.25 10.6445 19.4404 11.6523 19.4404C12.4375 19.4404 13.1846 19.3232 13.8936 19.0889C14.6025 18.8545 15.2529 18.5264 15.8447 18.1045C16.4424 17.6768 16.9609 17.1729 17.4004 16.5928C17.5762 16.3877 17.7812 16.2588 18.0156 16.2061C18.2559 16.1533 18.4814 16.2031 18.6924 16.3555C18.8975 16.502 19.0146 16.7012 19.0439 16.9531C19.0732 17.2051 18.9912 17.4512 18.7979 17.6914C18.2646 18.4062 17.623 19.0303 16.873 19.5635C16.123 20.0967 15.3027 20.5068 14.4121 20.7939C13.5215 21.0869 12.6016 21.2334 11.6523 21.2334ZM21.6982 10.4141C21.915 10.4141 22.0791 10.4609 22.1904 10.5547C22.3018 10.6484 22.3545 10.7715 22.3486 10.9238C22.3486 11.0762 22.2871 11.2344 22.1641 11.3984L20.1162 14.2373C19.9814 14.4365 19.8174 14.5361 19.624 14.5361C19.4307 14.5303 19.2637 14.4307 19.123 14.2373L17.084 11.3896C16.9668 11.2256 16.9053 11.0703 16.8994 10.9238C16.8994 10.7715 16.9521 10.6484 17.0576 10.5547C17.1631 10.4609 17.3242 10.4141 17.541 10.4141H21.6982Z" fill="#4E5969"/>
             </svg>
           </button>
         </div>
       </div>

       {/* Size Control Section - moved before Actions */}
       <div className="p-2 pb-4 md:p-4 md:pb-8 border-t border-gray-200 bg-[#FEFAF6]">
         {/* Tool Size Control with expand icon */}
         <div className="flex items-center justify-between mb-2">
           <label className="text-sm text-gray-600">Størrelse:</label>
           <button
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               console.log('Expand button clicked');
               // Always set ToolSizeControl to consistent position (330, 550)
               setToolSizePosition(getInitialToolSizePosition());
               setShowToolSizePopup(true);
             }}
             className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
             title="Expand size control"
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
               <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </button>
         </div>
         {/* Custom slider design matching popup */}
         <div className="flex items-center border border-[#E5E7EB] rounded-full gap-4 px-3 my-5 bg-white min-h-[44px]">
           {/* Thin brush icon */}
           <svg width="20" height="20" viewBox="0 0 28 28" fill="none" className="shrink-0">
             <path d="M2.1582 16.6348C2.04753 16.5176 1.99219 16.3841 1.99219 16.2344C1.99219 16.0781 2.04753 15.9414 2.1582 15.8242L3.88672 14.1055C5.60547 12.3867 7.08008 10.9414 8.31055 9.76953C9.54102 8.59115 10.5859 7.65039 11.4453 6.94727C12.3047 6.24414 13.0273 5.7526 13.6133 5.47266C14.2057 5.1862 14.7135 5.08203 15.1367 5.16016C15.5599 5.23177 15.957 5.44987 16.3281 5.81445C16.6862 6.17904 16.875 6.58919 16.8945 7.04492C16.9206 7.50065 16.7773 8.04102 16.4648 8.66602C16.1589 9.29102 15.6771 10.0299 15.0195 10.8828C14.3685 11.7357 13.5482 12.7318 12.5586 13.8711C11.4648 15.1341 10.6022 16.1953 9.9707 17.0547C9.33919 17.9076 8.9388 18.6042 8.76953 19.1445C8.60677 19.6784 8.67839 20.0951 8.98438 20.3945C9.23828 20.6354 9.58333 20.694 10.0195 20.5703C10.4622 20.4466 11.0189 20.1276 11.6895 19.6133C12.3665 19.0924 13.1836 18.3698 14.1406 17.4453C15.1888 16.4297 16.0872 15.6452 16.8359 15.0918C17.5911 14.5384 18.2292 14.2161 18.75 14.125C19.2773 14.0339 19.7233 14.1738 20.0879 14.5449C20.3613 14.8184 20.5046 15.1406 20.5176 15.5117C20.5371 15.8763 20.4329 16.319 20.2051 16.8398C19.9837 17.3607 19.6484 17.9857 19.1992 18.7148C18.8477 19.2878 18.5677 19.763 18.3594 20.1406C18.1576 20.5117 18.0306 20.8047 17.9785 21.0195C17.9329 21.2409 17.9655 21.4036 18.0762 21.5078C18.1738 21.612 18.3301 21.625 18.5449 21.5469C18.7663 21.4688 19.0397 21.3027 19.3652 21.0488C19.6973 20.8014 20.0879 20.4694 20.5371 20.0527C20.6608 19.929 20.7975 19.8672 20.9473 19.8672C21.097 19.8672 21.2305 19.9225 21.3477 20.0332C21.4714 20.1504 21.5299 20.2871 21.5234 20.4434C21.5169 20.5996 21.4421 20.7493 21.2988 20.8926C20.4199 21.8171 19.6387 22.3997 18.9551 22.6406C18.278 22.8815 17.7376 22.8001 17.334 22.3965C17.0801 22.1426 16.9434 21.8496 16.9238 21.5176C16.9043 21.1921 16.9629 20.8438 17.0996 20.4727C17.2428 20.1016 17.4284 19.7174 17.6562 19.3203C17.8841 18.9167 18.1152 18.5098 18.3496 18.0996C18.7663 17.377 19.0788 16.791 19.2871 16.3418C19.502 15.8926 19.4922 15.5508 19.2578 15.3164C19.1146 15.1797 18.9095 15.1569 18.6426 15.248C18.3822 15.3327 18.0664 15.5117 17.6953 15.7852C17.3307 16.0586 16.9206 16.4102 16.4648 16.8398C16.0091 17.263 15.5111 17.7415 14.9707 18.2754C14.4173 18.8223 13.8737 19.3236 13.3398 19.7793C12.8125 20.2285 12.3047 20.6126 11.8164 20.9316C11.3281 21.2441 10.8626 21.472 10.4199 21.6152C9.98372 21.765 9.57682 21.8073 9.19922 21.7422C8.82812 21.6836 8.48958 21.5013 8.18359 21.1953C7.80599 20.8177 7.60091 20.3945 7.56836 19.9258C7.54232 19.457 7.64323 18.9557 7.87109 18.4219C8.09896 17.888 8.41471 17.3314 8.81836 16.752C9.22201 16.166 9.67448 15.5703 10.1758 14.9648C10.6771 14.3594 11.1882 13.7507 11.709 13.1387C12.4186 12.3053 13.0566 11.5404 13.623 10.8438C14.196 10.1406 14.6615 9.51562 15.0195 8.96875C15.3841 8.41536 15.6152 7.94336 15.7129 7.55273C15.8171 7.1556 15.7552 6.84635 15.5273 6.625C15.2799 6.3776 14.9609 6.29297 14.5703 6.37109C14.1797 6.44922 13.6947 6.68685 13.1152 7.08398C12.5358 7.47461 11.849 8.02474 11.0547 8.73438C10.2604 9.44401 9.33594 10.3164 8.28125 11.3516C7.22656 12.3802 6.02865 13.5684 4.6875 14.916L2.96875 16.6348C2.85156 16.752 2.71484 16.8105 2.55859 16.8105C2.40885 16.8105 2.27539 16.752 2.1582 16.6348Z" fill="#8D95A3"/>
           </svg>
           
           {/* Custom track with draggable indicator */}
           <div className="relative flex-1 h-2">
             <svg width="100%" height="8" viewBox="0 0 308 8" fill="none" className="w-full">
               <path d="M0 4L303.994 0.052028C306.198 0.0234037 308 1.80223 308 4.00649C308 6.20573 306.206 7.98252 304.007 7.9611L0 5V4Z" fill="#787880" fillOpacity="0.15"/>
             </svg>
             
             <input
               type="range"
               min="1"
               max="50"
               value={pencilSize || 50}
               onChange={(e) => {
                 const size = Number(e.target.value);
                 onPencilSizeChange?.(size);
                 onEraserSizeChange?.(size);
               }}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             
             {/* Custom indicator */}
             <div 
               className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#8D95A3] shadow-lg pointer-events-none"
               style={{ 
                 left: `calc(${((pencilSize || 50) - 1) / 49 * 100}% - 8px)`
               }}
             />
           </div>
           
           {/* Thick brush icon */}
           <svg width="20" height="20" viewBox="0 0 28 28" fill="none" className="shrink-0">
             <path d="M2.59766 16.7129C2.36979 16.4915 2.20052 16.2181 2.08984 15.8926C1.97917 15.5671 1.96289 15.2122 2.04102 14.8281C2.12565 14.444 2.33073 14.0534 2.65625 13.6562C2.76693 13.526 2.89714 13.3828 3.04688 13.2266C3.19661 13.0638 3.36914 12.8848 3.56445 12.6895C3.75977 12.4941 3.97786 12.2793 4.21875 12.0449C4.45964 11.8105 4.72005 11.5534 5 11.2734C6.84245 9.45052 8.44401 7.97266 9.80469 6.83984C11.1654 5.70703 12.3405 4.88997 13.3301 4.38867C14.3262 3.88086 15.1888 3.65951 15.918 3.72461C16.6471 3.7832 17.3014 4.0957 17.8809 4.66211C18.3366 5.11133 18.5742 5.63216 18.5938 6.22461C18.6133 6.81706 18.457 7.49089 18.125 8.24609C17.793 9.0013 17.3242 9.84115 16.7188 10.7656C16.1198 11.6836 15.4264 12.6927 14.6387 13.793C14.1243 14.5156 13.6654 15.1602 13.2617 15.7266C12.8581 16.293 12.513 16.791 12.2266 17.2207C11.9401 17.6439 11.709 18.002 11.5332 18.2949C11.3574 18.5879 11.237 18.819 11.1719 18.9883C11.1133 19.151 11.1068 19.2617 11.1523 19.3203C11.1849 19.3659 11.2891 19.3496 11.4648 19.2715C11.6471 19.1934 11.8945 19.0501 12.207 18.8418C12.526 18.627 12.9134 18.3372 13.3691 17.9727C13.8314 17.6081 14.362 17.1589 14.9609 16.625C15.7422 15.9414 16.4486 15.3392 17.0801 14.8184C17.7181 14.291 18.3008 13.8874 18.8281 13.6074C19.3555 13.321 19.8438 13.1842 20.293 13.1973C20.7487 13.2103 21.1751 13.4121 21.5723 13.8027C21.8783 14.0957 22.0638 14.418 22.1289 14.7695C22.2005 15.1146 22.181 15.4889 22.0703 15.8926C21.9596 16.2962 21.7839 16.7357 21.543 17.2109C21.3086 17.6862 21.0384 18.2005 20.7324 18.7539C20.4525 19.2552 20.2083 19.6914 20 20.0625C19.7982 20.4336 19.6484 20.7298 19.5508 20.9512C19.4596 21.1725 19.4336 21.3027 19.4727 21.3418C19.5117 21.3809 19.6289 21.3451 19.8242 21.2344C20.0195 21.1237 20.2702 20.9512 20.5762 20.7168C20.8887 20.4759 21.2305 20.1797 21.6016 19.8281C21.7904 19.6654 21.9954 19.5775 22.2168 19.5645C22.4447 19.5449 22.6465 19.6198 22.8223 19.7891C23.0046 19.9648 23.0762 20.1764 23.0371 20.4238C23.0046 20.6647 22.8809 20.8926 22.666 21.1074C21.709 22.0514 20.8301 22.6309 20.0293 22.8457C19.235 23.0605 18.6068 22.9401 18.1445 22.4844C17.8255 22.1589 17.6465 21.804 17.6074 21.4199C17.5749 21.0358 17.6335 20.6322 17.7832 20.209C17.9395 19.7793 18.138 19.3529 18.3789 18.9297C18.6263 18.5 18.8672 18.0833 19.1016 17.6797C19.3034 17.3281 19.4889 17.0059 19.6582 16.7129C19.834 16.4199 19.9642 16.179 20.0488 15.9902C20.1335 15.7949 20.1497 15.6712 20.0977 15.6191C20.013 15.5345 19.8145 15.5996 19.502 15.8145C19.196 16.0228 18.7956 16.3418 18.3008 16.7715C17.806 17.2012 17.2331 17.7057 16.582 18.2852C15.319 19.3919 14.209 20.2643 13.252 20.9023C12.3014 21.5404 11.4746 21.9082 10.7715 22.0059C10.0749 22.1035 9.4694 21.8919 8.95508 21.3711C8.55143 20.974 8.32031 20.528 8.26172 20.0332C8.20964 19.5384 8.28776 19.0013 8.49609 18.4219C8.71094 17.8424 9.02344 17.2207 9.43359 16.5566C9.85026 15.8861 10.3288 15.1764 10.8691 14.4277C11.416 13.679 11.9857 12.888 12.5781 12.0547C13.0013 11.4688 13.4082 10.8991 13.7988 10.3457C14.1895 9.79232 14.5312 9.28776 14.8242 8.83203C15.1172 8.36979 15.332 7.98893 15.4688 7.68945C15.6055 7.38997 15.6348 7.20117 15.5566 7.12305C15.4525 7.0319 15.2018 7.13932 14.8047 7.44531C14.4076 7.7513 13.8704 8.23307 13.1934 8.89062C12.5228 9.54167 11.7122 10.3457 10.7617 11.3027C9.81771 12.2598 8.75 13.3438 7.55859 14.5547C7.3112 14.7956 7.08333 15.0234 6.875 15.2383C6.67318 15.4466 6.48438 15.6387 6.30859 15.8145C6.13932 15.9902 5.98633 16.1465 5.84961 16.2832C5.7194 16.4134 5.60547 16.5241 5.50781 16.6152C5.18229 16.9082 4.83724 17.097 4.47266 17.1816C4.10807 17.2598 3.75977 17.2565 3.42773 17.1719C3.10221 17.0807 2.82552 16.9277 2.59766 16.7129Z" fill="#8D95A3"/>
           </svg>
         </div>
         

{/* Add the popup */}
<ToolSizeControl
  pencilSize={pencilSize}
  onPencilSizeChange={onPencilSizeChange}
  onEraserSizeChange={onEraserSizeChange}
  isOpen={showToolSizePopup}
  onClose={() => setShowToolSizePopup(false)}
  position={toolSizePosition}
  onPositionChange={setToolSizePosition}
  size={toolSizeSize}
  onSizeChange={setToolSizeSize}
/>
       </div>
      
      {/* Color Wheel Picker Modal */}
      {showColorWheel && (
        <ColorWheelPicker
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onClose={() => setShowColorWheel(false)}
          onPositionChange={setColorWheelPosition}
          onSizeChange={setColorWheelSize}
        />
      )}
    </div>
  )
} 