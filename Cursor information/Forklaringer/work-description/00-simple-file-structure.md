# Simple File Structure - Keep It Simple

## Overview
A practical, simple file structure that focuses on getting zoom/pan working without over-engineering. Only the essential files needed to implement the core functionality.

## Design Principles
1. **One file per major responsibility** - No excessive splitting
2. **Flat structure** - Minimal nested directories
3. **Essential only** - No premature optimization
4. **Easy to find** - Logical naming and organization
5. **Quick to implement** - Focus on working functionality first

## Simple Structure

### Core Viewport System (10 files total)
```
src/core/viewport/
├── ViewportManager.ts          # State management + change notifications + persistence
├── CoordinateSystem.ts         # All coordinate conversion + validation + precision
├── InputHandler.ts             # Mouse + touch + gesture handling in one place
├── CanvasTransform.ts          # Canvas transforms + layer sync + error handling
├── RenderLoop.ts               # RAF rendering + basic performance monitoring
├── ToggleMode.ts               # Zoom/draw mode switching + state preservation
├── types.ts                    # All TypeScript interfaces and types
├── constants.ts                # Configuration values and limits
├── utils.ts                    # Helper functions and utilities
└── index.ts                    # Public API exports
```

### React Integration (3 files)
```
src/integrations/
├── useViewport.ts              # Main React hook for viewport functionality
├── ViewportProvider.tsx        # React context provider component
└── CanvasAdapter.ts            # Integration with existing canvas system
```

### UI Components (1 file)
```
src/components/shared/
└── ZoomToggleButton.tsx        # Simple zoom/draw mode toggle button
```

### Testing (Mirror structure)
```
src/__tests__/viewport/
├── ViewportManager.test.ts
├── CoordinateSystem.test.ts
├── InputHandler.test.ts
├── CanvasTransform.test.ts
├── RenderLoop.test.ts
├── ToggleMode.test.ts
└── integration.test.ts         # End-to-end tests
```

**Total: 14 implementation files + 7 test files = 21 files**

## File Responsibilities

### Core Files

#### `ViewportManager.ts` (Single Source of Truth)
```typescript
// Everything related to viewport state in one place
class ViewportManager {
  // State management
  private state: ViewportState;
  
  // Change notifications
  private listeners: Array<(state: ViewportState) => void>;
  
  // State persistence
  saveState(): void;
  loadState(): ViewportState | null;
  
  // All state operations
  setScale(scale: number): void;
  setPan(panX: number, panY: number): void;
  setMode(mode: 'zoom' | 'draw'): void;
  
  // Constraints and validation
  private validateState(state: ViewportState): ViewportState;
}
```

#### `CoordinateSystem.ts` (All Coordinate Logic)
```typescript
// Everything related to coordinates in one place
class CoordinateSystem {
  // Screen to world conversion with pixel precision
  toWorldCoords(screenX: number, screenY: number): { x: number, y: number };
  
  // World to screen conversion
  toScreenCoords(worldX: number, worldY: number): { x: number, y: number };
  
  // Validation and bounds checking
  isWithinBounds(coords: { x: number, y: number }): boolean;
  clampToBounds(coords: { x: number, y: number }): { x: number, y: number };
  
  // Pixel precision utilities (Math.round for flood fill)
  ensurePixelPrecision(coords: { x: number, y: number }): { x: number, y: number };
}
```

#### `InputHandler.ts` (Unified Input Management)
```typescript
// All input handling in one place
class InputHandler {
  // Mouse events
  handleMouseWheel(e: WheelEvent): void;
  handleMouseDrag(e: MouseEvent): void;
  
  // Touch events
  handleTouchPinch(e: TouchEvent): void;
  handleTouchPan(e: TouchEvent): void;
  
  // Gesture conflict prevention
  preventBrowserZoom(e: Event): void;
  
  // Event setup/cleanup
  attachEventListeners(canvas: HTMLCanvasElement): void;
  removeEventListeners(): void;
}
```

#### `CanvasTransform.ts` (Transform Management)
```typescript
// All transform logic in one place
class CanvasTransform {
  // Multi-layer transform application
  applyToAllLayers(scale: number, panX: number, panY: number): void;
  
  // Layer management
  addLayer(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void;
  
  // Transform validation and error handling
  validateTransform(scale: number, panX: number, panY: number): boolean;
  
  // Reset and cleanup
  resetAllTransforms(): void;
}
```

#### `RenderLoop.ts` (Simple Rendering)
```typescript
// Basic RAF rendering with minimal performance monitoring
class RenderLoop {
  // Simple render scheduling
  start(): void;
  stop(): void;
  
  // Basic performance tracking
  getCurrentFPS(): number;
  
  // Render coordination
  onBeforeRender(callback: () => void): () => void;
  onAfterRender(callback: () => void): () => void;
}
```

#### `ToggleMode.ts` (Mode Switching)
```typescript
// Simple mode switching
class ToggleMode {
  private currentMode: 'zoom' | 'draw' = 'draw';
  
  // Mode switching
  toggle(): void;
  switchToZoom(): void;
  switchToDraw(): void;
  
  // State preservation
  preserveState(): void;
  restoreState(): void;
  
  // Tool management
  enableDrawingTools(): void;
  disableDrawingTools(): void;
}
```

