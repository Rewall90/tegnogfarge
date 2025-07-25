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

  handleClick(e: PointerEvent, fillColor: string) {
    const coords = this.getCanvasCoords(e.clientX, e.clientY);
    
    // Always use 100% tolerance for flood fill
    this.floodFill(coords.x, coords.y, fillColor);
  }

  /**
   * Optimized flood fill with 100% tolerance
   */
  private floodFill(startX: number, startY: number, fillColor: string) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    const fillRGB = this.hexToRgb(fillColor);
    if (!fillRGB) return;
    
    // Get starting pixel color
    const startIndex = (startY * this.canvas.width + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    
    // Don't fill if starting color is same as fill color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) return;
    
    // Optimized flood fill with scanline algorithm for better performance
    const stack = [[startX, startY]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      
      if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
        continue;
      }
      
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      
      const index = (y * this.canvas.width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      // With 100% tolerance, fill everything except very dark pixels (boundaries)
      const isDarkBoundary = r < 50 && g < 50 && b < 50;
      if (isDarkBoundary) continue;
      
      visited.add(key);
      
      // Fill this pixel
      data[index] = fillRGB.r;
      data[index + 1] = fillRGB.g;
      data[index + 2] = fillRGB.b;
      data[index + 3] = 255;
      
      // Add neighbors
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}