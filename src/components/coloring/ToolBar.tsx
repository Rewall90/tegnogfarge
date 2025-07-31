'use client'

// UPDATED interface for three specialized tools
export interface ToolBarProps {
  // REMOVED: tolerance - flood fill always uses 100%
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onDownload: () => void
  className?: string
}

export default function ToolBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  className = ""
}: ToolBarProps) {
  return (
    <div className={`bg-white border-b px-4 py-2 h-12 flex-shrink-0 flex items-center gap-4 ${className}`}>




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