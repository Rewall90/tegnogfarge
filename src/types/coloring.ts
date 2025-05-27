// Coloring state interface
export interface ColoringState {
  drawingId: string
  coloredRegions: Record<string, string>
  timestamp: number
  version: string
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

// Component props interfaces
export interface SVGCanvasProps {
  drawingId: string
  svgContent: string
  currentColor: string
  onSave?: (svgData: string) => void
  onColorChange?: (coloredRegions: Record<string, string>) => void
}

export interface ColoringInterfaceProps {
  drawingId: string
  title: string
  svgContent: string
  downloadUrl?: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

// Sanity-related types
export interface SanityColoringImage {
  _id: string
  title: string
  description?: string
  svgContent?: string
  hasDigitalColoring: boolean
  suggestedColors?: Array<{ name: string; hex: string }>
  imageUrl?: string
  downloadUrl?: string
  category?: {
    title: string
    slug: string
  }
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  _createdAt: string
  _updatedAt: string
} 