# Pencil Tool: Step-by-Step Logic for Freehand Drawing

## 1. Tool Activation
- The user selects the "pencil" tool from the UI.
- The application sets the current brush/tool state to `"pencil"`.

## 2. Pointer Event Handling
- The system listens for pointer events on the drawing canvas:
  - `pointerdown` (or `mousedown`/`touchstart`): User starts drawing.
  - `pointermove` (or `mousemove`/`touchmove`): User moves the pointer to draw.
  - `pointerup` (or `mouseup`/`touchend`): User stops drawing.

## 3. Stroke Initialization
- On `pointerdown`, the following occurs:
  - The drawing state is set to active (e.g., `isDrawing = true`).
  - The initial pointer position (Point A) is recorded.
  - A new path is started on the canvas context using `beginPath()`.
  - The context moves to the initial position using `moveTo(x, y)`.

## 4. Drawing the Stroke
- On each `pointermove` event while drawing:
  - The current pointer position (Point B) is captured.
  - The context draws a line from the previous position to the new position using `lineTo(x, y)`.
  - The stroke is rendered using `stroke()`.
  - The previous position is updated to the current position for the next segment.

## 5. Stroke Finalization
- On `pointerup`:
  - The drawing state is set to inactive (`isDrawing = false`).
  - The current path is finalized (optionally, the path can be closed or left open).

## 6. Additional Details
- The pencil tool uses the canvas 2D context for rendering:
  - `beginPath()`: Starts a new drawing path.
  - `moveTo(x, y)`: Moves the drawing cursor to a specific coordinate without drawing.
  - `lineTo(x, y)`: Draws a straight line from the current position to the specified coordinate.
  - `stroke()`: Renders the path with the current stroke style.
- Stroke color, width, and opacity are set according to the current brush settings.
- The logic ensures smooth, continuous freehand lines by connecting each pointer position with a line segment.

## 7. Pseudocode Example
```js
// On pointerdown:
isDrawing = true;
context.beginPath();
context.moveTo(startX, startY);

// On pointermove:
if (isDrawing) {
  context.lineTo(currentX, currentY);
  context.stroke();
}

// On pointerup:
isDrawing = false;
```

---

This process allows the pencil tool to render smooth, real-time freehand strokes from point A to point B as the user draws on the canvas. The logic can be adapted for any environment that supports pointer events and a 2D drawing context.
