# Phase 2: Clean Up Advanced Tools

## Overview
Remove the complex advanced tool implementation and make the specialized tools (Pencil, Flood Fill, Eraser) the primary drawing system.

## Objectives
- ✅ Remove advanced tool files safely
- ✅ Update all import dependencies 
- ✅ Make specialized tools the primary drawing system
- ✅ Ensure no broken references
- ✅ Validate everything still works

## Prerequisites
- ✅ Phase 1 completed successfully
- ✅ All three specialized tools tested and working
- ✅ Pencil and eraser boundary detection verified
- ✅ Flood fill 100% tolerance verified
- ✅ Confidence that specialized approach meets requirements

## What Gets Removed
- `src/core/viewport/BrushTool.ts` (516 lines)
- `src/core/viewport/DrawingToolManager.ts` 
- `src/core/viewport/ToolCoordinateHandler.ts`
- Complex tool management logic
- Advanced brush settings and features

## What Gets Updated
- `src/components/coloring/ColoringApp.tsx` - Remove complex tool imports, integrate specialized tools
- Drawing mode logic updated for three tools: 'pencil' | 'fill' | 'eraser'
- Event handlers streamlined for specialized tools
- State management updated for separate pencil/eraser sizes

## Step 2.1: Backup Current Implementation

Before making destructive changes, create a backup:

```bash
# Create backup directory
mkdir -p backup/advanced-tools

# Backup files that will be deleted
cp src/core/viewport/BrushTool.ts backup/advanced-tools/
cp src/core/viewport/DrawingToolManager.ts backup/advanced-tools/
cp src/core/viewport/ToolCoordinateHandler.ts backup/advanced-tools/

# Backup files that will be modified
cp src/components/coloring/ColoringApp.tsx backup/advanced-tools/ColoringApp.tsx.backup

# Also backup any existing simple tools from Phase 1 testing
cp src/components/coloring/PencilTool.ts backup/advanced-tools/ 2>/dev/null || true
cp src/components/coloring/FloodFillTool.ts backup/advanced-tools/ 2>/dev/null || true
cp src/components/coloring/EraserTool.ts backup/advanced-tools/ 2>/dev/null || true
```

## Step 2.2: Identify All Dependencies

**Files That Import Advanced Tools:**

1. **ColoringApp.tsx** - Main integration
   ```typescript
   import { DrawingToolManager } from '@/core/viewport/DrawingToolManager'
   import { BrushTool } from '@/core/viewport/BrushTool'
   import { ToolCoordinateHandler } from '@/core/viewport/ToolCoordinateHandler'
   ```

2. **Check for other imports:**
   ```bash
   # Search for any other files importing these tools
   grep -r "DrawingToolManager" src/
   grep -r "BrushTool" src/
   grep -r "ToolCoordinateHandler" src/
   ```

## Step 2.3: Remove Advanced Tool Files

**Delete these files:**
- [ ] `src/core/viewport/BrushTool.ts`
- [ ] `src/core/viewport/DrawingToolManager.ts` 
- [ ] `src/core/viewport/ToolCoordinateHandler.ts`

```bash
rm src/core/viewport/BrushTool.ts
rm src/core/viewport/DrawingToolManager.ts
rm src/core/viewport/ToolCoordinateHandler.ts
```

## Step 2.4: Update ColoringApp.tsx

**Remove Advanced Tool Imports:**
```typescript
// REMOVE these imports:
// import { DrawingToolManager } from '@/core/viewport/DrawingToolManager'
// import { ToolCoordinateHandler } from '@/core/viewport/ToolCoordinateHandler'

// ADD specialized tool imports:
import { PencilTool } from './PencilTool'
import { FloodFillTool } from './FloodFillTool'
import { EraserTool } from './EraserTool'
```