### Integration Files

#### `useViewport.ts` (Main React Hook)
```typescript
// Single hook that provides everything needed
export const useViewport = () => {
  const viewportManager = useRef(new ViewportManager());
  const [state, setState] = useState(viewportManager.current.getState());
  
  // All viewport operations
  return {
    // State
    scale: state.scale,
    panX: state.panX,
    panY: state.panY,
    mode: state.mode,
    
    // Operations
    setScale: viewportManager.current.setScale,
    setPan: viewportManager.current.setPan,
    toggleMode: () => toggleMode.toggle(),
    
    // Coordinate conversion
    toWorldCoords: coordinateSystem.toWorldCoords,
    toScreenCoords: coordinateSystem.toScreenCoords
  };
};
```

#### `ViewportProvider.tsx` (React Context)
```typescript
// Simple context provider
export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const viewport = useViewport();
  
  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};
```

#### `CanvasAdapter.ts` (Canvas Integration)
```typescript
// Integration with existing ColoringApp canvas system
class CanvasAdapter {
  // Setup with existing canvases
  initialize(
    backgroundCanvas: HTMLCanvasElement,
    fillCanvas: HTMLCanvasElement,
    mainCanvas: HTMLCanvasElement,
    shadowCanvas: HTMLCanvasElement
  ): void;
  
  // Replace existing coordinate functions
  replaceCoordinateFunctions(): void;
  
  // Integration with existing event handlers
  integrateWithExistingHandlers(): void;
}
```

### UI Components

#### `ZoomToggleButton.tsx` (Simple Toggle)
```typescript
// Simple toggle button component
export const ZoomToggleButton: React.FC = () => {
  const { mode, toggleMode } = useViewportContext();
  
  return (
    <button onClick={toggleMode} className={`toggle-btn ${mode}`}>
      {mode === 'zoom' ? '🔍 Zoom' : '✏️ Draw'}
    </button>
  );
};
```

## Implementation Order (Simple Phases)

### Phase 1: Core Foundation (3 files)
1. `types.ts` - Define all interfaces
2. `constants.ts` - Set up configuration  
3. `ViewportManager.ts` - Central state management

### Phase 2: Core Logic (3 files)
1. `CoordinateSystem.ts` - Coordinate conversion
2. `CanvasTransform.ts` - Transform management
3. `ToggleMode.ts` - Mode switching

### Phase 3: Input & Rendering (2 files)
1. `InputHandler.ts` - Input management
2. `RenderLoop.ts` - Rendering system

### Phase 4: React Integration (3 files)
1. `useViewport.ts` - Main hook
2. `ViewportProvider.tsx` - Context provider
3. `CanvasAdapter.ts` - Canvas integration

### Phase 5: UI & Testing (3 files)
1. `ZoomToggleButton.tsx` - Toggle button
2. Basic tests for core functionality
3. Integration with existing ColoringApp

## Configuration (Keep It Simple)

### `constants.ts`
```typescript
export const VIEWPORT_CONFIG = {
  // Basic limits
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4.0,
  
  // Input sensitivity
  ZOOM_SENSITIVITY: 0.001,
  
  // Performance
  TARGET_FPS: 60
};
```

### `types.ts`
```typescript
// Only essential types
export interface ViewportState {
  scale: number;
  panX: number;
  panY: number;
  mode: 'zoom' | 'draw';
}

export interface Coordinates {
  x: number;
  y: number;
}
```

## What We're NOT Doing (Keeping It Simple)

❌ **Excessive separation** - No separate files for validation, caching, optimization  
❌ **Premature optimization** - No caching systems until we need them  
❌ **Over-abstraction** - No complex interfaces until we have multiple implementations  
❌ **Nested directories** - Flat structure is easier to navigate  
❌ **Migration utilities** - We'll handle migration manually if needed  

## Success Criteria

### Simplicity
- [x] Can find any functionality in < 3 seconds
- [x] Each file has one clear purpose
- [⚠️] No file is longer than 200 lines (5 files exceed: CoordinateSystem.ts=218, InputHandler.ts=267, RenderLoop.ts=215, utils.ts=277, ViewportManager.ts=210, CanvasAdapter.ts=273, useViewport.ts=203)
- [x] Total implementation time < 2 weeks

### Functionality 
- [❓] Zoom/pan works perfectly (not yet tested - needs integration)
- [❓] Toggle mode works (not yet tested - needs integration)
- [❓] Drawing tools integrate correctly (not yet tested - needs integration)
- [❓] Mobile gestures work (not yet tested - needs integration)
- [❓] Performance is acceptable (55+ fps) (not yet tested - needs integration)

### Maintainability
- [x] Easy to understand each file
- [x] Easy to add new features
- [x] Easy to debug issues
- [x] Easy to test individual components

This simple structure focuses on **getting it working first**, then optimizing later if needed. We can always split files or add optimizations once the core functionality is solid.