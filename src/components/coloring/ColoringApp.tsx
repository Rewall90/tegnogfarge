'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FloodFill, type PixelChange, type FillRegion } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import ImageSelector from './ImageSelector'
import { MobileColorPicker } from './MobileColorPicker'
import { MobileToolbar } from './MobileToolbar'
import { DEFAULT_THEME_ID, getThemeById } from './colorConstants'
import type { ColoringState, DrawingMode } from '@/types/canvas-coloring'

interface ColoringAppProps {
  imageData: {
    _id: string
    title: string
    webpImageUrl: string
    suggestedColors?: Array<{ name: string; hex: string }>
    category: { title: string; slug: string }
    subcategory: { title: string; slug: string }
  }
}

type HistoryStep = {
  changes: PixelChange[];
  region: FillRegion;
};

// New interface for brush strokes that doesn't store individual points
interface BrushStroke {
  canvasSnapshot: HTMLCanvasElement | null; // Snapshot of canvas after stroke is complete
  color: string;
  size: number;
}

const MAX_HISTORY = 5

// Interface for canvas contexts cache
interface CanvasContexts {
  background: CanvasRenderingContext2D | null;
  main: CanvasRenderingContext2D | null;
  fill: CanvasRenderingContext2D | null;
  shadow: CanvasRenderingContext2D | null;
}

// Helper: sjekk om en piksel er "svart nok"
function isBlackPixel(imageData: ImageData, x: number, y: number, threshold = 80) {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) return false;
  const idx = (y * imageData.width + x) * 4;
  const r = imageData.data[idx];
  const g = imageData.data[idx + 1];
  const b = imageData.data[idx + 2];
  // threshold: 0 = helt sort, høyere = mørke grå også
  return r < threshold && g < threshold && b < threshold;
}

function isAnyBlackInBrush(imageData: ImageData, cx: number, cy: number, radius: number, threshold = 80) {
  // Sjekk et rutenett av punkter i penselens sirkel
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      if (isBlackPixel(imageData, cx + dx, cy + dy, threshold)) return true;
    }
  }
  return false;
}

