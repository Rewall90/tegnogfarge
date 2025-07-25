# Drawing Tools Refactoring Guide: Separate Pencil, Flood Fill, and Eraser Tools

## Overview
This guide outlines the step-by-step process to refactor our complex tool implementation into three separate, specialized tools:
- **Pencil Tool**: Simple drawing with black pixel boundary detection
- **Flood Fill Tool**: Fill areas with 100% tolerance (always)
- **Eraser Tool**: Remove content with black pixel boundary detection

## Current Complex Implementation Analysis

### Files Involved:
- `src/core/viewport/BrushTool.ts` - 516 lines of advanced brush logic
- `src/core/viewport/DrawingToolManager.ts` - Complex tool management
- `src/core/viewport/ToolCoordinateHandler.ts` - Advanced coordinate handling
- `src/components/coloring/ColoringApp.tsx` - Integration layer
- `src/components/coloring/ToolBar.tsx` - UI controls
- `src/components/coloring/MobileToolbar/` - Mobile controls

### Features to Remove:
- ❌ Bresenham's algorithm interpolation
- ❌ Complex coordinate transformation system
- ❌ Pressure sensitivity
- ❌ Hardness, opacity, spacing settings
- ❌ RequestAnimationFrame batching
- ❌ Complex tool management architecture

### Features to Keep and Improve:
- ✅ Basic drawing state (`isDrawing`)
- ✅ Color and size settings
- ✅ Simple coordinate conversion
- ✅ Basic moveTo/lineTo/stroke pattern
- ✅ **Black pixel boundary detection** (for pencil and eraser)
- ✅ **Flood fill with 100% tolerance** (always)
- ✅ **Separate tool instances** for pencil, fill, and eraser

## Step-by-Step Refactoring Plan

### Phase 1: Create Specialized Drawing Tools

#### Step 1.1: Create Pencil Tool with Boundary Detection
**File:** `src/components/coloring/PencilTool.ts`

Create a pencil tool that respects black pixel boundaries:

```typescript
interface PencilSettings {
  color: string;
  size: number;
}

export class PencilTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private settings: PencilSettings;
  private lastPoint: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = { color: '#000000', size: 2 };
  }

  // Simple coordinate conversion
  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  // Check if pixel is black (boundary detection)
  private isBlackPixel(x: number, y: number): boolean {
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const [r, g, b] = imageData.data;
    return r < 50 && g < 50 && b < 50; // Consider very dark pixels as black
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't start drawing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.isDrawing = true;
    this.lastPoint = coords;
    
    this.ctx.strokeStyle = this.settings.color;
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  handlePointerMove(e: PointerEvent) {
    if (!this.isDrawing || !this.lastPoint) return;
    
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't draw on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastPoint = coords;
  }

  handlePointerUp(e: PointerEvent) {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  setColor(color: string) { this.settings.color = color; }
  setSize(size: number) { this.settings.size = size; }
}
```

#### Step 1.2: Create Flood Fill Tool with 100% Tolerance
**File:** `src/components/coloring/FloodFillTool.ts`

Create a flood fill tool that always uses maximum tolerance:

```typescript
export class FloodFillTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor((clientX - rect.left) * (this.canvas.width / rect.width)),
      y: Math.floor((clientY - rect.top) * (this.canvas.height / rect.height))
    };
  }

  handleClick(e: PointerEvent, fillColor: string) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Always use 100% tolerance for flood fill
    this.floodFill(coords.x, coords.y, fillColor, 100);
  }

  private floodFill(startX: number, startY: number, fillColor: string, tolerance: number) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Convert fill color to RGB
    const fillRGB = this.hexToRgb(fillColor);
    if (!fillRGB) return;
    
    // Get starting pixel color
    const startIndex = (startY * this.canvas.width + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    
    // Don't fill if starting color is same as fill color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) return;
    
    // Flood fill algorithm with 100% tolerance
    const stack = [[startX, startY]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
        continue;
      }
      
      const index = (y * this.canvas.width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      // With 100% tolerance, fill everything except very dark pixels (boundaries)
      const isDarkBoundary = r < 50 && g < 50 && b < 50;
      if (isDarkBoundary) continue;
      
      visited.add(key);
      
      // Fill this pixel
      data[index] = fillRGB.r;
      data[index + 1] = fillRGB.g;
      data[index + 2] = fillRGB.b;
      data[index + 3] = 255; // Full opacity
      
      // Add neighbors to stack
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
```

