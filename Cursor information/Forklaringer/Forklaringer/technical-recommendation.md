# Feature Request: CSS Transform-Based Zoom/Pan Implementation

## Project Context
The tegnogfarge coloring application requires a complete rewrite of its zoom/pan functionality to provide a dedicated toggle-based navigation mode. After comprehensive analysis of the current multi-layer canvas architecture (background, fill, main, shadow layers) and flood fill algorithm requirements, this document provides technical recommendations using CSS transforms for optimal performance and coordinate accuracy.

## Key Insight: CSS Transform Approach
Analysis revealed the optimal pattern: using CSS transforms on a container element while keeping canvas internals at 1:1 scale. This approach eliminates canvas transform complexity while maintaining pixel-perfect coordinate accuracy through direct coordinate mapping.

**Implementation Pattern:**
```html
<div class="canvas-viewport" style="overflow: hidden;">
  <div class="canvas-container" style="transform: translate(-17px, -374px) scale(1.3);">
    <canvas width="1024" height="1536" style="width: 730px; height: 1095px;"></canvas>
  </div>
</div>
```

**Coordinate Mapping (Based on Your Example):**
```javascript
// CSS transform values (from ViewportManager state)
const panX = -17; // translateX value
const panY = -374; // translateY value  
const zoom = 1.3; // scale value

function getCanvasCoordinates(event) {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Mouse position relative to canvas (in CSS pixels)
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  
  // Undo CSS transform: subtract pan, then divide by zoom
  const logicalX = (screenX - panX) / zoom;
  const logicalY = (screenY - panY) / zoom;
  
  // Map to canvas pixel coordinates
  const canvasX = Math.round(logicalX * (canvas.width / canvas.clientWidth));
  const canvasY = Math.round(logicalY * (canvas.height / canvas.clientHeight));
  
  return { x: canvasX, y: canvasY };
}
```

## Goals  
- Implement a **dedicated Zoom & Pan toggle mode** that prevents accidental drawing interactions during navigation
- Create a clean **CSS Transform-based architecture** (ViewportManager, InputHandler, RenderingSystem, CanvasLayer) following the CSS transform approach
- Ensure **pixel-perfect coordinate accuracy** for all drawing tools using the CSS transform coordinate mapping
- Preserve zoom/pan state when switching between navigation and drawing modes
- Support both desktop (mouse wheel, drag) and mobile (pinch, touch) interactions seamlessly
- Maintain **60fps performance** through CSS GPU acceleration and optimized rendering
- Provide a maintainable, testable codebase with clear separation of concerns

## Constraints
- **Fixed Canvas Dimensions**: All coloring images use consistent 2550x3300px resolution (17:22 aspect ratio)
- The underlying canvas resolution must remain fixed - transformations apply to the container view only
- All existing drawing tools (brush, flood fill, etc.) must work with pixel-perfect accuracy after CSS transform coordinate mapping
- **Device Pixel Ratio (DPR) must be handled** - Canvas internal size must scale with `devicePixelRatio` for crisp rendering on high-DPI displays
- Only the canvas should zoom/pan - UI elements and toolbars remain fixed in position
- Must support zoom levels from 25% to 400% with smooth CSS transitions and proper boundary clamping
- The system must handle multiple synchronized canvas layers through single container transform
- Mobile touch interactions must not conflict with browser gestures (prevent default scrolling/zooming using Pointer Events API)
- Toggle mode must cleanly disable/enable drawing tools while preserving tool state and viewport position
- **Pan/Zoom boundaries** can be optimized for known 2550x3300px dimensions to prevent viewport loss
- CSS transforms may cause visual blur at non-integer zoom levels - acceptable trade-off for coordinate accuracy

## Related Components

