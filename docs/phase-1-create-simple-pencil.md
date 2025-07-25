# Phase 1: Create Specialized Drawing Tools

## Overview
Create three separate, specialized drawing tools with specific behaviors, while keeping existing functionality intact for testing.

## Objectives
- ✅ Create pencil tool with black pixel boundary detection
- ✅ Create flood fill tool with 100% tolerance (always)
- ✅ Create eraser tool with black pixel boundary detection
- ✅ Test all tools work alongside existing functionality
- ✅ Validate approach before making destructive changes
- ✅ Ensure mobile and desktop compatibility

## What Gets Created
- New `PencilTool.ts` class with boundary detection
- New `FloodFillTool.ts` class with 100% tolerance
- New `EraserTool.ts` class with boundary detection
- Basic integration in `ColoringApp.tsx`
- Simple coordinate conversion for all tools
- Direct event handling for each tool

## Step 1.1: Create Pencil Tool with Boundary Detection

**File:** `src/components/coloring/PencilTool.ts`

Create a pencil tool that respects black pixel boundaries:

```typescript
/**
 * PencilTool - Pencil drawing with black pixel boundary detection
 * Prevents drawing on black pixels (coloring book boundaries)
 */

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
    this.settings = { color: '#000000', size: 3 };
  }

  /**
   * Simple coordinate conversion
   */
  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  /**
   * Check if pixel is black (boundary detection)
   * Returns true for very dark pixels (RGB < 50)
   */
  private isBlackPixel(x: number, y: number): boolean {
    if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
      return true; // Treat out-of-bounds as boundaries
    }
    
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const [r, g, b] = imageData.data;
    return r < 50 && g < 50 && b < 50;
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't start drawing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.isDrawing = true;
    this.lastPoint = coords;
    
    // Set stroke properties
    this.ctx.strokeStyle = this.settings.color;
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Start new path
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

  setColor(color: string) { 
    this.settings.color = color; 
  }
  
  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(20, size)); 
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isDrawing;
  }
}
```

## Step 1.2: Create Flood Fill Tool with 100% Tolerance

**File:** `src/components/coloring/FloodFillTool.ts`

Create a flood fill tool that always uses maximum tolerance:

```typescript
/**
 * FloodFillTool - Flood fill with hardcoded 100% tolerance
 * Always fills entire areas except black boundaries
 */

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
    this.floodFill(coords.x, coords.y, fillColor);
  }

  private floodFill(startX: number, startY: number, fillColor: string) {
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
    
    // Flood fill with 100% tolerance - fill everything except very dark pixels
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

## Step 1.3: Create Eraser Tool with Boundary Detection

**File:** `src/components/coloring/EraserTool.ts`

Create an eraser tool that respects black pixel boundaries:

```typescript
/**
 * EraserTool - Eraser with black pixel boundary detection
 * Prevents erasing black pixels (coloring book boundaries)
 */

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

  /**
   * Check if pixel is black (boundary detection)
   */
  private isBlackPixel(x: number, y: number): boolean {
    if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
      return true; // Treat out-of-bounds as boundaries
    }
    
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

  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(50, size)); 
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isErasing;
  }
}
```

## Step 1.4: Add Basic Integration to ColoringApp

**File:** `src/components/coloring/ColoringApp.tsx`

Add these changes to test all three specialized tools alongside existing functionality:

### Add Imports
```typescript
import { PencilTool } from './PencilTool';
import { FloodFillTool } from './FloodFillTool';
import { EraserTool } from './EraserTool';
```

### Add State for Specialized Tools
```typescript
// Add to existing state
const pencilToolRef = useRef<PencilTool | null>(null);
const floodFillToolRef = useRef<FloodFillTool | null>(null);
const eraserToolRef = useRef<EraserTool | null>(null);
const [useNewTools, setUseNewTools] = useState(false); // Toggle for testing
const [newToolMode, setNewToolMode] = useState<'pencil' | 'fill' | 'eraser'>('pencil');
```

### Initialize Specialized Tools
```typescript
// Add this useEffect after canvas setup
useEffect(() => {
  const mainCanvas = mainCanvasRef.current;
  if (mainCanvas && state.imageData) {
    // Initialize all three tools
    if (!pencilToolRef.current) {
      pencilToolRef.current = new PencilTool(mainCanvas);
    }
    if (!floodFillToolRef.current) {
      floodFillToolRef.current = new FloodFillTool(mainCanvas);
    }
    if (!eraserToolRef.current) {
      eraserToolRef.current = new EraserTool(mainCanvas);
    }
  }
}, [state.imageData]); // Initialize after canvas is ready
```

### Update Event Handlers for Testing
```typescript
// Modify existing mouse handlers to route to specialized tools when enabled
const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom') {
    // Existing zoom logic...
    setIsPanning(true);
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  } else {
    // NEW: Route to specialized tools if enabled
    if (useNewTools) {
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        buttons: e.buttons,
        pressure: 0.5,
        pointerId: 1,
        pointerType: 'mouse'
      });

      if (newToolMode === 'pencil') {
        pencilToolRef.current?.handlePointerDown(pointerEvent);
      } else if (newToolMode === 'fill') {
        floodFillToolRef.current?.handleClick(pointerEvent, state.currentColor);
      } else if (newToolMode === 'eraser') {
        eraserToolRef.current?.handlePointerDown(pointerEvent);
      }
      e.preventDefault();
      return;
    }
    
    // Existing complex tool logic...
    if (state.drawingMode === 'brush' || state.drawingMode === 'eraser') {
      // ... existing tool manager code
    }
  }
}, [currentMode, state.drawingMode, useNewTools, newToolMode, state.currentColor]);

