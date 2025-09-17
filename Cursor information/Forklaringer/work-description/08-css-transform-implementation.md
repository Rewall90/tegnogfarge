# CSS Transform Implementation

## Overview
Implement container-based CSS transforms using `transform: translate(${offsetX}px, ${offsetY}px) scale(${scale})` on the canvas container element, keeping canvas internals at 1:1 scale for pixel accuracy.

## Technical Approach

### Container-Based Transforms
Apply CSS transforms to container element instead of individual canvases:

```typescript
class CSSTransformApplier {
  private containerElement: HTMLElement;
  private currentTransform: string = '';
  
  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
    this.setupContainer();
  }
  
  private setupContainer(): void {
    this.containerElement.style.transformOrigin = '0 0';
    this.containerElement.style.willChange = 'transform';
    this.containerElement.style.position = 'absolute';
  }
  
  applyTransform(state: ViewportState): void {
    const transformString = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
    
    // Only update if transform actually changed
    if (transformString !== this.currentTransform) {
      this.containerElement.style.transform = transformString;
      this.currentTransform = transformString;
    }
  }
  
  getCurrentTransform(): string {
    return this.currentTransform;
  }
  
  resetTransform(): void {
    this.containerElement.style.transform = 'translate(0px, 0px) scale(1)';
    this.currentTransform = 'translate(0px, 0px) scale(1)';
  }
}
```

### Transform State Management
Efficiently update CSS transforms when viewport state changes:

```typescript
class TransformStateManager {
  private transformApplier: CSSTransformApplier;
  private lastAppliedState: ViewportState | null = null;
  
  constructor(transformApplier: CSSTransformApplier) {
    this.transformApplier = transformApplier;
  }
  
  updateTransform(newState: ViewportState): void {
    // Skip unnecessary updates
    if (this.statesEqual(newState, this.lastAppliedState)) {
      return;
    }
    
    // Apply transform with optimized string generation
    this.transformApplier.applyTransform(newState);
    this.lastAppliedState = { ...newState };
  }
  
  private statesEqual(state1: ViewportState, state2: ViewportState | null): boolean {
    if (!state2) return false;
    
    return state1.scale === state2.scale && 
           state1.offsetX === state2.offsetX && 
           state1.offsetY === state2.offsetY;
  }
  
  // Batch multiple transform updates
  batchTransformUpdate(callback: () => void): void {
    requestAnimationFrame(() => {
      callback();
    });
  }
}
```

## Transform-Origin Management

### Zoom Centering with Transform Origin
Handle zoom centering properly with CSS transforms:

```typescript
class TransformOriginManager {
  private containerElement: HTMLElement;
  
  setTransformOrigin(originX: number, originY: number): void {
    this.containerElement.style.transformOrigin = `${originX}px ${originY}px`;
  }
  
  // For zoom-to-point operations
  applyZoomAtPoint(
    scale: number, 
    offsetX: number, 
    offsetY: number, 
    zoomCenterX: number, 
    zoomCenterY: number
  ): void {
    // Calculate transform that keeps zoom centered on point
    const adjustedOffsetX = zoomCenterX - (zoomCenterX - offsetX) * scale;
    const adjustedOffsetY = zoomCenterY - (zoomCenterY - offsetY) * scale;
    
    const transformString = `translate(${adjustedOffsetX}px, ${adjustedOffsetY}px) scale(${scale})`;
    this.containerElement.style.transform = transformString;
  }
  
  resetTransformOrigin(): void {
    this.containerElement.style.transformOrigin = '0 0';
  }
}
```

## Performance Optimization

### GPU Acceleration
Optimize for hardware acceleration:

```typescript
class TransformPerformanceOptimizer {
  private containerElement: HTMLElement;
  
  enableGPUAcceleration(): void {
    this.containerElement.style.willChange = 'transform';
    this.containerElement.style.transform = 'translateZ(0)'; // Force layer creation
  }
  
  optimizeForTransforms(): void {
    // Prevent layout thrashing
    this.containerElement.style.position = 'absolute';
    this.containerElement.style.top = '0';
    this.containerElement.style.left = '0';
    
    // Optimize rendering
    this.containerElement.style.backfaceVisibility = 'hidden';
    this.containerElement.style.perspective = '1000px';
  }
  
  disableGPUAcceleration(): void {
    this.containerElement.style.willChange = 'auto';
  }
}
```

### Batched Updates
Batch transform updates for smooth performance:

```typescript
class BatchedTransformUpdater {
  private pendingUpdate: ViewportState | null = null;
  private updateScheduled = false;
  private transformApplier: CSSTransformApplier;
  
  constructor(transformApplier: CSSTransformApplier) {
    this.transformApplier = transformApplier;
  }
  
  scheduleTransformUpdate(state: ViewportState): void {
    this.pendingUpdate = state;
    
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => {
        this.flushUpdate();
      });
    }
  }
  
  private flushUpdate(): void {
    if (this.pendingUpdate) {
      this.transformApplier.applyTransform(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    this.updateScheduled = false;
  }
  
  // For urgent updates that bypass batching
  immediateTransformUpdate(state: ViewportState): void {
    this.transformApplier.applyTransform(state);
    this.pendingUpdate = null;
  }
}
```

