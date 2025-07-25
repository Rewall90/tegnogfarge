# Phase 3: Update UI Controls for Specialized Tools

## Overview
Update the toolbar and mobile controls to support the three specialized tools (Pencil, Flood Fill, Eraser), removing advanced settings and creating intuitive controls for each tool.

## Objectives
- ✅ Add controls for three specialized tools: Pencil, Fill, Eraser
- ✅ Remove advanced brush settings from UI
- ✅ Context-sensitive controls (size for pencil/eraser, color for pencil/fill)
- ✅ Remove tolerance controls (flood fill always uses 100%)
- ✅ Update mobile toolbar components
- ✅ Maintain clean, intuitive interface
- ✅ Ensure mobile and desktop consistency

## Prerequisites
- ✅ Phase 1 completed (Three specialized tools created)
- ✅ Phase 2 completed (Advanced tools removed)
- ✅ All three specialized tools working as primary drawing system
- ✅ Pencil and eraser boundary detection verified
- ✅ Flood fill 100% tolerance verified

## What Gets Removed from UI
- ❌ Brush hardness controls
- ❌ Opacity controls  
- ❌ Spacing controls
- ❌ Tolerance controls (flood fill now always uses 100%)
- ❌ Advanced brush settings

## What Gets Updated
- ✅ Drawing mode: Three buttons (Pencil, Fill, Eraser)
- ✅ Context-sensitive controls:
  - **Pencil mode**: Color selection + Size slider
  - **Fill mode**: Color selection only (no tolerance - always 100%)
  - **Eraser mode**: Size slider only (no color)
- ✅ Basic controls (undo, reset, download) - unchanged

## Step 3.1: Update Desktop ToolBar

**File:** `src/components/coloring/ToolBar.tsx`

### Update Interface
```typescript
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
```

### Three Tool Mode Controls
```typescript
{/* THREE TOOL MODE CONTROLS - Pencil, Fill, Eraser */}
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
```

### Context-Sensitive Size Controls
```typescript
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
      max="50" // Eraser can be larger than pencil
      value={eraserSize}
      onChange={(e) => onEraserSizeChange(Number(e.target.value))}
      className="w-24"
    />
    <span className="text-sm text-gray-600">{eraserSize}px</span>
  </div>
)}

{/* Fill Mode - No additional controls needed (100% tolerance hardcoded) */}
{drawingMode === 'fill' && (
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Toleranse: 100% (Maks)</span>
  </div>
)}
```

### Complete Updated ToolBar.tsx
```typescript
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
```

## Step 3.2: Update Mobile Toolbar Components

### Update ToolModeSelector

**File:** `src/components/coloring/MobileToolbar/ToolModeSelector.tsx`

```typescript
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
```

### Update Mobile Toolbar Main Component

**File:** `src/components/coloring/MobileToolbar/index.tsx`

```typescript
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
```

## Step 3.3: Update ColoringApp Integration

**File:** `src/components/coloring/ColoringApp.tsx`

Update the toolbar props to match the new three-tool interface:

```typescript
<ToolBar
  className="hidden md:block"
  // REMOVED: tolerance props - flood fill always uses 100%
  canUndo={historyStep > 0}
  canRedo={historyStep < history.length - 1}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onReset={handleReset}
  onDownload={handleDownload}
  drawingMode={state.drawingMode} // Now 'pencil' | 'fill' | 'eraser'
  onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
  pencilSize={state.pencilSize}
  onPencilSizeChange={(size: number) => setState(prev => ({ ...prev, pencilSize: size }))}
  eraserSize={state.eraserSize}
  onEraserSizeChange={(size: number) => setState(prev => ({ ...prev, eraserSize: size }))}
/>

<MobileToolbar
  drawingMode={state.drawingMode}
  onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
  onUndo={handleUndo}
  canUndo={historyStep > 0}
  pencilSize={state.pencilSize}
  onPencilSizeChange={(size: number) => setState(prev => ({ ...prev, pencilSize: size }))}
  eraserSize={state.eraserSize}
  onEraserSizeChange={(size: number) => setState(prev => ({ ...prev, eraserSize: size }))}
/>
```

## Step 3.4: Update Types

**File:** `src/types/canvas-coloring.ts`

Update the DrawingMode type:

```typescript
// THREE SPECIALIZED TOOLS
export type DrawingMode = 'pencil' | 'fill' | 'eraser'

// Update ColoringState for three tools
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
```

## Testing Checklist

### Step 3.5: UI Component Testing
- [ ] Desktop toolbar shows three tool buttons: Pencil, Fill, Eraser
- [ ] Pencil size slider appears only in pencil mode
- [ ] Eraser size slider appears only in eraser mode
- [ ] Fill mode shows "100% tolerance" indicator (no slider)
- [ ] No advanced brush settings visible
- [ ] Mobile toolbar shows three tool modes
- [ ] Mobile size controls appear for pencil/eraser modes
- [ ] Mode indicators show correct text and emojis
- [ ] All buttons function correctly
- [ ] Color coding works (blue=pencil, green=fill, red=eraser)

### Step 3.6: Integration Testing
- [ ] Toolbar props match component interfaces
- [ ] Mode switching works correctly between all three tools
- [ ] Pencil size changes sync with pencil tool
- [ ] Eraser size changes sync with eraser tool
- [ ] Color changes work for pencil and fill (but not eraser)
- [ ] Removed tolerance controls don't break fill functionality
- [ ] Undo/redo still functional
- [ ] Mobile controls work on touch devices
- [ ] Mobile size sliders work properly

### Step 3.7: Visual Design Testing
- [ ] UI looks clean and uncluttered with three tools
- [ ] Mobile interface is touch-friendly with compact three-button layout
- [ ] Responsive design works
- [ ] Icons and text are appropriate for each tool
- [ ] Color scheme is consistent and intuitive
- [ ] Context-sensitive controls provide good UX
- [ ] "100% tolerance" indicator is clear for fill mode

## Expected Results

After Phase 3:
- ✅ Clean UI controls for three specialized tools
- ✅ Context-sensitive controls (size for pencil/eraser, color for pencil/fill)
- ✅ No tolerance controls (flood fill hardcoded to 100%)
- ✅ Better mobile user experience with size controls
- ✅ Consistent desktop/mobile interface
- ✅ Intuitive color coding (blue=pencil, green=fill, red=eraser)
- ✅ Reduced cognitive load for users
- ✅ Fast three-way tool switching

## Validation Criteria

Before moving to Phase 4:
1. **UI supports three tools** - Pencil, Fill, Eraser buttons visible
2. **Context-sensitive controls work** - Right controls appear for each tool
3. **Mode switching works** - Smooth transitions between all three tools
4. **Size controls work** - Separate pencil and eraser size adjustments
5. **No tolerance controls** - Fill mode shows "100%" indicator instead
6. **Mobile friendly** - Touch interface responsive with size controls
7. **Visual consistency** - Design looks polished with intuitive colors
8. **No regressions** - All specialized tool functionality intact

## Next Phase
Once Phase 3 is complete and validated, proceed to **Phase 4: Final Cleanup & Testing** where we'll do final state management cleanup, comprehensive testing, and documentation updates.