# Feature Request: New Zoom/Pan Implementation with Toggle Mode

## Project Context
The tegnogfarge coloring application needs a complete rewrite of its zoom/pan functionality. The current implementation is fragmented across multiple files and lacks proper separation of concerns. We need to implement a clean, dedicated Zoom & Pan mode that follows the 4-component architecture (ViewportManager, InputHandler, RenderingSystem, CanvasLayer) while providing a toggle-based user experience.

## Goals
- Implement a dedicated **Zoom & Pan toggle mode** that prevents accidental drawing interactions during navigation
- Create a clean 4-component architecture (ViewportManager, InputHandler, RenderingSystem, CanvasLayer) following the zoompan.md design
- Ensure **pixel-perfect coordinate accuracy** for all drawing tools regardless of zoom level or pan position
- Preserve zoom/pan state when switching between navigation and drawing modes
- Support both desktop (mouse wheel, drag) and mobile (pinch, touch) interactions seamlessly
- Maintain high performance with smooth 60fps rendering during zoom/pan operations
- Provide a maintainable, testable codebase with clear separation of concerns

## Constraints
- The underlying canvas resolution must remain fixed - transformations apply to the view only
- All existing drawing tools (brush, flood fill, etc.) must work with pixel-perfect accuracy after transformation
- Only the canvas should zoom/pan - UI elements and toolbars remain fixed
- Must support zoom levels from 25% to 400% with smooth transitions
- The system must handle multiple synchronized canvas layers efficiently
- Mobile touch interactions must not conflict with browser gestures (prevent default scrolling/zooming)

## Related Components
**New files to be created following the architecture:**
- `src/core/viewport/ViewportManager.ts` - Single source of truth for viewport state
- `src/core/viewport/InputStrategy.ts` - Pluggable input handlers for different interaction modes
- `src/core/viewport/RenderScheduler.ts` - RAF management and performance optimization
- `src/core/viewport/LayerRegistry.ts` - Multi-layer canvas management
- `src/core/viewport/types.ts` - Shared TypeScript interfaces
- `src/core/viewport/constants.ts` - Zoom limits, defaults, constraints
- `src/integrations/react/useViewport.ts` - React hook integration
- `src/integrations/react/ViewportProvider.tsx` - Context provider
- `src/integrations/canvas/CanvasViewport.ts` - Canvas-specific integration

**Components requiring integration:**
- `src/components/coloring/ColoringApp.tsx` - Remove embedded zoom/pan code, integrate new system
- `src/components/coloring/ToolBar.tsx` - Add zoom toggle button
- `src/components/coloring/MobileToolbar/index.tsx` - Add mobile zoom toggle

## Specific Help Needed
1. **Toggle Mode Implementation** - How to cleanly disable/enable drawing tools when zoom mode is active while preserving tool state
2. **Coordinate Transformation Pipeline** - Implement robust `toWorldCoords()` and `toScreenCoords()` methods that work perfectly with flood fill and drawing tools
3. **State Persistence Strategy** - Best approach for maintaining zoom/pan state across mode switches without performance impact
4. **Multi-layer Synchronization** - Ensure all canvas layers (background, main, overlay) transform together seamlessly
5. **Mobile Gesture Handling** - Prevent browser default zoom/scroll while allowing app zoom/pan, especially for pinch gestures
6. **Performance Optimization** - Implement efficient rendering pipeline that only redraws when necessary
7. **Testing Strategy** - How to unit test coordinate transformations and viewport state management

## Optional Extras
- **Zoom to fit** button that automatically scales canvas to fit viewport
- **Zoom presets** (25%, 50%, 100%, 200%, 400%) for quick navigation
- **Animated zoom transitions** with smooth easing for better UX
- **Mini-map overlay** showing current viewport position on large canvases
- **Keyboard shortcuts** for zoom in/out and reset (Ctrl+/-, Ctrl+0)
- **Zoom indicator** showing current zoom percentage in the UI
- **Pan boundaries** to prevent panning beyond canvas edges when zoomed in