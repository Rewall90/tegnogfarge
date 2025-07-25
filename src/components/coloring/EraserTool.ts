/**
 * EraserTool - Eraser with black pixel boundary detection
 * 
 * Features:
 * - Uses destination-out composite operation
 * - Black pixel boundary detection (RGB < 50)
 * - Pixel caching for performance
 * - Size control (5-50px range)
 * 
 * This tool allows content removal while respecting coloring book
 * boundaries by preventing erasing of black pixels.
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
  private lastDrawTime = 0;
  private readonly DRAW_THROTTLE = 16;
  private pixelCache: Map<string, boolean> = new Map(); // Cache boundary checks

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true // Need frequent reads for boundary detection
    })!;
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
   * Optimized boundary detection with caching (same as pencil)
   */
  private isBlackPixel(x: number, y: number): boolean {
    const key = `${Math.floor(x)},${Math.floor(y)}`;
    if (this.pixelCache.has(key)) {
      return this.pixelCache.get(key)!;
    }

    if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
      this.pixelCache.set(key, true);
      return true;
    }
    
    const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    const [r, g, b] = imageData.data;
    const isBlack = r < 50 && g < 50 && b < 50;
    
    this.pixelCache.set(key, isBlack);
    return isBlack;
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
    
    // Throttling for performance
    const now = Date.now();
    if (now - this.lastDrawTime < this.DRAW_THROTTLE) return;
    this.lastDrawTime = now;
    
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

  /**
   * Clear pixel cache when canvas changes
   */
  clearCache() {
    this.pixelCache.clear();
  }
}