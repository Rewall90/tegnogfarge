/**
 * EraserTool - Eraser with black pixel boundary detection
 * Prevents erasing black pixels (coloring book boundaries)
 */

interface EraserSettings {
  size: number;
}

export class EraserTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isErasing = false;
  private settings: EraserSettings;
  private lastPoint: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = { size: 10 };
  }

  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  /**
   * Check if pixel is black (boundary detection)
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
    
    // Don't start erasing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.isErasing = true;
    this.lastPoint = coords;
    
    // Set up eraser (composite operation)
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  handlePointerMove(e: PointerEvent) {
    if (!this.isErasing || !this.lastPoint) return;
    
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't erase black pixels
    if (this.isBlackPixel(coords.x, coords.y)) return;
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastPoint = coords;
  }

  handlePointerUp(e: PointerEvent) {
    this.isErasing = false;
    this.lastPoint = null;
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
  }

  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(50, size)); 
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isErasing;
  }
}