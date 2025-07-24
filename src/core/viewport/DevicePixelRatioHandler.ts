import type { CanvasCoordinates } from './types';
import { VIEWPORT_CONFIG } from './constants';

/**
 * DevicePixelRatioHandler - Manages DPR-aware coordinate conversions
 * Handles high-DPI display scaling and canvas setup
 */
export class DevicePixelRatioHandler {
  private readonly CANVAS_WIDTH = VIEWPORT_CONFIG.CANVAS_WIDTH;
  private readonly CANVAS_HEIGHT = VIEWPORT_CONFIG.CANVAS_HEIGHT;
  
  /**
   * Get current device pixel ratio
   */
  getDPR(): number {
    return window.devicePixelRatio || 1;
  }
  
  /**
   * Get internal canvas size (scaled by DPR)
   */
  getInternalCanvasSize(): { width: number, height: number } {
    const dpr = this.getDPR();
    return {
      width: this.CANVAS_WIDTH * dpr,
      height: this.CANVAS_HEIGHT * dpr
    };
  }
  
  /**
   * Get CSS canvas size (logical pixels)
   */
  getCSSCanvasSize(): { width: number, height: number } {
    return {
      width: this.CANVAS_WIDTH,
      height: this.CANVAS_HEIGHT
    };
  }
  
  /**
   * Scale canvas context for device pixel ratio
   */
  scaleContextForDPR(ctx: CanvasRenderingContext2D): void {
    const dpr = this.getDPR();
    
    // Reset any existing scaling
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Apply DPR scaling
    ctx.scale(dpr, dpr);
  }
  
  /**
   * Setup canvas element with proper DPR handling
   */
  setupCanvasElement(canvas: HTMLCanvasElement): void {
    const dpr = this.getDPR();
    const internalSize = this.getInternalCanvasSize();
    const cssSize = this.getCSSCanvasSize();
    
    // Set internal resolution
    canvas.width = internalSize.width;
    canvas.height = internalSize.height;
    
    // Set CSS size
    canvas.style.width = `${cssSize.width}px`;
    canvas.style.height = `${cssSize.height}px`;
    
    // Scale context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.scaleContextForDPR(ctx);
    }
  }
  
  /**
   * Convert logical coordinates to exact canvas pixel coordinates
   */
  logicalToCanvasPixel(logicalX: number, logicalY: number): CanvasCoordinates {
    const dpr = this.getDPR();
    const internalSize = this.getInternalCanvasSize();
    
    // Scale by DPR and ensure integer coordinates
    const canvasX = Math.round(logicalX * dpr);
    const canvasY = Math.round(logicalY * dpr);
    
    // Clamp to canvas bounds
    return {
      x: Math.max(0, Math.min(internalSize.width - 1, canvasX)),
      y: Math.max(0, Math.min(internalSize.height - 1, canvasY))
    };
  }
  
  /**
   * Convert canvas pixel coordinates to logical coordinates
   */
  canvasPixelToLogical(canvasX: number, canvasY: number): { x: number; y: number } {
    const dpr = this.getDPR();
    
    return {
      x: canvasX / dpr,
      y: canvasY / dpr
    };
  }
  
  /**
   * Get pixel-perfect coordinates for drawing operations
   */
  getPixelPerfectCoordinates(coords: CanvasCoordinates): CanvasCoordinates {
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }
  
  /**
   * Check if coordinates are pixel-aligned
   */
  areCoordinatesPixelAligned(coords: CanvasCoordinates): boolean {
    return Number.isInteger(coords.x) && Number.isInteger(coords.y);
  }
  
  /**
   * Get DPR information for debugging
   */
  getDPRInfo(): {
    dpr: number;
    isHighDPI: boolean;
    internalSize: { width: number; height: number };
    cssSize: { width: number; height: number };
    scalingFactor: number;
  } {
    const dpr = this.getDPR();
    
    return {
      dpr,
      isHighDPI: dpr > 1,
      internalSize: this.getInternalCanvasSize(),
      cssSize: this.getCSSCanvasSize(),
      scalingFactor: dpr
    };
  }
  
  /**
   * Test coordinate accuracy at different DPR values
   */
  testDPRAccuracy(testCoordinates: Array<{ x: number; y: number }>): {
    currentDPR: number;
    results: Array<{
      input: { x: number; y: number };
      output: CanvasCoordinates;
      isPixelAligned: boolean;
      scaledCorrectly: boolean;
    }>;
  } {
    const dpr = this.getDPR();
    
    const results = testCoordinates.map(coord => {
      const output = this.logicalToCanvasPixel(coord.x, coord.y);
      const expectedX = Math.round(coord.x * dpr);
      const expectedY = Math.round(coord.y * dpr);
      
      return {
        input: coord,
        output,
        isPixelAligned: this.areCoordinatesPixelAligned(output),
        scaledCorrectly: output.x === expectedX && output.y === expectedY
      };
    });
    
    return {
      currentDPR: dpr,
      results
    };
  }
  
  /**
   * Create DPR-aware image data
   */
  createDPRAwareImageData(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): ImageData {
    const dpr = this.getDPR();
    return ctx.createImageData(width * dpr, height * dpr);
  }
  
  /**
   * Get coordinates for image data access
   */
  getImageDataCoordinates(logicalX: number, logicalY: number): {
    x: number;
    y: number;
    index: number;
    width: number;
  } {
    const dpr = this.getDPR();
    const internalSize = this.getInternalCanvasSize();
    
    const pixelX = Math.round(logicalX * dpr);
    const pixelY = Math.round(logicalY * dpr);
    
    // Calculate index for RGBA array access
    const index = (pixelY * internalSize.width + pixelX) * 4;
    
    return {
      x: pixelX,
      y: pixelY,
      index,
      width: internalSize.width
    };
  }
  
  /**
   * Validate coordinates for image data operations
   */
  validateImageDataCoordinates(coords: CanvasCoordinates): {
    isValid: boolean;
    clampedCoords: CanvasCoordinates;
    issues: string[];
  } {
    const internalSize = this.getInternalCanvasSize();
    const issues: string[] = [];
    
    if (!this.areCoordinatesPixelAligned(coords)) {
      issues.push('Coordinates must be integers for image data access');
    }
    
    if (coords.x < 0 || coords.x >= internalSize.width) {
      issues.push(`X coordinate out of bounds: ${coords.x} (max: ${internalSize.width - 1})`);
    }
    
    if (coords.y < 0 || coords.y >= internalSize.height) {
      issues.push(`Y coordinate out of bounds: ${coords.y} (max: ${internalSize.height - 1})`);
    }
    
    const clampedCoords = {
      x: Math.max(0, Math.min(internalSize.width - 1, Math.round(coords.x))),
      y: Math.max(0, Math.min(internalSize.height - 1, Math.round(coords.y)))
    };
    
    return {
      isValid: issues.length === 0,
      clampedCoords,
      issues
    };
  }
  
  /**
   * Monitor DPR changes
   */
  monitorDPRChanges(callback: (newDPR: number) => void): () => void {
    const mediaQuery = window.matchMedia(`(resolution: ${this.getDPR()}dppx)`);
    
    const handleChange = () => {
      const newDPR = this.getDPR();
      callback(newDPR);
    };
    
    mediaQuery.addListener(handleChange);
    
    // Return cleanup function
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }
}