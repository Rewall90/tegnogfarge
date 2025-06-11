'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FloodFill, type PixelChange, type FillRegion } from '@/lib/flood-fill'
import ColorPalette from './ColorPalette'
import ToolBar from './ToolBar'
import type { ColoringCanvasProps, ColoringState, DrawingMode } from '@/types/canvas-coloring'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

type HistoryStep = {
  changes: PixelChange[];
  region: FillRegion;
};

const MAX_HISTORY = 5

export default function ColoringCanvas({
  drawingId,
  title,
  imageUrl,
  suggestedColors,
  backUrl = '/'
}: ColoringCanvasProps) {
  // Canvas references
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const fillCanvasRef = useRef<HTMLCanvasElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Contexts for canvases
  const contextRef = useRef<{
    background: CanvasRenderingContext2D | null;
    fill: CanvasRenderingContext2D | null;
    main: CanvasRenderingContext2D | null;
    shadow: CanvasRenderingContext2D | null;
  }>({
    background: null,
    fill: null,
    main: null,
    shadow: null
  });
  
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track filled regions for optimized rendering
  const [fillRegions, setFillRegions] = useState<FillRegion[]>([]);
  
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

  // Initialize contexts
  const initializeContexts = useCallback(() => {
    const background = backgroundCanvasRef.current;
    const fill = fillCanvasRef.current;
    const main = mainCanvasRef.current;
    const shadow = shadowCanvasRef.current;
    
    if (background && fill && main && shadow) {
      contextRef.current = {
        background: background.getContext('2d'),
        fill: fill.getContext('2d', { alpha: true }),
        main: main.getContext('2d', { willReadFrequently: true }),
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
    
    // Clear the fill canvas
    fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
    
    // Lag ett ImageData-objekt for alle regioner (mer effektivt)
    const imageData = fillCtx.createImageData(fillCanvas.width, fillCanvas.height);
    const pixels32 = new Uint32Array(imageData.data.buffer);
    
    // Draw each region with its color
    regions.forEach(region => {
      if (region.points.length === 0) return;
      
      // Konverter hex-farge til RGBA32 (gjør dette én gang per region)
      const r = parseInt(region.color.substr(1, 2), 16);
      const g = parseInt(region.color.substr(3, 2), 16);
      const b = parseInt(region.color.substr(5, 2), 16);
      const color32 = (255 << 24) | (b << 16) | (g << 8) | r;
      
      // Fyll inn alle punkter fra regionen
      region.points.forEach(([x, y]) => {
        const idx = y * fillCanvas.width + x;
        if (idx >= 0 && idx < pixels32.length) {
          pixels32[idx] = color32;
        }
      });
    });
    
    // Tegn alle fylte områder på én gang
    fillCtx.putImageData(imageData, 0, 0);
  }, []);

  // Laste inn bilde
  useEffect(() => {
    let isMounted = true
    const loadImage = async () => {
      try {
        if (!isMounted) return
        setIsLoading(true)
        const img = new window.Image()
        imageRef.current = img // Hold på referansen
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (!isMounted) return
          
          // Initialize all canvases
          const background = backgroundCanvasRef.current
          const fill = fillCanvasRef.current
          const main = mainCanvasRef.current
          const shadow = shadowCanvasRef.current
          
          if (!background || !fill || !main || !shadow) {
            console.error('[ColoringCanvas] canvas references missing')
            return
          }
          
          // Set dimensions for all canvases
          background.width = img.width
          background.height = img.height
          fill.width = img.width
          fill.height = img.height
          main.width = img.width
          main.height = img.height
          shadow.width = img.width
          shadow.height = img.height
          
          // Initialize contexts if not already done
          if (!initializeContexts()) {
            console.error('[ColoringCanvas] Failed to initialize contexts')
            return
          }
          
          const { background: bgCtx, fill: fillCtx, main: mainCtx, shadow: shadowCtx } = contextRef.current
          
          if (!bgCtx || !fillCtx || !mainCtx || !shadowCtx) {
            console.error('[ColoringCanvas] Context missing')
            return
          }
          
          // Make sure fill context has global composite operation set correctly
          fillCtx.globalCompositeOperation = 'source-over';
          
          // Draw the image on the background canvas
          bgCtx.clearRect(0, 0, background.width, background.height);
          bgCtx.drawImage(img, 0, 0)
          
          // Verify image was drawn correctly
          try {
            const testData = bgCtx.getImageData(0, 0, 1, 1);
          } catch (err) {
            console.error('[ColoringCanvas] Failed to get background image data:', err);
          }
          
          // Clear the other canvases
          fillCtx.clearRect(0, 0, fill.width, fill.height)
          mainCtx.clearRect(0, 0, main.width, main.height)
          
          // Draw the image on shadow canvas for processing
          shadowCtx.clearRect(0, 0, shadow.width, shadow.height);
          shadowCtx.drawImage(img, 0, 0)
          
          // Get and cache image data
          const imageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height)
          const originalImageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height)
          
          // Reset fill regions
          setFillRegions([])
          
          setState(prev => {
            return {
              ...prev,
              imageData,
              originalImageData,
              history: [imageData],
              historyStep: 0
            }
          })
          
          // Reset history
          setHistory([])
          setHistoryStep(-1)
          
          setIsLoading(false)
        }
        img.onerror = (e) => {
          console.error('[ColoringCanvas] img.onerror', e)
          if (!isMounted) return
          setError('Kunne ikke laste bilde')
          setIsLoading(false)
        }
        img.src = imageUrl
      } catch (err) {
        console.error('[ColoringCanvas] Exception ved lasting av bilde', err)
        setError('En feil oppstod ved lasting av bildet')
        setIsLoading(false)
      }
    }
    loadImage()
    return () => {
      isMounted = false
      imageRef.current = null // Rydd opp
    }
  }, [imageUrl, initializeContexts])

  // Drawing handlers
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.drawingMode !== 'brush') return;
    
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    setState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y
    }));
  }, [state.drawingMode]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing || state.drawingMode !== 'brush') return;
    
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const ctx = contextRef.current.main;
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    if (state.lastX === null || state.lastY === null) return;
    
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = state.currentColor;
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    setState(prev => ({
      ...prev,
      lastX: x,
      lastY: y
    }));
  }, [state.isDrawing, state.drawingMode, state.lastX, state.lastY, state.currentColor, state.brushSize]);

  const stopDrawing = useCallback(() => {
    if (!state.isDrawing) return;
    
    setState(prev => ({
      ...prev,
      isDrawing: false,
      lastX: null,
      lastY: null
    }));
  }, [state.isDrawing]);

  // Combined click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.drawingMode === 'fill') {
      const shadow = shadowCanvasRef.current;
      const main = mainCanvasRef.current;
      if (!shadow || !main || !state.imageData) return;
      if (shadow.width === 0 || shadow.height === 0) return;
      
      const shadowCtx = contextRef.current.shadow;
      if (!shadowCtx) return;
      
      // VIKTIG: Bruk koordinater fra main canvas (den synlige), ikke shadow canvas
      const rect = main.getBoundingClientRect();
      const scaleX = main.width / rect.width;
      const scaleY = main.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      
      // Verifiser at canvas data er OK
      if (state.imageData.width !== shadow.width || state.imageData.height !== shadow.height) {
        const imageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height);
        setState(prev => ({ ...prev, imageData }));
        return; // Venter til neste render
      }
      
      // Sjekk at koordinatene er innenfor canvas
      if (x < 0 || y < 0 || x >= state.imageData.width || y >= state.imageData.height) {
        return;
      }
      
      const floodFill = new FloodFill(state.imageData, state.tolerance, 50);
      const { imageData: newImageData, changes, region } = floodFill.fill(x, y, state.currentColor);
      
      if (changes.length === 0) {
        return;
      }
      
      // Update shadow canvas
      shadowCtx.putImageData(newImageData, 0, 0);
      
      // Add new region
      const newRegions = [...fillRegions, region];
      setFillRegions(newRegions);
      
      // Redraw the regions
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
    }
  }, [state.drawingMode, state.currentColor, state.tolerance, state.imageData, history, historyStep, fillRegions, redrawFillRegions]);

  function applyChanges(pixels32: Uint32Array, changes: PixelChange[], reverse = false) {
    for (const change of changes) {
      pixels32[change.index] = reverse ? change.oldColor : change.newColor
    }
  }

  const handleUndo = useCallback(() => {
    if (historyStep < 0) return
    
    // Remove the last region
    const newRegions = fillRegions.slice(0, -1);
    setFillRegions(newRegions);
    
    // Redraw the regions
    redrawFillRegions(newRegions);
    
    // Update shadow canvas
    const shadowCtx = contextRef.current.shadow;
    const shadow = shadowCanvasRef.current;
    
    if (!shadowCtx || !shadow) return;
    
    // Get current imageData
    const imageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height);
    const pixels32 = new Uint32Array(imageData.data.buffer);
    
    // Apply undo changes
    applyChanges(pixels32, history[historyStep].changes, true);
    shadowCtx.putImageData(imageData, 0, 0);
    
    setHistoryStep(historyStep - 1);
    setState(prev => ({ ...prev, imageData }));
  }, [history, historyStep, fillRegions, redrawFillRegions]);

  const handleRedo = useCallback(() => {
    if (historyStep >= history.length - 1) return;
    
    // Add the next region back
    const redoStep = historyStep + 1;
    if (redoStep < history.length) {
      const regionToRestore = history[redoStep].region;
      const newRegions = [...fillRegions, regionToRestore];
      setFillRegions(newRegions);
      
      // Redraw the regions
      redrawFillRegions(newRegions);
      
      // Update shadow canvas
      const shadowCtx = contextRef.current.shadow;
      const shadow = shadowCanvasRef.current;
      
      if (!shadowCtx || !shadow) return;
      
      // Get current imageData
      const imageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height);
      const pixels32 = new Uint32Array(imageData.data.buffer);
      
      // Apply redo changes
      applyChanges(pixels32, history[redoStep].changes, false);
      shadowCtx.putImageData(imageData, 0, 0);
      
      setHistoryStep(redoStep);
      setState(prev => ({ ...prev, imageData }));
    }
  }, [history, historyStep, fillRegions, redrawFillRegions]);

  // Reset handler
  const handleReset = useCallback(() => {
    if (!state.originalImageData) return
    
    // Clear all regions
    setFillRegions([]);
    
    // Clear the fill canvas
    const fillCtx = contextRef.current.fill;
    const fill = fillCanvasRef.current;
    
    if (fillCtx && fill) {
      fillCtx.clearRect(0, 0, fill.width, fill.height);
    }
    
    // Reset shadow canvas from background
    const shadowCtx = contextRef.current.shadow;
    const bgCtx = contextRef.current.background;
    const shadow = shadowCanvasRef.current;
    const background = backgroundCanvasRef.current;
    
    if (!shadowCtx || !bgCtx || !shadow || !background) return;
    
    // Reset shadow by copying from background
    shadowCtx.clearRect(0, 0, shadow.width, shadow.height);
    shadowCtx.drawImage(background, 0, 0);
    
    // Get fresh imageData
    const imageData = shadowCtx.getImageData(0, 0, shadow.width, shadow.height);
    
    setState(prev => ({
      ...prev,
      imageData,
      history: [imageData],
      historyStep: 0
    }));
    
    // Reset history
    setHistory([]);
    setHistoryStep(-1);
  }, [state.originalImageData]);

  // Download handler
  const handleDownload = useCallback(() => {
    // Create a temporary canvas for download that combines all layers
    const tempCanvas = document.createElement('canvas');
    const background = backgroundCanvasRef.current;
    const fill = fillCanvasRef.current;
    
    if (!background || !fill) return;
    
    tempCanvas.width = background.width;
    tempCanvas.height = background.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    // Draw background layer
    tempCtx.drawImage(background, 0, 0);
    
    // Draw fill layer
    tempCtx.drawImage(fill, 0, 0);
    
    // Add any brush strokes from main canvas
    const main = mainCanvasRef.current;
    if (main) {
      tempCtx.drawImage(main, 0, 0);
    }
    
    // Export as PNG
    tempCanvas.toBlob(blob => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fargelegging-${drawingId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png', 0.95);
  }, [drawingId]);

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleDownload
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Laster fargelegging...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Feil</p>
          <p>{error}</p>
          <Link href={backUrl} className="text-blue-600 hover:underline mt-4 inline-block">
            Gå tilbake
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={backUrl} className="text-blue-600 hover:text-blue-800">
                ← Tilbake
              </Link>
              <h1 className="text-section">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Color palette */}
        <ColorPalette
          selectedColor={state.currentColor}
          onColorSelect={(color: string) => setState(prev => ({ ...prev, currentColor: color }))}
          suggestedColors={suggestedColors}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <ToolBar
            tolerance={state.tolerance}
            onToleranceChange={(t: number) => setState(prev => ({ ...prev, tolerance: t }))}
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

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto relative">
              {/* Background canvas (contour lines) */}
              <canvas 
                ref={backgroundCanvasRef}
                className="absolute top-0 left-0 max-w-full w-full h-auto z-0"
                style={{ imageRendering: 'pixelated' }}
              />
              
              {/* Fill canvas (colored areas only) */}
              <canvas
                ref={fillCanvasRef}
                className="absolute top-0 left-0 max-w-full w-full h-auto z-10"
                style={{ imageRendering: 'pixelated' }}
              />
              
              {/* Main canvas (for brush and user interaction) */}
              <canvas
                ref={mainCanvasRef}
                onClick={handleCanvasClick}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="relative max-w-full w-full h-auto bg-transparent shadow-lg cursor-crosshair z-20"
                style={{ imageRendering: 'pixelated' }}
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