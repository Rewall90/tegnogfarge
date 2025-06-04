'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FloodFill, type PixelChange, type FillRegion } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import ImageSelector from './ImageSelector'
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
  
  // Track brush strokes for optimized rendering
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const currentStrokeRef = useRef<BrushStroke | null>(null);
  
  // Throttling for flood fill operations
  const [isFilling, setIsFilling] = useState(false);
  const fillThrottleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Redraw all fill regions efficiently
  const redrawFillRegions = useCallback((regions: FillRegion[]) => {
    const fillCtx = contextRef.current.fill;
    const fillCanvas = fillCanvasRef.current;
    if (!fillCtx || !fillCanvas) return;
    
    // Forbered rendering i neste animasjonsramme
    requestAnimationFrame(() => {
      // Clear the fill canvas
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
      
      // Skip if no regions to draw
      if (regions.length === 0) return;
      
      // Gå tilbake til ImageData for bedre ytelse, men med sikringsmekanismer
      const imageData = fillCtx.createImageData(fillCanvas.width, fillCanvas.height);
      const pixels32 = new Uint32Array(imageData.data.buffer);
      
      // Beregn "dirty rectangle" - området som faktisk endres
      let minX = fillCanvas.width;
      let minY = fillCanvas.height;
      let maxX = 0;
      let maxY = 0;
      
      // Fyll hver region med sin farge og spor bounds
      let totalPoints = 0;
      regions.forEach(region => {
        if (region.points.length === 0) return;
        
        // Konverter hex-farge til RGBA32
        const r = parseInt(region.color.substr(1, 2), 16);
        const g = parseInt(region.color.substr(3, 2), 16);
        const b = parseInt(region.color.substr(5, 2), 16);
        const color32 = (255 << 24) | (b << 16) | (g << 8) | r;
        
        // Sett alle punkter i regionen
        region.points.forEach(([x, y]) => {
          const idx = y * fillCanvas.width + x;
          if (idx >= 0 && idx < pixels32.length) {
            pixels32[idx] = color32;
            
            // Oppdater bounds
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        });
        
        totalPoints += region.points.length;
      });
      
      // Sikre at vi har gyldig dirtyRectangle
      if (minX > maxX || minY > maxY) {
        return;
      }
      
      // Legg til litt padding rundt det berørte området
      const padding = 2;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(fillCanvas.width - 1, maxX + padding);
      maxY = Math.min(fillCanvas.height - 1, maxY + padding);
      
      // Beregn bredde og høyde på dirty rectangle
      const dirtyWidth = maxX - minX + 1;
      const dirtyHeight = maxY - minY + 1;
      
      // Tegn bare det berørte området (dirty rectangle)
      fillCtx.putImageData(imageData, 0, 0, minX, minY, dirtyWidth, dirtyHeight);
    });
  }, []);

  // Tegn penselstrøk fra snapshots - mye mer minneeffektivt
  const redrawBrushStrokes = useCallback((strokes: BrushStroke[]) => {
    const mainCtx = contextRef.current.main;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCtx || !mainCanvas) return;
    
    // Bruk requestAnimationFrame for å synkronisere med skjermoppdateringer
    requestAnimationFrame(() => {
      // Clear the main canvas
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      
      // Skip if no strokes to draw
      if (strokes.length === 0) return;
      
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
          const testData = bgCtx.getImageData(0, 0, 1, 1);
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
    };
  }, []);

  const handleImageChange = (newImageData: any) => {
    setCurrentImage(newImageData)
    setShowImageSelector(false)
  }

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.drawingMode !== 'brush') return;
    
    // Use cached context
    const ctx = contextRef.current.main;
    const canvas = mainCanvasRef.current;
    
    if (!ctx || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    // Opprett et nytt penselstrøk (uten snapshot ennå)
    currentStrokeRef.current = {
      canvasSnapshot: null,
      color: state.currentColor,
      size: state.brushSize
    };
    
    // Sett opp penselstil
    ctx.fillStyle = state.currentColor;
    
    // Tegn det første punktet
    const radius = Math.max(1, Math.floor(state.brushSize / 2));
    const original = state.originalImageData;
    
    if (original && !isAnyBlackInBrush(original, x, y, radius, 80)) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    setState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y
    }));
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing || state.drawingMode !== 'brush') return;
    
    // Use cached context
    const canvas = mainCanvasRef.current;
    const ctx = contextRef.current.main;
    
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
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
        // Sett opp penselstil
        ctx.fillStyle = state.currentColor;
        
        // Tegn alle punkter i én batch
        pointsToDraw.forEach(({px, py}) => {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }
    
    setState(prev => ({
      ...prev,
      lastX: x,
      lastY: y
    }));
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.drawingMode !== 'fill') return;
    
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
    
    // VIKTIG: Bruk koordinater fra main canvas (den synlige), ikke shadow canvas
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
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
        shadowCtx.putImageData(newImageData, 0, 0, minX, minY, dirtyWidth, dirtyHeight);
        
        // Store the new region and redraw
        const newRegions = [...fillRegions, region];
        setFillRegions(newRegions);
        
        // Redraw all regions efficiently
        redrawFillRegions(newRegions);
        
        // Update history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({ changes, region });
        setHistory(newHistory.slice(-MAX_HISTORY));
        setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
        
        setState(prev => ({
          ...prev,
          imageData: newImageData
        }));
      });
    } else {
      // Fallback to full update if no points (shouldn't happen)
      requestAnimationFrame(() => {
        shadowCtx.putImageData(newImageData, 0, 0);
        
        // Store the new region and redraw
        const newRegions = [...fillRegions, region];
        setFillRegions(newRegions);
        
        // Redraw all regions efficiently
        redrawFillRegions(newRegions);
        
        // Update history
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push({ changes, region });
        setHistory(newHistory.slice(-MAX_HISTORY));
        setHistoryStep(Math.min(newHistory.length - 1, MAX_HISTORY - 1));
        
        setState(prev => ({
          ...prev,
          imageData: newImageData
        }));
      });
    }
    
    // Set a timeout before allowing another fill operation (300ms delay)
    fillThrottleTimeoutRef.current = setTimeout(() => {
      setIsFilling(false);
      fillThrottleTimeoutRef.current = null;
    }, 300);
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

  return (
    <div className="min-h-screen bg-gray-100" ref={appContainerRef}>
      {showImageSelector && (
        <ImageSelector
          currentImageId={currentImage._id}
          categorySlug={currentImage.category.slug}
          subcategorySlug={currentImage.subcategory.slug}
          onSelect={handleImageChange}
          onClose={() => setShowImageSelector(false)}
        />
      )}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/categories/${currentImage.category.slug}/${currentImage.subcategory.slug}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Tilbake
              </button>
              <h1 className="text-xl md:text-2xl font-bold">{currentImage.title}</h1>
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
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <ColorPalette
          selectedColor={state.currentColor}
          onColorSelect={(color) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={currentImage.suggestedColors}
        />
        <div className="flex-1 flex flex-col">
          <ToolBar
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
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto relative">
              {/* Background canvas (contour lines) */}
              <canvas 
                ref={backgroundCanvasRef} 
                className="absolute top-0 left-0 max-w-full w-full h-auto z-0"
                style={{ 
                  imageRendering: 'pixelated',
                  backgroundColor: 'rgba(255, 255, 255, 1)' // white background
                }}
              />
              
              {/* Fill canvas (colored areas only) */}
              <canvas
                ref={fillCanvasRef}
                className="absolute top-0 left-0 max-w-full w-full h-auto z-10"
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
                className="relative max-w-full w-full h-auto bg-transparent shadow-lg cursor-crosshair z-20"
                style={{ 
                  imageRendering: 'pixelated',
                  backgroundColor: 'rgba(255, 255, 255, 0)' // transparent
                }}
              />
              
              {/* Shadow canvas for processing (hidden) */}
              <canvas 
                ref={shadowCanvasRef} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 