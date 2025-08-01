/**
 * EraserTool - Simple white-paint eraser tool
 * 
 * Features:
 * - Uses moveTo() → lineTo() → stroke() pattern (same as PencilTool)
 * - Fixed white color for erasing effect on white backgrounds
 * - Same performance optimizations as PencilTool
 * - Compatible with existing history/undo system
 * 
 * This tool creates the illusion of erasing by painting white over drawings.
 * Much simpler and more performant than composite operations.
 */

interface EraserSettings {
  size: number;
}

export class EraserTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private settings: EraserSettings;
  private lastPoint: { x: number; y: number } | null = null;
  private lastDrawTime = 0; // For throttling
  private readonly DRAW_THROTTLE = 16; // ~60fps
  private onStrokeComplete?: () => void;

  constructor(canvas: HTMLCanvasElement, onStrokeComplete?: () => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: false
    })!;
    this.settings = { size: 10 };
    this.onStrokeComplete = onStrokeComplete;
  }

  /**
   * Simple coordinate conversion (same as PencilTool)
   */
  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    this.isDrawing = true;
    this.lastPoint = coords;
    
    // Set stroke properties - always white for erasing
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = this.settings.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Start new path
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  /**
   * Optimized pointer move with throttling (same as PencilTool)
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
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastPoint = coords;
  }

  handlePointerUp(e: PointerEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.lastPoint = null;
      
      // Call the completion callback to save state AFTER stroke is done
      if (this.onStrokeComplete) {
        this.onStrokeComplete();
      }
    }
  }

  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(50, size));
    console.log('EraserTool size set to:', this.settings.size, 'from input:', size);
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isDrawing;
  }
}