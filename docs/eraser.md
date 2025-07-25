# Eraser Implementation Guide

## Overview
Single canvas layer eraser using HTML5 Canvas composite operations. Two erasing modes: background erasing (transparent) and drawing erasing (white overlay).

## Multi-Layer Canvas Architecture

### Canvas Layer Structure
The application uses **multiple canvas layers** for different content types:

```javascript
// Main canvas layers
const x = ref(null);        // Main drawing canvas (user drawings)
const W = ref(null);        // Background canvas (images/colors)
const K = ref(null);        // Temporary canvas (flood fill)
const j = ref(null);        // Working canvas (operations)
const d = ref(null);        // Display canvas (final output)
const M = ref(null);        // Master canvas (compositing)
const p1 = ref(null);       // Preview canvas
const c1 = ref(null);       // Background image canvas
const u1 = ref(null);       // User drawing canvas
```

### Layer Compositing Order
```javascript
// Final display composition (from bottom to top)
d.clearRect(0, 0, F.width, F.height);
d.drawImage(c1, 0, 0);      // Background image
d.drawImage(W, 0, 0);       // Background color
d.drawImage(K, 0, 0);       // Flood fill content
d.drawImage(u1, 0, 0);      // User drawings
```

## Core Function Structure

### Main Eraser Function
```javascript
function eraser(x, y, prevX, prevY, brushSize, canvasContext) {
    if (!isDrawing) return;
    
    canvasContext.globalCompositeOperation = "source-over";
    canvasContext.beginPath();
    canvasContext.strokeStyle = "#ffffff";  // White for drawing erasing
    canvasContext.lineWidth = brushSize;
    canvasContext.lineCap = "round";
    canvasContext.moveTo(prevX, prevY);
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
}
```

### Background Eraser Function
```javascript
function backgroundEraser(x, y, prevX, prevY, brushSize, canvasContext) {
    if (!isDrawing) return;
    
    canvasContext.globalCompositeOperation = "destination-out";  // Transparent
    canvasContext.beginPath();
    canvasContext.strokeStyle = "rgba(0,0,0,1)";  // Any color works
    canvasContext.lineWidth = brushSize;
    canvasContext.lineCap = "round";
    canvasContext.moveTo(prevX, prevY);
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
    canvasContext.globalCompositeOperation = "source-over";  // Reset
}
```

### Smart Eraser Function (Handles All Content Types)
```javascript
function smartEraser(x, y, prevX, prevY, brushSize, canvasContext, backgroundType) {
    if (!isDrawing) return;
    
    // Determine erasing mode based on background type
    if (backgroundType === "default-bg-img" || backgroundType === "default-bg-color") {
        // Erase background content (make transparent)
        canvasContext.globalCompositeOperation = "destination-out";
        canvasContext.beginPath();
        canvasContext.strokeStyle = "rgba(0,0,0,1)";
        canvasContext.lineWidth = brushSize;
        canvasContext.lineCap = "round";
        canvasContext.moveTo(prevX, prevY);
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
        canvasContext.globalCompositeOperation = "source-over";
    } else {
        // Erase user drawings (white overlay)
        canvasContext.globalCompositeOperation = "source-over";
        canvasContext.beginPath();
        canvasContext.strokeStyle = "#ffffff";
        canvasContext.lineWidth = brushSize;
        canvasContext.lineCap = "round";
        canvasContext.moveTo(prevX, prevY);
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
    }
}
```

## Flood Fill Implementation

