# Step 3: Update Mouse Event Handlers

## Location
`src/components/coloring/ColoringApp.tsx`

## Update handleMouseDown
Find the section handling eraser mode and replace with:

```typescript
} else if (state.drawingMode === 'eraser') {
  const coords = getCanvasCoordinates(e.clientX, e.clientY, mainCanvasRef.current!);
  setState(prev => ({ 
    ...prev, 
    isDrawing: true, 
    prevX: coords.x, 
    prevY: coords.y 
  }));
  e.preventDefault();
}
```

## Update handleMouseMove
Find the section handling eraser mode and replace with:

```typescript
} else if (state.drawingMode === 'eraser') {
  if (state.prevX !== null && state.prevY !== null) {
    const coords = getCanvasCoordinates(e.clientX, e.clientY, mainCanvasRef.current!);
    smartEraser(
      coords.x, 
      coords.y, 
      state.prevX, 
      state.prevY, 
      state.eraserSize, 
      contextRef.current.main!, 
      backgroundType
    );
    setState(prev => ({ 
      ...prev, 
      prevX: coords.x, 
      prevY: coords.y 
    }));
  }
}
```

## Update handleMouseUp
Find the section handling eraser mode and replace with:

```typescript
} else if (state.drawingMode === 'eraser') {
  setState(prev => ({ 
    ...prev, 
    isDrawing: false, 
    prevX: null, 
    prevY: null 
  }));
}
```

## Next Step
[Remove EraserTool Class](./eraser-step-4-remove-class.md)