/**
 * PencilTool - Pencil drawing with black pixel boundary detection
 * 
 * Features:
 * - Uses moveTo() → lineTo() → stroke() pattern
 * - Black pixel boundary detection (RGB < 50)
 * - Pixel caching for performance
 * - Simple coordinate conversion
 * - Basic drawing state management
 * 
 * This tool respects coloring book boundaries by preventing
 * drawing on black pixels, making it perfect for coloring applications.
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
  private lastDrawTime = 0; // For throttling
  private readonly DRAW_THROTTLE = 16; // ~60fps
  private pixelCache: Map<string, boolean> = new Map(); // Cache boundary checks

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true // Need frequent reads for boundary detection
    })!;
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
   * Optimized boundary detection with caching
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
    const [r, g, b, a] = imageData.data;
    
    // Only consider it a "black pixel" if it's actually opaque AND dark
    // Transparent pixels (a === 0) should be drawable
    const isBlack = a > 0 && r < 50 && g < 50 && b < 50;
    
    
    this.pixelCache.set(key, isBlack);
    return isBlack;
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't start drawing on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) {
      return;
    }
    
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

  /**
   * Optimized pointer move with throttling and boundary detection
   */
  handlePointerMove(e: PointerEvent) {
    if (!this.isDrawing || !this.lastPoint) {
      return;
    }
    
    // Throttling for performance
    const now = Date.now();
    if (now - this.lastDrawTime < this.DRAW_THROTTLE) return;
    this.lastDrawTime = now;
    
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Don't draw on black pixels
    if (this.isBlackPixel(coords.x, coords.y)) {
      return;
    }
    
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

  /**
   * Clear pixel cache when canvas changes
   */
  clearCache() {
    this.pixelCache.clear();
  }
}