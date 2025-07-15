'use client'

import { useState } from 'react';
import { ToolModeSelector } from './ToolModeSelector';
import { UndoButton } from './UndoButton';
import { type DrawingMode } from '@/types/canvas-coloring';

interface MobileToolbarProps {
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function MobileToolbar({
  drawingMode,
  onDrawingModeChange,
  onUndo,
  canUndo
}: MobileToolbarProps) {
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Expandable Tools Section */}
      <div className={`overflow-hidden transition-all duration-300 ${
        showTools ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0'
      }`}>
        <ToolModeSelector
          drawingMode={drawingMode}
          onDrawingModeChange={onDrawingModeChange}
        />
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between">
        {/* Tools Toggle Button */}
        <button
          onClick={() => setShowTools(!showTools)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-gray-200 ${
            showTools ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
          aria-label="Toggle tools menu"
        >
          <span className="text-lg">🎨</span>
        </button>

        {/* Current Mode Indicator */}
        <div className="flex-1 text-center text-sm text-gray-600">
          {drawingMode === 'fill' && 'Fyllmodus'}
          {drawingMode === 'brush' && 'Penselmodus'}
          {drawingMode === 'eraser' && 'Viskelær'}
        </div>

        {/* Undo Button */}
        <UndoButton onUndo={onUndo} canUndo={canUndo} />
      </div>
    </div>
  );
}