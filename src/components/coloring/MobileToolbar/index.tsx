'use client'

import { useState } from 'react';
import { ToolModeSelector } from './ToolModeSelector';
import { UndoButton } from './UndoButton';

interface MobileToolbarProps {
  drawingMode: 'pencil' | 'fill' | 'eraser'; // THREE TOOLS
  onDrawingModeChange: (mode: 'pencil' | 'fill' | 'eraser') => void;
  onUndo: () => void;
  canUndo: boolean;
  // Add size controls for mobile
  pencilSize: number;
  onPencilSizeChange: (size: number) => void;
  eraserSize: number;
  onEraserSizeChange: (size: number) => void;
}

export function MobileToolbar({
  drawingMode,
  onDrawingModeChange,
  onUndo,
  canUndo,
  pencilSize,
  onPencilSizeChange,
  eraserSize,
  onEraserSizeChange
}: MobileToolbarProps) {
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Expandable Tools Section */}
      <div className={`overflow-hidden transition-all duration-300 ${
        showTools ? 'max-h-32 opacity-100 mb-4' : 'max-h-0 opacity-0'
      }`}>
        <ToolModeSelector
          drawingMode={drawingMode}
          onDrawingModeChange={onDrawingModeChange}
        />
        
        {/* Context-sensitive size controls for mobile */}
        {(drawingMode === 'pencil' || drawingMode === 'eraser') && (
          <div className="mt-3 flex items-center gap-2 justify-center">
            <label className="text-xs text-gray-600">
              {drawingMode === 'pencil' ? 'Pensel:' : 'Visk:'}
            </label>
            <input
              type="range"
              min={drawingMode === 'pencil' ? "1" : "5"}
              max={drawingMode === 'pencil' ? "20" : "50"}
              value={drawingMode === 'pencil' ? pencilSize : eraserSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (drawingMode === 'pencil') {
                  onPencilSizeChange(size);
                } else {
                  onEraserSizeChange(size);
                }
              }}
              className="flex-1 max-w-24"
            />
            <span className="text-xs text-gray-600 min-w-8">
              {drawingMode === 'pencil' ? pencilSize : eraserSize}px
            </span>
          </div>
        )}
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

        {/* THREE TOOL MODE INDICATOR */}
        <div className="flex-1 text-center text-sm text-gray-600">
          {drawingMode === 'pencil' && '✏️ Tegnmodus'}
          {drawingMode === 'fill' && '🎨 Fyllmodus (100%)'}
          {drawingMode === 'eraser' && '🧹 Viskelærmodus'}
        </div>

        {/* UNCHANGED Undo Button */}
        <UndoButton onUndo={onUndo} canUndo={canUndo} />
      </div>
    </div>
  );
}