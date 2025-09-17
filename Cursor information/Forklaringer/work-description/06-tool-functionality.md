# Tool Functionality

## Overview
Ensure drawing tools (brush and flood fill) work correctly with the CSS transform coordinate system, maintaining pixel-perfect accuracy across all zoom levels.

## Coordinate Integration

### CSS Transform Coordinate Mapping
All drawing tools must use the CSS transform coordinate mapper:

```typescript
class ToolCoordinateHandler {
  private coordinateMapper: CSSTransformCoordinateMapper;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateMapper = coordinateMapper;
  }
  
  getCanvasCoordinates(e: PointerEvent): CanvasCoordinates {
    return this.coordinateMapper.toCanvasCoords(e.clientX, e.clientY);
  }
  
  validateCoordinates(coords: CanvasCoordinates): boolean {
    return this.coordinateMapper.isWithinCanvasBounds(coords);
  }
}
```

## Brush Tool Implementation

### Brush Tool Integration
Update brush tool to use CSS transform coordinates:

```typescript
class BrushTool {
  private isDrawing = false;
  private lastPoint: CanvasCoordinates | null = null;
  private coordinateHandler: ToolCoordinateHandler;
  
  handlePointerStart(e: PointerEvent): void {
    if (this.viewportManager.getMode() !== 'draw') return;
    
    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    if (!this.coordinateHandler.validateCoordinates(coords)) return;
    
    this.isDrawing = true;
    this.lastPoint = coords;
    this.drawPoint(coords);
  }
  
  handlePointerMove(e: PointerEvent): void {
    if (!this.isDrawing || this.viewportManager.getMode() !== 'draw') return;
    
    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    if (!this.coordinateHandler.validateCoordinates(coords)) return;
    
    if (this.lastPoint) {
      this.drawLine(this.lastPoint, coords);
    }
    
    this.lastPoint = coords;
  }
  
  private drawLine(from: CanvasCoordinates, to: CanvasCoordinates): void {
    const ctx = this.mainCanvas.getContext('2d')!;
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  
  private drawPoint(coords: CanvasCoordinates): void {
    const ctx = this.mainCanvas.getContext('2d')!;
    
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, this.brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### Brush Size Scaling
Maintain consistent brush size across zoom levels:

```typescript
class BrushSizeManager {
  private baseBrushSize: number;
  
  constructor(baseBrushSize: number) {
    this.baseBrushSize = baseBrushSize;
  }
  
  getEffectiveBrushSize(): number {
    // Brush size remains constant in canvas pixels
    // regardless of zoom level since we draw on the
    // internal canvas which is always 2550x3300
    return this.baseBrushSize;
  }
  
  updateBrushSize(newSize: number): void {
    this.baseBrushSize = newSize;
  }
}
```

## Flood Fill Implementation

### Flood Fill with CSS Transform Coordinates
Critical implementation for pixel-perfect flood fill:

```typescript
class FloodFillTool {
  private coordinateHandler: ToolCoordinateHandler;
  
  handleClick(e: PointerEvent): void {
    if (this.viewportManager.getMode() !== 'draw') return;
    
    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    
    // Validate and clamp coordinates for flood fill safety
    const validation = this.validateFloodFillCoordinates(coords);
    if (!validation.isValid) {
      console.warn('Invalid flood fill coordinates:', validation.issues);
      if (!validation.safeCoords) return;
      coords = validation.safeCoords;
    }
    
    this.performFloodFill(coords);
  }
  
  private validateFloodFillCoordinates(coords: CanvasCoordinates) {
    const dpr = window.devicePixelRatio || 1;
    const maxX = 2550 * dpr;
    const maxY = 3300 * dpr;
    
    const issues: string[] = [];
    
    // Ensure integer coordinates
    if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) {
      issues.push('Coordinates must be integers for flood fill');
    }
    
    // Check bounds
    if (coords.x < 0 || coords.x >= maxX) {
      issues.push(`X coordinate out of bounds: ${coords.x}`);
    }
    
    if (coords.y < 0 || coords.y >= maxY) {
      issues.push(`Y coordinate out of bounds: ${coords.y}`);
    }
    
    const safeCoords = {
      x: Math.max(0, Math.min(maxX - 1, Math.round(coords.x))),
      y: Math.max(0, Math.min(maxY - 1, Math.round(coords.y)))
    };
    
