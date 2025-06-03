'use client'

import { type DrawingMode } from '@/types/canvas-coloring'

export interface ToolBarProps {
  tolerance: number
  onToleranceChange: (tolerance: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onDownload: () => void
  drawingMode: DrawingMode
  onDrawingModeChange: (mode: DrawingMode) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
}

export default function ToolBar({
  tolerance,
  onToleranceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  drawingMode,
  onDrawingModeChange,
  brushSize,
  onBrushSizeChange
}: ToolBarProps) {
  return (
    <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
      {/* Drawing Mode */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDrawingModeChange('fill')}
          className={`px-3 py-1 rounded ${
            drawingMode === 'fill'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Fyll
        </button>
        <button
          onClick={() => onDrawingModeChange('brush')}
          className={`px-3 py-1 rounded ${
            drawingMode === 'brush'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Tegn
        </button>
      </div>

      {/* Brush Size (only show when in brush mode) */}
      {drawingMode === 'brush' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Penselstørrelse:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600">{brushSize}px</span>
        </div>
      )}

      {/* Tolerance (only show when in fill mode) */}
      {drawingMode === 'fill' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Toleranse:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={tolerance}
            onChange={(e) => onToleranceChange(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600">{tolerance}</span>
        </div>
      )}

      {/* History Controls */}
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

      {/* Reset & Download */}
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