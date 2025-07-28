/**
 * FloodFillTool - Flood fill with hardcoded 100% tolerance
 * 
 * Features:
 * - Always uses 100% tolerance (no user control)
 * - Respects black pixel boundaries (RGB < 50)
 * - Optimized scanline algorithm
 * - Fills entire areas except boundaries
 * 
 * This tool provides consistent flood fill behavior by always
 * using maximum tolerance while respecting coloring book boundaries.
 */

export class FloodFillTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true // Need frequent reads for flood fill
    })!;
  }

  private getCanvasCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor((clientX - rect.left) * (this.canvas.width / rect.width)),
      y: Math.floor((clientY - rect.top) * (this.canvas.height / rect.height))
    };
  }

  handleClick(e: PointerEvent, fillColor: string): { x: number; y: number } | null {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Just return the coordinates - don't modify any canvas
    // The actual flood fill will be handled by ColoringApp's performFillAtCoordinates
    return coords;
  }
}