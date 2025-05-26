import { useState, useCallback, useRef, useEffect } from 'react';

interface UseColoringOptions {
  drawingId: string;
  initialDrawingUrl: string;
  canvasWidth?: number;
  canvasHeight?: number;
  autoSave?: boolean;
}

export default function useColoring({
  drawingId,
  initialDrawingUrl,
  canvasWidth = 800,
  canvasHeight = 600,
  autoSave = true,
}: UseColoringOptions) {
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drawingImage, setDrawingImage] = useState<HTMLImageElement | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Initialize the canvas and load the drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 1;
    contextRef.current = context;
    
    // Load the drawing image
    const image = new Image();
    image.src = initialDrawingUrl;
    image.onload = () => {
      setDrawingImage(image);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [initialDrawingUrl, canvasWidth, canvasHeight]);
  
  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;
    
    const saveInterval = setInterval(() => {
      saveColoring();
    }, 60000); // Save every minute
    
    return () => clearInterval(saveInterval);
  }, [autoSave]);
  
  const startDrawing = useCallback((x: number, y: number) => {
    const context = contextRef.current;
    if (!context) return;
    
    context.strokeStyle = currentColor;
    context.lineWidth = brushSize;
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  }, [currentColor, brushSize]);
  
  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    
    const context = contextRef.current;
    if (!context) return;
    
    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing]);
  
  const stopDrawing = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;
    
    context.closePath();
    setIsDrawing(false);
  }, []);
  
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (!canvas || !context || !drawingImage) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(drawingImage, 0, 0, canvas.width, canvas.height);
  }, [drawingImage]);
  
  const saveColoring = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsSaving(true);
    
    try {
      const dataUrl = canvas.toDataURL('image/png');
      
      // In a real application, this would send the data to the server
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // const response = await fetch(`/api/colorings`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ drawingId, imageData: dataUrl }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save coloring');
      // }
      
      setLastSaved(new Date());
      console.log('Coloring saved!');
      return true;
    } catch (error) {
      console.error('Error saving coloring:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [drawingId]);
  
  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `coloring-${drawingId}.png`;
    a.click();
  }, [drawingId]);
  
  return {
    canvasRef,
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    isDrawing,
    isSaving,
    lastSaved,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    saveColoring,
    downloadImage,
  };
} 