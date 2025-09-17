# Zoom & Pan Architecture – Technical Planning Document

## Objective

Define the technical implementation plan for a **CSS Transform-based Zoom & Pan** feature for the canvas in our coloring application. This document outlines the chosen architecture using CSS transforms with Pointer Events API, Device Pixel Ratio handling, and boundary clamping for production-ready implementation.

---

## Goals

- Implement a **dedicated Zoom & Pan toggle mode** that prevents accidental drawing interactions during navigation
- Create a **CSS Transform-based architecture** with 4-component design (ViewportManager, InputHandler, RenderingSystem, CanvasLayer)
- Ensure **pixel-perfect coordinate accuracy** for all drawing tools using CSS transform coordinate mapping with Device Pixel Ratio support
- Preserve zoom/pan state when switching between navigation and drawing modes
- Support both desktop (mouse wheel, drag) and mobile (pinch, touch) interactions using **Pointer Events API**
- Maintain **60fps performance** through CSS GPU acceleration and boundary clamping
- Handle **high-DPI displays** with proper Device Pixel Ratio scaling

---

## Interaction Mode

| State          | Description                                                            |
|----------------|------------------------------------------------------------------------|
| Zoom Mode ON   | Users can zoom and pan. Drawing tools are temporarily disabled.         |
| Zoom Mode OFF  | Drawing tools are active. Current zoom/pan state must be preserved.     |

---

## Chosen Approach: CSS Transform-Based Implementation

### Key Architecture Decision
After analysis of multiple approaches, we've chosen **CSS Transforms** applied to a container element while keeping canvas internals at 1:1 scale. This approach provides optimal performance and coordinate accuracy.

### Implementation Pattern for Fixed Canvas Size
```html
<div class="canvas-viewport" style="overflow: hidden;">
  <div class="canvas-container" style="transform: translate(-17px, -374px) scale(1.3);">
    <canvas width={2550 * devicePixelRatio} height={3300 * devicePixelRatio} 
            style="width: 2550px; height: 3300px;" />
  </div>
</div>
```

### Benefits of CSS Transform Approach with Fixed Dimensions
- **GPU Acceleration**: CSS transforms are hardware-accelerated for smooth 60fps performance
- **Multi-layer Support**: Single container transform synchronizes all canvas layers automatically
- **Coordinate Accuracy**: Direct coordinate mapping preserves pixel-perfect precision for drawing tools
- **Fixed Canvas Optimization**: Known 2550x3300px dimensions enable optimized boundary calculations and zoom presets
- **Device Pixel Ratio**: Canvas internal size scales with DPR for crisp high-DPI rendering
- **Predictable Performance**: Consistent canvas size ensures reliable performance across all images

### Architecture Components
1. **ViewportManager** - Single source of truth for viewport state (scale, offsetX, offsetY, mode)
2. **InputHandler** - Unified Pointer Events API handling for all input types
3. **RenderingSystem** - CSS transform application and rendering coordination
4. **CanvasLayer** - Individual canvas layer management with transform support

---

## Input Handling: Pointer Events API

### Unified Input Strategy
We use the **Pointer Events API** for unified handling of mouse, touch, and pen inputs. This eliminates the need for separate mouse/touch event handlers.

```javascript
function setupPointerEvents(canvas) {
  // Prevent browser zoom/scroll interference
  canvas.style.touchAction = 'none';
  
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerCancel);
  canvas.addEventListener('wheel', handleWheel, { passive: false });
}
```

### Input Type Support
| Input Type       | Implementation                          | Benefits                                              |
|------------------|------------------------------------------|-------------------------------------------------------|
| **Mouse**        | `pointerdown/move/up` + `wheel`         | Unified with touch handling, no separate logic needed |
| **Touch**        | `pointerdown/move/up` (multi-touch)     | Native pinch/pan support with `touchAction: 'none'`  |
| **Pen/Stylus**   | `pointerdown/move/up` with pressure     | Automatic detection, same coordinate pipeline         |
| **Wheel/Scroll** | `wheel` events with `preventDefault()`  | Precise zoom control with browser zoom disabled       |

### Browser Gesture Prevention
- `touchAction: 'none'` prevents browser zoom/scroll
- `{ passive: false }` allows `preventDefault()` on wheel events
- `setPointerCapture()` ensures smooth pan operations

---

## Coordinate Transformation Pipeline

### CSS Transform-Based Coordinate Mapping
Our coordinate transformation uses a precise 3-step process to map pointer events to canvas pixels:

