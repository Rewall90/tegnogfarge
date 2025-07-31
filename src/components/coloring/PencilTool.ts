/**
 * PencilTool - Simple pencil drawing tool
 * 
 * Features:
 * - Uses moveTo() → lineTo() → stroke() pattern
 * - Simple coordinate conversion
 * - Basic drawing state management
 * - Throttled pointer events for performance
 * 
 * This tool allows free drawing anywhere on the canvas.
 * Visual boundaries are handled by overlay canvases.
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
  private onStrokeComplete?: () => void;

  constructor(canvas: HTMLCanvasElement, onStrokeComplete?: () => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: false
    })!;
    this.settings = { color: '#FF0000', size: 25 };
    this.onStrokeComplete = onStrokeComplete;
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


  handlePointerDown(e: PointerEvent) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
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
   * Optimized pointer move with throttling
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

  setColor(color: string) {
    this.settings.color = color; 
  }
  
  setSize(size: number) { 
    this.settings.size = Math.max(1, Math.min(50, size));
    console.log('PencilTool size set to:', this.settings.size, 'from input:', size);
  }

  getSettings() {
    return { ...this.settings };
  }

  isActive() {
    return this.isDrawing;
  }

}