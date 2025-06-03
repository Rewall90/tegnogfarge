import type { ColorRGB } from '@/types/canvas-coloring'

export interface PixelChange {
  index: number;
  oldColor: number;
  newColor: number;
}

// New interface for region-based filling
export interface FillRegion {
  points: number[][];  // Array of x,y coordinates that form the region
  color: string;      // Fill color in hex format
}

export class FloodFill {
  private imageData: ImageData
  private tolerance: number
  private width: number
  private height: number
  private pixels: Uint8ClampedArray
  private pixels32: Uint32Array
  private blackThreshold: number
  private stack: Int32Array
  private stackPtr: number = 0
  private visited: Uint8Array // For tracking visited pixels in region collection

  constructor(
    imageData: ImageData,
    tolerance: number = 32,
    blackThreshold: number = 50
  ) {
    this.imageData = imageData
    this.tolerance = tolerance
    this.width = imageData.width
    this.height = imageData.height
    this.pixels = imageData.data
    this.pixels32 = new Uint32Array(imageData.data.buffer)
    this.blackThreshold = blackThreshold
    this.stack = new Int32Array(this.width * this.height * 2)
    this.visited = new Uint8Array(this.width * this.height)
  }

  fill(x: number, y: number, fillColor: string): { 
    imageData: ImageData, 
    changes: PixelChange[],
    region: FillRegion  // New return value
  } {
    console.log(`[FloodFill] Starting fill at (${x},${y}) with color ${fillColor}`);
    
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      console.log(`[FloodFill] Position out of bounds: (${x},${y}), canvas size: ${this.width}x${this.height}`);
      return {
        imageData: this.imageData,
        changes: [],
        region: { points: [], color: fillColor }
      };
    }
    
    const fillRGBA = this.hexToRGBA32(fillColor);
    const startPos = y * this.width + x;
    const startColor = this.pixels32[startPos];
    
    // Log start pixel color for debugging
    const sr = startColor & 0xFF;
    const sg = (startColor >> 8) & 0xFF;
    const sb = (startColor >> 16) & 0xFF;
    console.log(`[FloodFill] Start pixel color: RGB(${sr},${sg},${sb})`);
    
    const changes: PixelChange[] = [];
    const regionPoints: number[][] = [];

    // Reset visited array
    this.visited.fill(0);

    // Sjekk om startpunktet er svart eller samme farge som vi fyller med
    if (this.isProtectedColor(startColor)) {
      console.log(`[FloodFill] Start pixel is protected (black/outline)`);
      return { 
        imageData: this.imageData, 
        changes: [],
        region: { points: [], color: fillColor }
      };
    }
    
    if (this.colorMatches32(startColor, fillRGBA, 0)) {
      console.log(`[FloodFill] Start pixel already has the fill color`);
      return { 
        imageData: this.imageData, 
        changes: [],
        region: { points: [], color: fillColor }
      };
    }

    // Gjenbruk stack-arrayen
    this.stackPtr = 0;
    this.stack[this.stackPtr++] = x;
    this.stack[this.stackPtr++] = y;
    this.visited[startPos] = 1; // Mark start as visited

    // Optimalisert scanline flood fill
    while (this.stackPtr > 0) {
      const py = this.stack[--this.stackPtr];
      const px = this.stack[--this.stackPtr];
      
      // Finn venstre kant av denne linjen
      let leftX = px;
      let pos = py * this.width + leftX;
      
      while (
        leftX > 0 && 
        this.canFill(this.pixels32[pos - 1], startColor, fillRGBA) && 
        this.visited[pos - 1] === 0
      ) {
        leftX--;
        pos = py * this.width + leftX;
      }
      
      // Scan fra venstre til høyre og fyll
      let spanUp = false;
      let spanDown = false;
      
      for (let curX = leftX; curX < this.width; curX++) {
        pos = py * this.width + curX;
        
        // Stopp hvis vi ikke kan fylle denne pikselen
        if (!this.canFill(this.pixels32[pos], startColor, fillRGBA) || this.visited[pos] === 1) {
          break;
        }
        
        // Marker som besøkt
        this.visited[pos] = 1;
        
        // Legg til i regionens punkter
        regionPoints.push([curX, py]);
        
        // Endre fargen
        if (this.pixels32[pos] !== fillRGBA) {
          changes.push({ index: pos, oldColor: this.pixels32[pos], newColor: fillRGBA });
          this.pixels32[pos] = fillRGBA;
        }
        
        // Sjekk pikselen over
        if (py > 0) {
          const upPos = pos - this.width;
          const canFillUp = this.canFill(this.pixels32[upPos], startColor, fillRGBA);
          
          if (!spanUp && canFillUp && this.visited[upPos] === 0) {
            // Start en ny span over
            this.stack[this.stackPtr++] = curX;
            this.stack[this.stackPtr++] = py - 1;
            spanUp = true;
          } else if (spanUp && (!canFillUp || this.visited[upPos] === 1)) {
            // Avslutt nåværende span over
            spanUp = false;
          }
        }
        
        // Sjekk pikselen under
        if (py < this.height - 1) {
          const downPos = pos + this.width;
          const canFillDown = this.canFill(this.pixels32[downPos], startColor, fillRGBA);
          
          if (!spanDown && canFillDown && this.visited[downPos] === 0) {
            // Start en ny span under
            this.stack[this.stackPtr++] = curX;
            this.stack[this.stackPtr++] = py + 1;
            spanDown = true;
          } else if (spanDown && (!canFillDown || this.visited[downPos] === 1)) {
            // Avslutt nåværende span under
            spanDown = false;
          }
        }
      }
    }

    console.log(`[FloodFill] Fill complete. Collected ${regionPoints.length} points, made ${changes.length} changes.`);
    
    // Create the fill region
    const region: FillRegion = {
      points: regionPoints,
      color: fillColor
    };

    return { imageData: this.imageData, changes, region };
  }

  private canFill(color: number, targetColor: number, fillRGBA: number): boolean {
    // Ikke fyll svarte/mørke piksler
    if (this.isProtectedColor(color)) return false;
    // Ikke fyll allerede fylt
    if (color === fillRGBA) return false;
    // Toleranse
    if (this.tolerance === 0) return color === targetColor;
    return this.colorMatches32(color, targetColor, this.tolerance);
  }

  private colorMatches32(color1: number, color2: number, tolerance: number): boolean {
    if (tolerance === 0) return color1 === color2;
    const r1 = color1 & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = (color1 >> 16) & 0xFF;
    const r2 = color2 & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = (color2 >> 16) & 0xFF;
    return (
      Math.abs(r1 - r2) <= tolerance &&
      Math.abs(g1 - g2) <= tolerance &&
      Math.abs(b1 - b2) <= tolerance
    );
  }

  private isProtectedColor(color: number): boolean {
    const r = color & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = (color >> 16) & 0xFF;
    // Senke terskelen litt for å ikke beskytte for mye
    return r < this.blackThreshold && g < this.blackThreshold && b < this.blackThreshold;
  }

  private hexToRGBA32(hex: string): number {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }
} 