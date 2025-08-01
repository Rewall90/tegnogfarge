'use client'

interface LeftColorSidebarProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
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

function ColorButton({ color, isSelected, onSelect, ariaLabel }: ColorButtonProps) {
  return (
    <button
      onClick={() => onSelect(color)}
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
        style={{ backgroundColor: color }}
        aria-label={ariaLabel || `Select ${color}`}
      />

      {isSelected && (
        <div 
          className={`absolute w-4 h-4 rounded-full drop-shadow top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
            getOptimalDotColor(color) === 'white' ? 'bg-white' : 'bg-black'
          }`} 
        />
      )}
    </button>
  )
}

export default function LeftColorSidebar({
  selectedColor,
  onColorSelect,
  suggestedColors,
  className = ""
}: LeftColorSidebarProps) {

  const defaultColors = [
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
    '#000000', '#404040', '#808080', '#C0C0C0'
  ]

  const skinTones = [
    '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C4037',
    '#FFDBCB', '#F3D5AB', '#E8C5A0', '#DEB887', '#CD853F', '#A0522D',
    '#PEACHPUFF', '#NAVAJOWHITE', '#WHEAT', '#BURLYWOOD', '#TAN', '#ROSYBROWN'
  ]

  const hairColors = [
    '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', '#D2691E',
    '#000000', '#2F1B14', '#4A4A4A', '#8B7355', '#DAA520', '#FFD700'
  ]

  const eyeColors = [
    '#87CEEB', '#4682B4', '#0000CD', '#228B22', '#808080', '#8B4513',
    '#00CED1', '#20B2AA', '#32CD32', '#9ACD32', '#CD853F', '#A0522D'
  ]

  const lipColors = [
    '#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000', '#FF6347',
    '#FF4500', '#FFA07A', '#F08080', '#CD5C5C', '#A0522D', '#D2691E'
  ]

  const skyColors = [
    '#87CEEB', '#87CEFA', '#00BFFF', '#1E90FF', '#4169E1', '#0000CD',
    '#ADD8E6', '#B0C4DE', '#B0E0E6', '#AFEEEE', '#E0F6FF', '#F0F8FF'
  ]

  const forestColors = [
    '#228B22', '#32CD32', '#9ACD32', '#ADFF2F', '#7CFC00', '#7FFF00',
    '#006400', '#008000', '#008B00', '#00FF00', '#90EE90', '#98FB98'
  ]

  return (
    <div className={`w-full h-full bg-[#FEFAF6] border-r border-gray-200 grid overflow-hidden ${className}`}
         style={{
           display: 'grid',
           gridTemplateRows: 'auto 1fr',
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
                  onSelect={onColorSelect}
                  ariaLabel={color.name}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
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
                onSelect={onColorSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}