**Remove Advanced Tool State:**
```typescript
// REMOVE these refs and state:
// const drawingToolManagerRef = useRef<DrawingToolManager | null>(null);
// const coordinateSystemRef = useRef<CoordinateSystem | null>(null>;

// ADD specialized tool refs:
const pencilToolRef = useRef<PencilTool | null>(null);
const floodFillToolRef = useRef<FloodFillTool | null>(null);
const eraserToolRef = useRef<EraserTool | null>(null);

// REMOVE the testing toggles from Phase 1:
// const [useNewTools, setUseNewTools] = useState(false);
// const [newToolMode, setNewToolMode] = useState<'pencil' | 'fill' | 'eraser'>('pencil');
```

**Update Drawing Mode State for Three Tools:**
```typescript
// UPDATE the state interface for three specialized tools:
const [state, setState] = useState<ColoringState>({
  imageData: null,
  originalImageData: null,
  currentColor: '#FF0000',
  pencilSize: 3, // Size for pencil tool
  eraserSize: 10, // Separate size for eraser tool
  // REMOVE tolerance - flood fill always uses 100%
  isDrawing: false,
  history: [],
  historyStep: -1,
  drawingMode: 'fill' as 'pencil' | 'fill' | 'eraser', // Three specialized modes
  lastX: null,
  lastY: null
});
```

**Remove Complex Tool Initialization:**
```typescript
// REMOVE this entire useEffect block:
/*
useEffect(() => {
  // Initialize coordinate system and drawing tool manager
  coordinateSystemRef.current = new CoordinateSystem(viewportManagerRef.current.getState());
  drawingToolManagerRef.current = new DrawingToolManager(
    coordinateSystemRef.current,
    viewportManagerRef.current
  );
  
  // ... complex initialization code
}, []);
*/

// REPLACE with specialized tool initialization:
useEffect(() => {
  const mainCanvas = mainCanvasRef.current;
  if (mainCanvas && state.imageData) {
    // Initialize all three specialized tools
    pencilToolRef.current = new PencilTool(mainCanvas);
    floodFillToolRef.current = new FloodFillTool(mainCanvas);
    eraserToolRef.current = new EraserTool(mainCanvas);
    
    // Sync initial settings
    pencilToolRef.current.setColor(state.currentColor);
    pencilToolRef.current.setSize(state.pencilSize);
    eraserToolRef.current.setSize(state.eraserSize);
  }
}, [state.imageData]);
```

**Update Event Handlers for Three Tools:**
```typescript
const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom') {
    // Keep existing zoom logic
    setIsPanning(true);
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  } else {
    // Route to appropriate specialized tool
    const pointerEvent = new PointerEvent('pointerdown', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
      buttons: e.buttons,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'mouse'
    });

    if (state.drawingMode === 'pencil') {
      pencilToolRef.current?.handlePointerDown(pointerEvent);
      e.preventDefault();
    } else if (state.drawingMode === 'fill') {
      floodFillToolRef.current?.handleClick(pointerEvent, state.currentColor);
      e.preventDefault();
    } else if (state.drawingMode === 'eraser') {
      eraserToolRef.current?.handlePointerDown(pointerEvent);
      e.preventDefault();
    }
  }
}, [currentMode, state.drawingMode, state.currentColor]);

const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom' && isPanning) {
    // Keep existing zoom logic
  } else {
    const pointerEvent = new PointerEvent('pointermove', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
      buttons: e.buttons,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'mouse'
    });

    if (state.drawingMode === 'pencil') {
      pencilToolRef.current?.handlePointerMove(pointerEvent);
    } else if (state.drawingMode === 'eraser') {
      eraserToolRef.current?.handlePointerMove(pointerEvent);
    }
    // Fill tool doesn't need move events
  }
}, [currentMode, isPanning, state.drawingMode]);

const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  if (currentMode === 'zoom') {
    setIsPanning(false);
  } else {
    const pointerEvent = new PointerEvent('pointerup', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button,
      buttons: e.buttons,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'mouse'
    });

    if (state.drawingMode === 'pencil') {
      pencilToolRef.current?.handlePointerUp(pointerEvent);
    } else if (state.drawingMode === 'eraser') {
      eraserToolRef.current?.handlePointerUp(pointerEvent);
    }
    // Fill tool doesn't need up events
  }
}, [currentMode, state.drawingMode]);
```

