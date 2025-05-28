// Fargepalett komponenet
export interface ColorPaletteProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}

// Fargedata struktur
export interface SuggestedColor {
  name: string
  hex: string
}

// Fargekategori struktur  
export interface ColorCategory {
  title: string
  colors: string[]
}

// Standard fargepaletter
export interface ColorCategories {
  basic: ColorCategory
  skin: ColorCategory
  pastels: ColorCategory
  neutral: ColorCategory
}

// Coloring interface props
export interface ColoringInterfaceProps {
  drawingId: string
  title: string
  svgContent: string
  downloadUrl?: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

// SVG sanitizer options
export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
}

// SVG validation result
export interface SVGValidationResult {
  isValid: boolean
  hasColorableAreas: boolean
  colorableAreasCount: number
  warnings: string[]
}

export interface ColoringState {
  colors: Record<string, string>
  timestamp: number
  version: string
}

// SVGCanvas component props
export interface SVGCanvasProps {
  drawingId: string;
  svgContent: string;
  currentColor: string;
  onSave?: (svgData: string) => void;
  onColorChange?: (regions: Record<string, string>) => void;
} 