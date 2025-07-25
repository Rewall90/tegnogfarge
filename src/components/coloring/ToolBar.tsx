'use client'

import { type DrawingMode } from '@/types/canvas-coloring'

// UPDATED interface for three specialized tools
export interface ToolBarProps {
  // REMOVED: tolerance - flood fill always uses 100%
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onDownload: () => void
  drawingMode: 'pencil' | 'fill' | 'eraser' // THREE specialized tools
  onDrawingModeChange: (mode: 'pencil' | 'fill' | 'eraser') => void
  pencilSize: number // Size for pencil tool
  onPencilSizeChange: (size: number) => void
  eraserSize: number // Separate size for eraser tool
  onEraserSizeChange: (size: number) => void
  className?: string
}

export default function ToolBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  drawingMode,
  onDrawingModeChange,
  pencilSize,
  onPencilSizeChange,
  eraserSize,
  onEraserSizeChange,
  className = ""
}: ToolBarProps) {
  return (
    <div className={`bg-white border-b px-4 py-2 h-12 flex-shrink-0 flex items-center gap-4 ${className}`}>
      {/* THREE TOOL MODE CONTROLS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDrawingModeChange('pencil')}
          className={`px-3 py-1 rounded ${
            drawingMode === 'pencil'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          ✏️ Tegn
        </button>
        <button
          onClick={() => onDrawingModeChange('fill')}
          className={`px-3 py-1 rounded ${
            drawingMode === 'fill'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🎨 Fyll
        </button>
        <button
          onClick={() => onDrawingModeChange('eraser')}
          className={`px-3 py-1 rounded ${
            drawingMode === 'eraser'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          🧹 Viskelær
        </button>
      </div>

      {/* CONTEXT-SENSITIVE SIZE CONTROLS */}
      {/* Pencil Size - Only show when in pencil mode */}
      {drawingMode === 'pencil' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Penselstørrelse:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={pencilSize}
            onChange={(e) => onPencilSizeChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600">{pencilSize}px</span>
        </div>
      )}

      {/* Eraser Size - Only show when in eraser mode */}
      {drawingMode === 'eraser' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Viskelærstørrelse:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={eraserSize}
            onChange={(e) => onEraserSizeChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600">{eraserSize}px</span>
        </div>
      )}

      {/* Fill Mode - Show 100% tolerance indicator */}
      {drawingMode === 'fill' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Toleranse: 100% (Maks)</span>
        </div>
      )}

      {/* UNCHANGED History Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`px-3 py-1 rounded ${
            canUndo
              ? 'bg-gray-100 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          Angre
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`px-3 py-1 rounded ${
            canRedo
              ? 'bg-gray-100 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          Gjør om
        </button>
      </div>

      {/* UNCHANGED Reset & Download */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onReset}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          Nullstill
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Last ned
        </button>
      </div>
    </div>
  )
} 