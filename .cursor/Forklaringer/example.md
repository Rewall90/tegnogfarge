<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Fargelegging App - Tre Lag</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .controls {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .file-input {
            padding: 8px 15px;
            border: 2px dashed #007bff;
            border-radius: 5px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .file-input:hover {
            background: #e3f2fd;
        }
        
        .color-picker {
            width: 50px;
            height: 40px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .canvas-container {
            position: relative;
            display: inline-block;
            border: 2px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background: white;
            width: 800px;
            height: 600px;
            max-width: 100%;
        }
        
        /* THREE CANVAS LAYERS */
        #colorCanvas, #lineArtCanvas, #uiCanvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        #colorCanvas {
            /* Layer 1: Bottom - Final colors */
            z-index: 1;
        }
        
        #lineArtCanvas {
            /* Layer 2: Middle - Static line art */
            z-index: 2;
            pointer-events: none; /* Lines don't block mouse events */
        }
        
        #uiCanvas {
            /* Layer 3: Top - Live brush preview and UI */
            z-index: 3;
            cursor: crosshair;
        }
        
        .info {
            margin-top: 15px;
            padding: 10px;
            background: #e8f4fd;
            border-radius: 5px;
            font-size: 14px;
            color: #0066cc;
        }
        
        .status {
            margin-top: 10px;
            padding: 8px;
            border-radius: 5px;
            font-weight: bold;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 SVG Fargelegging App - Tre Lag Arkitektur</h1>
        
        <div class="controls">
            <label class="file-input">
                📁 Velg SVG fil
                <input type="file" id="svgFile" accept=".svg" style="display: none;">
            </label>
            
            <label>
                🎨 Farge:
                <input type="color" id="colorPicker" class="color-picker" value="#ff6b6b">
            </label>
            
            <button id="clearBtn" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🗑️ Nullstill
            </button>
            
            <div style="display: flex; gap: 5px; align-items: center;">
                <label>
                    🖌️ Modus:
                    <select id="drawMode" style="padding: 5px; border-radius: 5px;">
                        <option value="fill">Flood Fill</option>
                        <option value="draw">Frihånd tegning</option>
                    </select>
                </label>
                
                <label id="brushSizeLabel" style="display: none;">
                    📏 Pensel:
                    <input type="range" id="brushSize" min="1" max="20" value="5" style="width: 80px;">
                    <span id="brushSizeValue">5px</span>
                </label>
            </div>
        </div>
        
        <div class="canvas-container">
            <canvas id="colorCanvas"></canvas>
            <canvas id="lineArtCanvas"></canvas>
            <canvas id="uiCanvas"></canvas>
        </div>
        
        <div class="info">
            💡 <strong>Tre-lag arkitektur:</strong><br>
            🎨 <strong>Lag 1:</strong> Farger (bunnen)<br>
            🖋️ <strong>Lag 2:</strong> Linjer (midten)<br>
            👆 <strong>Lag 3:</strong> Live pensel-preview (toppen)<br><br>
            <strong>Slik bruker du appen:</strong><br>
            1. Last inn en SVG-fil ved å klikke på "Velg SVG fil"<br>
            2. Velg ønsket farge med fargevelgeren<br>
            3. <strong>Flood Fill:</strong> Klikk på området du vil fargelegge<br>
            4. <strong>Frihånd:</strong> Velg "Frihånd tegning" og tegn med musen<br>
            5. Se live preview av penselstrøk før du slipper museknappen!
        </div>
        
        <div id="status"></div>
    </div>

    <script>
        class SVGColoringApp {
            constructor() {
                // THREE CANVASES - Professional Architecture
                this.colorCanvas = document.getElementById('colorCanvas');
                this.colorCtx = this.colorCanvas.getContext('2d');
                this.lineArtCanvas = document.getElementById('lineArtCanvas');
                this.lineArtCtx = this.lineArtCanvas.getContext('2d');
                this.uiCanvas = document.getElementById('uiCanvas');
                this.uiCtx = this.uiCanvas.getContext('2d');

                // Core properties (preserved from original)
                this.originalImage = null;
                this.currentColor = '#ff6b6b';
                this.drawMode = 'fill';
                this.brushSize = 5;
                this.imageScale = 1;
                this.imageOffsetX = 0;
                this.imageOffsetY = 0;

                // Drawing state for Layer 3 (UI)
                this.isDrawing = false;
                this.previewPath = [];
                this.lastX = 0;
                this.lastY = 0;

                this.initializeEventListeners();
                this.setupCanvases();
            }

            initializeEventListeners() {
                document.getElementById('svgFile').addEventListener('change', (e) => this.loadSVG(e));
                document.getElementById('colorPicker').addEventListener('change', (e) => this.currentColor = e.target.value);
                document.getElementById('clearBtn').addEventListener('click', () => this.clearColorCanvas());
                document.getElementById('drawMode').addEventListener('change', (e) => this.setDrawMode(e.target.value));
                document.getElementById('brushSize').addEventListener('input', (e) => this.setBrushSize(e.target.value));

                // ALL mouse events on the TOP canvas (Layer 3)
                this.uiCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                this.uiCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                this.uiCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                this.uiCanvas.addEventListener('mouseout', (e) => this.handleMouseUp(e));
                this.uiCanvas.addEventListener('click', (e) => this.handleClick(e));
            }

            setupCanvases() {
                // Initial setup - will be properly sized when SVG loads
                this.showStatus('Last inn en SVG-fil for å begynne!', 'info');
            }

            setDrawMode(mode) {
                this.drawMode = mode;
                const brushSizeLabel = document.getElementById('brushSizeLabel');
                if (mode === 'draw') {
                    brushSizeLabel.style.display = 'flex';
                    this.uiCanvas.style.cursor = 'crosshair';
                } else {
                    brushSizeLabel.style.display = 'none';
                    this.uiCanvas.style.cursor = 'pointer';
                }
            }

            setBrushSize(size) {
                this.brushSize = parseInt(size);
                document.getElementById('brushSizeValue').textContent = size + 'px';
            }
            
            loadSVG(event) {
                const file = event.target.files[0];
                if (!file) {
                    this.showStatus('Ingen fil valgt', 'error');
                    return;
                }

                console.log('Loading file:', file.name, 'Type:', file.type, 'Size:', file.size);
                this.showStatus('Laster SVG...', 'info');

                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('File read successfully, length:', e.target.result.length);
                    
                    // Create blob and URL
                    const svgBlob = new Blob([e.target.result], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    console.log('Created blob URL:', url);
                    
                    const img = new Image();
                    img.onload = () => {
                        console.log('Image loaded successfully:', img.width, 'x', img.height);
                        this.originalImage = img;
                        this.redrawAllCanvases();
                        this.showStatus('SVG lastet! Klar for fargelegging.', 'success');
                        URL.revokeObjectURL(url); // Clean up
                    };
                    img.onerror = (error) => {
                        console.error('Image load error:', error);
                        this.showStatus('Feil ved lasting av SVG. Sjekk at filen er gyldig.', 'error');
                        URL.revokeObjectURL(url); // Clean up
                    };
                    
                    // Add timeout fallback
                    setTimeout(() => {
                        if (!this.originalImage) {
                            console.error('Image load timeout');
                            this.showStatus('Timeout ved lasting av SVG', 'error');
                            URL.revokeObjectURL(url);
                        }
                    }, 5000);
                    
                    img.src = url;
                };
                reader.onerror = (error) => {
                    console.error('FileReader error:', error);
                    this.showStatus('Feil ved lesing av fil', 'error');
                };
                reader.readAsText(file);
            }
            
            redrawAllCanvases() {
                if (!this.originalImage) {
                    console.error('No original image to redraw');
                    return;
                }
                
                console.log('Redrawing canvases for image:', this.originalImage.width, 'x', this.originalImage.height);
                
                // Fixed container dimensions
                const containerWidth = 800;
                const containerHeight = 600;
                
                console.log('Container dimensions:', containerWidth, 'x', containerHeight);
                
                this.imageScale = Math.min(
                    containerWidth / this.originalImage.width, 
                    containerHeight / this.originalImage.height
                );
                
                const scaledWidth = this.originalImage.width * this.imageScale;
                const scaledHeight = this.originalImage.height * this.imageScale;
                this.imageOffsetX = (containerWidth - scaledWidth) / 2;
                this.imageOffsetY = (containerHeight - scaledHeight) / 2;

                console.log('Calculated scale:', this.imageScale, 'Scaled size:', scaledWidth, 'x', scaledHeight);
                console.log('Offset:', this.imageOffsetX, 'x', this.imageOffsetY);

                // Set size for ALL THREE canvases
                [this.colorCanvas, this.lineArtCanvas, this.uiCanvas].forEach((canvas, index) => {
                    canvas.width = containerWidth;
                    canvas.height = containerHeight;
                    canvas.style.width = containerWidth + 'px';
                    canvas.style.height = containerHeight + 'px';
                    canvas.style.display = 'block';
                    console.log(`Canvas ${index + 1} sized to:`, canvas.width, 'x', canvas.height);
                });
                
                // Set up the layers
                this.clearColorCanvas(); // Layer 1: Clear color layer
                this.drawLineArt(); // Layer 2: Draw line art  
                this.clearUICanvas(); // Layer 3: Clear UI layer
                
                console.log('All canvases redrawn successfully');
            }

            clearColorCanvas() {
                this.colorCtx.fillStyle = 'white';
                this.colorCtx.fillRect(0, 0, this.colorCanvas.width, this.colorCanvas.height);
            }

            clearUICanvas() {
                this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
            }

            drawLineArt() {
                const ctx = this.lineArtCtx;
                ctx.clearRect(0, 0, this.lineArtCanvas.width, this.lineArtCanvas.height);

                if (!this.originalImage) {
                    console.error('No original image for line art');
                    return;
                }

                console.log('Drawing line art...');

                // Create transparent line art (preserve original logic)
                const offscreenCanvas = document.createElement('canvas');
                const offscreenCtx = offscreenCanvas.getContext('2d');
                offscreenCanvas.width = this.originalImage.width;
                offscreenCanvas.height = this.originalImage.height;
                
                console.log('Offscreen canvas size:', offscreenCanvas.width, 'x', offscreenCanvas.height);
                
                // Draw original image to offscreen canvas
                offscreenCtx.drawImage(this.originalImage, 0, 0);
                console.log('Original image drawn to offscreen canvas');

                const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                const data = imageData.data;
                
                let blackPixels = 0;
                let transparentPixels = 0;
                
                // Make non-black pixels transparent (preserve original logic)
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 100 || data[i + 1] > 100 || data[i + 2] > 100) {
                        data[i + 3] = 0; // Make non-black pixels transparent
                        transparentPixels++;
                    } else {
                        blackPixels++;
                    }
                }
                
                console.log('Processed pixels - Black:', blackPixels, 'Transparent:', transparentPixels);
                
                offscreenCtx.putImageData(imageData, 0, 0);
                
                // Draw the final transparent line art to Layer 2
                const drawWidth = this.originalImage.width * this.imageScale;
                const drawHeight = this.originalImage.height * this.imageScale;
                
                console.log('Drawing to line art canvas at:', this.imageOffsetX, this.imageOffsetY, 'Size:', drawWidth, 'x', drawHeight);
                
                ctx.drawImage(
                    offscreenCanvas, 
                    this.imageOffsetX, 
                    this.imageOffsetY, 
                    drawWidth,
                    drawHeight
                );
                
                console.log('Line art drawing complete');
            }

            getMousePos(event) {
                const rect = this.uiCanvas.getBoundingClientRect();
                return {
                    x: Math.floor(event.clientX - rect.left),
                    y: Math.floor(event.clientY - rect.top)
                };
            }

            handleClick(event) {
                if (this.drawMode === 'fill') {
                    const pos = this.getMousePos(event);
                    this.floodFill(pos.x, pos.y);
                }
            }

            handleMouseDown(event) {
                if (this.drawMode !== 'draw') return;
                
                event.preventDefault();
                const pos = this.getMousePos(event);
                
                // Check if we're starting on a black line - if so, don't allow drawing
                const lineArtData = this.lineArtCtx.getImageData(pos.x, pos.y, 1, 1).data;
                if (lineArtData[3] > 0) { // Alpha > 0 means there's a black line here
                    this.showStatus('Kan ikke tegne over svarte linjer!', 'error');
                    return;
                }
                
                this.isDrawing = true;
                this.previewPath = [pos];
                this.lastX = pos.x;
                this.lastY = pos.y;
                
                // Start preview on Layer 3
                this.drawBrushPreview();
            }

            handleMouseMove(event) {
                const pos = this.getMousePos(event);
                
                if (this.drawMode === 'draw' && this.isDrawing) {
                    event.preventDefault();
                    
                    // Check if current position is over a black line
                    const lineArtData = this.lineArtCtx.getImageData(pos.x, pos.y, 1, 1).data;
                    if (lineArtData[3] > 0) {
                        // We hit a black line - stop drawing
                        this.handleMouseUp(event);
                        return;
                    }
                    
                    // Add to preview path only if not over black line
                    this.previewPath.push(pos);
                    this.lastX = pos.x;
                    this.lastY = pos.y;
                    
                    // Update live preview on Layer 3
                    this.drawBrushPreview();
                } else if (this.drawMode === 'draw') {
                    // Show brush cursor when not drawing
                    this.showBrushCursor(pos.x, pos.y);
                }
            }

            handleMouseUp(event) {
                if (this.drawMode !== 'draw' || !this.isDrawing) return;
                
                // Commit the preview path to Layer 1 (Color Canvas)
                this.commitBrushStroke();
                
                // Clear the preview from Layer 3
                this.clearUICanvas();
                
                // Reset drawing state
                this.isDrawing = false;
                this.previewPath = [];
                
                this.showStatus('Penselstrøk fullført!', 'success');
            }

            drawBrushPreview() {
                // Clear Layer 3 and redraw the entire preview path
                this.clearUICanvas();
                
                if (this.previewPath.length < 2) return;
                
                this.uiCtx.strokeStyle = this.currentColor;
                this.uiCtx.lineWidth = this.brushSize;
                this.uiCtx.lineCap = 'round';
                this.uiCtx.lineJoin = 'round';
                this.uiCtx.globalAlpha = 0.8; // Slightly transparent for preview
                
                this.uiCtx.beginPath();
                this.uiCtx.moveTo(this.previewPath[0].x, this.previewPath[0].y);
                
                for (let i = 1; i < this.previewPath.length; i++) {
                    this.uiCtx.lineTo(this.previewPath[i].x, this.previewPath[i].y);
                }
                
                this.uiCtx.stroke();
                this.uiCtx.globalAlpha = 1.0; // Reset alpha
            }

            showBrushCursor(x, y) {
                this.clearUICanvas();
                
                // Draw brush size indicator
                this.uiCtx.strokeStyle = this.currentColor;
                this.uiCtx.lineWidth = 1;
                this.uiCtx.globalAlpha = 0.5;
                this.uiCtx.beginPath();
                this.uiCtx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
                this.uiCtx.stroke();
                this.uiCtx.globalAlpha = 1.0;
            }

            commitBrushStroke() {
                if (this.previewPath.length < 2) return;
                
                // Draw the final stroke to Layer 1 (Color Canvas) with line art collision detection
                this.colorCtx.strokeStyle = this.currentColor;
                this.colorCtx.lineWidth = this.brushSize;
                this.colorCtx.lineCap = 'round';
                this.colorCtx.lineJoin = 'round';
                
                // Use custom line drawing that respects black line boundaries
                this.drawConstrainedStroke(this.previewPath);
            }

            drawConstrainedStroke(path) {
                if (path.length < 2) return;
                
                this.colorCtx.beginPath();
                this.colorCtx.moveTo(path[0].x, path[0].y);
                
                for (let i = 1; i < path.length; i++) {
                    // Draw line from previous point to current point, pixel by pixel
                    this.drawConstrainedLine(path[i-1].x, path[i-1].y, path[i].x, path[i].y);
                }
            }

            drawConstrainedLine(x1, y1, x2, y2) {
                const dx = Math.abs(x2 - x1);
                const dy = Math.abs(y2 - y1);
                const sx = x1 < x2 ? 1 : -1;
                const sy = y1 < y2 ? 1 : -1;
                let err = dx - dy;
                
                let x = x1;
                let y = y1;
                
                while (true) {
                    // Check if this pixel is over a black line
                    const lineArtData = this.lineArtCtx.getImageData(x, y, 1, 1).data;
                    if (lineArtData[3] === 0) { // Only draw if NOT over black line
                        this.drawPixelBrush(x, y);
                    }
                    
                    if (x === x2 && y === y2) break;
                    
                    const e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        x += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y += sy;
                    }
                }
            }

            drawPixelBrush(x, y) {
                const radius = this.brushSize / 2;
                const imageData = this.colorCtx.getImageData(
                    Math.max(0, x - radius), 
                    Math.max(0, y - radius),
                    Math.min(this.colorCanvas.width, this.brushSize),
                    Math.min(this.colorCanvas.height, this.brushSize)
                );
                const data = imageData.data;
                const fillColor = this.hexToRgb(this.currentColor);
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const dist = Math.hypot(dx, dy);
                        if (dist > radius) continue;
                        
                        const px = x + dx;
                        const py = y + dy;
                        
                        if (px < 0 || px >= this.colorCanvas.width || py < 0 || py >= this.colorCanvas.height) continue;
                        
                        // Check if this pixel is over a black line
                        const lineArtData = this.lineArtCtx.getImageData(px, py, 1, 1).data;
                        if (lineArtData[3] > 0) continue; // Skip if over black line
                        
                        const imgX = px - Math.max(0, x - radius);
                        const imgY = py - Math.max(0, y - radius);
                        const index = (imgY * Math.min(this.colorCanvas.width, this.brushSize) + imgX) * 4;
                        
                        if (index >= 0 && index < data.length) {
                            data[index] = fillColor.r;
                            data[index + 1] = fillColor.g;
                            data[index + 2] = fillColor.b;
                            data[index + 3] = 255;
                        }
                    }
                }
                
                this.colorCtx.putImageData(imageData, Math.max(0, x - radius), Math.max(0, y - radius));
            }

            // PRESERVED: Original elegant flood fill logic with growFill
            floodFill(startX, startY) {
                if (!this.originalImage) {
                    this.showStatus('Last inn en SVG først!', 'error');
                    return;
                }

                // Get data from the LINE ART canvas to know where the boundaries are
                const lineArtData = this.lineArtCtx.getImageData(0, 0, this.lineArtCanvas.width, this.lineArtCanvas.height).data;
                
                const colorData = this.colorCtx.getImageData(0, 0, this.colorCanvas.width, this.colorCanvas.height);
                const data = colorData.data;

                const startIdx = (startY * this.colorCanvas.width + startX) * 4;
                
                // If we click a line or an already colored area, do nothing
                if (lineArtData[startIdx + 3] > 0 || data[startIdx + 3] < 255 || 
                    (data[startIdx] !== 255 || data[startIdx + 1] !== 255 || data[startIdx + 2] !== 255)) {
                    this.showStatus('Kan ikke fargelegge her!', 'error');
                    return;
                }

                const fillRGB = this.hexToRgb(this.currentColor);
                const stack = [[startX, startY]];
                const visited = new Set();
                const filledPixels = new Set(); // Track filled pixels for growFill

                while (stack.length > 0) {
                    const [x, y] = stack.pop();
                    
                    if (x < 0 || x >= this.colorCanvas.width || y < 0 || y >= this.colorCanvas.height) continue;
                    
                    const key = y * this.colorCanvas.width + x;
                    if (visited.has(key)) continue;
                    visited.add(key);
                    
                    const idx = key * 4;

                    // Stop if we hit a line on the line art canvas OR a non-white pixel
                    if (lineArtData[idx + 3] > 0 || 
                        data[idx] !== 255 || data[idx + 1] !== 255 || data[idx + 2] !== 255) continue;

                    data[idx] = fillRGB.r;
                    data[idx + 1] = fillRGB.g;
                    data[idx + 2] = fillRGB.b;
                    data[idx + 3] = 255;

                    filledPixels.add(key); // Track this pixel for growth

                    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
                }

                // CRITICAL: Grow the fill to cover pixels near black lines (subtle overflow)
                this.growFill(data, filledPixels, fillRGB, 2);
                
                this.colorCtx.putImageData(colorData, 0, 0);
                this.showStatus('Område fargelagt!', 'success');
            }

            // RESTORED: Critical growFill function from original code
            growFill(data, filledPixels, fillRGB, growPixels) {
                const width = this.colorCanvas.width;
                const height = this.colorCanvas.height;
                
                for (let grow = 0; grow < growPixels; grow++) {
                    const newPixels = new Set();
                    
                    for (const pixelKey of filledPixels) {
                        const x = pixelKey % width;
                        const y = Math.floor(pixelKey / width);
                        
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                if (dx === 0 && dy === 0) continue;
                                
                                const nx = x + dx;
                                const ny = y + dy;
                                
                                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                                
                                const neighborKey = ny * width + nx;
                                const neighborIndex = neighborKey * 4;
                                
                                const r = data[neighborIndex];
                                const g = data[neighborIndex + 1];
                                const b = data[neighborIndex + 2];
                                
                                // Grow into light pixels (not black) that haven't been filled yet
                                if (r > 100 && g > 100 && b > 100 && !filledPixels.has(neighborKey)) {
                                    data[neighborIndex] = fillRGB.r;
                                    data[neighborIndex + 1] = fillRGB.g;
                                    data[neighborIndex + 2] = fillRGB.b;
                                    data[neighborIndex + 3] = 255;
                                    
                                    newPixels.add(neighborKey);
                                }
                            }
                        }
                    }
                    
                    for (const pixel of newPixels) {
                        filledPixels.add(pixel);
                    }
                    
                    if (newPixels.size === 0) break;
                }
            }
            
            // PRESERVED: Original utility function
            hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }

            showStatus(message, type) {
                const status = document.getElementById('status');
                status.textContent = message;
                status.className = `status ${type}`;
                
                setTimeout(() => {
                    status.textContent = '';
                    status.className = 'status';
                }, 3000);
            }
        }

        window.addEventListener('load', () => {
            new SVGColoringApp();
        });
    </script>
</body>
</html>