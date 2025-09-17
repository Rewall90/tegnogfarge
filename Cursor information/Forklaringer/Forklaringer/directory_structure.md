## Example Directory Structure with Suggestions

## 1. Core Viewport System
The core directory contains the main viewport logic using CSS Transform approach for 2550x3300px fixed canvas dimensions.

**ViewportManager.ts**
Central state management for CSS transform values (scale, offsetX, offsetY, mode).
Handles viewport state updates and provides methods for zoom/pan operations.
Manages toggle between zoom mode and drawing mode with state preservation.

**InputHandler.ts**
Unified Pointer Events API handling for mouse, touch, and pen input.
Implements `touchAction: 'none'` and `setPointerCapture()` for smooth gestures.
Prevents browser zoom/scroll while allowing app zoom/pan functionality.

**RenderingSystem.ts**
CSS transform application and rendering coordination (not canvas redraw loops).
Applies `transform: translate(${offsetX}px, ${offsetY}px) scale(${scale})` to container.
Handles transform-origin and GPU acceleration with `will-change: transform`.

**CanvasLayer.ts**
Individual canvas layer management with fixed 2550x3300px dimensions.
Handles Device Pixel Ratio scaling: `width = 2550 * devicePixelRatio`.
Manages canvas context scaling: `ctx.scale(dpr, dpr)`.

**types.ts**
TypeScript interfaces for viewport state, coordinate systems, and Pointer Events.
Includes types for CSS transform state and boundary clamping.

**constants.ts** (NEW)
Fixed canvas dimensions: `CANVAS_WIDTH = 2550`, `CANVAS_HEIGHT = 3300`.
Zoom limits, aspect ratio, and other viewport constants.

**utils.ts**
CSS transform coordinate mapping utilities.
3-step transformation: screen → logical → canvas pixels with DPR support.
Boundary clamping functions for fixed canvas dimensions.
## 2. Integration Layer
The integrations directory provides clean interfaces between the core viewport system and external frameworks.

**react/useViewport.ts**
React hook for viewport state management and CSS transform integration.
Provides access to viewport state (scale, offsetX, offsetY, mode) and update methods.
Handles React state synchronization with ViewportManager.

**react/ViewportProvider.tsx** 
Context provider for app-wide viewport state access.
Wraps the application with viewport context for component consumption.
Manages viewport system lifecycle and cleanup.

**canvas/CanvasViewport.ts**
Canvas-specific integration layer for existing drawing tools.
Provides coordinate transformation utilities for drawing tools (brush, flood fill).
Bridges viewport system with existing canvas rendering pipeline.
## 3. Testing Strategy for CSS Transform Implementation
**Critical Test Coverage:**
- **coordinate-mapping.test.ts**: Test 3-step transformation accuracy (screen → logical → canvas pixels)
- **boundary-clamping.test.ts**: Verify zoom/pan limits with fixed 2550x3300px dimensions  
- **device-pixel-ratio.test.ts**: Test DPR handling on high-DPI displays
- **pointer-events.test.ts**: Validate Pointer Events API integration and gesture prevention

## 4. Key Architecture Benefits
**Fixed Canvas Dimensions (2550x3300px):**
- Predictable boundary calculations and zoom-to-fit ratios
- Consistent performance across all coloring images
- Optimized coordinate transformation with known aspect ratio

**CSS Transform Approach:**
- Hardware-accelerated GPU rendering for smooth 60fps performance
- Single container transform synchronizes all canvas layers automatically
- No canvas redraw loops - just CSS transform state updates

**Pointer Events API:**
- Unified input handling for mouse, touch, and pen across all devices
- Proper browser gesture prevention with `touchAction: 'none'`
- Clean toggle between zoom mode and drawing mode

## Example Directory Structure with Suggestions

src/
  ├── core/
  │   ├── viewport/
  │   │   ├── ViewportManager.ts
  │   │   ├── InputHandler.ts
  │   │   ├── RenderingSystem.ts
  │   │   ├── CanvasLayer.ts
  │   │   ├── types.ts
  │   │   ├── constants.ts
  │   │   ├── utils.ts
  │   │   └── index.ts
  │   ├── tools/
  │   │   ├── BrushTool.ts
  │   │   ├── FloodFillTool.ts
  │   │   └── index.ts
  │   ├── services/
  │   │   ├── CanvasStorageService.ts
  │   │   └── index.ts
  │   └── index.ts
  ├── integrations/
  │   ├── react/
  │   │   ├── useViewport.ts
  │   │   └── ViewportProvider.tsx
  │   └── canvas/
  │       └── CanvasViewport.ts
  ├── hooks/
  │   └── useViewportSystem.ts
  ├── components/
  │   └── ViewportProvider.tsx
  ├── tests/
  │   ├── core/
  │   │   ├── viewport/
  │   │   │   ├── ViewportManager.test.ts
  │   │   │   ├── InputHandler.test.ts
  │   │   │   ├── coordinate-mapping.test.ts
  │   │   │   ├── boundary-clamping.test.ts
  │   │   │   └── ...
  │   │   └── ...
  │   └── ...
  ├── docs/
  │   └── README.md