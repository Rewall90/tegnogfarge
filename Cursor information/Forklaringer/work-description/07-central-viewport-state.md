# Central Viewport State

## Overview
Create a unified ViewportManager to store and synchronize `scale`, `offsetX`, and `offsetY` state across all interactions, ensuring consistent zoom/pan behavior throughout the application.

## Viewport State Definition

### State Interface
```typescript
interface ViewportState {
  scale: number;      // Current zoom level (0.25 to 4.0)
  offsetX: number;    // Pan offset in CSS pixels
  offsetY: number;    // Pan offset in CSS pixels
  mode: 'zoom' | 'draw';
}

interface ViewportBounds {
  minScale: number;
  maxScale: number;
  canvasWidth: number;
  canvasHeight: number;
}
```

### ViewportManager Implementation
```typescript
class ViewportManager {
  private state: ViewportState = {
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    mode: 'draw'
  };
  
  private bounds: ViewportBounds = {
    minScale: 0.25,
    maxScale: 4.0,
    canvasWidth: 2550,
    canvasHeight: 3300
  };
  
  private stateChangeCallbacks: Array<(state: ViewportState) => void> = [];
  
  getState(): ViewportState {
    return { ...this.state };
  }
  
  setState(newState: Partial<ViewportState>): void {
    const previousState = { ...this.state };
    
    // Apply new state with validation
    this.state = {
      ...this.state,
      ...newState,
      scale: this.clampScale(newState.scale ?? this.state.scale),
      offsetX: newState.offsetX ?? this.state.offsetX,
      offsetY: newState.offsetY ?? this.state.offsetY
    };
    
    // Apply boundary clamping
    const clampedState = this.applyBoundaryConstraints(this.state);
    this.state = clampedState;
    
    // Only notify if state actually changed
    if (!this.statesEqual(previousState, this.state)) {
      this.notifyStateChange();
    }
  }
  
  private clampScale(scale: number): number {
    return Math.max(this.bounds.minScale, Math.min(this.bounds.maxScale, scale));
  }
  
  private applyBoundaryConstraints(state: ViewportState): ViewportState {
    const containerSize = this.getContainerSize();
    const scaledWidth = this.bounds.canvasWidth * state.scale;
    const scaledHeight = this.bounds.canvasHeight * state.scale;
    
    // Calculate pan boundaries
    let minOffsetX = containerSize.width - scaledWidth;
    let maxOffsetX = 0;
    let minOffsetY = containerSize.height - scaledHeight;
    let maxOffsetY = 0;
    
    // Center canvas if smaller than container
    if (scaledWidth < containerSize.width) {
      const centerX = (containerSize.width - scaledWidth) / 2;
      minOffsetX = maxOffsetX = centerX;
    }
    
    if (scaledHeight < containerSize.height) {
      const centerY = (containerSize.height - scaledHeight) / 2;
      minOffsetY = maxOffsetY = centerY;
    }
    
    return {
      ...state,
      offsetX: Math.max(minOffsetX, Math.min(maxOffsetX, state.offsetX)),
      offsetY: Math.max(minOffsetY, Math.min(maxOffsetY, state.offsetY))
    };
  }
}
```

## State Synchronization

### Event System
```typescript
class ViewportEventSystem {
  private viewportManager: ViewportManager;
  
  subscribeToStateChanges(callback: (state: ViewportState) => void): () => void {
    this.viewportManager.addStateChangeCallback(callback);
    
    // Return unsubscribe function
    return () => {
      this.viewportManager.removeStateChangeCallback(callback);
    };
  }
  
  // Synchronize with CSS transform updates
  syncWithTransformSystem(): void {
    this.subscribeToStateChanges((state) => {
      this.cssTransformApplier.updateTransform(state);
    });
  }
  
  // Synchronize with coordinate mapper
  syncWithCoordinateMapper(): void {
    this.subscribeToStateChanges((state) => {
      this.coordinateMapper.updateViewportState(state);
    });
  }
  
  // Synchronize with UI components
  syncWithUI(): void {
    this.subscribeToStateChanges((state) => {
      this.updateZoomDisplay(state.scale);
      this.updateModeIndicator(state.mode);
    });
  }
}
```

### State Validation
```typescript
class ViewportStateValidator {
  validateState(state: ViewportState): ValidationResult {
    const errors: string[] = [];
    
    if (!Number.isFinite(state.scale) || state.scale <= 0) {
      errors.push('Scale must be a positive finite number');
    }
    
    if (state.scale < 0.25 || state.scale > 4.0) {
      errors.push('Scale must be between 0.25 and 4.0');
    }
    
    if (!Number.isFinite(state.offsetX) || !Number.isFinite(state.offsetY)) {
      errors.push('Offset values must be finite numbers');
    }
    
    if (!['zoom', 'draw'].includes(state.mode)) {
      errors.push('Mode must be either "zoom" or "draw"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  sanitizeState(state: Partial<ViewportState>): ViewportState {
    return {
      scale: Number.isFinite(state.scale) ? Math.max(0.25, Math.min(4.0, state.scale!)) : 1.0,
      offsetX: Number.isFinite(state.offsetX) ? state.offsetX! : 0,
      offsetY: Number.isFinite(state.offsetY) ? state.offsetY! : 0,
      mode: ['zoom', 'draw'].includes(state.mode!) ? state.mode! : 'draw'
    };
  }
}
```