    return {
      isValid: issues.length === 0,
      issues,
      safeCoords: issues.length > 0 ? safeCoords : undefined
    };
  }
  
  private performFloodFill(coords: CanvasCoordinates): void {
    const ctx = this.fillCanvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, this.fillCanvas.width, this.fillCanvas.height);
    
    // Use exact integer coordinates for pixel access
    const pixelIndex = (coords.y * imageData.width + coords.x) * 4;
    const targetColor = [
      imageData.data[pixelIndex],
      imageData.data[pixelIndex + 1],
      imageData.data[pixelIndex + 2],
      imageData.data[pixelIndex + 3]
    ];
    
    // Perform flood fill algorithm
    this.floodFillAlgorithm(imageData, coords.x, coords.y, targetColor, this.fillColor);
    
    ctx.putImageData(imageData, 0, 0);
  }
}
```

## Tool State Management

### Tool Manager
Coordinate all drawing tools with viewport state:

```typescript
class DrawingToolManager {
  private tools = new Map<string, DrawingTool>();
  private activeTool: string | null = null;
  private coordinateHandler: ToolCoordinateHandler;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateHandler = new ToolCoordinateHandler(coordinateMapper);
    this.initializeTools();
  }
  
  private initializeTools(): void {
    this.tools.set('brush', new BrushTool(this.coordinateHandler));
    this.tools.set('floodfill', new FloodFillTool(this.coordinateHandler));
  }
  
  setActiveTool(toolName: string): void {
    if (this.tools.has(toolName)) {
      this.activeTool = toolName;
    }
  }
  
  handleToolInput(e: PointerEvent, eventType: 'start' | 'move' | 'end'): void {
    if (!this.activeTool || this.viewportManager.getMode() !== 'draw') return;
    
    const tool = this.tools.get(this.activeTool);
    if (!tool) return;
    
    switch (eventType) {
      case 'start':
        tool.handlePointerStart?.(e);
        break;
      case 'move':
        tool.handlePointerMove?.(e);
        break;
      case 'end':
        tool.handlePointerEnd?.(e);
        break;
    }
  }
  
  enableTools(): void {
    this.tools.forEach(tool => tool.enable?.());
  }
  
  disableAllTools(): void {
    this.tools.forEach(tool => tool.disable?.());
  }
}
```

## Implementation Steps

### Step 1: Update Coordinate Mapping
- Integrate CSS transform coordinate mapper with all tools
- Ensure pixel-perfect integer coordinates for flood fill
- Add coordinate validation and bounds checking

### Step 2: Update Brush Tool
- Modify brush tool to use new coordinate system
- Maintain consistent brush size across zoom levels
- Test brush accuracy at different zoom levels

### Step 3: Update Flood Fill Tool
- Critical: Ensure exact integer coordinates
- Add coordinate validation for safety
- Test flood fill accuracy across zoom/pan states

### Step 4: Tool Manager Integration
- Connect all tools with mode management
- Implement tool enable/disable functionality
- Add proper event routing based on viewport mode

## Testing Strategy

### Coordinate Accuracy Tests
```typescript
describe('Tool Coordinate Accuracy', () => {
  test('brush tool uses correct coordinates at all zoom levels', () => {
    const zoomLevels = [0.25, 0.5, 1.0, 1.5, 2.0, 4.0];
    
    zoomLevels.forEach(zoom => {
      viewportManager.setState({ scale: zoom, offsetX: 0, offsetY: 0, mode: 'draw' });
      
      const mockEvent = createMockPointerEvent(400, 300);
      const coords = coordinateHandler.getCanvasCoordinates(mockEvent);
      
      expect(Number.isInteger(coords.x)).toBe(true);
      expect(Number.isInteger(coords.y)).toBe(true);
    });
  });
  
  test('flood fill coordinates are pixel-perfect', () => {
    const coords = { x: 150.7, y: 200.3 };
    const validation = floodFillTool.validateFloodFillCoordinates(coords);
    
    expect(validation.safeCoords.x).toBe(151);
    expect(validation.safeCoords.y).toBe(200);
  });
});
```

### Tool Integration Tests
- Test tools only work in draw mode
- Verify tool disable/enable functionality
- Check coordinate mapping across viewport states

### Visual Accuracy Tests
- Draw test patterns at different zoom levels
- Verify brush strokes align with cursor
- Check flood fill accuracy with CSS transforms

### Success Criteria

#### Functional Requirements
- [x] Brush tool renders strokes on main layer with pixel accuracy
- [x] Flood fill uses exact integer coordinates with Math.round()
- [x] All tools work only in draw mode, disabled in zoom mode
- [x] Coordinate mapping accurate across all zoom levels
- [x] Tools respect canvas boundaries and bounds checking

#### Accuracy Requirements
- [x] Brush strokes align perfectly with cursor at all zoom levels
- [x] Flood fill operates on exact pixel coordinates
- [x] No coordinate drift during extended drawing sessions
- [x] Drawing tools maintain precision across zoom/pan operations
- [x] CSS transform coordinate mapping produces integer results

#### Integration Requirements
- [x] Tools properly integrated with mode management system
- [x] Clean enable/disable functionality based on viewport mode
- [x] Proper event routing through tool manager
- [x] Coordinate validation prevents out-of-bounds operations
- [x] All drawing operations use unified coordinate mapping system