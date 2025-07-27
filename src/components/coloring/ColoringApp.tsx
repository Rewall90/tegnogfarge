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
import { InputHandler } from '@/core/viewport/InputHandler'
import { COLORING_APP_CONFIG } from '@/config/coloringApp'
import { getColoringImageUrl, preloadImage, validateImageDimensions } from '@/lib/imageUtils'
import { PencilTool } from './PencilTool'
import { FloodFillTool } from './FloodFillTool'

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
  
  let blackPixelsFound = [];
  let totalPixelsChecked = 0;
  
  // Sjekk et rutenett av punkter i penselens sirkel
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      
      const x = cx + dx;
      const y = cy + dy;
      totalPixelsChecked++;
      
      if (isBlackPixel(imageData, x, y, threshold)) {
        // Get the actual pixel color for debugging
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        
        blackPixelsFound.push({ x, y, r, g, b });
        
        // Return true immediately when first black pixel is found
        return true;
      }
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
    pencilSize: 3, // Size for pencil tool
    eraserSize: 10, // Separate size for eraser tool
    // REMOVED: tolerance - flood fill always uses 100%
    isDrawing: false,
    history: [],
    historyStep: -1,
    drawingMode: 'fill', // Default to fill mode
    lastX: null,
    lastY: null,
    prevX: null,    // Add this
    prevY: null     // Add this
  })
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_THEME_ID);
  const [backgroundType, setBackgroundType] = useState<string>("default-bg-color");

  // Viewport management
  const viewportManagerRef = useRef<ViewportManager | null>(null);
  const toggleModeRef = useRef<ToggleMode | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const [viewportState, setViewportState] = useState<ViewportState>({
    scale: 1,
    panX: 0,
    panY: 0,
    mode: 'draw'
  });
  const [currentMode, setCurrentMode] = useState<ViewportMode>('draw');


  // Reference to the app container for performance testing
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Refs for specialized tools
  const pencilToolRef = useRef<PencilTool | null>(null);
  const floodFillToolRef = useRef<FloodFillTool | null>(null);

  // Initialize viewport system
  useEffect(() => {
    if (!viewportManagerRef.current) {
      viewportManagerRef.current = new ViewportManager();
      toggleModeRef.current = new ToggleMode();
      inputHandlerRef.current = new InputHandler();
      
      // Ensure ViewportManager has valid state
      const state = viewportManagerRef.current.getState();
      if (!state || typeof state.scale === 'undefined') {
        console.warn('ViewportManager state invalid, resetting to default');
        viewportManagerRef.current.reset();
      }
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

  // Initialize specialized tools
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas && state.imageData) {
      // Initialize all three tools
      if (!pencilToolRef.current) {
        pencilToolRef.current = new PencilTool(mainCanvas);
      }
      if (!floodFillToolRef.current) {
        floodFillToolRef.current = new FloodFillTool(mainCanvas);
      }
    }
  }, [state.imageData]); // Initialize after canvas is ready

  // Sync settings for all tools
  useEffect(() => {
    // Sync pencil tool
    const pencilTool = pencilToolRef.current;
    if (pencilTool) {
      pencilTool.setColor(state.currentColor);
      pencilTool.setSize(state.pencilSize);
    }
    
    
    // Flood fill tool doesn't need syncing (uses color directly on click)
  }, [state.currentColor, state.pencilSize, state.eraserSize, state.imageData]); // Added state.imageData to trigger sync after tools are created

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

  // Smart eraser - works on both main canvas and fill layer
  const smartEraser = useCallback((
    x: number, 
    y: number, 
    prevX: number, 
    prevY: number, 
    brushSize: number, 
    mainCtx: CanvasRenderingContext2D,
    fillCtx: CanvasRenderingContext2D | null,
    backgroundType: string,
    isDrawing: boolean
  ) => {
    console.log('smartEraser called:', { 
      x, y, prevX, prevY, brushSize, isDrawing,
      mainCtx: !!mainCtx,
      fillCtx: !!fillCtx
    });
    
    if (!isDrawing) {
      console.log('Not drawing, returning');
      return;
    }
    
    if (!mainCtx) {
      console.error('Main context is null!');
      return;
    }
    
    // Erase from both main canvas and fill canvas
    const contexts = [mainCtx];
    if (fillCtx) contexts.push(fillCtx);
    
    console.log('Erasing from', contexts.length, 'contexts');
    
    contexts.forEach((ctx, index) => {
      console.log(`Erasing from context ${index}`);
      
      // Always use destination-out for erasing - creates transparency
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      
      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Reset to default
      ctx.globalCompositeOperation = "source-over";
    });
  }, []);

  // Mouse pan handlers
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode === 'zoom') {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    } else {
      // Route to appropriate specialized tool
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        buttons: e.buttons,
        pressure: 0.5,
        pointerId: 1,
        pointerType: 'mouse'
      });

      if (state.drawingMode === 'pencil') {
        pencilToolRef.current?.handlePointerDown(pointerEvent);
        e.preventDefault();
      } else if (state.drawingMode === 'fill') {
        floodFillToolRef.current?.handleClick(pointerEvent, state.currentColor);
        e.preventDefault();
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
    }
  }, [currentMode, state.drawingMode, state.currentColor, state]);

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
      const pointerEvent = new PointerEvent('pointermove', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        buttons: e.buttons,
        pressure: 0.5,
        pointerId: 1,
        pointerType: 'mouse'
      });

      if (state.drawingMode === 'pencil') {
        pencilToolRef.current?.handlePointerMove(pointerEvent);
      } else if (state.drawingMode === 'eraser') {
        console.log('Eraser mode in mouse move', {
          isDrawing: state.isDrawing,
          prevX: state.prevX,
          prevY: state.prevY,
          hasMainCtx: !!contextRef.current.main,
          hasFillCtx: !!contextRef.current.fill
        });
        
        if (state.isDrawing && state.prevX !== null && state.prevY !== null) {
          const coords = getCanvasCoordinates(e.clientX, e.clientY, mainCanvasRef.current!);
          console.log('Calling smartEraser with coords:', coords);
          
          smartEraser(
            coords.x, 
            coords.y, 
            state.prevX, 
            state.prevY, 
            state.eraserSize, 
            contextRef.current.main!,
            contextRef.current.fill,
            backgroundType,
            state.isDrawing
          );
          setState(prev => ({ 
            ...prev, 
            prevX: coords.x, 
            prevY: coords.y 
          }));
        }
      }
      // Fill tool doesn't need move events
    }
  }, [currentMode, isPanning, state.drawingMode, state.prevX, state.prevY, state.eraserSize, backgroundType, smartEraser]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode === 'zoom') {
      setIsPanning(false);
      lastPanPosition.current = null;
    } else {
      const pointerEvent = new PointerEvent('pointerup', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        buttons: e.buttons,
        pressure: 0.5,
        pointerId: 1,
        pointerType: 'mouse'
      });

      if (state.drawingMode === 'pencil') {
        pencilToolRef.current?.handlePointerUp(pointerEvent);
      } else if (state.drawingMode === 'eraser') {
        setState(prev => ({ 
          ...prev, 
          isDrawing: false, 
          prevX: null, 
          prevY: null 
        }));
      }
      // Fill tool doesn't need up events
    }
  }, [currentMode, state.drawingMode]);

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
        
        // Set background type for eraser functionality
        setBackgroundType("default-bg-img");
        
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
        
        
        // Calculate the CSS scale and sync with ViewportManager
        setTimeout(() => {
          const canvas = mainCanvasRef.current;
          if (canvas && viewportManagerRef.current) {
            // Get the actual displayed size (CSS size)
            const cssWidth = canvas.offsetWidth;
            const actualWidth = canvas.width; // Original canvas width (2550 or img.width)
            
            if (cssWidth > 0 && actualWidth > 0) {
              const currentScale = cssWidth / actualWidth;
              
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
      
      try {
        // Use utility to get the proper image URL with fallbacks
        const finalImageUrl = getColoringImageUrl(
          currentImage.webpImageUrl, 
          currentImage.displayImageUrl || currentImage.fallbackImageUrl
        );
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

  // Touch gesture state no longer needed - InputHandler handles all multi-touch gestures

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling and zooming
    
    // Skip multi-touch - let InputHandler handle all zoom gestures
    if (e.touches.length > 1) return;
    
    // Only handle single touch for drawing
    
    const touch = e.touches[0];
    
    // Handle fill mode with single tap
    if (state.drawingMode === 'fill') {
      handleFillTouch(e);
      return;
    }
    
    // Handle pencil and eraser modes
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    if (!coords) return;
    
    // Convert touch to pointer event for specialized tools
    const pointerEvent = new PointerEvent('pointerdown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      button: 0,
      buttons: 1,
      pressure: 0.5,
      pointerId: 1,
      pointerType: 'touch'
    });

    if (state.drawingMode === 'pencil') {
      pencilToolRef.current?.handlePointerDown(pointerEvent);
    } else if (state.drawingMode === 'eraser') {
      const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
      setState(prev => ({ 
        ...prev, 
        isDrawing: true, 
        prevX: coords.x, 
        prevY: coords.y 
      }));
    }
  }, [state.drawingMode, handleFillTouch, currentMode]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Critical: prevent page scroll
    
    // Skip multi-touch - let InputHandler handle all zoom gestures
    if (e.touches.length > 1) return;
    
    // Only handle single touch for drawing
    
    if (state.drawingMode !== 'pencil' && state.drawingMode !== 'eraser') return;
    
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch.clientX, touch.clientY, canvas);
    if (!coords) return;
    
    // Throttle touch move events for performance
    if (touchMoveThrottleRef.current) return;
    
    touchMoveThrottleRef.current = requestAnimationFrame(() => {
      // Convert touch to pointer event for specialized tools
      const pointerEvent = new PointerEvent('pointermove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        buttons: 1,
        pressure: 0.5,
        pointerId: 1,
        pointerType: 'touch'
      });

      if (state.drawingMode === 'pencil') {
        pencilToolRef.current?.handlePointerMove(pointerEvent);
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
            contextRef.current.fill,
            backgroundType,
            state.isDrawing
          );
          setState(prev => ({ 
            ...prev, 
            prevX: coords.x, 
            prevY: coords.y 
          }));
        }
      }
      
      touchMoveThrottleRef.current = null;
    });
  }, [state.isDrawing, state.drawingMode, currentMode]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Touch gesture state cleanup no longer needed - InputHandler handles it
    
    // Clean up throttled operations
    if (touchMoveThrottleRef.current) {
      cancelAnimationFrame(touchMoveThrottleRef.current);
      touchMoveThrottleRef.current = null;
    }
    
    // Convert touch to pointer event for specialized tools
    const pointerEvent = new PointerEvent('pointerup', {
      clientX: 0,
      clientY: 0,
      button: 0,
      buttons: 0,
      pressure: 0,
      pointerId: 1,
      pointerType: 'touch'
    });

    if (state.drawingMode === 'pencil') {
      pencilToolRef.current?.handlePointerUp(pointerEvent);
    } else if (state.drawingMode === 'eraser') {
      setState(prev => ({ 
        ...prev, 
        isDrawing: false, 
        prevX: null, 
        prevY: null 
      }));
    }
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

    // Set up InputHandler for unified touch/pointer handling
    const inputHandler = inputHandlerRef.current;
    const viewportManager = viewportManagerRef.current;
    
    if (inputHandler && viewportManager) {
      inputHandler.setCanvas(canvas);
      inputHandler.setMode(currentMode);

      // Set up zoom callback for two-finger pinch
      inputHandler.onZoom((scaleFactor: number, centerX: number, centerY: number) => {
        if (!viewportManager) return;
        
        const currentState = viewportManager.getState();
        
        if (!currentState || typeof currentState.scale === 'undefined') {
          console.error('ViewportManager state is invalid:', currentState);
          return;
        }
        
        // Convert InputHandler's canvas-relative coordinates to container-center-relative coordinates
        const container = canvas.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // InputHandler provides coordinates relative to canvas top-left
        // We need coordinates relative to container center
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        // Convert canvas-relative to container-relative, then to container-center-relative
        const canvasToContainerX = centerX + (canvasRect.left - containerRect.left);
        const canvasToContainerY = centerY + (canvasRect.top - containerRect.top);
        
        const centerRelativeToContainerCenter = {
          x: canvasToContainerX - containerCenterX,
          y: canvasToContainerY - containerCenterY
        };
        
        
        const zoomParams = {
          currentState: currentState,
          zoomFactor: scaleFactor,
          centerX: centerRelativeToContainerCenter.x,
          centerY: centerRelativeToContainerCenter.y
        };
        
        const zoomResult = calculateZoom(zoomParams);
        
        viewportManager.setState({
          scale: zoomResult.scale,
          panX: zoomResult.panX,
          panY: zoomResult.panY
        });
      });

      // Set up pan callback for single-finger pan in zoom mode
      inputHandler.onPan((deltaX: number, deltaY: number) => {
        if (!viewportManager) return;
        
        const currentState = viewportManager.getState();
        if (!currentState) return;
        
        viewportManager.setState({
          panX: currentState.panX + deltaX,
          panY: currentState.panY + deltaY
        });
      });
    }

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
      
      // Cleanup InputHandler
      if (inputHandler) {
        inputHandler.cleanup();
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, currentMode]);

  // Update InputHandler mode when currentMode changes
  useEffect(() => {
    const inputHandler = inputHandlerRef.current;
    if (inputHandler && inputHandler.isReady()) {
      inputHandler.setMode(currentMode);
    }
  }, [currentMode]);

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
            // REMOVED: tolerance props - flood fill always uses 100%
            canUndo={historyStep > 0}
            canRedo={historyStep < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onDownload={handleDownload}
            drawingMode={state.drawingMode} // Now 'pencil' | 'fill' | 'eraser'
            onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
            pencilSize={state.pencilSize}
            onPencilSizeChange={(size: number) => setState(prev => ({ ...prev, pencilSize: size }))}
            eraserSize={state.eraserSize}
            onEraserSizeChange={(size: number) => setState(prev => ({ ...prev, eraserSize: size }))}
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
                  onClick={(e) => {
                    
                    // Test what element is at the click position
                    const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
                    
                    if (currentMode === 'draw' && state.drawingMode === 'fill') {
                      handleCanvasClick(e);
                    }
                  }}

                  className="relative w-full h-full bg-transparent shadow-lg cursor-crosshair z-20"
                  style={{ 
                    imageRendering: 'pixelated',
                    backgroundColor: 'rgba(255, 255, 255, 0)', // transparent
                    touchAction: 'none', // Disable all default touch behaviors
                    userSelect: 'none', // Prevent text selection
                    WebkitUserSelect: 'none', // Prevent text selection on iOS
                    pointerEvents: 'all' // Ensure pointer events are enabled
                  }}
                  onPointerDown={(e) => {
                    // Use pointer events instead of mouse events for brush drawing
                    if (currentMode === 'zoom') {
                      setIsPanning(true);
                      lastPanPosition.current = { x: e.clientX, y: e.clientY };        
                      e.preventDefault();
                    } else {
                      // Convert pointer event to mouse event format
                      const mouseEvent = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        button: e.button,
                        buttons: e.buttons,
                        preventDefault: () => e.preventDefault(),
                        stopPropagation: () => e.stopPropagation()
                      } as React.MouseEvent<HTMLCanvasElement>;
                      handleMouseDown(mouseEvent);
                    }
                  }}
                  onPointerMove={(e) => {
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
                      // Always call mouse move - let the tools decide if they're drawing
                      const mouseEvent = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        button: e.button,
                        buttons: e.buttons,
                        preventDefault: () => e.preventDefault(),
                        stopPropagation: () => e.stopPropagation()
                      } as React.MouseEvent<HTMLCanvasElement>;
                      handleMouseMove(mouseEvent);
                    }
                  }}
                  onPointerUp={(e) => {
                    if (currentMode === 'zoom') {
                      setIsPanning(false);
                      lastPanPosition.current = null;
                    } else {
                      const mouseEvent = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        button: e.button,
                        buttons: e.buttons,
                        preventDefault: () => e.preventDefault(),
                        stopPropagation: () => e.stopPropagation()
                      } as React.MouseEvent<HTMLCanvasElement>;
                      handleMouseUp(mouseEvent);
                    }
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
              onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
              onUndo={handleUndo}
              canUndo={historyStep > 0}
              pencilSize={state.pencilSize}
              onPencilSizeChange={(size: number) => setState(prev => ({ ...prev, pencilSize: size }))}
              eraserSize={state.eraserSize}
              onEraserSizeChange={(size: number) => setState(prev => ({ ...prev, eraserSize: size }))}
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