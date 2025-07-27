# Eraser Tool Implementation Documentation

## Overview
The eraser tool in the coloring application is designed to remove content from both the main drawing canvas (pencil/brush strokes) and the fill canvas (flood fill areas). It uses HTML5 Canvas's composite operations to create transparency, effectively "erasing" content.

## Architecture

### Canvas Layers
The application uses multiple canvas layers:
1. **Background Canvas** (`backgroundCanvasRef`) - Contains the base image
2. **Main Canvas** (`mainCanvasRef`) - Contains pencil/brush drawings
3. **Fill Canvas** (`fillCanvasRef`) - Contains flood fill colored areas
4. **Shadow Canvas** (`shadowCanvasRef`) - Used for image processing

### Core Function: `smartEraser`
Located at `ColoringApp.tsx:339-390`

```typescript
const smartEraser = useCallback((
  x: number,                    // Current X coordinate
  y: number,                    // Current Y coordinate
  prevX: number,                // Previous X coordinate
  prevY: number,                // Previous Y coordinate
  brushSize: number,            // Eraser size
  mainCtx: CanvasRenderingContext2D,     // Main canvas context
  fillCtx: CanvasRenderingContext2D | null, // Fill canvas context
  backgroundType: string,       // Background type (unused in current implementation)
  isDrawing: boolean           // Drawing state
) => {
  // Implementation...
}, []);
```

## How It Works

### 1. Multi-Layer Erasing
The eraser works on both canvas layers simultaneously:
- Erases pencil/brush strokes from the main canvas
- Erases flood fill areas from the fill canvas
- Both layers are erased in the same stroke for consistency

### 2. Composite Operation
Uses `destination-out` composite operation:
```javascript
ctx.globalCompositeOperation = "destination-out";
```
This makes the drawn pixels transparent, revealing the background layer underneath.

### 3. Event Flow

#### Mouse Down (`handleMouseDown`)
1. User clicks with eraser tool selected
2. Captures initial coordinates
3. Sets `isDrawing: true` in state
4. Stores coordinates in `prevX` and `prevY`

#### Mouse Move (`handleMouseMove`)
1. Checks if `isDrawing` is true
2. Gets current canvas coordinates
3. Calls `smartEraser` with:
   - Current and previous coordinates
   - Eraser size
   - Both canvas contexts
   - Drawing state
4. Updates `prevX` and `prevY` for next frame

#### Mouse Up (`handleMouseUp`)
1. Sets `isDrawing: false`
2. Clears `prevX` and `prevY`

## State Management

The eraser uses the following state properties:
```typescript
{
  drawingMode: 'eraser',  // Current tool mode
  eraserSize: 10,         // Eraser brush size
  isDrawing: false,       // Whether user is currently erasing
  prevX: null,           // Previous X coordinate
  prevY: null            // Previous Y coordinate
}
```

## Implementation Details

### Coordinate Transformation
Uses `getCanvasCoordinates` to transform mouse/touch coordinates to canvas space, accounting for:
- Canvas scaling
- Viewport transformations
- Device pixel ratio

### Performance Optimizations
1. Uses `useCallback` to memoize the eraser function
2. Saves and restores canvas state to avoid side effects
3. Processes both canvases in a single pass

### Touch Support
The same eraser logic works for touch events through the unified pointer event system.

## Current Issues and Debugging

### Debugging Features
The implementation includes console logging for:
- Function calls with parameters
- Context validity checks
- Coordinate tracking
- Drawing state monitoring

### Common Issues
1. **Context not initialized**: Ensure `contextRef.current` is properly set
2. **State not updating**: Check React state dependencies in callbacks
3. **Coordinates incorrect**: Verify `getCanvasCoordinates` transformation

## Usage

### UI Integration
- Desktop: Button in `ToolBar.tsx` with size slider
- Mobile: Button in `MobileToolbar/ToolModeSelector.tsx`

### Size Control
- Range: 5-50 pixels
- Separate size state from brush size
- Context-aware UI shows size control when eraser is active

## Future Improvements

1. **Selective Layer Erasing**: Option to erase only from specific layers
2. **Eraser Shapes**: Support for square or custom eraser shapes
3. **Opacity Control**: Variable eraser strength
4. **Performance**: Batch erasing operations for better performance
5. **Undo Integration**: Better integration with history system