### Flood Fill Function (J1)
```javascript
function floodFill(x, y, targetCanvas, fillColor) {
    // Get image data from target canvas
    const imageData = targetCanvas.getImageData(0, 0, targetCanvas.canvas.width, targetCanvas.canvas.height);
    const masterData = masterCanvas.getImageData(0, 0, masterCanvas.canvas.width, masterCanvas.canvas.height);
    
    // Get color at click point
    const targetColor = getPixelColor(masterData, Math.floor(x), Math.floor(y));
    
    // Check if target is already filled
    if (isColorFilled(targetColor)) return;
    
    // Parse fill color
    const fillRGB = fillColor ? parseColor(fillColor) : {r: 255, g: 255, b: 255, a: 0};
    
    // Flood fill algorithm
    const pixelsToFill = [{x: Math.floor(x), y: Math.floor(y)}];
    const visited = new Set();
    const maxIterations = 300;
    
    for (let i = 0; i < pixelsToFill.length && i < maxIterations; i++) {
        const pixel = pixelsToFill[i];
        const key = `${pixel.x},${pixel.y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // Check if pixel matches target color
        const currentColor = getPixelColor(masterData, pixel.x, pixel.y);
        if (!colorsMatch(currentColor, targetColor)) continue;
        
        // Fill pixel
        setPixelColor(imageData, pixel.x, pixel.y, fillRGB);
        
        // Add neighboring pixels
        if (pixel.x > 0) pixelsToFill.push({x: pixel.x - 1, y: pixel.y});
        if (pixel.x < imageData.width - 1) pixelsToFill.push({x: pixel.x + 1, y: pixel.y});
        if (pixel.y > 0) pixelsToFill.push({x: pixel.x, y: pixel.y - 1});
        if (pixel.y < imageData.height - 1) pixelsToFill.push({x: pixel.x, y: pixel.y + 1});
    }
    
    // Apply filled image data
    targetCanvas.putImageData(imageData, 0, 0);
    updateDisplay();
    
    // Save to history if color provided
    if (fillColor) saveToHistory();
}

// Helper functions
function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = color.a;
}

function colorsMatch(color1, color2) {
    return color1.r === color2.r && 
           color1.g === color2.g && 
           color1.b === color2.b && 
           color1.a === color2.a;
}
```

## Required Variables

### State Variables
```javascript
let isDrawing = false;
let currentTool = "draw";  // "erase", "draw", "fill", "drag"
let prevX = 0;
let prevY = 0;
let brushSize = 10;  // Adjustable
let backgroundType = "none";  // "default-bg-img", "default-bg-color", "none"
```

### Canvas Setup
```javascript
// Main canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Layer canvases
const backgroundCanvas = document.createElement("canvas");
const backgroundCtx = backgroundCanvas.getContext("2d");

const drawingCanvas = document.createElement("canvas");
const drawingCtx = drawingCanvas.getContext("2d");

const floodFillCanvas = document.createElement("canvas");
const floodFillCtx = floodFillCanvas.getContext("2d");

const displayCanvas = document.createElement("canvas");
const displayCtx = displayCanvas.getContext("2d");
```

## Event Handlers

### Mouse Events
```javascript
// Mouse down
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    prevX = e.clientX - rect.left;
    prevY = e.clientY - rect.top;
});

// Mouse move
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === "erase") {
        smartEraser(x, y, prevX, prevY, brushSize, drawingCtx, backgroundType);
    }
    
    prevX = x;
    prevY = y;
});

// Mouse up
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});
```

### Touch Events (Mobile)
```javascript
// Touch start
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    prevX = touch.clientX - rect.left;
    prevY = touch.clientY - rect.top;
});

// Touch move
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (currentTool === "erase") {
        smartEraser(x, y, prevX, prevY, brushSize, drawingCtx, backgroundType);
    }
    
    prevX = x;
    prevY = y;
});

// Touch end
canvas.addEventListener("touchend", () => {
    isDrawing = false;
});
```

## Tool Selection

### UI Button Handler
```javascript
function selectTool(toolName) {
    currentTool = toolName;
    // Update UI to show active tool
    updateToolUI(toolName);
}

