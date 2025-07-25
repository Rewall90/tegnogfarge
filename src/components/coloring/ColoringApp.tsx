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
import { ViewportManager } from '@/core/viewport/ViewportManager'
import { ToggleMode } from '@/core/viewport/ToggleMode'
import type { ViewportState, ViewportMode } from '@/core/viewport/types'
import { calculateZoom } from '@/core/viewport/ZoomUtils'
import { COLORING_APP_CONFIG } from '@/config/coloringApp'
import { getColoringImageUrl, preloadImage, validateImageDimensions } from '@/lib/imageUtils'

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

const MAX_HISTORY = COLORING_APP_CONFIG.MAX_HISTORY_STEPS

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



function getCanvasCoordinates(clientX: number, clientY: number, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  // Convert client coordinates to canvas coordinates
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  
  return {
    x: Math.round(x),
    y: Math.round(y)
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
  const fillThrottleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    tolerance: COLORING_APP_CONFIG.DEFAULT_TOLERANCE,
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

  // Viewport management
  const viewportManagerRef = useRef<ViewportManager | null>(null);
  const toggleModeRef = useRef<ToggleMode | null>(null);
  const [viewportState, setViewportState] = useState<ViewportState>({
    scale: 1,
    panX: 0,
    panY: 0,
    mode: 'draw'
  });
  const [currentMode, setCurrentMode] = useState<ViewportMode>('draw');


  // Reference to the app container for performance testing
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Initialize viewport system
  useEffect(() => {
    if (!viewportManagerRef.current) {
      viewportManagerRef.current = new ViewportManager();
      toggleModeRef.current = new ToggleMode();
    }

    // Subscribe to viewport state changes
    const unsubscribeViewport = viewportManagerRef.current.addStateChangeListener((state) => {
      setViewportState(state);
    });

    // Subscribe to mode changes
    const unsubscribeMode = toggleModeRef.current.addModeChangeCallback((mode) => {
      setCurrentMode(mode);
      // Update viewport manager mode
      if (viewportManagerRef.current) {
        viewportManagerRef.current.setMode(mode);
      }
    });

    // Initial state
    setViewportState(viewportManagerRef.current.getState());
    setCurrentMode(toggleModeRef.current.getCurrentMode());

    // Cleanup
    return () => {
      unsubscribeViewport();
      unsubscribeMode();
    };
  }, []);

  // Toggle zoom mode handler
  const handleToggleZoom = useCallback(() => {
    if (toggleModeRef.current) {
      toggleModeRef.current.toggle();
    }
  }, []);

  // Helper function to get mouse coordinates relative to container center (for transform-origin: center center)
  const getBrowserMouseCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { mouseX: clientX, mouseY: clientY };

    const container = canvas.parentElement;
    if (!container) return { mouseX: clientX, mouseY: clientY };

    // Get container bounds to convert browser coordinates to container-relative coordinates
    const containerRect = container.getBoundingClientRect();

    // Since transform-origin is 'center center', we need coordinates relative to the center
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    
    const mouseX = clientX - centerX;
    const mouseY = clientY - centerY;
    
    return { mouseX, mouseY };
  }, []);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: WheelEvent) => {
    if (currentMode !== 'zoom') return;
    
    e.preventDefault();
    
    const viewportManager = viewportManagerRef.current;
    if (!viewportManager) return;

    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    // Get mouse coordinates using helper function
    const { mouseX, mouseY } = getBrowserMouseCoordinates(e.clientX, e.clientY);

    // Calculate zoom factor (negative deltaY = zoom in)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const currentState = viewportManager.getState();
    
    // Use ZoomUtils to calculate new zoom state
    const result = calculateZoom({
      centerX: mouseX,
      centerY: mouseY,
      zoomFactor,
      currentState
    });
    
    viewportManager.setState(result);
  }, [currentMode]);

  // Mouse pan handlers
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode === 'zoom') {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    } else {
      // Existing drawing logic
      handleStartDrawing(e);
    }
  }, [currentMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode === 'zoom' && isPanning && lastPanPosition.current) {
      const viewportManager = viewportManagerRef.current;
      if (!viewportManager) return;

      const deltaX = e.clientX - lastPanPosition.current.x;
      const deltaY = e.clientY - lastPanPosition.current.y;

      const currentState = viewportManager.getState();
      viewportManager.setState({
        panX: currentState.panX + deltaX,
        panY: currentState.panY + deltaY
      });

      lastPanPosition.current = { x: e.clientX, y: e.clientY };
    } else {
      // Existing drawing logic
      handleDraw(e);
    }
  }, [currentMode, isPanning]);

  const handleMouseUp = useCallback(() => {
    if (currentMode === 'zoom') {
      setIsPanning(false);
      lastPanPosition.current = null;
    } else {
      // Existing drawing logic
      handleStopDrawing();
    }
  }, [currentMode]);

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


  // Redraw all fill regions efficiently with fade-in support
  const redrawFillRegions = useCallback((regions: FillRegion[]) => {
    const fillCtx = contextRef.current.fill;
    const fillCanvas = fillCanvasRef.current;
    if (!fillCtx || !fillCanvas) return;
    
    requestAnimationFrame(() => {
      // Clear the entire canvas
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
      
      // Skip if no regions to draw
      if (regions.length === 0) {
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
    });
  }, []);


  // Tegn penselstrøk fra snapshots - mye mer minneeffektivt
  const redrawBrushStrokes = useCallback((strokes: BrushStroke[]) => {
    const mainCtx = contextRef.current.main;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCtx || !mainCanvas) return;
    
    // Bruk requestAnimationFrame for å synkronisere med skjermoppdateringer
    requestAnimationFrame(() => {
      // Clear the entire canvas
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      
      // Skip if no strokes to draw
      if (strokes.length === 0) {
        return;
      }
      
      // Vi trenger bare å tegne det siste snapshot-et
      // Dette gir oss akkumulert resultat av alle penselstrøk
      const lastStroke = strokes[strokes.length - 1];
      if (lastStroke.canvasSnapshot) {
        mainCtx.drawImage(lastStroke.canvasSnapshot, 0, 0);
      }
    });
  }, []);

  // Load image and set up canvases
  useEffect(() => {
    const loadImage = async () => {
      const img = new Image()
      // Set crossOrigin before setting src to ensure proper CORS handling
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        // Validate image dimensions
        if (!validateImageDimensions(img)) {
          setError('Bildet har ugyldige dimensjoner for fargelegging')
          setIsLoading(false)
          return
        }
        
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
        
        // Calculate the CSS scale and sync with ViewportManager
        setTimeout(() => {
          const canvas = mainCanvasRef.current;
          if (canvas && viewportManagerRef.current) {
            // Get the actual displayed size (CSS size)
            const cssWidth = canvas.offsetWidth;
            const actualWidth = canvas.width; // Original canvas width (2550 or img.width)
            
            if (cssWidth > 0 && actualWidth > 0) {
              const currentScale = cssWidth / actualWidth;
              console.log('Initial CSS scale:', currentScale);
              
              // Set minimum scale for all devices to make canvas more usable
              const minScale = 1.0; // Minimum 100% scale for all devices
              const finalScale = Math.max(currentScale, minScale);
              
              // Update viewport manager with the CSS-calculated scale
              viewportManagerRef.current.setState({ 
                scale: finalScale,
                panX: 0,
                panY: 0
              });
            }
          }
          setIsLoading(false);
        }, 100); // Small delay to ensure CSS has applied
      }
      img.onerror = (e) => {
        console.error('Error loading image:', e)
        console.error('Image URL:', currentImage.webpImageUrl)
        
        // More specific error messages
        if (currentImage.webpImageUrl.includes('cdn.sanity.io')) {
          setError('Kunne ikke laste bilde fra Sanity CDN. CORS-feil kan være årsaken.')
        } else {
          setError('Kunne ikke laste bilde. Sjekk at bildet eksisterer.')
        }
        setIsLoading(false)
      }
      
      // Log the image URL for debugging
      console.log('[ColoringApp] Loading image from:', currentImage.webpImageUrl)
      
      try {
        // Use utility to get the proper image URL with fallbacks
        const finalImageUrl = getColoringImageUrl(
          currentImage.webpImageUrl, 
          currentImage.displayImageUrl || currentImage.fallbackImageUrl
        );
        console.log('[ColoringApp] Final URL:', finalImageUrl)
        img.src = finalImageUrl;
      } catch (urlError) {
        console.error('Invalid image URL:', urlError)
        setError('Ugyldig bilde-URL eller ingen tilgjengelige bilder')
        setIsLoading(false)
        return
      }
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
    if (currentMode === 'zoom') return; // Disable drawing in zoom mode
    
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
  }, [state.drawingMode, state.currentColor, state.brushSize, state.originalImageData, currentMode]);

  const continueDrawingAtCoordinates = useCallback((x: number, y: number) => {
    if (!state.isDrawing || (state.drawingMode !== 'brush' && state.drawingMode !== 'eraser')) return;
    if (currentMode === 'zoom') return; // Disable drawing in zoom mode
    
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
  }, [state.isDrawing, state.drawingMode, state.lastX, state.lastY, state.originalImageData, state.brushSize, state.currentColor, currentMode]);

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    if (!coords) return;
    
    startDrawingAtCoordinates(coords.x, coords.y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY, canvas);
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
    
    const coordinates = getCanvasCoordinates(touch.clientX, touch.clientY, mainCanvas);
    if (!coordinates) return;
    
    const { x, y } = coordinates;
    performFillAtCoordinates(x, y);
  }, [state.drawingMode, state.currentColor, currentMode]);

  // Touch gesture state for zoom/pan
  const touchRef = useRef<{
    initialDistance?: number;
    initialScale?: number;
    initialPanX?: number;
    initialPanY?: number;
    lastTouchCenter?: { x: number; y: number };
  }>({});

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling and zooming
    
    if (currentMode === 'zoom' && e.touches.length === 2) {
      // Two-finger zoom gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Get touch center relative to container center (for transform-origin: center center)
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;
      
      const touchCenterX = (touch1.clientX + touch2.clientX) / 2;
      const touchCenterY = (touch1.clientY + touch2.clientY) / 2;
      
      // Coordinates relative to container center
      const centerX = touchCenterX - containerCenterX;
      const centerY = touchCenterY - containerCenterY;
      
      const viewportManager = viewportManagerRef.current;
      if (viewportManager) {
        const currentState = viewportManager.getState();
        touchRef.current = {
          initialDistance: distance,
          initialScale: currentState.scale,
          initialPanX: currentState.panX,
          initialPanY: currentState.panY,
          lastTouchCenter: { x: centerX, y: centerY }
        };
      }
      return;
    }
    
    // Only handle single touch for drawing
    if (e.touches.length > 1) return;
    
    const touch = e.touches[0];
    
    // Handle fill mode with single tap
    if (state.drawingMode === 'fill') {
      handleFillTouch(e);
      return;
    }
    
    // Handle brush and eraser modes
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    if (!coords) return;
    
    startDrawingAtCoordinates(coords.x, coords.y);
  }, [state.drawingMode, handleFillTouch, currentMode]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Critical: prevent page scroll
    
    if (currentMode === 'zoom' && e.touches.length === 2) {
      // Two-finger zoom and pan gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Get touch center relative to container center (for transform-origin: center center)
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;
      
      const touchCenterX = (touch1.clientX + touch2.clientX) / 2;
      const touchCenterY = (touch1.clientY + touch2.clientY) / 2;
      
      // Coordinates relative to container center
      const centerX = touchCenterX - containerCenterX;
      const centerY = touchCenterY - containerCenterY;
      
      const viewportManager = viewportManagerRef.current;
      const touchState = touchRef.current;
      
      if (viewportManager && touchState.initialDistance && touchState.lastTouchCenter) {
        // Calculate zoom with center-relative coordinates
        const scaleChange = distance / touchState.initialDistance;
        const newScale = Math.max(0.25, Math.min(4.0, touchState.initialScale! * scaleChange));
        
        // Calculate pan using center-relative coordinates  
        const panDeltaX = centerX - touchState.lastTouchCenter.x;
        const panDeltaY = centerY - touchState.lastTouchCenter.y;
        
        viewportManager.setState({
          scale: newScale,
          panX: touchState.initialPanX! + panDeltaX,
          panY: touchState.initialPanY! + panDeltaY
        });
      }
      return;
    }
    
    // Only handle single touch for drawing
    if (e.touches.length > 1) return;
    
    if (!state.isDrawing || (state.drawingMode !== 'brush' && state.drawingMode !== 'eraser')) return;
    
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    if (!coords) return;
    
    // Throttle touch move events for performance
    if (touchMoveThrottleRef.current) return;
    
    touchMoveThrottleRef.current = requestAnimationFrame(() => {
      continueDrawingAtCoordinates(coords.x, coords.y);
      touchMoveThrottleRef.current = null;
    });
  }, [state.isDrawing, state.drawingMode, currentMode]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Clean up touch gesture state if no more touches
    if (e.touches.length === 0) {
      touchRef.current = {};
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
    if (currentMode === 'zoom') return; // Disable fill in zoom mode
    
    // Step 1 & 3: Defensive check for finite coordinates and logging
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      console.error('Invalid fill coordinates:', { x, y });
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
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY, mainCanvas);
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

  // Add event listeners for zoom/pan and drawing
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    // Add wheel event listener for zoom
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Add non-passive touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      // Cleanup event listeners
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

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
        {/* Left Sidebar with Zoom Toggle */}
        <div className="flex-shrink-0 bg-white border-r border-gray-200 p-2 flex flex-col items-center">
          <button
            onClick={handleToggleZoom}
            className={`
              w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-semibold transition-all duration-200
              ${currentMode === 'zoom' 
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
              }
            `}
            title={currentMode === 'zoom' ? 'Switch to Draw Mode' : 'Switch to Zoom Mode'}
          >
            {currentMode === 'zoom' ? '✏️' : '🔍'}
          </button>
          <span className="text-xs text-gray-500 mt-1">
            {currentMode === 'zoom' ? 'Draw' : 'Zoom'}
          </span>
        </div>
        
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
              className="relative max-w-full max-h-full"
              style={{
                aspectRatio: '2550 / 3300',
                transform: `translate(${viewportState.panX}px, ${viewportState.panY}px) scale(${viewportState.scale})`,
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
            >
              {/* Background canvas (contour lines) */}
                              <canvas 
                  ref={backgroundCanvasRef} 
                  className="absolute top-0 left-0 w-full h-full z-0"
                  style={{ 
                    imageRendering: 'pixelated',
                    backgroundColor: 'rgba(255, 255, 255, 1)' // white background
                  }}
                />
              
              {/* Fill canvas (colored areas only) */}
                              <canvas
                  ref={fillCanvasRef}
                  className="absolute top-0 left-0 w-full h-full z-10"
                  style={{ 
                    imageRendering: 'pixelated',
                    pointerEvents: 'none', // Make sure it doesn't block clicks
                    backgroundColor: 'rgba(255, 255, 255, 0)' // transparent
                  }}
                />
              
              {/* Main canvas for user interaction */}
                              <canvas
                  ref={mainCanvasRef}
                  onClick={currentMode === 'draw' ? handleCanvasClick : undefined}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}

                  className="relative w-full h-full bg-transparent shadow-lg cursor-crosshair z-20"
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