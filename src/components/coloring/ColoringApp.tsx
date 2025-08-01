'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import Link from 'next/link'
import { FloodFill, type PixelChange, type FillRegion } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import LeftColorSidebar from './LeftColorSidebar'
import RightToolsSidebar from './RightToolsSidebar'
import ImageSelector from './ImageSelector'
import { MobileColorPicker } from './MobileColorPicker'
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

// Unified history system for all tools
type UnifiedHistoryEntry = {
  type: 'fill' | 'pencil' | 'eraser';
  timestamp: number;
  canvasData: ImageData; // Main canvas state after this action
  fillCanvasData?: ImageData; // Fill canvas state for transparency preservation
  fillRegions?: FillRegion[]; // Store fill regions for backward compatibility
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
  overlay: CanvasRenderingContext2D | null;
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
  // Add CSS animation for fade-up effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const router = useRouter()
  
  
  // Create our layered canvas references
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const fillCanvasRef = useRef<HTMLCanvasElement>(null)
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Cache for canvas contexts
  const contextRef = useRef<CanvasContexts>({
    background: null,
    main: null,
    fill: null,
    shadow: null,
    overlay: null
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
  const lastFillTime = useRef(0); // Prevent multiple fills
  
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
    pencilSize: 25, // Size for pencil tool
    eraserSize: 10, // Separate size for eraser tool
    // REMOVED: tolerance - flood fill always uses 100%
    isDrawing: false,
    history: [],
    historyStep: -1,
    drawingMode: 'pencil', // Default to pencil mode
    lastX: null,
    lastY: null,
    prevX: null,    // Add this
    prevY: null     // Add this
  })
  

  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // Pencil stroke history system
  const [pencilHistory, setPencilHistory] = useState<ImageData[]>([]);
  const [pencilHistoryStep, setPencilHistoryStep] = useState(-1);
  const pencilSaveInProgress = useRef(0); // Store timestamp instead of boolean
  const pencilHistoryStepRef = useRef(-1); // Track current step for immediate access
  
  // Unified history system
  const [unifiedHistory, setUnifiedHistory] = useState<UnifiedHistoryEntry[]>([]);
  const [unifiedHistoryStep, setUnifiedHistoryStep] = useState(-1);
  const MAX_UNIFIED_HISTORY = 50; // Maximum number of undo steps
  const unifiedHistoryRef = useRef<UnifiedHistoryEntry[]>([]);
  const unifiedHistoryStepRef = useRef(-1);
  
  const [activeThemeId, setActiveThemeId] = useState(DEFAULT_THEME_ID);
  const [backgroundType, setBackgroundType] = useState<string>("default-bg-color");
  const [showMobileTools, setShowMobileTools] = useState(false);
  
  // Track screen dimensions for layout decisions
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const [isTallScreen, setIsTallScreen] = useState(true); // >= 1024px height = single sidebar, < 1024px = split sidebars

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
  const [isWheelScrolling, setIsWheelScrolling] = useState(false);
  const wheelScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Reference to the app container for performance testing
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Track screen dimensions for responsive layout
  useEffect(() => {
    const updateScreenDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenDimensions({ width, height });
      setIsTallScreen(height >= 1024);
    };

    // Set initial dimensions
    updateScreenDimensions();

    // Add resize listener
    window.addEventListener('resize', updateScreenDimensions);

    return () => {
      window.removeEventListener('resize', updateScreenDimensions);
    };
  }, []);

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
    const unsubscribeMode = toggleModeRef.current!.addModeChangeCallback((mode) => {
      setCurrentMode(mode);
      // Update viewport manager mode
      if (viewportManagerRef.current) {
        viewportManagerRef.current.setMode(mode);
      }
    });

    // Initial state
    setViewportState(viewportManagerRef.current.getState());
    setCurrentMode(toggleModeRef.current!.getCurrentMode());

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
      // Initialize flood fill tool only - pencil tool is initialized later with callback
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
    
    // Set wheel scrolling state for cursor change
    setIsWheelScrolling(true);
    
    // Clear existing timeout
    if (wheelScrollTimeoutRef.current) {
      clearTimeout(wheelScrollTimeoutRef.current);
    }
    
    // Set timeout to reset wheel scrolling state
    wheelScrollTimeoutRef.current = setTimeout(() => {
      setIsWheelScrolling(false);
    }, 150); // Reset after 150ms of no scrolling
    
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

  // Save to unified history
  const saveToUnifiedHistory = useCallback((type: 'fill' | 'pencil' | 'eraser', currentFillRegions?: FillRegion[]) => {
    console.log(`[saveToUnifiedHistory] Called with type: ${type}, current step: ${unifiedHistoryStepRef.current}, history length: ${unifiedHistoryRef.current.length}`);
    const newStep = unifiedHistoryStepRef.current + 1;
    const regionsToSave = currentFillRegions || fillRegions;
    
    // Check if we're trying to save a duplicate entry (only check for flood fill)
    if (type === 'fill') {
      const currentEntry = unifiedHistoryRef.current[unifiedHistoryStepRef.current];
      if (currentEntry && currentEntry.type === 'fill' && currentEntry.fillRegions?.length === regionsToSave.length) {
        console.log('[saveToUnifiedHistory] Skipping duplicate fill entry');
        return;
      }
    }
    
    const mainCanvas = mainCanvasRef.current;
    const fillCanvas = fillCanvasRef.current;
    if (!mainCanvas) return;
    
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;
    
    // Get current main canvas state
    const canvasData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Get current fill canvas state for transparency preservation
    let fillCanvasData: ImageData | undefined;
    if (fillCanvas) {
      const fillCtx = fillCanvas.getContext('2d');
      if (fillCtx) {
        fillCanvasData = fillCtx.getImageData(0, 0, fillCanvas.width, fillCanvas.height);
      }
    }
    
    // Create history entry
    const entry: UnifiedHistoryEntry = {
      type,
      timestamp: Date.now(),
      canvasData,
      fillCanvasData, // Save fill canvas state for transparency preservation
      fillRegions: [...regionsToSave] // Keep for backward compatibility
    };
    

    
    // Update refs directly (no React state batching issues)
    const currentStep = unifiedHistoryStepRef.current;
    const truncatedHistory = unifiedHistoryRef.current.slice(0, currentStep + 1);
    const newHistory = [...truncatedHistory, entry].slice(-MAX_UNIFIED_HISTORY);
    const finalStep = Math.min(currentStep + 1, MAX_UNIFIED_HISTORY - 1);
    
    // Update refs
    unifiedHistoryRef.current = newHistory;
    unifiedHistoryStepRef.current = finalStep;
    

    
    // Update state to trigger re-render for UI updates
    console.log(`[saveToUnifiedHistory] Updating state - new history length: ${newHistory.length}, new step: ${finalStep}`);
    setUnifiedHistory(newHistory);
    setUnifiedHistoryStep(finalStep);
  }, [fillRegions]); // Fix: Include fillRegions in dependency array to prevent stale closure

  // Smart eraser - uses dual strategy based on background type
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
    if (!isDrawing) {
      return;
    }
    
    if (!mainCtx) {
      console.error('Main context is null!');
      return;
    }
    
    if (backgroundType === "default-bg-img") {
      // Strategy 1: Coloring Layer Erasing (for images with black lines)
      // Use destination-out to make coloring layers transparent, preserving black lines
      const contexts = [mainCtx];
      if (fillCtx) contexts.push(fillCtx);
      
      contexts.forEach((ctx) => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Reset composite operation for future drawing
        ctx.globalCompositeOperation = "source-over";
      });
    } else {
      // Strategy 2: User Drawing Erasing (for plain backgrounds)  
      // Paint white over user drawings on main/fill canvas
      const contexts = [mainCtx];
      if (fillCtx) contexts.push(fillCtx);
      
      contexts.forEach((ctx) => {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
    }
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
        const coords = floodFillToolRef.current?.handleClick(pointerEvent, state.currentColor);
        if (coords) {
          performFillAtCoordinates(coords.x, coords.y);
        }
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
        if (state.isDrawing && state.prevX !== null && state.prevY !== null) {
          const coords = getCanvasCoordinates(e.clientX, e.clientY, mainCanvasRef.current!);
          
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
        // Save eraser state to history
        saveToUnifiedHistory('eraser');
      }
      // Fill tool doesn't need up events
    }
  }, [currentMode, state.drawingMode, saveToUnifiedHistory]);

  // Initialize and cache canvas contexts
  const initializeContexts = useCallback(() => {
    const background = backgroundCanvasRef.current;
    const main = mainCanvasRef.current;
    const fill = fillCanvasRef.current;
    const shadow = shadowCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    
    if (background && main && fill && shadow && overlay) {
      contextRef.current = {
        background: background.getContext('2d'),
        main: main.getContext('2d', { willReadFrequently: true }),
        fill: fill.getContext('2d', { alpha: true }),
        shadow: shadow.getContext('2d', { willReadFrequently: true }),
        overlay: overlay.getContext('2d', { alpha: true })
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
        const overlayCanvas = overlayCanvasRef.current
        
        if (!background || !canvas || !fillCanvas || !shadowCanvas || !overlayCanvas) {
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
        overlayCanvas.width = img.width
        overlayCanvas.height = img.height
        
        // Initialize contexts if not already done
        if (!contextRef.current.main || !contextRef.current.background || !contextRef.current.fill || !contextRef.current.shadow || !contextRef.current.overlay) {
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
        
        // Process overlay canvas with aggressive two-tone conversion
        const overlayCtx = contextRef.current.overlay!;
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayCtx.drawImage(img, 0, 0);
        
        // Get original image data for processing
        const originalImageData = overlayCtx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        // Create display version with aggressive two-tone conversion
        const displayImageData = overlayCtx.createImageData(originalImageData);
        const originalData = originalImageData.data;
        const displayData = displayImageData.data;
        
        // Aggressive two-tone: only keep pure black pixels, make everything else transparent
        for (let i = 0; i < originalData.length; i += 4) {
          const r = originalData[i];
          const g = originalData[i + 1];
          const b = originalData[i + 2];
          
          // Only keep pixels that are clearly black
          if (r < 50 && g < 50 && b < 50) {
            displayData[i] = r;     // Keep original black
            displayData[i + 1] = g;
            displayData[i + 2] = b;
            displayData[i + 3] = originalData[i + 3]; // Keep original alpha
          } else {
            // Make everything else (white, gray, anti-aliasing) transparent
            displayData[i] = 0;
            displayData[i + 1] = 0;
            displayData[i + 2] = 0;
            displayData[i + 3] = 0; // Transparent
          }
        }
        
        // Put the display version (pure black only) on overlay canvas
        overlayCtx.putImageData(displayImageData, 0, 0);
        
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
        
        // Save initial clean canvas state
        const initialCanvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setPencilHistory([initialCanvasData]);
        setPencilHistoryStep(0);
        pencilHistoryStepRef.current = 0;
        
        // Get initial fill canvas state
        let initialFillCanvasData: ImageData | undefined;
        if (fillCanvas) {
          const fillCtx = fillCanvas.getContext('2d');
          if (fillCtx) {
            initialFillCanvasData = fillCtx.getImageData(0, 0, fillCanvas.width, fillCanvas.height);
          }
        }
        
        // Initialize unified history with clean state using refs
        const initialHistoryEntry = {
          type: 'pencil' as const,
          timestamp: Date.now(),
          canvasData: initialCanvasData,
          fillCanvasData: initialFillCanvasData,
          fillRegions: [] // Start with no fill regions
        };
        unifiedHistoryRef.current = [initialHistoryEntry];
        unifiedHistoryStepRef.current = 0;
        
        // Also update state to sync UI
        setUnifiedHistory([initialHistoryEntry]);
        setUnifiedHistoryStep(0);
        
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
      if (wheelScrollTimeoutRef.current) {
        clearTimeout(wheelScrollTimeoutRef.current);
        wheelScrollTimeoutRef.current = null;
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
    
    // Block all drawing tools when in zoom mode (same as desktop)
    if (currentMode === 'zoom') return;
    
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
    
    // Block all drawing tools when in zoom mode (same as desktop)
    if (currentMode === 'zoom') return;
    
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
    
    // Block all drawing tools when in zoom mode (same as desktop)
    if (currentMode === 'zoom') return;
    
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
      // Save eraser state to history
      saveToUnifiedHistory('eraser');
    }
  }, [state.drawingMode, saveToUnifiedHistory]);

  // Shared fill logic for both mouse and touch
  const performFillAtCoordinates = (x: number, y: number) => {
    // Prevent multiple fill operations within 500ms
    const now = Date.now();
    if (now - lastFillTime.current < 500) {
      return;
    }
    lastFillTime.current = now;
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
    
    // Always read fresh data from shadow canvas to ensure consistency after undo/redo
    // The cached imageData might be stale after undo operations
    const imageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
    sharedImageDataRef.current = imageData;
    
    if (!imageData || imageData.width === 0 || imageData.height === 0) {
      setIsFilling(false);
      return;
    }
    
    // Sjekk at koordinatene er innenfor canvas
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
      setIsFilling(false);
      return;
    }
    
    const floodFill = new FloodFill(imageData, 100, 50); // Always use 100% tolerance
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
                
                // Save to history AFTER the animation completes and canvas is fully rendered
                // This ensures the fillCanvasData captures the actual visual state
                saveToUnifiedHistory('fill', newRegions);
              }
            };
            
            // Start animation
            if (fadeAnimationRef.current) {
              cancelAnimationFrame(fadeAnimationRef.current);
            }
            fadeAnimationRef.current = requestAnimationFrame(animateFade);
            
            return newRegions;
          });
          
          // History will be saved after fill animation completes
          
          // Update history - DISABLED: Using unified history instead
          // const newHistory = history.slice(0, historyStep + 1);
          // newHistory.push({ changes, region });
          // setHistory(newHistory.slice(-MAX_HISTORY));
          // setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
          
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
                
                // Save to history AFTER the animation completes and canvas is fully rendered
                // This ensures the fillCanvasData captures the actual visual state
                saveToUnifiedHistory('fill', newRegions);
              }
            };
            
            // Start animation
            if (fadeAnimationRef.current) {
              cancelAnimationFrame(fadeAnimationRef.current);
            }
            fadeAnimationRef.current = requestAnimationFrame(animateFade);
            
            return newRegions;
          });
          
          // History will be saved after fill animation completes
          
          // Update history - DISABLED: Using unified history instead
          // const newHistory = history.slice(0, historyStep + 1);
          // newHistory.push({ changes, region });
          // setHistory(newHistory.slice(-MAX_HISTORY));
          // setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
          
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

  // Save canvas state to pencil history
  const savePencilState = useCallback(() => {
    // Prevent rapid duplicate calls with a more robust check
    const now = Date.now();
    const lastSaveTime = pencilSaveInProgress.current || 0;
    
    if (now - lastSaveTime < 200) { // 200ms minimum between saves
      return;
    }
    
    pencilSaveInProgress.current = now;
    
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Add state to history, but first truncate any future history
    setPencilHistory(currentHistory => {
      const currentStep = pencilHistoryStepRef.current;
      // Truncate history from current step + 1 onwards (remove any "future" states)
      const truncatedHistory = currentHistory.slice(0, currentStep + 1);
      const newHistory = [...truncatedHistory, imageData];
      const limitedHistory = newHistory.slice(-MAX_HISTORY);
      
      // Update step to match the new history length - 1
      const newStep = limitedHistory.length - 1;
      pencilHistoryStepRef.current = newStep;
      setPencilHistoryStep(newStep);
      
      return limitedHistory;
    });
  }, []); // Remove dependency

  // Restore canvas state from pencil history
  const restorePencilState = useCallback((step: number) => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas || step < 0 || step >= pencilHistory.length) return;

    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(pencilHistory[step], 0, 0);
  }, [pencilHistory]);

  // Initialize pencil tool with callback after functions are defined
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas && state.imageData && !pencilToolRef.current) {
      pencilToolRef.current = new PencilTool(mainCanvas, () => {
        // savePencilState(); // DISABLED: Using unified history instead
        saveToUnifiedHistory('pencil');
      });
      // Set the initial size to match the React state
      pencilToolRef.current.setSize(state.pencilSize);
    }
  }, [state.imageData, saveToUnifiedHistory]);

  // Sync PencilTool size with React state
  useEffect(() => {
    if (pencilToolRef.current) {
      pencilToolRef.current.setSize(state.pencilSize);
    }
  }, [state.pencilSize]);

  const handleUndo = useCallback(() => {
    // Use unified history for undo
    if (unifiedHistoryStepRef.current <= 0) return;
    
    const mainCanvas = mainCanvasRef.current;
    const fillCanvas = fillCanvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!mainCanvas) return;
    
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;
    
    // Get the previous state
    const previousStep = unifiedHistoryStepRef.current - 1;
    const previousEntry = unifiedHistoryRef.current[previousStep];
    
    // Restore from previous state
    mainCtx.putImageData(previousEntry.canvasData, 0, 0);
    
    // Restore fill canvas state
    if (fillCanvas) {
      const fillCtx = fillCanvas.getContext('2d');
      if (fillCtx) {
        if (previousEntry.fillCanvasData) {
          // Use saved fill canvas state (preserves transparency)
          fillCtx.putImageData(previousEntry.fillCanvasData, 0, 0);
        } else {
          // Fallback to old method for backward compatibility
          fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
          if (previousEntry.fillRegions) {
            redrawFillRegions(previousEntry.fillRegions);
          }
        }
      }
    }
    
    // Update fill regions state for consistency
    if (previousEntry.fillRegions) {
      setFillRegions(previousEntry.fillRegions);
    } else {
      setFillRegions([]);
    }
    
    // Update shadow canvas to match the restored state
    const shadowCtx = contextRef.current.shadow;
    if (shadowCtx && shadowCanvas && backgroundCanvas) {
      // Redraw shadow canvas from background + main canvas (includes eraser) + fill layer
      shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
      shadowCtx.drawImage(backgroundCanvas, 0, 0);
      shadowCtx.drawImage(mainCanvas, 0, 0);
      if (fillCanvas) {
        shadowCtx.drawImage(fillCanvas, 0, 0);
      }
      
      // Update the cached image data
      const newImageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = newImageData;
      setState(prev => ({ ...prev, imageData: newImageData }));
    }
    
    // Update the step using ref and state
    unifiedHistoryStepRef.current = previousStep;
    setUnifiedHistoryStep(previousStep);
  }, [unifiedHistory, unifiedHistoryStep]);


  const handleRedo = useCallback(() => {
    // Use unified history for redo
    if (unifiedHistoryStepRef.current >= unifiedHistoryRef.current.length - 1) return;
    
    const mainCanvas = mainCanvasRef.current;
    const fillCanvas = fillCanvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!mainCanvas) return;
    
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;
    
    // Get the next state
    const nextStep = unifiedHistoryStepRef.current + 1;
    const nextEntry = unifiedHistoryRef.current[nextStep];
    
    // Restore from next state
    mainCtx.putImageData(nextEntry.canvasData, 0, 0);
    
    // Restore fill canvas state
    if (fillCanvas) {
      const fillCtx = fillCanvas.getContext('2d');
      if (fillCtx) {
        if (nextEntry.fillCanvasData) {
          // Use saved fill canvas state (preserves transparency)
          fillCtx.putImageData(nextEntry.fillCanvasData, 0, 0);
        } else {
          // Fallback to old method for backward compatibility
          fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
          if (nextEntry.fillRegions) {
            redrawFillRegions(nextEntry.fillRegions);
          }
        }
      }
    }
    
    // Update fill regions state for consistency
    if (nextEntry.fillRegions) {
      setFillRegions(nextEntry.fillRegions);
    } else {
      setFillRegions([]);
    }
    
    // Update shadow canvas to match the restored state
    const shadowCtx = contextRef.current.shadow;
    if (shadowCtx && shadowCanvas && backgroundCanvas) {
      // Redraw shadow canvas from background + main canvas (includes eraser) + fill layer
      shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
      shadowCtx.drawImage(backgroundCanvas, 0, 0);
      shadowCtx.drawImage(mainCanvas, 0, 0);
      if (fillCanvas) {
        shadowCtx.drawImage(fillCanvas, 0, 0);
      }
      
      // Update the cached image data
      const newImageData = shadowCtx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
      sharedImageDataRef.current = newImageData;
      setState(prev => ({ ...prev, imageData: newImageData }));
    }
    
    // Update the step using ref and state
    unifiedHistoryStepRef.current = nextStep;
    setUnifiedHistoryStep(nextStep);
  }, []);

  const handleReset = useCallback(() => {
    if (!state.originalImageData) return;
    
    // Clear all regions
    setFillRegions([]);
    
    // Clear all brush strokes and snapshots
    setBrushStrokes([]);
    
    // Clear unified history using refs and state
    unifiedHistoryRef.current = [];
    unifiedHistoryStepRef.current = -1;
    setUnifiedHistory([]);
    setUnifiedHistoryStep(-1);
    
    // Reset pencil history to initial clean state
    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas) {
      const ctx = mainCanvas.getContext('2d');
      if (ctx) {
        const initialCanvasData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
        setPencilHistory([initialCanvasData]);
        setPencilHistoryStep(0);
        pencilHistoryStepRef.current = 0;
      }
    }
    
    // Clear the fill canvas
    const fillCtx = contextRef.current.fill;
    const fillCanvas = fillCanvasRef.current;
    
    if (fillCtx && fillCanvas) {
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
    }
    
    // Clear the main canvas
    const mainCtx = contextRef.current.main;
    
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
          centerY: centerRelativeToContainerCenter.y,
          purePinchZoom: true // Two-finger pinch should not apply pan adjustments
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
    <div className="h-screen overflow-hidden bg-gray-100 grid grid-rows-[auto_1fr_auto] lg:grid-rows-[auto_1fr]" style={{ height: '100vh', maxHeight: '100vh' }} ref={appContainerRef}>
      {showImageSelector && (
        <ImageSelector
          currentImageId={currentImage._id}
          categorySlug={currentImage.category.slug}
          subcategorySlug={currentImage.subcategory.slug}
          onSelect={handleImageChange}
          onClose={() => setShowImageSelector(false)}
        />
      )}
      {/* New Container with tools */}
      <div className="bg-[#FEFAF6] shadow-sm p-2 relative z-40">
        <div className="flex justify-between items-center">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/categories/${currentImage.category.slug}/${currentImage.subcategory.slug}`)}
            className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer border-red-500 hover:border-red-600 text-red-500 hover:text-red-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>

          {/* Center tools */}
          <div className="flex items-center gap-4">
          {/* Undo */}
          <button 
           onClick={handleUndo}
           disabled={!(unifiedHistory.length > 1 && unifiedHistoryStep > 0)}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             !(unifiedHistory.length > 1 && unifiedHistoryStep > 0)
               ? 'border-gray-200 opacity-50 cursor-not-allowed' 
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20.0723 15.5117C20.0723 16.6895 19.8262 17.7148 19.334 18.5879C18.8418 19.4609 18.1299 20.1377 17.1982 20.6182C16.2725 21.0986 15.1533 21.3389 13.8408 21.3389H11.7314C11.4443 21.3389 11.21 21.2451 11.0283 21.0576C10.8467 20.8701 10.7559 20.6416 10.7559 20.3721C10.7559 20.1084 10.8467 19.8828 11.0283 19.6953C11.21 19.5078 11.4443 19.4141 11.7314 19.4141H13.7793C14.7227 19.4141 15.5195 19.2412 16.1699 18.8955C16.8262 18.5498 17.3213 18.0781 17.6553 17.4805C17.9951 16.8828 18.165 16.2031 18.165 15.4414C18.165 14.6797 17.9951 14.0059 17.6553 13.4199C17.3213 12.834 16.8262 12.377 16.1699 12.0488C15.5195 11.7148 14.7227 11.5479 13.7793 11.5479H8.18945L5.22754 11.416L5.5 10.915L7.69727 12.7695L9.95605 14.9668C10.0381 15.0488 10.1055 15.1455 10.1582 15.2568C10.2109 15.3682 10.2373 15.4941 10.2373 15.6348C10.2373 15.9043 10.1494 16.127 9.97363 16.3027C9.80371 16.4785 9.5752 16.5664 9.28809 16.5664C9.02441 16.5664 8.7959 16.4668 8.60254 16.2676L3.54883 11.3018C3.44922 11.2021 3.37305 11.0908 3.32031 10.9678C3.26758 10.8447 3.24121 10.7188 3.24121 10.5898C3.24121 10.4551 3.26758 10.3262 3.32031 10.2031C3.37305 10.0742 3.44922 9.96289 3.54883 9.86914L8.60254 4.90332C8.7959 4.69824 9.02441 4.5957 9.28809 4.5957C9.5752 4.5957 9.80371 4.68359 9.97363 4.85938C10.1494 5.03516 10.2373 5.26074 10.2373 5.53613C10.2373 5.67676 10.2109 5.80273 10.1582 5.91406C10.1055 6.01953 10.0381 6.11621 9.95605 6.2041L7.69727 8.41016L5.5 10.2646L5.22754 9.75488L8.18945 9.61426H13.7266C15.0566 9.61426 16.1963 9.86621 17.1455 10.3701C18.0947 10.8682 18.8184 11.5596 19.3164 12.4443C19.8203 13.3291 20.0723 14.3516 20.0723 15.5117Z" fill="#4E5969"/>
            </svg>
          </button>

          {/* Zoom Tool */}
          <button 
           onClick={handleToggleZoom}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             currentMode === 'zoom'
               ? 'border-blue-600 bg-blue-50 scale-110'
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 10.5H7.5M10.5 7.5V13.5" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Redo */}
          <button 
           onClick={handleRedo}
           disabled={!(unifiedHistoryStep < unifiedHistory.length - 1)}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             !(unifiedHistoryStep < unifiedHistory.length - 1)
               ? 'border-gray-200 opacity-50 cursor-not-allowed' 
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3.24121 15.5117C3.24121 14.3516 3.49316 13.3291 3.99707 12.4443C4.50098 11.5596 5.22461 10.8682 6.16797 10.3701C7.11719 9.86621 8.25684 9.61426 9.58691 9.61426H15.124L18.0859 9.75488L17.8135 10.2646L15.6162 8.41016L13.3574 6.2041C13.2695 6.11621 13.1992 6.01953 13.1465 5.91406C13.0996 5.80273 13.0762 5.67676 13.0762 5.53613C13.0762 5.26074 13.1611 5.03516 13.3311 4.85938C13.5068 4.68359 13.7354 4.5957 14.0166 4.5957C14.2861 4.5957 14.5205 4.69824 14.7197 4.90332L19.7646 9.86914C19.8643 9.96289 19.9404 10.0742 19.9932 10.2031C20.0459 10.3262 20.0723 10.4551 20.0723 10.5898C20.0723 10.7188 20.0459 10.8447 19.9932 10.9678C19.9404 11.0908 19.8643 11.2021 19.7646 11.3018L14.7197 16.2676C14.5205 16.4668 14.2861 16.5664 14.0166 16.5664C13.7354 16.5664 13.5068 16.4785 13.3311 16.3027C13.1611 16.127 13.0762 15.9043 13.0762 15.6348C13.0762 15.4941 13.0996 15.3682 13.1465 15.2568C13.1992 15.1455 13.2695 15.0488 13.3574 14.9668L15.6162 12.7695L17.8135 10.915L18.0859 11.416L15.124 11.5479H9.54297C8.59375 11.5479 7.79395 11.7148 7.14355 12.0488C6.49316 12.377 5.99805 12.834 5.6582 13.4199C5.31836 14.0059 5.14844 14.6797 5.14844 15.4414C5.14844 16.2031 5.31836 16.8828 5.6582 17.4805C5.99805 18.0781 6.49316 18.5498 7.14355 18.8955C7.79395 19.2412 8.59375 19.4141 9.54297 19.4141H11.582C11.8691 19.4141 12.1035 19.5078 12.2852 19.6953C12.4727 19.8828 12.5664 20.1084 12.5664 20.3721C12.5664 20.6416 12.4727 20.8701 12.2852 21.0576C12.1035 21.2451 11.8691 21.3389 11.582 21.3389H9.47266C8.16016 21.3389 7.03809 21.0986 6.10645 20.6182C5.18066 20.1377 4.47168 19.4609 3.97949 18.5879C3.4873 17.7148 3.24121 16.6895 3.24121 15.5117Z" fill="#4E5969"/>
            </svg>
          </button>
          </div>

          {/* Bytt bilde button */}
          <button
            onClick={() => setShowImageSelector(true)}
            className="bg-[#EB7060] text-black px-3 py-2 rounded hover:bg-[#EB7060]/90 font-quicksand text-xs whitespace-nowrap"
          >
            Bytt bilde
          </button>
        </div>
      </div>

      {/* Canvas Section - Now a direct grid child */}
      <div className="overflow-hidden min-h-0">
          
          {/* Canvas Section - 3 Column Layout */}
          <div className="bg-[#FEFAF6] p-1 flex h-full" style={{ overflow: 'hidden' }}>
            {/* Single ColorPalette for tall screens (height >= 1024px) - Desktop AND Tablets */}
            <div className={`lg:w-1/5 lg:flex-shrink-0 ${isTallScreen ? 'hidden lg:block' : 'hidden'}`}>
              <ColorPalette
                selectedColor={state.currentColor}
                onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
                suggestedColors={currentImage.suggestedColors}
                drawingMode={state.drawingMode}
                onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
                pencilSize={state.pencilSize}
                onPencilSizeChange={(size) => setState(prev => ({ ...prev, pencilSize: size }))}
                eraserSize={state.eraserSize}
                onEraserSizeChange={(size) => setState(prev => ({ ...prev, eraserSize: size }))}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onReset={handleReset}
                onDownload={handleDownload}
                onToggleZoom={handleToggleZoom}
                currentMode={currentMode}
                canUndo={unifiedHistory.length > 1 && unifiedHistoryStep > 0}
                canRedo={unifiedHistoryStep < unifiedHistory.length - 1}
              />
            </div>

            {/* Split Layout: Left Color Sidebar - For short screens (height < 1024px) - Desktop AND Tablets */}
            <div className={`lg:w-[20%] lg:flex-shrink-0 ${!isTallScreen ? 'hidden lg:block' : 'hidden'}`}>
              <LeftColorSidebar
                selectedColor={state.currentColor}
                onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
                suggestedColors={currentImage.suggestedColors}
              />
            </div>
            <div className="relative flex-1 w-full h-full p-4 flex items-center justify-center overflow-hidden">
              <div 
              className="relative"
              style={{
                width: 'auto',
                height: '100%',
                maxWidth: screenDimensions.width > 0 ? (() => {
                  const isDesktop = screenDimensions.width >= 1024;
                  const heightBasedWidth = (screenDimensions.height - 200) * 2550 / 3300;
                  
                  if (isDesktop && isTallScreen) {
                    // Tall screens (>=1024px height): Single sidebar (20% width) - Desktop AND Tablets
                    return `${heightBasedWidth}px`;
                  } else if (isDesktop && !isTallScreen) {
                    // Short screens (<1024px height): Split sidebars (30% total width) - Desktop AND Tablets  
                    const shortScreenConstraint = screenDimensions.width * 0.60;
                    return `${Math.min(heightBasedWidth, shortScreenConstraint)}px`;
                  } else {
                    // Mobile: No sidebars, use 85% of full width
                    const mobileWidthConstraint = screenDimensions.width * 0.85;
                    return `${Math.min(heightBasedWidth, mobileWidthConstraint)}px`;
                  }
                })() : '100%',
                maxHeight: screenDimensions.height > 0 ? `${screenDimensions.height - 200}px` : '100%',
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

                  className={`relative w-full h-full bg-transparent shadow-lg z-20 ${
                    currentMode === 'zoom'
                      ? isWheelScrolling
                        ? 'cursor-zoom-in'
                        : 'cursor-grab'
                      : state.drawingMode === 'pencil' 
                      ? 'cursor-pencil' 
                      : state.drawingMode === 'fill'
                      ? 'cursor-fill'
                      : state.drawingMode === 'eraser'
                      ? 'cursor-eraser'
                      : 'cursor-crosshair'
                  }`}
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
                      // Check if InputHandler is currently handling a zoom gesture
                      const inputHandler = inputHandlerRef.current;
                      const isZooming = inputHandler?.getGestureState().isZooming || false;
                      
                      // Only allow pan when NOT zooming (single finger only)
                      if (!isZooming) {
                        setIsPanning(true);
                        lastPanPosition.current = { x: e.clientX, y: e.clientY };        
                        e.preventDefault();
                      }
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
                      // Check if InputHandler is currently handling a zoom gesture
                      const inputHandler = inputHandlerRef.current;
                      const isZooming = inputHandler?.getGestureState().isZooming || false;
                      
                      // Only continue pan when NOT zooming (block pan during pinch zoom)
                      if (!isZooming) {
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
                        // Stop pan immediately when zoom gesture starts
                        setIsPanning(false);
                        lastPanPosition.current = null;
                      }
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
              
              {/* Overlay canvas - visible black outlines on top */}
              <canvas 
                ref={overlayCanvasRef} 
                className="absolute top-0 left-0 w-full h-full z-40"
                style={{ 
                  imageRendering: 'pixelated',
                  backgroundColor: 'rgba(255, 255, 255, 0)', // transparent
                  pointerEvents: 'none'
                }} 
              />
              </div>
            </div>
            
            {/* Split Layout: Right Tools Sidebar - For short screens (height < 1024px) - Desktop AND Tablets */}
            <div className={`lg:w-[15%] lg:flex-shrink-0 ${!isTallScreen ? 'hidden lg:block' : 'hidden'}`}>
              <RightToolsSidebar
                drawingMode={state.drawingMode}
                onDrawingModeChange={(mode: 'pencil' | 'fill' | 'eraser') => setState(prev => ({ ...prev, drawingMode: mode }))}
                pencilSize={state.pencilSize}
                onPencilSizeChange={(size) => setState(prev => ({ ...prev, pencilSize: size }))}
                eraserSize={state.eraserSize}
                onEraserSizeChange={(size) => setState(prev => ({ ...prev, eraserSize: size }))}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onReset={handleReset}
                onDownload={handleDownload}
                onToggleZoom={handleToggleZoom}
                currentMode={currentMode}
                canUndo={unifiedHistory.length > 1 && unifiedHistoryStep > 0}
                canRedo={unifiedHistoryStep < unifiedHistory.length - 1}
              />
            </div>
          </div>
      </div>
      
      {/* Mobile Controls Section - Now a direct grid child */}
      <div className="lg:hidden relative min-w-0">
            <div className="bg-white shadow-lg relative transition-all duration-300 ease-out min-w-0" style={{ zIndex: 9999, position: 'relative' }}>
              
              {/* Tools Section - Overlays canvas when expanded */}
              {showMobileTools && (
                <div className="absolute bottom-full left-0 right-0 bg-white/70 px-4 pt-4 pb-0 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in rounded-t-2xl" 
                     style={{ 
                       zIndex: 9999,
                       marginBottom: '-1px', // Connect seamlessly with base
                       boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)', // Shadow only on top
                       animation: 'fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                     }}>
                  {/* Tool Buttons */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, drawingMode: 'pencil' }));
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
                        state.drawingMode === 'pencil' 
                          ? 'border-blue-600 scale-110' 
                          : 'border-[#E5E7EB] hover:border-gray-300'
                      }`}
                    >
                      <img 
                        className="w-full h-full rounded-full" 
                        src="/images/pencil-flood-eraser/pencil.png" 
                        alt="Pencil tool"
                      />
                    </button>
                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, drawingMode: 'fill' }));
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
                        state.drawingMode === 'fill'
                          ? 'border-green-600 scale-110'
                          : 'border-[#E5E7EB] hover:border-gray-300'
                      }`}
                    >
                      <img 
                        className="w-full h-full rounded-full" 
                        src="/images/pencil-flood-eraser/floodandfill.png" 
                        alt="Flood fill tool"
                      />
                    </button>
                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, drawingMode: 'eraser' }));
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
                        state.drawingMode === 'eraser'
                          ? 'border-red-600 scale-110'
                          : 'border-[#E5E7EB] hover:border-gray-300'
                      }`}
                    >
                      <img 
                        className="w-full h-full rounded-full" 
                        src="/images/pencil-flood-eraser/eraser.png" 
                        alt="Eraser tool"
                      />
                    </button>
                  </div>
                  
                  {/* Size Controls */}
                  {(state.drawingMode === 'pencil' || state.drawingMode === 'eraser') && (
                    <div className="flex items-center gap-3 justify-center mb-3">
                      <label className="text-sm text-gray-600">
                        {state.drawingMode === 'pencil' ? 'Pensel Størrelse:' : 'Viskelær Størrelse:'}
                      </label>
                      <input
                        type="range"
                        min={state.drawingMode === 'pencil' ? "1" : "5"}
                        max={state.drawingMode === 'pencil' ? "20" : "50"}
                        value={state.drawingMode === 'pencil' ? state.pencilSize : state.eraserSize}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          if (state.drawingMode === 'pencil') {
                            setState(prev => ({ ...prev, pencilSize: size }));
                          } else {
                            setState(prev => ({ ...prev, eraserSize: size }));
                          }
                        }}
                        className="flex-1 max-w-32"
                      />
                      <span className="text-sm text-gray-600 min-w-12">
                        {state.drawingMode === 'pencil' ? state.pencilSize : state.eraserSize}px
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <MobileColorPicker
                selectedColor={state.currentColor}
                onColorChange={(color: string) => setState(prev => ({ ...prev, currentColor: color }))}
                activeThemeId={activeThemeId}
                onThemeChange={setActiveThemeId}
                showMobileTools={showMobileTools}
                onToggleTools={() => setShowMobileTools(!showMobileTools)}
              />
            </div>
      </div>
    </div>
  )
} 