const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom' && isPanning) {
    // Existing zoom logic...
  } else if (useNewTools) {
    const pointerEvent = new PointerEvent('pointermove', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
      buttons: e.buttons,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'mouse'
    });

    if (newToolMode === 'pencil') {
      pencilToolRef.current?.handlePointerMove(pointerEvent);
    } else if (newToolMode === 'eraser') {
      eraserToolRef.current?.handlePointerMove(pointerEvent);
    }
  } else {
    // Existing tool logic...
  }
}, [currentMode, isPanning, useNewTools, newToolMode]);

const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom') {
    setIsPanning(false);
  } else if (useNewTools) {
    const pointerEvent = new PointerEvent('pointerup', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
      buttons: e.buttons,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'mouse'
    });

    if (newToolMode === 'pencil') {
      pencilToolRef.current?.handlePointerUp(pointerEvent);
    } else if (newToolMode === 'eraser') {
      eraserToolRef.current?.handlePointerUp(pointerEvent);
    }
  } else {
    // Existing tool logic...
  }
}, [currentMode, useNewTools, newToolMode]);
```

### Add Testing Controls for New Tools
```typescript
// Add this temporarily to the UI for testing
<div className="flex gap-2 mb-4 p-2 bg-yellow-100 rounded">
  <button
    onClick={() => setUseNewTools(!useNewTools)}
    className={`px-3 py-1 rounded ${
      useNewTools ? 'bg-green-600 text-white' : 'bg-gray-200'
    }`}
  >
    New Tools: {useNewTools ? 'ON' : 'OFF'}
  </button>
  
  {useNewTools && (
    <>
      <button
        onClick={() => setNewToolMode('pencil')}
        className={`px-3 py-1 rounded ${
          newToolMode === 'pencil' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        Pencil
      </button>
      <button
        onClick={() => setNewToolMode('fill')}
        className={`px-3 py-1 rounded ${
          newToolMode === 'fill' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        Fill (100%)
      </button>
      <button
        onClick={() => setNewToolMode('eraser')}
        className={`px-3 py-1 rounded ${
          newToolMode === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        Eraser
      </button>
    </>
  )}
</div>
```

### Sync Settings
```typescript
// Add useEffect to sync color and size for all tools
useEffect(() => {
  if (useNewTools) {
    // Sync pencil tool
    const pencilTool = pencilToolRef.current;
    if (pencilTool) {
      pencilTool.setColor(state.currentColor);
      pencilTool.setSize(state.brushSize);
    }
    
    // Sync eraser tool (only size)
    const eraserTool = eraserToolRef.current;
    if (eraserTool) {
      eraserTool.setSize(state.brushSize);
    }
    
    // Flood fill tool doesn't need syncing (uses color directly on click)
  }
}, [state.currentColor, state.brushSize, useNewTools]);
```

## Testing Checklist

### Step 1.5: Basic Functionality Testing
- [ ] Create `PencilTool.ts` file
- [ ] Create `FloodFillTool.ts` file
- [ ] Create `EraserTool.ts` file
- [ ] Add integration code to `ColoringApp.tsx`
- [ ] Test toggle button appears
- [ ] Test new tools can be enabled/disabled
- [ ] Test tool switching between pencil/fill/eraser
- [ ] Test pencil drawing with mouse
- [ ] Test pencil boundary detection (can't draw on black)
- [ ] Test flood fill with 100% tolerance
- [ ] Test eraser with boundary detection (can't erase black)
- [ ] Verify coordinates are correct for all tools
- [ ] Test color changes work for pencil and fill
- [ ] Test size changes work for pencil and eraser

### Step 1.6: Boundary Detection Testing
- [ ] Pencil tool stops at black pixel boundaries
- [ ] Eraser tool stops at black pixel boundaries
- [ ] Flood fill respects black boundaries with 100% tolerance
- [ ] Out-of-bounds coordinates handled correctly
- [ ] Dark pixels (RGB < 50) treated as boundaries

### Step 1.7: Compatibility Testing
- [ ] Verify existing fill tool still works when new tools are off
- [ ] Verify zoom/pan still works
- [ ] Verify existing brush tool works when new tools are off
- [ ] Test switching between new/old tools doesn't break anything
- [ ] Test mobile touch events work with all new tools

### Step 1.8: Performance Testing
- [ ] Drawing feels smooth and responsive for all tools
- [ ] Flood fill performance acceptable on large areas
- [ ] Boundary detection doesn't cause lag
- [ ] No memory leaks from pixel data reads
- [ ] No console errors

## Expected Results

After Phase 1, you should have:
- ✅ Working pencil tool with black pixel boundary detection
- ✅ Working flood fill tool with hardcoded 100% tolerance
- ✅ Working eraser tool with black pixel boundary detection
- ✅ Ability to toggle between new specialized tools and existing complex tools
- ✅ Proof that the specialized approach works
- ✅ Confidence to proceed with removing complex tools
- ✅ No broken functionality

## Validation Criteria

Before moving to Phase 2:
1. **Pencil tool respects boundaries** - Cannot draw on black pixels (RGB < 50)
2. **Flood fill uses 100% tolerance** - Fills entire areas except black boundaries
3. **Eraser tool respects boundaries** - Cannot erase black pixels (RGB < 50)
4. **Coordinates are accurate** - All tools work where you click/touch
5. **Color/size changes work** - Settings sync correctly for appropriate tools
6. **Tool switching works** - Can switch between pencil/fill/eraser smoothly
7. **Mobile compatibility** - Touch events work properly for all tools
8. **No regressions** - Existing functionality unchanged when new tools are off
9. **Performance acceptable** - No noticeable lag, especially with boundary detection

## Next Phase
Once Phase 1 is complete and validated, proceed to **Phase 2: Clean Up Advanced Tools** where we'll remove the complex implementation and make the specialized tools the primary drawing system.