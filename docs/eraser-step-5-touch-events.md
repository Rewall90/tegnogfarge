# Step 5: Update Touch Event Handlers

## Location
`src/components/coloring/ColoringApp.tsx`

## Update handleTouchStart
Find the section handling eraser mode and replace with:

```typescript
} else if (state.drawingMode === 'eraser') {
  const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
  setState(prev => ({ 
    ...prev, 
    isDrawing: true, 
    prevX: coords.x, 
    prevY: coords.y 
  }));
}
```

## Update handleTouchMove
Find the section handling eraser mode and replace with:

```typescript
} else if (state.drawingMode === 'eraser') {
  if (state.prevX !== null && state.prevY !== null) {
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
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

## Update handleTouchEnd
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

## Done! 🎉

### Quick Test
1. Run the app
2. Select eraser tool
3. Try erasing on desktop (mouse)
4. Try erasing on mobile (touch)
5. Check size control works

### Success Criteria
- Erasing works smoothly
- Size control applies
- No console errors
- Performance maintained