#### Step 1.3: Create Eraser Tool with Boundary Detection
**File:** `src/components/coloring/EraserTool.ts`

Create an eraser tool that respects black pixel boundaries:

```typescript
interface EraserSettings {
  size: number;
}

export class EraserTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isErasing = false;
  private settings: EraserSettings;
  private lastPoint: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = { size: 10 };
  }

  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  private isBlackPixel(x: number, y: number): boolean {
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const [r, g, b] = imageData.data;
    return r < 50 && g < 50 && b < 50;
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't start erasing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.isErasing = true;
    this.lastPoint = coords;
    
    // Set up eraser (composite operation)
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  handlePointerMove(e: PointerEvent) {
    if (!this.isErasing || !this.lastPoint) return;
    
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't erase black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastPoint = coords;
  }

  handlePointerUp(e: PointerEvent) {
    this.isErasing = false;
    this.lastPoint = null;
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
  }

  setSize(size: number) { this.settings.size = size; }
}
```

#### Step 1.4: Update ColoringApp Integration
**File:** `src/components/coloring/ColoringApp.tsx`

Replace complex tool management with specialized tool integration:

1. Remove imports related to advanced tools
2. Add imports for PencilTool, FloodFillTool, EraserTool
3. Replace tool manager logic with direct tool handling
4. Update event handlers for three separate tools

### Phase 2: Clean Up Advanced Tool Files

#### Step 2.1: Remove Advanced Tool Files
**Files to Delete:**
- `src/core/viewport/BrushTool.ts`
- `src/core/viewport/DrawingToolManager.ts`
- `src/core/viewport/ToolCoordinateHandler.ts`

#### Step 2.2: Update Import Dependencies
**Files to Update:**
- `src/components/coloring/ColoringApp.tsx` - Remove advanced tool imports
- Any other files importing the deleted tools

### Phase 3: Simplify UI Controls

#### Step 3.1: Update ToolBar
**File:** `src/components/coloring/ToolBar.tsx`

Update controls for three separate tools:
- Add three tool mode buttons: Pencil, Fill, Eraser
- Show size control for Pencil and Eraser tools
- Show color control for Pencil and Fill tools
- Remove tolerance control (flood fill always uses 100%)
- Remove advanced brush settings

#### Step 3.2: Update Mobile Toolbar
**Files:** `src/components/coloring/MobileToolbar/`

Update mobile controls for three tools:
- Add three tool mode buttons: Pencil, Fill, Eraser
- Context-sensitive controls (size for pencil/eraser, color for pencil/fill)
- Remove tolerance controls
- Remove advanced brush settings

### Phase 4: Update State Management

#### Step 4.1: Simplify Drawing State
**File:** `src/components/coloring/ColoringApp.tsx`

Update state interface:
```typescript
// Updated state for three separate tools
interface SimplifiedState {
  currentColor: string;
  pencilSize: number;
  eraserSize: number;
  drawingMode: 'pencil' | 'fill' | 'eraser'; // Three specialized tools
  // Remove: tolerance (always 100% for fill), brushSize, opacity, hardness, spacing, etc.
}
```

#### Step 4.2: Remove Advanced Coordinate System
**Files to Clean Up:**
- `src/core/viewport/CoordinateSystem.ts` - Simplify or remove if only used by advanced tools
- Remove complex viewport integration if not needed

### Phase 5: Testing and Validation

#### Step 5.1: Test Basic Functionality
- ✅ Pencil tool draws continuous lines with boundary detection
- ✅ Fill tool works with 100% tolerance
- ✅ Eraser tool removes content with boundary detection
- ✅ Color changes work for pencil and fill
- ✅ Size changes work for pencil and eraser
- ✅ Black pixel boundaries are respected
- ✅ Mobile touch events work for all tools

#### Step 5.2: Performance Testing
- ✅ Drawing is smooth without lag
- ✅ No memory leaks from removed code
- ✅ Canvas rendering is efficient

