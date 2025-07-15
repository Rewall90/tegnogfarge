# Canvas Zoom/Pan Implementation Guide (Simplified)

## Overview
This guide provides a practical approach to fixing the zoom system in the coloring app, focusing on correct coordinate mapping for mobile touch interactions.

## Current Problem

The existing zoom implementation uses CSS transform which causes incorrect coordinate mapping:
```typescript
// Current broken implementation
x: Math.floor((touch.clientX - rect.left) * scaleX / zoomScale)
```

This fails because CSS transform doesn't update the canvas's actual coordinate system.

## Recommended Solution: Simple Viewport System

Instead of CSS transforms, we'll track zoom and pan in state and apply transformations manually. This gives us full control over coordinate mapping.

## Implementation Steps

### Step 1: Remove Current Broken Implementation
```typescript
// Remove from ColoringApp.tsx:
- const [zoomScale, setZoomScale] = useState(1.0);
- const [isZooming, setIsZooming] = useState(false);
- style={{ transform: `scale(${zoomScale})` }}
```

### Step 2: Add Simple Viewport State
```typescript
// Add to ColoringApp.tsx
interface Viewport {
  x: number;      // Pan offset X
  y: number;      // Pan offset Y  
  scale: number;  // Zoom level (1 = 100%)
}

const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
```

### Step 3: Create Coordinate Conversion Functions
```typescript
// Simple coordinate conversion
const screenToCanvas = (screenX: number, screenY: number) => {
  const rect = mainCanvasRef.current?.getBoundingClientRect();
  if (!rect) return null;
  
  // Convert screen coordinates to canvas coordinates
  const x = (screenX - rect.left - viewport.x) / viewport.scale;
  const y = (screenY - rect.top - viewport.y) / viewport.scale;
  
  return { x: Math.floor(x), y: Math.floor(y) };
};
```

### Step 4: Update Touch Handlers
```typescript
// Handle pinch zoom
const handlePinchZoom = (e: TouchEvent) => {
  if (e.touches.length !== 2) return;
  
  const touch1 = e.touches[0];
  const touch2 = e.touches[1];
  
  // Calculate pinch center and new scale
  const centerX = (touch1.clientX + touch2.clientX) / 2;
  const centerY = (touch1.clientY + touch2.clientY) / 2;
  
  const distance = Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
  );
  
  // Update zoom, keeping pinch point stationary
  const newScale = Math.max(0.5, Math.min(3, distance / initialDistance));
  
  // Adjust pan to keep pinch center in same position
  setViewport(prev => ({
    scale: newScale,
    x: centerX - (centerX - prev.x) * (newScale / prev.scale),
    y: centerY - (centerY - prev.y) * (newScale / prev.scale)
  }));
};

// Handle pan (when zoomed in)
const handlePan = (deltaX: number, deltaY: number) => {
  if (viewport.scale <= 1) return; // No pan when not zoomed
  
  setViewport(prev => ({
    ...prev,
    x: prev.x + deltaX,
    y: prev.y + deltaY
  }));
};
```

### Step 5: Apply Transform to Canvas

Instead of CSS transform, we'll use canvas scaling:

```typescript
// Update canvas rendering
const drawCanvas = () => {
  // Clear and set transform for each canvas layer
  [backgroundCanvasRef, fillCanvasRef, mainCanvasRef, shadowCanvasRef].forEach(ref => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply viewport transform
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);
    
    // Draw content here...
    
    ctx.restore();
  });
};
```

### Step 6: Update All Touch/Click Handlers

Replace all coordinate calculations with the new `screenToCanvas` function:

```typescript
const handleFillTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  const coords = screenToCanvas(touch.clientX, touch.clientY);
  if (!coords) return;
  
  // Use coords.x and coords.y for fill operation
  performFillAtCoordinates(coords.x, coords.y);
};
```

## Simple Task List

### Essential Tasks (Do These First)
1. [ ] Remove CSS transform and current zoom state
2. [ ] Add viewport state (x, y, scale)
3. [ ] Create screenToCanvas coordinate converter
4. [ ] Update touch handlers for pinch zoom
5. [ ] Apply canvas transform instead of CSS

### Nice to Have (After Basics Work)
- [ ] Add pan support when zoomed in
- [ ] Add zoom limit constraints (0.5x - 3x)
- [ ] Simple zoom reset button

## Testing Checklist
- [ ] Fill tool works at different zoom levels
- [ ] Touch coordinates are accurate when zoomed
- [ ] Pinch zoom feels natural
- [ ] No lag or performance issues

## Key Points to Remember

1. **Don't use CSS transform** - it breaks coordinate mapping
2. **Keep it simple** - Basic zoom is better than broken complex zoom
3. **Test on real device** - Mobile touch behavior differs from desktop
4. **Start with zoom only** - Add pan later if needed

## Example: Minimal Working Implementation

```typescript
// This is all you really need for basic zoom:
const [scale, setScale] = useState(1);
const [lastDistance, setLastDistance] = useState(0);

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const distance = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    );
    
    if (lastDistance > 0) {
      const newScale = scale * (distance / lastDistance);
      setScale(Math.max(0.5, Math.min(3, newScale)));
    }
    setLastDistance(distance);
  }
};

// In render:
ctx.save();
ctx.scale(scale, scale);
// draw everything
ctx.restore();

// For coordinates:
const realX = touchX / scale;
const realY = touchY / scale;
```