**New files to be created following the 4-component architecture:**
- `src/core/viewport/ViewportManager.ts` - Single source of truth for viewport state (scale, offsetX, offsetY, mode)
- `src/core/viewport/InputHandler.ts` - Unified input event handling for zoom/pan and mode switching
- `src/core/viewport/RenderingSystem.ts` - CSS transform application and rendering coordination
- `src/core/viewport/CanvasLayer.ts` - Individual canvas layer management with transform support
- `src/core/viewport/types.ts` - Shared TypeScript interfaces for viewport state
- `src/core/viewport/constants.ts` - Zoom limits, defaults, performance constraints

**Integration Layer:**
- `src/integrations/react/useViewport.ts` - React hook integration for viewport state
- `src/integrations/react/ViewportProvider.tsx` - Context provider for app-wide viewport access
- `src/integrations/canvas/CanvasViewport.ts` - Canvas-specific integration layer

**Components requiring integration:**
- `src/components/coloring/ColoringApp.tsx` - Remove embedded zoom/pan code, integrate new system
- `src/components/coloring/ToolBar.tsx` - Add zoom toggle button for desktop
- `src/components/coloring/MobileToolbar/index.tsx` - Add mobile zoom toggle
- `src/components/coloring/ColoringCanvas.tsx` - Integrate coordinate transformation for drawing tools
- `src/lib/flood-fill.ts` - Update to use CSS transform coordinate mapping

## Specific Help Needed
1. **Toggle Mode Implementation** - How to cleanly disable/enable drawing tools when zoom mode is active while preserving tool state and viewport position
2. **Device Pixel Ratio Integration** - Proper handling of high-DPI displays with canvas internal size scaling and coordinate mapping adjustments
3. **CSS Transform Coordinate Pipeline** - Implementation with DPR support: undo transform, then adjust for device pixel ratio
4. **Pan/Zoom Boundary Clamping** - Calculate and enforce min/max pan/zoom values to prevent losing canvas visibility
5. **State Persistence Strategy** - Best approach for maintaining zoom/pan state across mode switches without performance impact
6. **Multi-layer Synchronization** - Ensure all canvas layers transform together with consistent DPR handling
7. **Mobile Gesture Handling** - Prevent browser default zoom/scroll while allowing app zoom/pan using Pointer Events API with `touchAction: 'none'` and proper boundary enforcement
8. **Performance Optimization** - Efficient rendering pipeline that handles DPR scaling without unnecessary redraws

## Implementation Architecture

### Container Structure with Fixed Canvas Dimensions
```html
<div className="canvas-viewport" style={{
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100%'
}}>
  <div className="canvas-container" style={{
    position: 'absolute',
    transformOrigin: '0 0',
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    willChange: 'transform'
  }}>
    <canvas 
      ref={backgroundCanvasRef}
      width={2550 * devicePixelRatio}
      height={3300 * devicePixelRatio}
      style={{ 
        position: 'absolute',
        width: '2550px',
        height: '3300px'
      }} 
    />
    <canvas 
      ref={fillCanvasRef}
      width={2550 * devicePixelRatio}
      height={3300 * devicePixelRatio}
      style={{ 
        position: 'absolute',
        width: '2550px',
        height: '3300px'
      }} 
    />
    <canvas 
      ref={mainCanvasRef}
      width={2550 * devicePixelRatio}
      height={3300 * devicePixelRatio}
      style={{ 
        position: 'absolute',
        width: '2550px',
        height: '3300px'
      }} 
    />
  </div>
</div>
```

### Device Pixel Ratio Setup for Fixed Dimensions
```javascript
const CANVAS_WIDTH = 2550;
const CANVAS_HEIGHT = 3300;

function setupCanvasWithDPR(canvas) {
  const dpr = window.devicePixelRatio || 1;
  
  // Set internal size (scaled for high-DPI) - always 2550x3300 base
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr;
  
  // Set CSS size (actual display size) - always 2550x3300 logical pixels
  canvas.style.width = `${CANVAS_WIDTH}px`;
  canvas.style.height = `${CANVAS_HEIGHT}px`;
  
  // Scale drawing context to match DPR
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  return { dpr, ctx };
}
```