// Example usage
document.getElementById("eraserBtn").addEventListener("click", () => {
    selectTool("erase");
});
```

### UI Update Function
```javascript
function updateToolUI(activeTool) {
    // Remove active class from all tools
    document.querySelectorAll(".tool-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Add active class to selected tool
    document.getElementById(activeTool + "Btn").classList.add("active");
}
```

## Brush Size Control

### Size Slider
```javascript
function updateBrushSize(size) {
    brushSize = size;
}

// Example slider
document.getElementById("brushSizeSlider").addEventListener("input", (e) => {
    updateBrushSize(parseInt(e.target.value));
});
```

## Canvas Layer Management

### Layer Initialization
```javascript
function initializeLayers(width, height) {
    // Set all canvas dimensions
    [backgroundCanvas, drawingCanvas, floodFillCanvas, displayCanvas].forEach(canvas => {
        canvas.width = width;
        canvas.height = height;
    });
    
    // Clear all layers
    [backgroundCtx, drawingCtx, floodFillCtx, displayCtx].forEach(ctx => {
        ctx.clearRect(0, 0, width, height);
    });
}
```

### Layer Compositing
```javascript
function compositeLayers() {
    // Clear display canvas
    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    // Composite layers in order
    displayCtx.drawImage(backgroundCanvas, 0, 0);  // Background
    displayCtx.drawImage(floodFillCanvas, 0, 0);   // Flood fill
    displayCtx.drawImage(drawingCanvas, 0, 0);     // User drawings
    
    // Update main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(displayCanvas, 0, 0);
}
```

### Background Management
```javascript
function setBackgroundImage(imageUrl) {
    backgroundType = "default-bg-img";
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
        backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        backgroundCtx.drawImage(img, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
        compositeLayers();
    };
}

function setBackgroundColor(color) {
    backgroundType = "default-bg-color";
    backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    backgroundCtx.fillStyle = color;
    backgroundCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    compositeLayers();
}
```

## CSS for Tool UI

### Basic Tool Button Styling
```css
.tool-btn {
    width: 48px;
    height: 48px;
    border: 2px solid #E5E7EB;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tool-btn.active {
    border-color: #2563EB;  /* primary-600 */
}
```

## Implementation Checklist

### Required Components
- [ ] Canvas element with 2D context
- [ ] Multiple layer canvases (background, drawing, flood fill, display)
- [ ] State management variables
- [ ] Mouse event handlers
- [ ] Touch event handlers
- [ ] Tool selection system
- [ ] Brush size control
- [ ] UI for tool selection
- [ ] Eraser function implementation
- [ ] Flood fill implementation
- [ ] Layer compositing system
- [ ] Background management

### Key Features
- [ ] Smooth line drawing with lineTo()
- [ ] Round line caps for natural erasing
- [ ] Adjustable brush size
- [ ] Tool state management
- [ ] Mobile touch support
- [ ] Visual feedback for active tool
- [ ] Multi-layer canvas architecture
- [ ] Smart erasing based on content type
- [ ] Flood fill with color detection
- [ ] Background image and color support

## Performance Notes
- Multi-layer canvas approach for content separation
- Efficient layer compositing
- Real-time erasing without lag
- Memory efficient with proper cleanup
- Compatible with all modern browsers

## Error Handling
```javascript
function safeEraser(x, y, prevX, prevY, brushSize, ctx, backgroundType) {
    try {
        if (!ctx || !isDrawing) return;
        
        // Validate coordinates
        if (isNaN(x) || isNaN(y) || isNaN(prevX) || isNaN(prevY)) return;
        
        // Validate brush size
        if (brushSize <= 0 || brushSize > 100) return;
        
        smartEraser(x, y, prevX, prevY, brushSize, ctx, backgroundType);
    } catch (error) {
        console.error("Eraser error:", error);
    }
}
```

## Testing
- Test on desktop with mouse
- Test on mobile with touch
- Test different brush sizes
- Test tool switching
- Test performance with large canvas
- Test error handling with invalid inputs
- Test flood fill functionality
- Test background erasing
- Test layer compositing
- Test memory usage with large images
