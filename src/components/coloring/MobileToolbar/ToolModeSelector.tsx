import { type DrawingMode } from '@/types/canvas-coloring';

interface ToolModeSelectorProps {
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
}

export function ToolModeSelector({
  drawingMode,
  onDrawingModeChange
}: ToolModeSelectorProps) {
  return (
    <div className="flex justify-center gap-6">
      <button
        onClick={() => onDrawingModeChange('brush')}
        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
          drawingMode === 'brush' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">✏️</span>
        <span className="text-xs">Pensel</span>
      </button>
      
      <button
        onClick={() => onDrawingModeChange('fill')}
        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
          drawingMode === 'fill' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">🪣</span>
        <span className="text-xs">Fyll</span>
      </button>
      
      <button
        onClick={() => onDrawingModeChange('eraser')}
        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
          drawingMode === 'eraser' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">🧽</span>
        <span className="text-xs">Viskelær</span>
      </button>
    </div>
  );
}