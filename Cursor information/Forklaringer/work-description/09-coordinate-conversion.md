# Coordinate Conversion

## Overview
Implement 3-step coordinate transformation: screen → logical → canvas pixels, using CSS transform undoing and Device Pixel Ratio handling. Critical for pixel-perfect drawing accuracy.

## Coordinate Transformation Pipeline

### Three-Step Conversion Process
```typescript
interface ScreenCoordinates {
  x: number;  // clientX relative to viewport
  y: number;  // clientY relative to viewport
}

interface LogicalCoordinates {
  x: number;  // CSS pixels after transform undo
  y: number;  // CSS pixels after transform undo
}

interface CanvasCoordinates {
  x: number;  // Internal canvas pixels (integer)
  y: number;  // Internal canvas pixels (integer)
}
```

### CSS Transform Coordinate Mapper
```typescript
class CSSTransformCoordinateMapper {
  private viewportState: ViewportState;
  private containerElement: HTMLElement;
  
  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
    this.viewportState = { scale: 1, offsetX: 0, offsetY: 0, mode: 'draw' };
  }
  
  updateViewportState(state: ViewportState): void {
    this.viewportState = state;
  }
  
  toCanvasCoords(screenX: number, screenY: number): CanvasCoordinates {
    // Step 1: Screen to container coordinates
    const containerCoords = this.screenToContainer(screenX, screenY);
    
    // Step 2: Undo CSS transform (container to logical)
    const logicalCoords = this.containerToLogical(containerCoords.x, containerCoords.y);
    
    // Step 3: Apply Device Pixel Ratio (logical to canvas)
    const canvasCoords = this.logicalToCanvas(logicalCoords.x, logicalCoords.y);
    
    return canvasCoords;
  }
  
  private screenToContainer(screenX: number, screenY: number): { x: number, y: number } {
    const rect = this.containerElement.getBoundingClientRect();
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }
  
  private containerToLogical(containerX: number, containerY: number): LogicalCoordinates {
    // Undo CSS transform: subtract pan, divide by scale
    const logicalX = (containerX - this.viewportState.offsetX) / this.viewportState.scale;
    const logicalY = (containerY - this.viewportState.offsetY) / this.viewportState.scale;
    
    return { x: logicalX, y: logicalY };
  }
  
  private logicalToCanvas(logicalX: number, logicalY: number): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    
    // Map to internal canvas pixels with DPR scaling
    const canvasX = Math.round(logicalX * dpr);
    const canvasY = Math.round(logicalY * dpr);
    
    return { x: canvasX, y: canvasY };
  }
}
```

## Device Pixel Ratio Handling

### DPR-Aware Coordinate Conversion
```typescript
class DevicePixelRatioHandler {
  private readonly CANVAS_WIDTH = 2550;
  private readonly CANVAS_HEIGHT = 3300;
  
  getDPR(): number {
    return window.devicePixelRatio || 1;
  }
  
  getInternalCanvasSize(): { width: number, height: number } {
    const dpr = this.getDPR();
    return {
      width: this.CANVAS_WIDTH * dpr,
      height: this.CANVAS_HEIGHT * dpr
    };
  }
  
  getCSSCanvasSize(): { width: number, height: number } {
    return {
      width: this.CANVAS_WIDTH,
      height: this.CANVAS_HEIGHT
    };
  }
  
  scaleContextForDPR(ctx: CanvasRenderingContext2D): void {
    const dpr = this.getDPR();
    ctx.scale(dpr, dpr);
  }
  
  // Convert logical coordinates to exact canvas pixel coordinates
  logicalToCanvasPixel(logicalX: number, logicalY: number): CanvasCoordinates {
    const dpr = this.getDPR();
    const internalSize = this.getInternalCanvasSize();
    
    // Scale by DPR and ensure integer coordinates
    const canvasX = Math.round(logicalX * dpr);
    const canvasY = Math.round(logicalY * dpr);
    
    // Clamp to canvas bounds
    return {
      x: Math.max(0, Math.min(internalSize.width - 1, canvasX)),
      y: Math.max(0, Math.min(internalSize.height - 1, canvasY))
    };
  }
}
```

