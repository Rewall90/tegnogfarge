export type DrawingMode = 'pencil' | 'fill' | 'eraser';

export interface ColoringCanvasProps {
  drawingId: string
  title: string
  imageUrl: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

export interface ColoringSettings {
  defaultTolerance?: number
  maxBrushSize?: number
  enableSmoothing?: boolean
  preserveDetails?: boolean
}

export interface ColoringState {
  imageData: ImageData | null
  originalImageData: ImageData | null
  currentColor: string
  pencilSize: number // Size for pencil tool
  eraserSize: number // Separate size for eraser tool
  // REMOVED: tolerance - flood fill always uses 100%
  isDrawing: boolean
  history: ImageData[]
  historyStep: number
  drawingMode: DrawingMode
  lastX: number | null
  lastY: number | null
}

export interface Point {
  x: number
  y: number
}

export interface ColorRGB {
  r: number
  g: number
  b: number
  a: number
} 