/**
 * PencilTool - Simple pencil drawing tool
 * 
 * Features:
 * - Uses moveTo() → lineTo() → stroke() pattern
 * - Simple coordinate conversion
 * - Basic drawing state management
 * - Throttled pointer events for performance
 * - Incremental history tracking (pixel changes only)
 * 
 * This tool allows free drawing anywhere on the canvas.
 * Visual boundaries are handled by overlay canvases.
 */

import type { PixelChange } from '@/lib/flood-fill';

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
  private onStrokeComplete?: (changes?: PixelChange[]) => void;
  private beforeStrokeImageData: ImageData | null = null;

  constructor(canvas: HTMLCanvasElement, onStrokeComplete?: (changes?: PixelChange[]) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true  // Changed: we need to read frequently for change detection
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
    
    // Capture canvas state BEFORE starting to draw
    try {
      this.beforeStrokeImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    } catch (error) {
      console.warn('[PencilTool] Failed to capture before-stroke ImageData:', error);
      this.beforeStrokeImageData = null;
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
      
      // Call the completion callback with pixel changes AFTER stroke is done
      if (this.onStrokeComplete) {
        const changes = this.extractPixelChanges();
        this.onStrokeComplete(changes);
      }
      
      // Clean up the before-stroke data
      this.beforeStrokeImageData = null;
    }
  }

  /**
   * Extract pixel changes between before and after stroke
   */
  private extractPixelChanges(): PixelChange[] | undefined {
    if (!this.beforeStrokeImageData) {
      console.warn('[PencilTool] No before-stroke ImageData available');
      return undefined;
    }

    try {
      const afterImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.beforeStrokeImageData.width !== afterImageData.width || 
          this.beforeStrokeImageData.height !== afterImageData.height) {
        console.warn('[PencilTool] ImageData dimensions mismatch');
        return undefined;
      }

      const changes: PixelChange[] = [];
      const beforePixels32 = new Uint32Array(this.beforeStrokeImageData.data.buffer);
      const afterPixels32 = new Uint32Array(afterImageData.data.buffer);

      for (let i = 0; i < beforePixels32.length; i++) {
        if (beforePixels32[i] !== afterPixels32[i]) {
          changes.push({
            index: i,
            oldColor: beforePixels32[i],
            newColor: afterPixels32[i]
          });
        }
      }

      console.log(`[PencilTool] Captured ${changes.length} pixel changes out of ${beforePixels32.length} total pixels`);
      return changes;

    } catch (error) {
      console.error('[PencilTool] Error extracting pixel changes:', error);
      return undefined;
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