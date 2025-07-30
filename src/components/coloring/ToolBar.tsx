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