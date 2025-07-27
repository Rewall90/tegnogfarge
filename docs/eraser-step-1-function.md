# Step 1: Add Smart Eraser Function

## Location
`src/components/coloring/ColoringApp.tsx`

## Add This Function
Add this function inside the ColoringApp component (before the return statement):

```typescript
// Smart eraser from docs - automatically chooses mode
function smartEraser(
  x: number, 
  y: number, 
  prevX: number, 
  prevY: number, 
  brushSize: number, 
  ctx: CanvasRenderingContext2D, 
  backgroundType: string
) {
  if (!state.isDrawing) return;
  
  if (backgroundType === "default-bg-img" || backgroundType === "default-bg-color") {
    // Erase background content (transparent)
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    // Erase user drawings (white overlay)
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "#ffffff";
  }
  
  ctx.beginPath();
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // Reset
  ctx.globalCompositeOperation = "source-over";
}
```

## What It Does
- Checks background type
- Uses transparent erasing for backgrounds
- Uses white overlay for user drawings
- Draws smooth lines with round caps

## Next Step
[Add Background Type State](./eraser-step-2-state.md)