```javascript
function getCanvasCoordinates(event: PointerEvent): { x: number, y: number } {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  // Step 1: Get pointer position relative to canvas (CSS pixels)
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  
  // Step 2: Undo CSS transform (subtract pan, divide by zoom)
  const logicalX = (screenX - panX) / zoom;
  const logicalY = (screenY - panY) / zoom;
  
  // Step 3: Map to internal canvas pixels (account for DPR)
  const canvasX = Math.round(logicalX * dpr);
  const canvasY = Math.round(logicalY * dpr);
  
  return { x: canvasX, y: canvasY };
}
```

### Device Pixel Ratio Handling
| Aspect                    | Implementation                                                               |
|---------------------------|------------------------------------------------------------------------------|
| **Canvas Setup**          | `canvas.width = displayWidth * devicePixelRatio`                            |
| **Context Scaling**       | `ctx.scale(dpr, dpr)` - Scale drawing context to match DPR                  |
| **Coordinate Mapping**    | `logicalX * dpr` - Convert logical coordinates to internal canvas pixels    |
| **High-DPI Support**      | Automatic crisp rendering on Retina/high-DPI displays                       |

### Boundary Clamping
```javascript
function clampViewportState(scale, offsetX, offsetY, canvasSize, containerSize) {
  // Clamp zoom: 25% to 400%
  const clampedScale = Math.max(0.25, Math.min(4.0, scale));
  
  // Calculate pan boundaries to keep canvas visible
  const scaledWidth = canvasSize.width * clampedScale;
  const minOffsetX = containerSize.width - scaledWidth;
  const maxOffsetX = 0;
  
  return {
    scale: clampedScale,
    offsetX: Math.max(minOffsetX, Math.min(maxOffsetX, offsetX)),
    offsetY: Math.max(minOffsetY, Math.min(maxOffsetY, offsetY))
  };
}
```

---

## Implementation Stack

### Chosen Technology Stack
| Layer                    | Selected Technology                    | Rationale                                                    |
|--------------------------|----------------------------------------|--------------------------------------------------------------|
| **Zoom Implementation**  | CSS `transform: scale()`               | GPU-accelerated, maintains canvas resolution                 |
| **Pan Implementation**   | CSS `transform: translate()`           | Synchronized with zoom, hardware-accelerated                 |
| **Input Handling**       | Pointer Events API                     | Unified mouse/touch/pen support, modern browser standard    |
| **Coordinate Mapping**   | Custom CSS transform math + DPR       | Pixel-perfect accuracy for drawing tools                     |
| **Canvas Management**    | Multi-layer HTML `<canvas>` elements   | Existing architecture, proven for drawing applications       |
| **State Management**     | React Context + ViewportManager        | Centralized state, clean component integration               |
| **Boundary Handling**    | Custom clamping functions              | Prevents viewport loss, smooth user experience               |

### File Structure
```
src/core/viewport/
├── ViewportManager.ts    # State management
├── InputHandler.ts       # Pointer events handling  
├── RenderingSystem.ts    # CSS transform application
├── CanvasLayer.ts        # Individual layer management
├── types.ts              # TypeScript interfaces
└── constants.ts          # Zoom limits, defaults

src/integrations/
├── react/useViewport.ts  # React hook
└── canvas/CanvasViewport.ts # Canvas integration
```

---

## Implementation Summary

This document defines the technical implementation plan for a production-ready CSS Transform-based zoom and pan system. The chosen approach delivers:

### Key Benefits
- **Performance**: Hardware-accelerated CSS transforms ensure smooth 60fps navigation
- **Accuracy**: Pixel-perfect coordinate mapping preserves drawing tool precision at all zoom levels
- **Compatibility**: Unified Pointer Events API works seamlessly across desktop and mobile devices
- **Quality**: Device Pixel Ratio support provides crisp rendering on high-DPI displays
- **Safety**: Boundary clamping prevents users from losing canvas visibility

### Critical Success Factors
- **Toggle Mode**: Clean separation between navigation and drawing modes with state preservation
- **Multi-layer Sync**: All canvas layers transform together through single container element
- **Browser Prevention**: Proper blocking of browser zoom/scroll gestures without breaking app functionality
- **Coordinate Pipeline**: Reliable 3-step transformation (screen → logical → canvas pixels) with DPR support

### Next Steps
1. Implement ViewportManager with CSS transform state management
2. Create InputHandler with Pointer Events API integration
3. Build RenderingSystem for transform application and boundary clamping
4. Integrate coordinate mapping with existing drawing tools (brush, flood fill)
5. Add toggle button UI for mode switching
6. Test across devices and browsers for accuracy and performance