**Update Touch Event Handlers:**
```typescript
const handleTouchStart = useCallback((e: TouchEvent) => {
  e.preventDefault();
  
  if (e.touches.length > 1) return; // Skip multi-touch
  
  const touch = e.touches[0];
  
  const pointerEvent = new PointerEvent('pointerdown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
    button: 0,
    buttons: 1,
    pressure: touch.force || 0.5,
    pointerId: touch.identifier,
    pointerType: 'touch'
  });

  if (state.drawingMode === 'pencil') {
    pencilToolRef.current?.handlePointerDown(pointerEvent);
  } else if (state.drawingMode === 'fill') {
    floodFillToolRef.current?.handleClick(pointerEvent, state.currentColor);
  } else if (state.drawingMode === 'eraser') {
    eraserToolRef.current?.handlePointerDown(pointerEvent);
  }
}, [state.drawingMode, state.currentColor]);

const handleTouchMove = useCallback((e: TouchEvent) => {
  e.preventDefault();
  
  if (e.touches.length > 1) return;
  
  const touch = e.touches[0];
  
  const pointerEvent = new PointerEvent('pointermove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
    button: 0,
    buttons: 1,
    pressure: touch.force || 0.5,
    pointerId: touch.identifier,
    pointerType: 'touch'
  });

  if (state.drawingMode === 'pencil') {
    pencilToolRef.current?.handlePointerMove(pointerEvent);
  } else if (state.drawingMode === 'eraser') {
    eraserToolRef.current?.handlePointerMove(pointerEvent);
  }
  // Fill tool doesn't need move events
}, [state.drawingMode]);

const handleTouchEnd = useCallback((e: TouchEvent) => {
  e.preventDefault();
  
  const pointerEvent = new PointerEvent('pointerup', {
    clientX: 0, // Touch ended, coordinates not relevant
    clientY: 0,
    button: 0,
    buttons: 0,
    pressure: 0,
    pointerId: 1,
    pointerType: 'touch'
  });

  if (state.drawingMode === 'pencil') {
    pencilToolRef.current?.handlePointerUp(pointerEvent);
  } else if (state.drawingMode === 'eraser') {
    eraserToolRef.current?.handlePointerUp(pointerEvent);
  }
  // Fill tool doesn't need up events
}, [state.drawingMode]);
```

**Remove Complex Tool Settings Sync:**
```typescript
// REMOVE this complex useEffect:
/*
useEffect(() => {
  const toolManager = drawingToolManagerRef.current;
  if (!toolManager) return;

  const brushTool = toolManager.getActiveToolInstance();
  // ... complex syncing logic
}, [state.currentColor, state.brushSize, state.drawingMode, state.originalImageData]);
*/

// REPLACE with specialized tool settings sync:
useEffect(() => {
  // Sync pencil tool
  const pencilTool = pencilToolRef.current;
  if (pencilTool) {
    pencilTool.setColor(state.currentColor);
    pencilTool.setSize(state.pencilSize);
  }
  
  // Sync eraser tool (only size)
  const eraserTool = eraserToolRef.current;
  if (eraserTool) {
    eraserTool.setSize(state.eraserSize);
  }
  
  // Flood fill tool uses color directly on click, no sync needed
}, [state.currentColor, state.pencilSize, state.eraserSize]);
```

**Remove Complex Tool Activation Logic:**
```typescript
// REMOVE this useEffect:
/*
useEffect(() => {
  const toolManager = drawingToolManagerRef.current;
  if (!toolManager) return;

  if (state.drawingMode === 'brush' || state.drawingMode === 'eraser') {
    toolManager.setActiveTool('brush');
  } else if (state.drawingMode === 'fill') {
    toolManager.setActiveTool('floodfill');
  }
}, [state.drawingMode]);
*/
```

