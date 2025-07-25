/**
 * PencilTool - Pencil drawing with black pixel boundary detection
 * Prevents drawing on black pixels (coloring book boundaries)
 */

interface PencilSettings {
  color: string;
  size: number;
}

export class PencilTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private settings: PencilSettings;
  private lastPoint: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = { color: '#000000', size: 3 };
  }

  /**
   * Simple coordinate conversion
   */
  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  /**
   * Check if pixel is black (boundary detection)
   * Returns true for very dark pixels (RGB < 50)
   */
  private isBlackPixel(x: number, y: number): boolean {
    if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
      return true; // Treat out-of-bounds as boundaries
    }
    
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const [r, g, b] = imageData.data;
    return r < 50 && g < 50 && b < 50;
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't start drawing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.isDrawing = true;
    this.lastPoint = coords;
    
    // Set stroke properties
    this.ctx.strokeStyle = this.settings.color;
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Start new path
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  handlePointerMove(e: PointerEvent) {
    if (!this.isDrawing || !this.lastPoint) return;
    
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't draw on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastPoint = coords;
  }

  handlePointerUp(e: PointerEvent) {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  setColor(color: string) { 
    this.settings.color = color; 
  }
  
  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(20, size)); 
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isDrawing;
  }
}