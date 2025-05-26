import React, { useRef, useState, useEffect } from 'react';

interface ColoringCanvasProps {
  drawingUrl: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ColoringCanvas({ 
  drawingUrl, 
  width = 800, 
  height = 600,
  className = ''
}: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [drawingImage, setDrawingImage] = useState<HTMLImageElement | null>(null);
  
  // Load the drawing image
  useEffect(() => {
    const image = new Image();
    image.src = drawingUrl;
    image.onload = () => {
      setDrawingImage(image);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [drawingUrl]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx || !drawingImage) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the original image
    ctx.drawImage(drawingImage, 0, 0, canvas.width, canvas.height);
  };
  
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'coloring.png';
    link.href = dataUrl;
    link.click();
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="color-picker" className="block text-sm font-medium text-gray-700 mb-1">Farge</label>
          <input
            id="color-picker"
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="h-8 w-8 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="brush-size" className="block text-sm font-medium text-gray-700 mb-1">Penselstørrelse</label>
          <input
            id="brush-size"
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={clearCanvas}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Tøm
          </button>
        </div>
        <div className="flex items-end">
          <button
            onClick={downloadImage}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Last ned
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
} 