**Remove Test Toggle Controls:**
```typescript
// REMOVE the temporary testing controls added in Phase 1:
/*
<div className="flex gap-2 mb-4 p-2 bg-yellow-100 rounded">
  <button onClick={() => setUseNewTools(!useNewTools)}>
    New Tools: {useNewTools ? 'ON' : 'OFF'}
  </button>
  // ... tool mode buttons
</div>
*/
```

## Step 2.5: Update Drawing Mode References

**Throughout ColoringApp.tsx, update references:**
- Ensure `'pencil' | 'fill' | 'eraser'` modes are supported
- Use `state.pencilSize` for pencil tool
- Use `state.eraserSize` for eraser tool
- Remove any remaining `state.brushSize` references
- Remove any `state.tolerance` references (flood fill uses 100%)

## Step 2.6: Validate File Structure

After cleanup, ensure these files remain:
- ✅ `src/components/coloring/PencilTool.ts`
- ✅ `src/components/coloring/FloodFillTool.ts`
- ✅ `src/components/coloring/EraserTool.ts`
- ✅ `src/components/coloring/ColoringApp.tsx` (modified)
- ✅ `src/core/viewport/CoordinateSystem.ts` (keep for zoom/pan)
- ✅ `src/core/viewport/ViewportManager.ts` (keep for zoom/pan)

## Testing Checklist

### Step 2.7: Functionality Testing
- [ ] Project builds without errors
- [ ] No import/reference errors in console
- [ ] Pencil drawing works on desktop with boundary detection
- [ ] Pencil drawing works on mobile with boundary detection
- [ ] Flood fill works with 100% tolerance (no tolerance control)
- [ ] Eraser works on desktop with boundary detection
- [ ] Eraser works on mobile with boundary detection
- [ ] Color changes work for pencil and fill
- [ ] Size changes work for pencil and eraser
- [ ] Zoom/pan functionality preserved
- [ ] Undo/redo still works for fill

### Step 2.8: Performance Testing
- [ ] Drawing feels smooth for all tools
- [ ] Boundary detection doesn't cause lag
- [ ] Flood fill performance acceptable on large areas
- [ ] No memory leaks from removed code or pixel data reads
- [ ] Canvas rendering is efficient
- [ ] Touch events responsive

### Step 2.9: Edge Case Testing
- [ ] Rapid drawing movements work for pencil and eraser
- [ ] Switching between pencil/fill/eraser works smoothly
- [ ] Canvas resizing works with all tools
- [ ] Different pencil sizes work with boundary detection
- [ ] Different eraser sizes work with boundary detection
- [ ] Different colors work for pencil and fill
- [ ] Black pixel boundaries are respected consistently

## Rollback Plan

If issues arise, you can rollback by:
1. Restore files from `backup/advanced-tools/`
2. Revert `ColoringApp.tsx` changes
3. Re-run the project

## Expected Results

After Phase 2:
- ✅ ~500 lines of complex code removed
- ✅ Three specialized tools are the primary drawing system
- ✅ Pencil and eraser respect black pixel boundaries
- ✅ Flood fill always uses 100% tolerance
- ✅ Cleaner, more maintainable codebase
- ✅ All functionality preserved with better specialization
- ✅ Better performance (less overhead, optimized for purpose)

## Validation Criteria

Before moving to Phase 3:
1. **No build errors** - Project compiles successfully
2. **Pencil tool works with boundaries** - Cannot draw on black pixels
3. **Flood fill works with 100% tolerance** - Fills entire areas except boundaries
4. **Eraser tool works with boundaries** - Cannot erase black pixels
5. **Tool switching works** - Smooth transitions between pencil/fill/eraser
6. **Mobile compatible** - Touch events work properly for all tools
7. **Performance good** - No noticeable degradation, boundary detection is fast
8. **Code is cleaner** - Reduced complexity, specialized responsibilities

## Next Phase
Once Phase 2 is complete and validated, proceed to **Phase 3: Simplify UI Controls** where we'll update the toolbar and mobile controls to support the three specialized tools.