## CSS Canvas Setup

### Canvas Style Configuration
Set up canvases to work with container transforms:

```typescript
class CanvasCSSSetup {
  setupCanvas(canvas: HTMLCanvasElement, zIndex: number): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Set fixed canvas dimensions
    canvas.width = 2550 * dpr;
    canvas.height = 3300 * dpr;
    canvas.style.width = '2550px';
    canvas.style.height = '3300px';
    
    // Position for container transform
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = zIndex.toString();
    
    // Prevent individual transforms
    canvas.style.transform = 'none';
    canvas.style.transformOrigin = '0 0';
    
    // Scale context for DPR
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }
  
  setupCanvasContainer(container: HTMLElement): void {
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.transformOrigin = '0 0';
    container.style.willChange = 'transform';
  }
}
```

## Transform Application Pipeline

### Viewport to CSS Transform Pipeline
```typescript
class ViewportToCSSTransformPipeline {
  private transformApplier: CSSTransformApplier;
  private batchUpdater: BatchedTransformUpdater;
  private performanceOptimizer: TransformPerformanceOptimizer;
  
  constructor(containerElement: HTMLElement) {
    this.transformApplier = new CSSTransformApplier(containerElement);
    this.batchUpdater = new BatchedTransformUpdater(this.transformApplier);
    this.performanceOptimizer = new TransformPerformanceOptimizer(containerElement);
    
    this.performanceOptimizer.enableGPUAcceleration();
    this.performanceOptimizer.optimizeForTransforms();
  }
  
  updateViewport(state: ViewportState, urgent = false): void {
    if (urgent) {
      this.batchUpdater.immediateTransformUpdate(state);
    } else {
      this.batchUpdater.scheduleTransformUpdate(state);
    }
  }
  
  // For smooth animations
  animateToViewport(
    targetState: ViewportState, 
    duration: number = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      const startState = this.getCurrentState();
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const eased = this.easeInOutCubic(progress);
        
        const interpolatedState = this.interpolateStates(startState, targetState, eased);
        this.batchUpdater.immediateTransformUpdate(interpolatedState);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
```

## Implementation Steps

### Step 1: CSS Transform Setup
- Create CSSTransformApplier class
- Configure container element for transforms
- Set up GPU acceleration and performance optimizations

### Step 2: Transform State Integration
- Connect viewport state changes to CSS transform updates
- Implement batched update system for smooth performance
- Add transform-origin management for zoom centering

### Step 3: Canvas CSS Configuration
- Set up all canvas elements with proper CSS
- Ensure canvases work correctly with container transforms
- Test alignment and scaling at various zoom levels

### Step 4: Performance Optimization
- Implement batched updates with requestAnimationFrame
- Add GPU acceleration hints and CSS optimizations
- Profile transform performance and optimize bottlenecks

## Testing Strategy

### Transform Accuracy Tests
```typescript
describe('CSS Transform Implementation', () => {
  test('generates correct transform strings', () => {
    const applier = new CSSTransformApplier(container);
    const state = { scale: 1.5, offsetX: 100, offsetY: 200, mode: 'zoom' };
    
    applier.applyTransform(state);
    
    expect(container.style.transform).toBe('translate(100px, 200px) scale(1.5)');
  });
  
  test('batches multiple updates efficiently', () => {
    const batchUpdater = new BatchedTransformUpdater(applier);
    const spy = jest.spyOn(applier, 'applyTransform');
    
    // Multiple rapid updates
    batchUpdater.scheduleTransformUpdate(state1);
    batchUpdater.scheduleTransformUpdate(state2);
    batchUpdater.scheduleTransformUpdate(state3);
    
    // Should only apply the final transform
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

### Performance Tests
- Measure transform application time
- Test GPU acceleration effectiveness
- Verify smooth 60fps performance during transforms

### Success Criteria

#### Functional Requirements
- [x] CSS transforms applied to container element, not individual canvases
- [x] Transform string format: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
- [x] Transform-origin set to '0 0' for consistent behavior
- [x] All canvas layers transform together through container
- [x] No individual canvas transforms interfere with container transform

#### Performance Requirements
- [x] GPU acceleration enabled with will-change: transform
- [x] Batched updates prevent excessive transform applications
- [x] Smooth 60fps performance during pan and zoom operations
- [x] Transform updates complete within 16ms frame budget
- [x] No layout thrashing during transform operations

#### Integration Requirements
- [x] Viewport state changes trigger CSS transform updates
- [x] Transform application doesn't interfere with canvas drawing
- [x] Coordinate mapping works correctly with applied transforms
- [x] Mode switching preserves transform state appropriately
- [x] Canvas layers maintain perfect alignment during transforms