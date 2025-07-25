'use client'

interface ToolModeSelectorProps {
  drawingMode: 'pencil' | 'fill' | 'eraser'; // THREE TOOLS
  onDrawingModeChange: (mode: 'pencil' | 'fill' | 'eraser') => void;
}

export function ToolModeSelector({
  drawingMode,
  onDrawingModeChange
}: ToolModeSelectorProps) {
  return (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => onDrawingModeChange('pencil')}
        className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-sm ${
          drawingMode === 'pencil'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        ✏️ Tegn
      </button>
      <button
        onClick={() => onDrawingModeChange('fill')}
        className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-sm ${
          drawingMode === 'fill'
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🎨 Fyll
      </button>
      <button
        onClick={() => onDrawingModeChange('eraser')}
        className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-sm ${
          drawingMode === 'eraser'
            ? 'bg-red-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🧹 Visk
      </button>
    </div>
  );
}