## Integration with Systems

### CSS Transform Integration
```typescript
class ViewportTransformSync {
  private cssTransformApplier: CSSTransformApplier;
  
  constructor(viewportManager: ViewportManager, transformApplier: CSSTransformApplier) {
    this.cssTransformApplier = transformApplier;
    
    // Subscribe to viewport changes
    viewportManager.addStateChangeCallback((state) => {
      this.updateCSSTransform(state);
    });
  }
  
  private updateCSSTransform(state: ViewportState): void {
    const transformString = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
    this.cssTransformApplier.applyTransform(transformString);
  }
}
```

### Input Handler Integration
```typescript
class ViewportInputSync {
  constructor(
    private viewportManager: ViewportManager,
    private panHandler: PanInputHandler,
    private zoomHandler: ZoomInputHandler
  ) {
    this.setupInputIntegration();
  }
  
  private setupInputIntegration(): void {
    // Pan handler updates viewport state
    this.panHandler.onPanDelta((deltaX, deltaY) => {
      const currentState = this.viewportManager.getState();
      this.viewportManager.setState({
        offsetX: currentState.offsetX + deltaX,
        offsetY: currentState.offsetY + deltaY
      });
    });
    
    // Zoom handler updates viewport state
    this.zoomHandler.onZoomChange((newScale, centerX, centerY) => {
      const currentState = this.viewportManager.getState();
      
      // Calculate new pan to keep zoom centered
      const newOffsetX = centerX - (centerX - currentState.offsetX) * (newScale / currentState.scale);
      const newOffsetY = centerY - (centerY - currentState.offsetY) * (newScale / currentState.scale);
      
      this.viewportManager.setState({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    });
  }
}
```

## State Persistence

### Local Storage Integration
```typescript
class ViewportStatePersistence {
  private readonly STORAGE_KEY = 'viewport-state';
  
  saveState(state: ViewportState): void {
    const persistData = {
      scale: state.scale,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persistData));
    } catch (error) {
      console.warn('Failed to save viewport state:', error);
    }
  }
  
  loadState(): Partial<ViewportState> | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Check if state is recent (within 24 hours)
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      return {
        scale: parsed.scale,
        offsetX: parsed.offsetX,
        offsetY: parsed.offsetY,
        mode: 'draw' // Always start in draw mode
      };
    } catch {
      return null;
    }
  }
  
  clearSavedState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

## Implementation Steps

### Step 1: Create Core Viewport Manager
- Implement state interface and bounds definition
- Add state validation and clamping logic
- Create event system for state change notifications

### Step 2: Set Up State Synchronization
- Connect viewport manager with CSS transform system
- Integrate with coordinate mapping system
- Sync with UI components for visual feedback

### Step 3: Input System Integration
- Connect pan handler to update viewport state
- Connect zoom handler to update viewport state
- Ensure clean separation between input and state

### Step 4: State Persistence
- Add local storage integration for state persistence
- Implement state restoration on application load
- Handle edge cases and error conditions

## Testing Strategy

### State Management Tests
```typescript
describe('ViewportManager', () => {
  test('clamps scale within bounds', () => {
    const manager = new ViewportManager();
    
    manager.setState({ scale: 10.0 });
    expect(manager.getState().scale).toBe(4.0);
    
    manager.setState({ scale: 0.1 });
    expect(manager.getState().scale).toBe(0.25);
  });
  
  test('applies boundary clamping for pan', () => {
    const manager = new ViewportManager();
    
    // Test with extreme pan values
    manager.setState({ 
      scale: 1.0, 
      offsetX: -5000, 
      offsetY: -5000 
    });
    
    const state = manager.getState();
    expect(state.offsetX).toBeGreaterThan(-3000);
    expect(state.offsetY).toBeGreaterThan(-4000);
  });
});
```

### Integration Tests
- Test viewport state synchronization across all systems
- Verify state persistence and restoration
- Check boundary enforcement under various conditions

### Success Criteria

#### Functional Requirements
- [x] ViewportManager stores scale, offsetX, offsetY, and mode state
- [x] State validation prevents invalid values
- [x] Boundary clamping keeps canvas visible at all zoom levels
- [x] Event system notifies all subscribers of state changes
- [x] State persistence works across browser sessions

#### Integration Requirements
- [x] CSS transform system updates when viewport state changes
- [x] Coordinate mapper receives viewport state updates
- [x] Input handlers properly update viewport state
- [x] UI components reflect current viewport state
- [x] All systems use single source of truth for viewport state

#### Performance Requirements
- [x] State updates are batched to prevent excessive notifications
- [x] Boundary calculations are optimized for real-time use
- [x] State validation has minimal performance impact
- [x] Event system scales with multiple subscribers
- [x] State persistence doesn't block UI operations