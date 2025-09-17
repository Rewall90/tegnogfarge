# Architecture Design: Multi-Layer Interactive Canvas

## Project Context
This document outlines the architectural design for implementing robust zoom and pan functionality within a browser-based drawing application. The application utilizes a multi-layer HTML5 canvas structure (e.g., for background, main content, and interactive elements) and already supports core drawing tools like brushes and flood fill. The primary goal is to integrate seamless navigation while ensuring the accuracy and responsiveness of all existing tools.

## Goals
- To enable smooth and intuitive zooming (in/out) and panning across all canvas layers.
- To ensure that all drawing tools (e.g., brush, flood fill) operate with pixel-perfect accuracy regardless of the current zoom level or pan position.
- To maintain high performance and responsiveness during all navigation and drawing operations.
- To establish a clear, modular, and maintainable codebase for future enhancements.

## Constraints
- The underlying canvas resolution (internal pixel dimensions) must remain fixed; transformations will be applied to the view, not the canvas itself.
- All existing pointer-based tool logic must continue to function correctly, requiring a robust coordinate transformation mechanism.
- The solution must support a wide range of zoom levels (e.g., from 25% to 400% or more).
- The architecture must accommodate multiple, synchronized canvas layers.

## Related Components
 Hooks:
  - src/hooks/useCanvasZoom.ts - Canvas zoom functionality hook
  - src/hooks/useViewport.ts - Viewport management hook

  Components:
  - src/components/shared/ZoomableCanvas.tsx - Reusable zoomable canvas
  - src/components/shared/ZoomDemo.tsx - Zoom demo component
  - src/components/coloring/ColoringApp.tsx - Main app with zoom integration
  - src/components/coloring/ColoringCanvas.tsx - Canvas with zoom support

  Utilities:
  - src/utils/viewportDetection.ts - Viewport detection utilities

  Documentation

  - docs/ZOOM_INTEGRATION.md - Zoom integration guide
  - docs/ZOOM_QUICK_REFERENCE.md - Quick reference
  - .cursor/Forklaringer/zoompan.md - Architecture design
  - zoom.md - Implementation guide
  - docs/input.md - Input handling docs

  Components with Zoom Controls

  - src/components/coloring/ToolBar.tsx - Desktop toolbar
  - src/components/coloring/MobileToolbar/index.tsx - Mobile toolbar
  - src/lib/flood-fill.ts - Contains coordinate transformations

## Specific Help Needed
This architecture directly addresses the following key questions:
1.  **How should the pointer coordinates be transformed to match zoom level and pan?**
    *   By implementing a `ViewportManager` with `toWorldCoords(screenX, screenY)` and `toScreenCoords(worldX, worldY)` utility methods. All tool logic will use `toWorldCoords` to convert raw input coordinates into the canvas's internal 


world coordinate system.
2.  **Should we apply zoom via CSS `transform: scale()` or use canvas scaling with `ctx.scale()`?**
    *   The architecture explicitly uses canvas scaling with `ctx.scale()` and `ctx.translate()` (orchestrated by the `RenderingSystem` and `CanvasLayer` components). This ensures that the canvas's internal drawing context is transformed, allowing for crisp, high-resolution drawing at any zoom level, unlike CSS transforms which would pixelate the canvas bitmap.
3.  **What’s the best way to handle panning via dragging while zoomed?**
    *   Panning is handled by updating the `offsetX` and `offsetY` properties within the `ViewportManager` based on mouse drag events captured by the `InputHandler`. These offsets are then applied to the canvas context via `ctx.translate()` during each render cycle, ensuring smooth and accurate panning.

## Optional Extras
- **Reset Zoom Button:** Can be implemented by adding a method to the `ViewportManager` to reset `scale` to `1.0` and `offsetX`, `offsetY` to `0`, and then triggering a re-render.
- **Animated Zoom Transitions:** Can be achieved by interpolating the `scale`, `offsetX`, and `offsetY` values in the `ViewportManager` over a short duration, updating the state on each `requestAnimationFrame` tick until the target values are reached.

## Core Components
The system is composed of four primary components, each with distinct responsibilities:

### `ViewportManager` (The "Single Source of Truth")
-   **Responsibilities:**
    -   Stores and manages the complete viewport state: `scale` (zoom), `offsetX`, and `offsetY` (pan).
    -   Provides clean, simple methods for updating this state (e.g., `panBy`, `zoomTo`).
    -   Provides utility methods to convert coordinates between Screen Space (mouse clicks) and World Space (canvas coordinates).