### High-DPI Display Testing
```typescript
class DPRTestSuite {
  testCoordinateAccuracyAtDifferentDPR(): void {
    const testDPRValues = [1, 1.25, 1.5, 2, 2.5, 3];
    
    testDPRValues.forEach(dpr => {
      // Mock different DPR values
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: dpr
      });
      
      const mapper = new CSSTransformCoordinateMapper(containerElement);
      const testCoords = { x: 100.5, y: 200.3 };
      
      const result = mapper.toCanvasCoords(testCoords.x, testCoords.y);
      
      // Verify integer coordinates
      expect(Number.isInteger(result.x)).toBe(true);
      expect(Number.isInteger(result.y)).toBe(true);
      
      // Verify DPR scaling
      expect(result.x).toBe(Math.round(testCoords.x * dpr));
      expect(result.y).toBe(Math.round(testCoords.y * dpr));
    });
  }
}
```

## Critical Flood Fill Coordinates

### Integer Coordinate Requirement
Flood fill operations require exact integer pixel coordinates:

```typescript
class FloodFillCoordinateHandler {
  private coordinateMapper: CSSTransformCoordinateMapper;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateMapper = coordinateMapper;
  }
  
  getFloodFillCoordinates(e: PointerEvent): CanvasCoordinates {
    const coords = this.coordinateMapper.toCanvasCoords(e.clientX, e.clientY);
    
    // Critical: Ensure integer coordinates for flood fill
    const floodFillCoords = {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
    
    // Validate bounds for safety
    const validation = this.validateFloodFillCoords(floodFillCoords);
    if (!validation.isValid) {
      console.warn('Invalid flood fill coordinates:', validation.issues);
      return validation.safeCoords;
    }
    
    return floodFillCoords;
  }
  
  private validateFloodFillCoords(coords: CanvasCoordinates) {
    const dpr = window.devicePixelRatio || 1;
    const maxX = 2550 * dpr;
    const maxY = 3300 * dpr;
    
    const issues: string[] = [];
    
    if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) {
      issues.push('Coordinates must be integers for flood fill');
    }
    
    if (coords.x < 0 || coords.x >= maxX) {
      issues.push(`X coordinate out of bounds: ${coords.x}`);\n    }\n    \n    if (coords.y < 0 || coords.y >= maxY) {\n      issues.push(`Y coordinate out of bounds: ${coords.y}`);\n    }\n    \n    const safeCoords = {\n      x: Math.max(0, Math.min(maxX - 1, Math.round(coords.x))),\n      y: Math.max(0, Math.min(maxY - 1, Math.round(coords.y)))\n    };\n    \n    return {\n      isValid: issues.length === 0,\n      issues,\n      safeCoords\n    };\n  }\n}\n```\n\n## Reverse Coordinate Mapping\n\n### Canvas to Screen Coordinates\nFor UI elements that need to align with canvas content:\n\n```typescript\nclass ReverseCoordinateMapper {\n  private coordinateMapper: CSSTransformCoordinateMapper;\n  \n  constructor(coordinateMapper: CSSTransformCoordinateMapper) {\n    this.coordinateMapper = coordinateMapper;\n  }\n  \n  canvasToScreen(canvasX: number, canvasY: number): ScreenCoordinates {\n    // Step 1: Canvas to logical coordinates\n    const logicalCoords = this.canvasToLogical(canvasX, canvasY);\n    \n    // Step 2: Apply CSS transform (logical to container)\n    const containerCoords = this.logicalToContainer(logicalCoords.x, logicalCoords.y);\n    \n    // Step 3: Container to screen coordinates\n    const screenCoords = this.containerToScreen(containerCoords.x, containerCoords.y);\n    \n    return screenCoords;\n  }\n  \n  private canvasToLogical(canvasX: number, canvasY: number): LogicalCoordinates {\n    const dpr = window.devicePixelRatio || 1;\n    return {\n      x: canvasX / dpr,\n      y: canvasY / dpr\n    };\n  }\n  \n  private logicalToContainer(logicalX: number, logicalY: number): { x: number, y: number } {\n    const state = this.coordinateMapper.getViewportState();\n    return {\n      x: logicalX * state.scale + state.offsetX,\n      y: logicalY * state.scale + state.offsetY\n    };\n  }\n  \n  private containerToScreen(containerX: number, containerY: number): ScreenCoordinates {\n    const rect = this.coordinateMapper.getContainerRect();\n    return {\n      x: containerX + rect.left,\n      y: containerY + rect.top\n    };\n  }\n}\n```\n\n## Coordinate Validation\n\n### Bounds Checking\n```typescript\nclass CoordinateBoundsValidator {\n  private readonly CANVAS_WIDTH = 2550;\n  private readonly CANVAS_HEIGHT = 3300;\n  \n  isWithinCanvasBounds(coords: CanvasCoordinates): boolean {\n    const dpr = window.devicePixelRatio || 1;\n    const maxX = this.CANVAS_WIDTH * dpr;\n    const maxY = this.CANVAS_HEIGHT * dpr;\n    \n    return coords.x >= 0 && coords.x < maxX && \n           coords.y >= 0 && coords.y < maxY;\n  }\n  \n  clampToCanvasBounds(coords: CanvasCoordinates): CanvasCoordinates {\n    const dpr = window.devicePixelRatio || 1;\n    const maxX = this.CANVAS_WIDTH * dpr;\n    const maxY = this.CANVAS_HEIGHT * dpr;\n    \n    return {\n      x: Math.max(0, Math.min(maxX - 1, coords.x)),\n      y: Math.max(0, Math.min(maxY - 1, coords.y))\n    };\n  }\n  \n  validateCoordinateTransformation(\n    screenCoords: ScreenCoordinates,\n    expectedCanvasCoords: CanvasCoordinates\n  ): boolean {\n    const actualCanvasCoords = this.coordinateMapper.toCanvasCoords(\n      screenCoords.x, \n      screenCoords.y\n    );\n    \n    const tolerance = 1; // 1 pixel tolerance\n    return Math.abs(actualCanvasCoords.x - expectedCanvasCoords.x) <= tolerance &&\n           Math.abs(actualCanvasCoords.y - expectedCanvasCoords.y) <= tolerance;\n  }\n}\n```\n\n## Implementation Steps\n\n### Step 1: Create Core Coordinate Mapper\n- Implement 3-step transformation pipeline\n- Add CSS transform undoing logic\n- Include Device Pixel Ratio scaling\n\n### Step 2: Device Pixel Ratio Integration\n- Handle DPR detection and scaling\n- Test coordinate accuracy on high-DPI displays\n- Ensure integer coordinates for flood fill\n\n### Step 3: Coordinate Validation\n- Add bounds checking for canvas limits\n- Implement coordinate clamping for safety\n- Create validation functions for different use cases\n\n### Step 4: Reverse Mapping\n- Implement canvas-to-screen coordinate conversion\n- Add UI alignment capabilities\n- Test bidirectional coordinate accuracy\n\n## Testing Strategy\n\n### Coordinate Accuracy Tests\n```typescript\ndescribe('Coordinate Conversion', () => {\n  test('converts screen coordinates to canvas coordinates accurately', () => {\n    const mapper = new CSSTransformCoordinateMapper(container);\n    mapper.updateViewportState({ scale: 2, offsetX: 100, offsetY: 50, mode: 'draw' });\n    \n    const screenCoords = { x: 300, y: 200 };\n    const canvasCoords = mapper.toCanvasCoords(screenCoords.x, screenCoords.y);\n    \n    // Verify integer coordinates\n    expect(Number.isInteger(canvasCoords.x)).toBe(true);\n    expect(Number.isInteger(canvasCoords.y)).toBe(true);\n  });\n  \n  test('handles Device Pixel Ratio correctly', () => {\n    Object.defineProperty(window, 'devicePixelRatio', { value: 2 });\n    \n    const mapper = new CSSTransformCoordinateMapper(container);\n    const coords = mapper.toCanvasCoords(100, 100);\n    \n    // Should scale by DPR\n    expect(coords.x).toBe(Math.round(100 * 2));\n    expect(coords.y).toBe(Math.round(100 * 2));\n  });\n});\n```\n\n### Flood Fill Coordinate Tests\n- Verify integer coordinates for flood fill operations\n- Test coordinate clamping and validation\n- Check pixel-perfect accuracy across zoom levels\n\n### Success Criteria\n\n#### Functional Requirements\n- [ ] 3-step coordinate transformation: screen → logical → canvas pixels\n- [ ] CSS transform undoing: `(screenX - panX) / zoom`\n- [ ] Device Pixel Ratio scaling: `logicalX * devicePixelRatio`\n- [ ] Math.round() used for flood fill integer coordinates\n- [ ] Coordinate bounds checking and validation\n\n#### Accuracy Requirements\n- [ ] Pixel-perfect coordinate mapping at all zoom levels\n- [ ] Integer coordinates for flood fill operations\n- [ ] No coordinate drift during extended use\n- [ ] Accurate DPR handling on high-DPI displays\n- [ ] Reverse coordinate mapping for UI alignment\n\n#### Integration Requirements\n- [ ] Coordinate mapper updates with viewport state changes\n- [ ] Drawing tools use coordinate mapper for all operations\n- [ ] Flood fill tool uses validated integer coordinates\n- [ ] UI elements align correctly with canvas content\n- [ ] Performance optimized for real-time coordinate conversion