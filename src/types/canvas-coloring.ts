export type DrawingMode = 'fill' | 'brush' | 'eraser';

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
  brushSize: number
  tolerance: number
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