-   **Key Methods:**
    -   `panBy(dx, dy)`: Updates the offset by a given delta.
    -   `zoom(zoomFactor, centerX, centerY)`: Updates the scale and offset to zoom towards a specific point.
    -   `getState()`: Returns the current `{ scale, offsetX, offsetY }`.
    -   `toWorldCoords(screenX, screenY)`: Converts screen coordinates to world coordinates.

### `InputHandler` (The "Listener")
-   **Responsibilities:**
    -   Binds to and listens for all user input events on the canvas (`mousedown`, `mousemove`, `mouseup`, `wheel`, etc.).
    -   Interprets user intent (e.g., "user is panning" vs. "user is drawing").
    -   Calculates the necessary changes based on input (e.g., the delta `dx, dy` for a pan).
    -   Calls the appropriate methods on the `ViewportManager` to update the state.
-   **Key Methods:**
    -   `handleMouseDown(event)`: Determines if a pan or draw action is starting.
    -   `handleMouseMove(event)`: Calculates the pan delta and calls `viewportManager.panBy(dx, dy)`.
    -   `handleMouseUp(event)`: Ends the current action.
    -   `handleWheel(event)`: Calculates the zoom factor and center point, then calls `viewportManager.zoom(...)`.

### `RenderingSystem` (The "Artist")
-   **Responsibilities:**
    -   Manages all canvas layers.
    -   Runs a continuous, performance-optimized rendering loop using `requestAnimationFrame`.
    -   In each frame, it fetches the latest state from the `ViewportManager` and applies the correct transformation to each canvas layer.
    -   Orchestrates the clearing and drawing of each layer.
-   **Key Methods:**
    -   `constructor()`: Initializes the canvas layers and starts the render loop.
    -   `render()`: The core loop function that executes on every frame. It gets the viewport state, applies transforms, and calls `draw()` on each layer.

### `CanvasLayer` (The "Canvas")
-   **Responsibilities:**
    -   Represents a single `<canvas>` element and its `2D` context.
    -   Contains the specific drawing logic for its purpose (e.g., drawing the background, the main artwork, or tool feedback).
    -   Has methods to apply transformations, clear its content, and draw its content.
-   **Key Methods:**
    -   `applyTransform(scale, offsetX, offsetY)`: Resets its own transform and applies the current viewport transform.
    -   `clear()`: Clears the canvas.
    -   `draw()`: Contains the layer-specific drawing commands (e.g., `ctx.drawImage(...)`, `ctx.fillRect(...)`).

## Interaction Flow: Panning the View
This flow demonstrates how the components work together in a decoupled manner.

1.  **Initialization:**
    -   The `RenderingSystem` is created. In its constructor, it starts a continuous `render()` loop via `requestAnimationFrame`. This loop is now running independently, refreshing the screen about 60 times per second.

2.  **User Input:**
    -   The user presses the middle mouse button. The `InputHandler`'s `handleMouseDown` method captures this, sets a flag `isPanning = true`, and records the initial mouse position (`lastX`, `lastY`).

3.  **State Update:**
    -   The user drags the mouse. The `InputHandler`'s `handleMouseMove` method fires.
    -   It calculates the delta: `dx = event.clientX - lastX` and `dy = event.clientY - lastY`.
    -   It calls `viewportManager.panBy(dx, dy)`.
    -   The `ViewportManager` simply updates its internal state: `this.offsetX += dx` and `this.offsetY += dy`. **It does not need to notify anyone.**
    -   The `InputHandler` updates `lastX` and `lastY` for the next mouse move event.

4.  **Rendering (Automatic):**
    -   At the next available animation frame, the `RenderingSystem`'s `render()` method executes.
    -   It calls `viewportManager.getState()` to get the *newest* offset values.
    -   It iterates through each `CanvasLayer`, calling `layer.applyTransform(...)` with the new state.
    -   It then calls `layer.draw()`. The browser paints the updated, panned view to the screen.

5.  **End of Interaction:**
    -   The user releases the mouse button. The `InputHandler`'s `handleMouseUp` method sets `isPanning = false`. The flow stops.

This architecture ensures that input handling is lightweight (just updating state variables), while the rendering is handled efficiently and independently by the browser's paint cycle.

