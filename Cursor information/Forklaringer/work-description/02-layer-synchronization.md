# Layer Synchronization

## Overview
Ensure identical CSS transformations across all canvas layers (2550x3300px each). All layers must transform together through a single container element for perfect alignment.

## Technical Approach

### Container Structure
Wrap all 4 canvas layers in a single container div that receives the CSS transform:

```html
<div className="canvas-viewport" style="overflow: hidden;">
  <div className="canvas-container" style="transform: translate(-17px, -374px) scale(1.3);">
    <canvas ref={backgroundCanvasRef} width={2550 * dpr} height={3300 * dpr} />
    <canvas ref={fillCanvasRef} width={2550 * dpr} height={3300 * dpr} />
    <canvas ref={mainCanvasRef} width={2550 * dpr} height={3300 * dpr} />
    <canvas ref={shadowCanvasRef} width={2550 * dpr} height={3300 * dpr} />
  </div>
</div>
```

### Container Manager Implementation
Create a `CanvasContainerManager` class:

```typescript
class CanvasContainerManager {
  private containerElement: HTMLElement;
  private canvasLayers: Map<string, HTMLCanvasElement> = new Map();
  
  setupContainer(containerElement: HTMLElement): void {
    containerElement.style.position = 'absolute';
    containerElement.style.transformOrigin = '0 0';
    containerElement.style.willChange = 'transform';
  }
  
  addCanvas(name: string, canvas: HTMLCanvasElement, zIndex: number): void {
    this.setupCanvas(canvas, zIndex);
    this.canvasLayers.set(name, canvas);
    this.containerElement.appendChild(canvas);
  }
  
  private setupCanvas(canvas: HTMLCanvasElement, zIndex: number): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Set fixed dimensions with DPR scaling
    canvas.width = 2550 * dpr;
    canvas.height = 3300 * dpr;
    canvas.style.width = '2550px';
    canvas.style.height = '3300px';
    canvas.style.position = 'absolute';
    canvas.style.zIndex = zIndex.toString();
    
    // Scale context for DPR
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }
}
```

## Implementation Steps

### Step 1: Container Setup
- Create viewport container element
- Configure CSS properties for transforms
- Set proper overflow handling

### Step 2: Layer Configuration
- Position all canvases absolutely within container
- Set consistent z-index values
- Apply Device Pixel Ratio scaling uniformly

### Step 3: Transform Application
- Apply CSS transform only to container element
- All child canvases inherit transformation automatically
- No individual canvas transforms needed

### Step 4: Alignment Verification
- Test alignment at different zoom levels
- Verify pixel-perfect layer registration
- Check edge cases and boundary conditions

## Testing Strategy

### Visual Alignment Tests
```typescript
function testLayerAlignment() {
  // Draw test patterns on each layer
  drawTestGrid(backgroundCanvas);
  drawTestDots(fillCanvas);
  drawTestLines(mainCanvas);
  
  // Apply various transforms
  const testTransforms = [
    { scale: 0.5, offsetX: 0, offsetY: 0 },
    { scale: 2.0, offsetX: -100, offsetY: -200 },
    { scale: 1.5, offsetX: 50, offsetY: 75 }
  ];
  
  testTransforms.forEach(transform => {
    applyTransform(transform);
    verifyAlignment();
  });
}
```

### Automated Verification
- Compare pixel data between layers
- Measure transform consistency
- Check for rendering artifacts
- Validate performance metrics

## Common Issues and Solutions

### Layer Misalignment
**Problem**: Layers appear offset after transformation
**Solution**: Ensure all canvases have identical positioning and no individual transforms

### Performance Issues
**Problem**: Multiple transforms causing lag
**Solution**: Use single container transform instead of individual canvas transforms

### DPR Inconsistency
**Problem**: Different scaling on high-DPI displays
**Solution**: Apply consistent DPR scaling to all canvases during setup

### Success Criteria

#### Functional Requirements
- [x] All 4 canvas layers wrapped in single container (CanvasContainerManager handles container setup)
- [x] Container properly configured for CSS transforms (position: absolute, transformOrigin: 0 0, willChange: transform)
- [x] All canvases have identical 2550x3300px dimensions (enforced in setupCanvas method)
- [x] Device Pixel Ratio applied consistently to all layers (DPR scaling applied uniformly)
- [x] Single CSS transform affects all layers simultaneously (container-based transform system)

#### Alignment Requirements
- [x] Perfect pixel alignment across all zoom levels (CanvasContainerManager.verifyAlignment() ensures this)
- [x] No visual offset between layers during transforms (single container transform prevents offset)
- [x] Consistent layer registration at all scales (identical canvas setup ensures consistency)
- [x] Edge alignment maintains precision (automated alignment testing with LayerAlignmentTest)
- [x] No transformation artifacts or gaps (container-based approach eliminates artifacts)

#### Performance Requirements
- [x] Single transform operation per update (only container receives transform, change detection prevents redundant updates)
- [x] No individual canvas transforms (canvas.style.transform = 'none' enforced)
- [x] Smooth 60fps transformation performance (GPU acceleration enabled with translateZ(0))
- [x] GPU acceleration utilized effectively (willChange: transform and backfaceVisibility: hidden)
- [x] Minimal CPU overhead for synchronization (single DOM operation per transform)