### Phase 6: Documentation Update

#### Step 6.1: Update Implementation Notes
**File:** `docs/pencil-up-dated.md`

Update analysis to reflect the simplified implementation that now matches the documentation.

#### Step 6.2: Code Comments
Add clear comments in the new SimplePencil class explaining each step according to `docs/pencil.md`.

## Dependency Impact Analysis

### Files That Import Current Tools:
1. **ColoringApp.tsx** - Main integration point
   - Impact: Major refactoring needed
   - Action: Replace tool manager with simple pencil

2. **ToolBar.tsx** - UI controls
   - Impact: Remove advanced controls
   - Action: Simplify to basic pencil settings

3. **MobileToolbar/** - Mobile UI
   - Impact: Simplify controls
   - Action: Remove advanced options

### Files That May Be Affected:
1. **ViewportManager** - If tightly coupled
   - Impact: Check zoom/pan integration
   - Action: Ensure simple pencil works with zoom

2. **Types** - Drawing-related types
   - Impact: May need to update interfaces
   - Action: Simplify type definitions

## Before/After Comparison

### Before (Current):
- 516 lines in BrushTool.ts
- Complex coordinate transformation
- Boundary detection
- Advanced brush settings
- Tool management architecture

### After (Target):
- ~100 lines each in PencilTool.ts, FloodFillTool.ts, EraserTool.ts
- Basic coordinate conversion
- Simple moveTo/lineTo/stroke for pencil/eraser
- Flood fill algorithm for fill tool
- Black pixel boundary detection for pencil/eraser
- 100% tolerance flood fill
- Basic color/size settings per tool
- Direct event handling

## Implementation Checklist

### Phase 1: Create Specialized Tools
- [ ] Create `PencilTool.ts` with boundary detection
- [ ] Create `FloodFillTool.ts` with 100% tolerance
- [ ] Create `EraserTool.ts` with boundary detection
- [ ] Test all three tools individually
- [ ] Verify boundary detection works
- [ ] Verify flood fill uses 100% tolerance

### Phase 2: Integration
- [ ] Update `ColoringApp.tsx` to use all three tools
- [ ] Remove references to old tool manager
- [ ] Update event handlers for pencil, fill, and eraser modes
- [ ] Implement tool switching logic

### Phase 3: UI Updates
- [ ] Update `ToolBar.tsx` for three tool modes
- [ ] Update `MobileToolbar` components for three tools
- [ ] Add pencil/fill/eraser mode buttons
- [ ] Remove tolerance controls (always 100% for fill)
- [ ] Context-sensitive size/color controls

### Phase 4: Cleanup
- [ ] Delete `BrushTool.ts`
- [ ] Delete `DrawingToolManager.ts`
- [ ] Delete `ToolCoordinateHandler.ts`
- [ ] Update all import statements

### Phase 5: State Management
- [ ] Update drawing state interface for three tools
- [ ] Add pencilSize and eraserSize to state
- [ ] Remove tolerance from state (always 100% for fill)
- [ ] Update drawingMode type: 'pencil' | 'fill' | 'eraser'

### Phase 6: Testing
- [ ] Test pencil drawing with boundary detection
- [ ] Test fill tool with 100% tolerance
- [ ] Test eraser tool with boundary detection
- [ ] Test all tools on desktop and mobile
- [ ] Test color changes for pencil and fill
- [ ] Test size changes for pencil and eraser
- [ ] Test tool switching
- [ ] Test zoom/pan integration with all tools

### Phase 7: Documentation
- [ ] Update `pencil-up-dated.md` to reflect three separate tools
- [ ] Add comments to all three tool classes
- [ ] Document boundary detection behavior
- [ ] Document 100% tolerance flood fill behavior

### Final Validation
- [ ] Pencil tool respects black pixel boundaries
- [ ] Fill tool always uses 100% tolerance
- [ ] Eraser tool respects black pixel boundaries  
- [ ] All three tools have separate, clean implementations
- [ ] Performance is acceptable for all tools
- [ ] Mobile and desktop work correctly
- [ ] Tool switching works smoothly
- [ ] Zoom/pan functionality preserved