// Bresenham's line algorithm for å gå gjennom alle piksler mellom to punkter
function forEachPixelOnLine(x0: number, y0: number, x1: number, y1: number, cb: (x: number, y: number) => void) {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, e2;
  while (true) {
    cb(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// Helper function to get scaled coordinates from mouse events
function getScaledCoordinates(e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, zoom: number = 1, pan: { x: number, y: number } = { x: 0, y: 0 }) {
  return getCanvasCoordinates(e.clientX, e.clientY, canvas, zoom, pan);
}

function getTouchDistance(e: TouchEvent): number {
  if (e.touches.length < 2) return 0;
  const touch1 = e.touches[0];
  const touch2 = e.touches[1];
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCanvasCoordinates(clientX: number, clientY: number, canvas: HTMLCanvasElement, zoom: number = 1, pan: { x: number, y: number } = { x: 0, y: 0 }) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  // Convert client coordinates to canvas coordinates, accounting for zoom and pan
  const x = ((clientX - rect.left) * scaleX - pan.x) / zoom;
  const y = ((clientY - rect.top) * scaleY - pan.y) / zoom;
  
  return {
    x: Math.floor(x),
    y: Math.floor(y)
  };
}

export default function ColoringApp({ imageData: initialImageData }: ColoringAppProps) {
  const router = useRouter()
  
  // Create our layered canvas references
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const fillCanvasRef = useRef<HTMLCanvasElement>(null)
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Cache for canvas contexts
  const contextRef = useRef<CanvasContexts>({
    background: null,
    main: null,
    fill: null,
    shadow: null
  });
  
  // Cache for reusable ImageData
  const sharedImageDataRef = useRef<ImageData | null>(null);

  // Track filled regions for optimized rendering
  const [fillRegions, setFillRegions] = useState<FillRegion[]>([]);
  
  // Track opacity for fade-in animation
  const fillOpacityRef = useRef<Map<number, number>>(new Map());
  const fadeAnimationRef = useRef<number | null>(null);
  
  // Track brush strokes for optimized rendering
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const currentStrokeRef = useRef<BrushStroke | null>(null);
  
  // Throttling for flood fill operations
  const [isFilling, setIsFilling] = useState(false);
  const fillThrottleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Touch handling for mobile brush drawing
  const touchMoveThrottleRef = useRef<number | null>(null);
  
  const [currentImage, setCurrentImage] = useState(initialImageData)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ColoringState>({
    imageData: null,
    originalImageData: null,
    currentColor: '#FF0000',
    brushSize: 10,
    tolerance: 32,
    isDrawing: false,
    history: [],
    historyStep: -1,
    drawingMode: 'fill',
    lastX: null,
    lastY: null
  })
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_THEME_ID);

  // Simple zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Gesture tracking
  const gestureRef = useRef({
    isPanning: false,
    isZooming: false,
    lastDistance: 0,
    lastX: 0,
    lastY: 0
  });

  // Reference to the app container for performance testing
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Initialize and cache canvas contexts
  const initializeContexts = useCallback(() => {
    const background = backgroundCanvasRef.current;
    const main = mainCanvasRef.current;
    const fill = fillCanvasRef.current;
    const shadow = shadowCanvasRef.current;
    
    if (background && main && fill && shadow) {
      contextRef.current = {
        background: background.getContext('2d'),
        main: main.getContext('2d', { willReadFrequently: true }),
        fill: fill.getContext('2d', { alpha: true }),
        shadow: shadow.getContext('2d', { willReadFrequently: true })
      };
      
      return true;
    }
    
    return false;
  }, []);

  // Apply zoom and pan transforms to a canvas context
  const applyTransform = useCallback((ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y);
  }, [zoom, pan]);

  // Reset transform on a canvas context
  const resetTransform = useCallback((ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, []);

  // Redraw all fill regions efficiently with fade-in support
  const redrawFillRegions = useCallback((regions: FillRegion[]) => {
    const fillCtx = contextRef.current.fill;
    const fillCanvas = fillCanvasRef.current;
    if (!fillCtx || !fillCanvas) return;
    
    requestAnimationFrame(() => {
      // Save context state
      fillCtx.save();
      
      // Clear the entire canvas (including transformed areas)
      resetTransform(fillCtx);
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
      
      // Apply transform for drawing
      applyTransform(fillCtx);
      
      // Skip if no regions to draw
      if (regions.length === 0) {
        fillCtx.restore();
        return;
      }
      
      // Create single imageData for all regions
      const imageData = fillCtx.createImageData(fillCanvas.width, fillCanvas.height);
      const pixels32 = new Uint32Array(imageData.data.buffer);
      
      // Draw each region
      regions.forEach((region, index) => {
        if (region.points.length === 0) return;
        
        // Get opacity for this region (default to 1 if not animating)
        const opacity = fillOpacityRef.current.get(index) ?? 1;
        const alpha = Math.floor(255 * opacity);
        
        // Parse color
        const r = parseInt(region.color.substring(1, 3), 16);
        const g = parseInt(region.color.substring(3, 5), 16);
        const b = parseInt(region.color.substring(5, 7), 16);
        const color32 = (alpha << 24) | (b << 16) | (g << 8) | r;
        
        // Fill pixels
        region.points.forEach(([x, y]) => {
          const idx = y * fillCanvas.width + x;
          if (idx >= 0 && idx < pixels32.length) {
            pixels32[idx] = color32;
          }
        });
      });
      
      // Draw all regions at once
      fillCtx.putImageData(imageData, 0, 0);
      
      // Restore context state
      fillCtx.restore();
    });
  }, [applyTransform, resetTransform]);

  // Watch for zoom/pan changes and redraw
  useEffect(() => {
    // Redraw background with transforms
    const bgCtx = contextRef.current.background;
    const bgCanvas = backgroundCanvasRef.current;
    
    if (bgCtx && bgCanvas && currentImage?.webpImageUrl) {
      const img = document.createElement('img');
      img.onload = () => {
        bgCtx.save();
        resetTransform(bgCtx);
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        applyTransform(bgCtx);
        bgCtx.drawImage(img, 0, 0);
        bgCtx.restore();
      };
      img.src = currentImage.webpImageUrl;
    }
    
    // Redraw other layers
    redrawFillRegions(fillRegions);
    redrawBrushStrokes(brushStrokes);
  }, [zoom, pan, currentImage, applyTransform, resetTransform]);

  // Tegn penselstrøk fra snapshots - mye mer minneeffektivt
  const redrawBrushStrokes = useCallback((strokes: BrushStroke[]) => {
    const mainCtx = contextRef.current.main;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCtx || !mainCanvas) return;
    
    // Bruk requestAnimationFrame for å synkronisere med skjermoppdateringer
    requestAnimationFrame(() => {
      // Save context state
      mainCtx.save();
      
      // Clear the entire canvas
      resetTransform(mainCtx);
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      
      // Apply transform for drawing
      applyTransform(mainCtx);
      
      // Skip if no strokes to draw
      if (strokes.length === 0) {
        mainCtx.restore();
        return;
      }
      
      // Vi trenger bare å tegne det siste snapshot-et
      // Dette gir oss akkumulert resultat av alle penselstrøk
      const lastStroke = strokes[strokes.length - 1];
      if (lastStroke.canvasSnapshot) {
        mainCtx.drawImage(lastStroke.canvasSnapshot, 0, 0);
      }
      
      // Restore context state
      mainCtx.restore();
    });
  }, [applyTransform, resetTransform]);

  // Load image and set up canvases
  useEffect(() => {
    const loadImage = async () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const background = backgroundCanvasRef.current
        const canvas = mainCanvasRef.current
        const fillCanvas = fillCanvasRef.current
        const shadowCanvas = shadowCanvasRef.current
        
        if (!background || !canvas || !fillCanvas || !shadowCanvas) {
          console.error('Canvas references not found');
          return;
        }
        
        // Set dimensions for all canvases
        background.width = img.width
        background.height = img.height
        canvas.width = img.width
        canvas.height = img.height
        fillCanvas.width = img.width
        fillCanvas.height = img.height
        shadowCanvas.width = img.width
        shadowCanvas.height = img.height
        
        // Initialize contexts if not already done
        if (!contextRef.current.main || !contextRef.current.background || !contextRef.current.fill || !contextRef.current.shadow) {
          if (!initializeContexts()) {
            console.error('Failed to initialize canvas contexts');
            return;
          }
        }
        
        const { background: bgCtx, main: ctx, fill: fillCtx, shadow: shadowCtx } = contextRef.current;
        
        if (!bgCtx || !ctx || !fillCtx || !shadowCtx) {
          console.error('Canvas contexts not available');
          return;
        }
        
        // Make sure fill context has global composite operation set correctly
        fillCtx.globalCompositeOperation = 'source-over';
        
        // Draw the image on the background canvas
        bgCtx.clearRect(0, 0, background.width, background.height);
        bgCtx.drawImage(img, 0, 0);
        
        // Verify image was drawn correctly
        try {
          bgCtx.getImageData(0, 0, 1, 1);
        } catch (err) {
          console.error('Failed to get background image data:', err);
        }
        
        // Clear the main canvas and make it transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Clear the fill canvas
        fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height)
        
        // Draw the image on the shadow canvas for processing
        shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
        shadowCtx.drawImage(img, 0, 0)
        
        // Get and cache the image data for processing
        const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height)
        sharedImageDataRef.current = imageData;
        
        // Reset fill regions
        setFillRegions([]);
        
        // Reset brush strokes
        setBrushStrokes([]);
        
        setState(prev => ({
          ...prev,
          imageData,
          originalImageData: imageData,
          history: [imageData],
          historyStep: 0
        }))
        
        console.log('Canvas setup complete');
      }
      img.onerror = (e) => {
        console.error('Error loading image:', e)
        setError('Kunne ikke laste bilde')
        setIsLoading(false)
      }
      img.src = currentImage.webpImageUrl;
    }
    
    setIsLoading(true);
    loadImage()
  }, [currentImage, initializeContexts]);

  // Cleanup any throttle timers when component unmounts
  useEffect(() => {
    return () => {
      if (fillThrottleTimeoutRef.current) {
        clearTimeout(fillThrottleTimeoutRef.current);
        fillThrottleTimeoutRef.current = null;
      }
      if (fadeAnimationRef.current) {
        cancelAnimationFrame(fadeAnimationRef.current);
        fadeAnimationRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (newImageData: any) => {
    setCurrentImage(newImageData)
    setShowImageSelector(false)
  }

  // Shared drawing logic for both mouse and touch
  const startDrawingAtCoordinates = useCallback((x: number, y: number) => {
    if (state.drawingMode !== 'brush' && state.drawingMode !== 'eraser') return;
    
    // Use cached context
    const ctx = contextRef.current.main;
    const canvas = mainCanvasRef.current;
    
    if (!ctx || !canvas) return;
    
    // Opprett et nytt penselstrøk (uten snapshot ennå)
    currentStrokeRef.current = {
      canvasSnapshot: null,
      color: state.currentColor,
      size: state.brushSize
    };
    
    // Sett opp penselstil basert på modus
    if (state.drawingMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000'; // Color doesn't matter for erasing
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = state.currentColor;
    }
    
    // Tegn det første punktet
    const radius = Math.max(1, Math.floor(state.brushSize / 2));
    const original = state.originalImageData;
    
    if (original && !isAnyBlackInBrush(original, x, y, radius, 80)) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Reset canvas mode back to normal
    ctx.globalCompositeOperation = 'source-over';
    
    setState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y
    }));
  }, [state.drawingMode, state.currentColor, state.brushSize, state.originalImageData]);

  const continueDrawingAtCoordinates = useCallback((x: number, y: number) => {
    if (!state.isDrawing || (state.drawingMode !== 'brush' && state.drawingMode !== 'eraser')) return;
    
    // Use cached context
    const canvas = mainCanvasRef.current;
    const ctx = contextRef.current.main;
    
    if (!canvas || !ctx) return;
    
    if (state.lastX === null || state.lastY === null) return;
    
    const original = state.originalImageData;
    if (!original) return;
    
    // Tegn linjen direkte på canvas
    const radius = Math.max(1, Math.floor(state.brushSize / 2));
    
    // Samle punkter for å tegne dem i én requestAnimationFrame
    const pointsToDraw: Array<{px: number, py: number}> = [];
    
    // Samle alle punkter langs linjen
    forEachPixelOnLine(state.lastX, state.lastY, x, y, (px, py) => {
      if (!isAnyBlackInBrush(original, px, py, radius, 80)) {
        pointsToDraw.push({px, py});
      }
    });
    
    // Tegn alle punkter i én animasjonsramme for bedre ytelse
    if (pointsToDraw.length > 0) {
      requestAnimationFrame(() => {
        // Sett opp penselstil basert på modus
        if (state.drawingMode === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = '#000000'; // Color doesn't matter for erasing
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = state.currentColor;
        }
        
        // Tegn alle punkter i én batch
        pointsToDraw.forEach(({px, py}) => {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Reset canvas mode back to normal
        ctx.globalCompositeOperation = 'source-over';
      });
    }
    
    setState(prev => ({
      ...prev,
      lastX: x,
      lastY: y
    }));
  }, [state.isDrawing, state.drawingMode, state.lastX, state.lastY, state.originalImageData, state.brushSize, state.currentColor]);

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getScaledCoordinates(e, canvas, zoom, pan);
    if (!coords) return;
    
    startDrawingAtCoordinates(coords.x, coords.y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getScaledCoordinates(e, canvas, zoom, pan);
    if (!coords) return;
    
    continueDrawingAtCoordinates(coords.x, coords.y);
  };

  const handleStopDrawing = () => {
    if (!state.isDrawing) return;
    
    // Lagre snapshot av canvas når penselstrøket er ferdig
    const currentStroke = currentStrokeRef.current;
    if (currentStroke) {
      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas) {
        // Opprett en kopi av nåværende canvas-state
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mainCanvas.width;
        tempCanvas.height = mainCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Kopier nåværende canvas til snapshot
          tempCtx.drawImage(mainCanvas, 0, 0);
          currentStroke.canvasSnapshot = tempCanvas;
          
          // Legg til stroke i historikken
          setBrushStrokes(prev => [...prev, currentStroke]);
          
          // Tøm hovedcanvas (for å forhindre dobbeltegning)
          const mainCtx = contextRef.current.main;
          if (mainCtx) {
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
          }
          
          // Redraw alle strøk
          const newStrokes = [...brushStrokes, currentStroke];
          redrawBrushStrokes(newStrokes);
        }
      }
    }
    
    // Nullstill nåværende strøk
    currentStrokeRef.current = null;
    
    setState(prev => ({
      ...prev,
      isDrawing: false,
      lastX: null,
      lastY: null
    }));
  };

  // Touch event handlers for mobile brush drawing
  // Touch handler for fill (single tap)
  const handleFillTouch = useCallback((e: TouchEvent) => {
    if (state.drawingMode !== 'fill') return;
    
    // Prevent default to avoid triggering click events
    e.preventDefault();
    
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    
    const coordinates = getCanvasCoordinates(touch.clientX, touch.clientY, mainCanvas, zoom, pan);
    if (!coordinates) return;
    
    const { x, y } = coordinates;
    performFillAtCoordinates(x, y);
  }, [state.drawingMode, zoom, pan, state.currentColor]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling and zooming
    
    // Two fingers = zoom mode
    if (e.touches.length === 2) {
      gestureRef.current.isZooming = true;
      gestureRef.current.lastDistance = getTouchDistance(e);
      return;
    }
    
    // Only handle single touch for drawing
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];
    
    // Check if we should pan when zoomed in
    if (zoom > 1.1) {
      gestureRef.current.isPanning = true;
      gestureRef.current.lastX = touch.clientX;
      gestureRef.current.lastY = touch.clientY;
      // Still allow fill on tap
      if (state.drawingMode === 'fill') {
        handleFillTouch(e);
      }
      return;
    }
    
    // Handle fill mode with single tap
    if (state.drawingMode === 'fill') {
      handleFillTouch(e);
      return;
    }
    
    // Handle brush and eraser modes
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas, zoom, pan);
    if (!coords) return;
    
    startDrawingAtCoordinates(coords.x, coords.y);
  }, [state.drawingMode, zoom, pan, handleFillTouch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Critical: prevent page scroll
    
    // Handle zoom gesture
    if (e.touches.length === 2 && gestureRef.current.isZooming) {
      const currentDistance = getTouchDistance(e);
      if (gestureRef.current.lastDistance === 0) return;
      
      // Calculate zoom centered on pinch point
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      const scale = zoom * (currentDistance / gestureRef.current.lastDistance);
      const newZoom = Math.min(Math.max(scale, 0.5), 3.0);
      
      // Adjust pan to keep pinch center stationary
      const rect = mainCanvasRef.current?.getBoundingClientRect();
      if (rect) {
        const dx = (centerX - rect.left) * (1 - newZoom / zoom);
        const dy = (centerY - rect.top) * (1 - newZoom / zoom);
        setPan(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
      }
      
      setZoom(newZoom);
      gestureRef.current.lastDistance = currentDistance;
      return;
    }
    
    // Handle pan gesture when zoomed in
    if (e.touches.length === 1 && gestureRef.current.isPanning && zoom > 1.1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - gestureRef.current.lastX;
      const deltaY = touch.clientY - gestureRef.current.lastY;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      gestureRef.current.lastX = touch.clientX;
      gestureRef.current.lastY = touch.clientY;
      return;
    }
    
    // Only handle single touch for drawing
    if (e.touches.length > 1) return;
    
    if (!state.isDrawing || (state.drawingMode !== 'brush' && state.drawingMode !== 'eraser')) return;
    
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas, zoom, pan);
    if (!coords) return;
    
    // Throttle touch move events for performance
    if (touchMoveThrottleRef.current) return;
    
    touchMoveThrottleRef.current = requestAnimationFrame(() => {
      continueDrawingAtCoordinates(coords.x, coords.y);
      touchMoveThrottleRef.current = null;
    });
  }, [zoom, pan, state.isDrawing, state.drawingMode]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Reset gesture states
    if (e.touches.length < 2) {
      gestureRef.current.isZooming = false;
    }
    if (e.touches.length === 0) {
      gestureRef.current.isPanning = false;
    }
    
    // Clean up throttled operations
    if (touchMoveThrottleRef.current) {
      cancelAnimationFrame(touchMoveThrottleRef.current);
      touchMoveThrottleRef.current = null;
    }
    
    handleStopDrawing();
  }, []);

  // Shared fill logic for both mouse and touch
  const performFillAtCoordinates = (x: number, y: number) => {
    if (state.drawingMode !== 'fill') return;
    
    // Step 1 & 3: Defensive check for finite coordinates and logging
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      console.error('Invalid fill coordinates:', { x, y, zoomScale });
      setIsFilling(false);
      return;
    }
    
    // Prevent multiple fill operations from running simultaneously
    if (isFilling) {
      return;
    }
    
    // Set filling state to true and clear any existing timeout
    setIsFilling(true);
    if (fillThrottleTimeoutRef.current) {
      clearTimeout(fillThrottleTimeoutRef.current);
      fillThrottleTimeoutRef.current = null;
    }
    
    // Use cached contexts
    const shadowCtx = contextRef.current.shadow;
    const fillCtx = contextRef.current.fill;
    const mainCanvas = mainCanvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    const fillCanvas = fillCanvasRef.current;
    
    if (!shadowCtx || !fillCtx || !mainCanvas || !shadowCanvas || !fillCanvas) {
      setIsFilling(false);
      return;
    }
    
    if (shadowCanvas.width === 0 || shadowCanvas.height === 0) {
      setIsFilling(false);
      return;
    }
    
    // VIKTIG: Verifiser at shadow canvas har riktig innhold
    if (!state.imageData) {
      const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = imageData;
      setState(prev => ({ ...prev, imageData }));
      setIsFilling(false);
      return;
    } else if (state.imageData.width !== shadowCanvas.width || state.imageData.height !== shadowCanvas.height) {
      const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = imageData;
      setState(prev => ({ ...prev, imageData }));
      setIsFilling(false);
      return;
    }
    
    // Reuse the cached ImageData if available, otherwise get a new one
    let imageData = sharedImageDataRef.current;
    if (!imageData || imageData.width !== shadowCanvas.width || imageData.height !== shadowCanvas.height) {
      imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = imageData;
    }
    
    if (!imageData || imageData.width === 0 || imageData.height === 0) {
      setIsFilling(false);
      return;
    }
    
    // Sjekk at koordinatene er innenfor canvas
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
      setIsFilling(false);
      return;
    }
    
    const floodFill = new FloodFill(imageData, state.tolerance, 50);
    const { imageData: newImageData, changes, region } = floodFill.fill(x, y, state.currentColor);
    
    if (changes.length === 0) {
      setIsFilling(false);
      return;
    }
    
    // Update the cached ImageData for future operations
    sharedImageDataRef.current = newImageData;
    
    // Calculate the dirty rectangle for the flood fill
    let minX = shadowCanvas.width;
    let minY = shadowCanvas.height;
    let maxX = 0;
    let maxY = 0;
    
    // Find the bounds of the changed area
    if (region.points.length > 0) {
      region.points.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
      
      // Add padding
      const padding = 2;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(shadowCanvas.width - 1, maxX + padding);
      maxY = Math.min(shadowCanvas.height - 1, maxY + padding);
      
      // Calculate dimensions
      const dirtyWidth = maxX - minX + 1;
      const dirtyHeight = maxY - minY + 1;
      
      // Only update the changed area of the shadow canvas, using requestAnimationFrame
      requestAnimationFrame(() => {
        try {
          shadowCtx.putImageData(newImageData, 0, 0, minX, minY, dirtyWidth, dirtyHeight);
          
          // Store the new region and start fade animation
          setFillRegions(prev => {
            const newRegions = [...prev, region];
            const regionIndex = prev.length;
            
            // Start fade-in animation for this region
            fillOpacityRef.current.set(regionIndex, 0);
            
            const startTime = Date.now();
            const duration = 300; // 300ms fade-in
            
            const animateFade = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Ease-out opacity
              const opacity = 1 - Math.pow(1 - progress, 2);
              fillOpacityRef.current.set(regionIndex, opacity);
              
              // Redraw with new opacity
              redrawFillRegions(newRegions);
              
              if (progress < 1) {
                fadeAnimationRef.current = requestAnimationFrame(animateFade);
              } else {
                // Clean up
                fillOpacityRef.current.set(regionIndex, 1);
                fadeAnimationRef.current = null;
              }
            };
            
            // Start animation
            if (fadeAnimationRef.current) {
              cancelAnimationFrame(fadeAnimationRef.current);
            }
            fadeAnimationRef.current = requestAnimationFrame(animateFade);
            
            return newRegions;
          });
          
          // Update history
          const newHistory = history.slice(0, historyStep + 1);
          newHistory.push({ changes, region });
          setHistory(newHistory.slice(-MAX_HISTORY));
          setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
          
          setState(prev => ({
            ...prev,
            imageData: newImageData
          }));
        } catch (error) {
          console.error('Fill operation failed:', error);
        } finally {
          // Reset filling state after history update completes
          setIsFilling(false);
        }
      });
    } else {
      // Fallback to full update if no points (shouldn't happen)
      requestAnimationFrame(() => {
        try {
          shadowCtx.putImageData(newImageData, 0, 0);
          
          // Store the new region and start fade animation
          setFillRegions(prev => {
            const newRegions = [...prev, region];
            const regionIndex = prev.length;
            
            // Start fade-in animation for this region
            fillOpacityRef.current.set(regionIndex, 0);
            
            const startTime = Date.now();
            const duration = 300; // 300ms fade-in
            
            const animateFade = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Ease-out opacity
              const opacity = 1 - Math.pow(1 - progress, 2);
              fillOpacityRef.current.set(regionIndex, opacity);
              
              // Redraw with new opacity
              redrawFillRegions(newRegions);
              
              if (progress < 1) {
                fadeAnimationRef.current = requestAnimationFrame(animateFade);
              } else {
                // Clean up
                fillOpacityRef.current.set(regionIndex, 1);
                fadeAnimationRef.current = null;
              }
            };
            
            // Start animation
            if (fadeAnimationRef.current) {
              cancelAnimationFrame(fadeAnimationRef.current);
            }
            fadeAnimationRef.current = requestAnimationFrame(animateFade);
            
            return newRegions;
          });
          
          // Update history
          const newHistory = history.slice(0, historyStep + 1);
          newHistory.push({ changes, region });
          setHistory(newHistory.slice(-MAX_HISTORY));
          setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
          
          setState(prev => ({
            ...prev,
            imageData: newImageData
          }));
        } catch (error) {
          console.error('Fill operation failed:', error);
        } finally {
          // Reset filling state after history update completes
          setIsFilling(false);
        }
      });
    }

  }

  // Mouse click handler for fill
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    
    const coords = getScaledCoordinates(e, mainCanvas, zoom, pan);
    if (!coords) return;
    
    performFillAtCoordinates(coords.x, coords.y);
  }



  function applyChanges(pixels32: Uint32Array, changes: PixelChange[], reverse = false) {
    for (const change of changes) {
      pixels32[change.index] = reverse ? change.oldColor : change.newColor;
    }
  }

  const handleUndo = useCallback(() => {
    if (historyStep < 0) return;
    
    // Just remove the last region from our fill regions
    const newRegions = fillRegions.slice(0, -1);
    setFillRegions(newRegions);
    
    // Redraw the regions
    redrawFillRegions(newRegions);
    
    // Use cached contexts to update shadow canvas for future operations
    const shadowCtx = contextRef.current.shadow;
    
    if (!shadowCtx) return;
    
    // Reuse the cached ImageData if available
    let imageData = sharedImageDataRef.current;
    if (!imageData) {
      const shadowCanvas = shadowCanvasRef.current;
      if (!shadowCanvas) return;
      imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = imageData;
    }
    
    const pixels32 = new Uint32Array(imageData.data.buffer);
    applyChanges(pixels32, history[historyStep].changes, true);
    
    // Apply to shadow canvas
    shadowCtx.putImageData(imageData, 0, 0);
    
    setHistoryStep(historyStep - 1);
    setState(prev => ({ ...prev, imageData }));
  }, [history, historyStep, fillRegions, redrawFillRegions]);

  const handleRedo = useCallback(() => {
    if (historyStep >= history.length - 1) return;
    
    // Add the region back
    const redoStep = historyStep + 1;
    if (redoStep < history.length) {
      const regionToRestore = history[redoStep].region;
      const newRegions = [...fillRegions, regionToRestore];
      setFillRegions(newRegions);
      
      // Redraw the regions
      redrawFillRegions(newRegions);
      
      // Use cached contexts to update shadow canvas for future operations
      const shadowCtx = contextRef.current.shadow;
      
      if (!shadowCtx) return;
      
      // Reuse the cached ImageData if available
      let imageData = sharedImageDataRef.current;
      if (!imageData) {
        const shadowCanvas = shadowCanvasRef.current;
        if (!shadowCanvas) return;
        imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
        sharedImageDataRef.current = imageData;
      }
      
      const pixels32 = new Uint32Array(imageData.data.buffer);
      applyChanges(pixels32, history[redoStep].changes, false);
      
      // Apply to shadow canvas
      shadowCtx.putImageData(imageData, 0, 0);
      
      setHistoryStep(redoStep);
      setState(prev => ({ ...prev, imageData }));
    }
  }, [history, historyStep, fillRegions, redrawFillRegions]);

  const handleReset = useCallback(() => {
    if (!state.originalImageData) return;
    
    // Clear all regions
    setFillRegions([]);
    
    // Clear all brush strokes and snapshots
    setBrushStrokes([]);
    
    // Clear the fill canvas
    const fillCtx = contextRef.current.fill;
    const fillCanvas = fillCanvasRef.current;
    
    if (fillCtx && fillCanvas) {
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
    }
    
    // Clear the main canvas
    const mainCtx = contextRef.current.main;
    const mainCanvas = mainCanvasRef.current;
    
    if (mainCtx && mainCanvas) {
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }
    
    // Reset shadow canvas
    const shadowCtx = contextRef.current.shadow;
    const bgCtx = contextRef.current.background;
    
    if (!shadowCtx || !bgCtx) return;
    
    const shadowCanvas = shadowCanvasRef.current;
    const background = backgroundCanvasRef.current;
    
    if (!shadowCanvas || !background) return;
    
    // Copy background to shadow canvas
    shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowCtx.drawImage(background, 0, 0);
    
    // Get the image data and update the cache
    const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
    sharedImageDataRef.current = imageData;
    
    setState(prev => ({
      ...prev,
      imageData,
      history: [imageData],
      historyStep: 0
    }));
    
    setHistory([]);
    setHistoryStep(-1);
  }, [state.originalImageData]);

  const handleDownload = useCallback(() => {
    // Create a temporary canvas for download that combines all layers
    const tempCanvas = document.createElement('canvas');
    const background = backgroundCanvasRef.current;
    const fillCanvas = fillCanvasRef.current;
    const mainCanvas = mainCanvasRef.current;
    
    if (!background || !fillCanvas || !mainCanvas) return;
    
    tempCanvas.width = background.width;
    tempCanvas.height = background.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    // Draw background layer
    tempCtx.drawImage(background, 0, 0);
    
    // Draw fill layer
    tempCtx.drawImage(fillCanvas, 0, 0);
    
    // Draw brush strokes layer
    tempCtx.drawImage(mainCanvas, 0, 0);
    
    // Export as PNG
    tempCanvas.toBlob(blob => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fargelegging-${currentImage._id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png', 0.95);
  }, [currentImage._id]);

  // Konsolider penselstrøk for å forhindre minnevekst
  const consolidateBrushStrokes = useCallback(() => {
    // Hvis vi har mer enn 5 penselstrøk, konsolider dem til ett
    if (brushStrokes.length > 5) {
      const mainCanvas = mainCanvasRef.current;
      const mainCtx = contextRef.current.main;
      
      if (!mainCanvas || !mainCtx) return;
      
      // Tegn alle eksisterende strøk
      redrawBrushStrokes(brushStrokes);
      
      // Opprett et nytt snapshot
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mainCanvas.width;
      tempCanvas.height = mainCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Kopier nåværende canvas til snapshot
        tempCtx.drawImage(mainCanvas, 0, 0);
        
        // Lag én ny stroke med dette snapshot-et
        const consolidatedStroke: BrushStroke = {
          canvasSnapshot: tempCanvas,
          color: 'consolidated',
          size: 0
        };
        
        // Erstatt alle eksisterende strokes med den ene
        setBrushStrokes([consolidatedStroke]);
      }
    }
  }, [brushStrokes, redrawBrushStrokes]);
  
  // Kjør konsolidering etter hver ferdig stroke
  useEffect(() => {
    if (brushStrokes.length > 5) {
      consolidateBrushStrokes();
    }
  }, [brushStrokes.length, consolidateBrushStrokes]);

  // Add non-passive touch event listeners for mobile zoom
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    // Add non-passive touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      // Cleanup event listeners
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col" ref={appContainerRef}>
      {showImageSelector && (
        <ImageSelector
          currentImageId={currentImage._id}
          categorySlug={currentImage.category.slug}
          subcategorySlug={currentImage.subcategory.slug}
          onSelect={handleImageChange}
          onClose={() => setShowImageSelector(false)}
        />
      )}
      <header className="bg-white shadow-sm border-b flex-shrink-0 h-12 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/categories/${currentImage.category.slug}/${currentImage.subcategory.slug}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Tilbake
              </button>
              <h1 className="text-section">{currentImage.title}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImageSelector(true)}
                className="px-3 py-1 text-blue-600 hover:text-blue-800"
              >
                Bytt bilde
              </button>
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ColorPalette
          className="hidden md:block"
          selectedColor={state.currentColor}
          onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={currentImage.suggestedColors}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ToolBar
            className="hidden md:block"
            tolerance={state.tolerance}
            onToleranceChange={(t) => setState(prev => ({ ...prev, tolerance: t }))}
            canUndo={historyStep > 0}
            canRedo={historyStep < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onDownload={handleDownload}
            drawingMode={state.drawingMode}
            onDrawingModeChange={(mode: DrawingMode) => setState(prev => ({ ...prev, drawingMode: mode }))}
            brushSize={state.brushSize}
            onBrushSizeChange={(size: number) => setState(prev => ({ ...prev, brushSize: size }))}
          />
          
          {/* Canvas Section */}
          <div className="flex-1 overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
            <div 
              className="relative flex items-center justify-center"
            >
              {/* Background canvas (contour lines) */}
                              <canvas 
                  ref={backgroundCanvasRef} 
                  className="absolute top-0 left-0 max-w-full max-h-full z-0"
                  style={{ 
                    imageRendering: 'pixelated',
                    backgroundColor: 'rgba(255, 255, 255, 1)' // white background
                  }}
                />
              
              {/* Fill canvas (colored areas only) */}
                              <canvas
                  ref={fillCanvasRef}
                  className="absolute top-0 left-0 max-w-full max-h-full z-10"
                  style={{ 
                    imageRendering: 'pixelated',
                    pointerEvents: 'none', // Make sure it doesn't block clicks
                    backgroundColor: 'rgba(255, 255, 255, 0)' // transparent
                  }}
                />
              
              {/* Main canvas for user interaction */}
                              <canvas
                  ref={mainCanvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleStartDrawing}
                  onMouseMove={handleDraw}
                  onMouseUp={handleStopDrawing}
                  onMouseLeave={handleStopDrawing}

                  className="relative max-w-full max-h-full bg-transparent shadow-lg cursor-crosshair z-20"
                  style={{ 
                    imageRendering: 'pixelated',
                    backgroundColor: 'rgba(255, 255, 255, 0)', // transparent
                    touchAction: 'none', // Disable all default touch behaviors
                    userSelect: 'none', // Prevent text selection
                    WebkitUserSelect: 'none' // Prevent text selection on iOS
                  }}
                />
              
              {/* Shadow canvas for processing (hidden) */}
              <canvas 
                ref={shadowCanvasRef} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
          
          {/* Mobile Controls Section */}
          <div className="md:hidden space-y-3 p-4">
            <MobileToolbar
              drawingMode={state.drawingMode}
              onDrawingModeChange={(mode: DrawingMode) => setState(prev => ({ ...prev, drawingMode: mode }))}
              onUndo={handleUndo}
              canUndo={historyStep > 0}
            />
            <MobileColorPicker
              selectedColor={state.currentColor}
              onColorChange={(color: string) => setState(prev => ({ ...prev, currentColor: color }))}
              activeThemeId={activeThemeId}
              onThemeChange={setActiveThemeId}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 