### Unified Input Handling with Pointer Events API
```javascript
// Use Pointer Events API for unified mouse/touch/pen handling
function setupPointerEvents(canvas) {
  // Enable pointer events and prevent default browser actions
  canvas.style.touchAction = 'none'; // Prevent browser zoom/scroll
  
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerCancel);
  
  // Handle wheel events for zoom
  canvas.addEventListener('wheel', handleWheel, { passive: false });
}

function handlePointerDown(event: PointerEvent) {
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  
  const coords = getCanvasCoordinates(event);
  
  if (viewportManager.isZoomMode) {
    // Start pan operation
    startPan(coords, event.pointerId);
  } else {
    // Pass to drawing tools
    drawingManager.handleStart(coords, event);
  }
}
```

### Event-to-Canvas Mapping with Device Pixel Ratio Support
```javascript
// ViewportManager maintains these values from CSS transforms
const panX = viewportManager.offsetX; // translateX value
const panY = viewportManager.offsetY; // translateY value  
const zoom = viewportManager.scale; // scale value

function getCanvasCoordinates(event: PointerEvent): { x: number, y: number } {
  const canvas = mainCanvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  // Pointer position relative to canvas (in CSS pixels)
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  
  // Undo CSS transform: subtract pan, then divide by zoom
  const logicalX = (screenX - panX) / zoom;
  const logicalY = (screenY - panY) / zoom;
  
  // Map to internal canvas pixels (accounting for DPR)
  const canvasX = Math.round(logicalX * dpr);
  const canvasY = Math.round(logicalY * dpr);
  
  return { x: canvasX, y: canvasY };
}
```

### Pan/Zoom Boundary Clamping for Fixed Canvas Size
```javascript
const CANVAS_WIDTH = 2550;
const CANVAS_HEIGHT = 3300;

function clampViewportState(scale, offsetX, offsetY, containerSize) {
  // Clamp zoom to reasonable limits
  const minZoom = 0.25;
  const maxZoom = 4.0;
  const clampedScale = Math.max(minZoom, Math.min(maxZoom, scale));
  
  // Calculate scaled canvas dimensions (fixed 2550x3300)
  const scaledWidth = CANVAS_WIDTH * clampedScale;
  const scaledHeight = CANVAS_HEIGHT * clampedScale;
  
  // Calculate pan boundaries to keep canvas visible
  const minOffsetX = containerSize.width - scaledWidth;
  const maxOffsetX = 0;
  const minOffsetY = containerSize.height - scaledHeight;
  const maxOffsetY = 0;
  
  // Clamp pan values
  const clampedOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, offsetX));
  const clampedOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, offsetY));
  
  return {
    scale: clampedScale,
    offsetX: clampedOffsetX,
    offsetY: clampedOffsetY
  };
}

// Utility function for zoom-to-fit calculations
function calculateFitToScreenZoom(containerSize) {
  const scaleX = containerSize.width / CANVAS_WIDTH;
  const scaleY = containerSize.height / CANVAS_HEIGHT;
  return Math.min(scaleX, scaleY); // Fit entire canvas in viewport
}
```

## Optional Extras
- **Zoom to fit** button that automatically scales canvas to fit viewport
- **Zoom presets** (25%, 50%, 100%, 200%, 400%) for quick navigation
- **Animated zoom transitions** with smooth CSS easing for better UX
- **Mini-map overlay** showing current viewport position on large canvases
- **Keyboard shortcuts** for zoom in/out and reset (Ctrl+/-, Ctrl+0)
- **Zoom indicator** showing current zoom percentage in the UI
- **Pan boundaries** to prevent panning beyond canvas edges when zoomed in
- **Double-tap to zoom** gesture for mobile devices
- **Reset zoom** button to return to 100% scale and center position