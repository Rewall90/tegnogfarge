/**
 * FloodFillTool - Enhanced flood fill tool with pixel-perfect coordinate handling
 * Critical implementation for accurate flood fill across all zoom levels
 */

import type { CanvasCoordinates, ViewportMode } from './types';
import { ToolCoordinateHandler } from './ToolCoordinateHandler';
import { ViewportManager } from './ViewportManager';

interface FloodFillSettings {
  color: string;
  tolerance: number;
  antiAlias: boolean;
  contiguous: boolean;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface DrawingTool {
  enable?(): void;
  disable?(): void;
  handlePointerStart?(e: PointerEvent): void;
  handlePointerMove?(e: PointerEvent): void;
  handlePointerEnd?(e: PointerEvent): void;
}

export class FloodFillTool implements DrawingTool {
  private coordinateHandler: ToolCoordinateHandler;
  private viewportManager: ViewportManager;
  private fillCanvas: HTMLCanvasElement;
  private enabled = true;
  private isProcessing = false;
  
  // Flood fill settings
  private settings: FloodFillSettings = {
    color: '#FF0000',
    tolerance: 0,
    antiAlias: false,
    contiguous: true
  };

  constructor(
    coordinateHandler: ToolCoordinateHandler,
    viewportManager: ViewportManager,
    fillCanvas: HTMLCanvasElement
  ) {
    this.coordinateHandler = coordinateHandler;
    this.viewportManager = viewportManager;
    this.fillCanvas = fillCanvas;
  }

  /**
   * Enable the flood fill tool
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable the flood fill tool
   */
  disable(): void {
    this.enabled = false;
    this.isProcessing = false;
  }

  /**
   * Handle pointer start (flood fill on click)
   */
  handlePointerStart(e: PointerEvent): void {
    if (!this.enabled || this.isProcessing || this.viewportManager.getState().mode !== 'draw') {
      return;
    }

    this.handleClick(e);
    e.preventDefault();
  }

  /**
   * Handle pointer move (no action for flood fill)
   */
  handlePointerMove(e: PointerEvent): void {
    // Flood fill doesn't respond to move events
  }

  /**
   * Handle pointer end (no action for flood fill)
   */
  handlePointerEnd(e: PointerEvent): void {
    // Flood fill doesn't respond to end events
  }

  /**
   * Handle click event for flood fill
   */
  private handleClick(e: PointerEvent): void {
    if (this.isProcessing) {
      console.warn('Flood fill already in progress');
      return;
    }

    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    
    // Critical: Validate and ensure pixel-perfect coordinates
    const validation = this.coordinateHandler.validateFloodFillCoordinates(coords);
    if (!validation.isValid) {
      console.warn('Invalid flood fill coordinates:', validation.issues);
      
      if (validation.safeCoords) {
        console.info('Using safe coordinates:', validation.safeCoords);
        this.performFloodFill(validation.safeCoords);
      }
      return;
    }

    this.performFloodFill(coords);
  }

  /**
   * Perform the flood fill operation
   */
  private async performFloodFill(coords: CanvasCoordinates): Promise<void> {
    this.isProcessing = true;

    try {
      const ctx = this.fillCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Get image data for flood fill algorithm
      const imageData = ctx.getImageData(0, 0, this.fillCanvas.width, this.fillCanvas.height);
      
      // Convert coordinates to DPR-adjusted pixel coordinates
      const dpr = window.devicePixelRatio || 1;
      const pixelX = Math.round(coords.x * dpr);
      const pixelY = Math.round(coords.y * dpr);

      // Validate pixel coordinates against actual image data
      if (pixelX < 0 || pixelX >= imageData.width || pixelY < 0 || pixelY >= imageData.height) {
        throw new Error(`Pixel coordinates out of bounds: (${pixelX}, ${pixelY}), max: (${imageData.width - 1}, ${imageData.height - 1})`);
      }

      // Get target color at click position
      const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
      const targetColor: Color = {
        r: imageData.data[pixelIndex],
        g: imageData.data[pixelIndex + 1],
        b: imageData.data[pixelIndex + 2],
        a: imageData.data[pixelIndex + 3]
      };

      // Parse fill color
      const fillColor = this.parseColor(this.settings.color);

      // Check if target color is already the fill color
      if (this.colorsEqual(targetColor, fillColor, this.settings.tolerance)) {
        console.info('Target color is already the fill color, no action needed');
        return;
      }

      // Perform flood fill algorithm
      const pixelsChanged = this.settings.contiguous
        ? this.floodFillContiguous(imageData, pixelX, pixelY, targetColor, fillColor)
        : this.floodFillNonContiguous(imageData, targetColor, fillColor);

      if (pixelsChanged > 0) {
        // Apply the changes back to canvas
        ctx.putImageData(imageData, 0, 0);
        console.debug(`Flood fill completed: ${pixelsChanged} pixels changed`);
        
        // Emit completion event for undo/redo system
        this.onFloodFillComplete(coords, pixelsChanged);
      } else {
        console.info('No pixels were changed during flood fill');
      }

    } catch (error) {
      console.error('Flood fill failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Contiguous flood fill algorithm (4-connected)
   */
  private floodFillContiguous(
    imageData: ImageData,
    startX: number,
    startY: number,
    targetColor: Color,
    fillColor: Color
  ): number {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
    const visited = new Set<string>();
    let pixelsChanged = 0;

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const key = `${x},${y}`;

      // Skip if already visited or out of bounds
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      visited.add(key);

      // Get pixel color
      const pixelIndex = (y * width + x) * 4;
      const currentColor: Color = {
        r: data[pixelIndex],
        g: data[pixelIndex + 1],
        b: data[pixelIndex + 2],
        a: data[pixelIndex + 3]
      };

      // Check if pixel matches target color within tolerance
      if (!this.colorsEqual(currentColor, targetColor, this.settings.tolerance)) {
        continue;
      }

      // Fill the pixel
      data[pixelIndex] = fillColor.r;
      data[pixelIndex + 1] = fillColor.g;
      data[pixelIndex + 2] = fillColor.b;
      data[pixelIndex + 3] = fillColor.a;
      pixelsChanged++;

      // Add neighboring pixels to stack (4-connected)
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    return pixelsChanged;
  }

  /**
   * Non-contiguous flood fill (fill all pixels of target color)
   */
  private floodFillNonContiguous(
    imageData: ImageData,
    targetColor: Color,
    fillColor: Color
  ): number {
    const data = imageData.data;
    let pixelsChanged = 0;

    // Iterate through all pixels
    for (let i = 0; i < data.length; i += 4) {
      const currentColor: Color = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
      };

      if (this.colorsEqual(currentColor, targetColor, this.settings.tolerance)) {
        data[i] = fillColor.r;
        data[i + 1] = fillColor.g;
        data[i + 2] = fillColor.b;
        data[i + 3] = fillColor.a;
        pixelsChanged++;
      }
    }

    return pixelsChanged;
  }

  /**
   * Parse color string to Color object
   */
  private parseColor(colorString: string): Color {
    // Handle hex colors
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      if (hex.length === 3) {
        // Short hex format (#RGB)
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
          a: 255
        };
      } else if (hex.length === 6) {
        // Long hex format (#RRGGBB)
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
          a: 255
        };
      }
    }

    // Handle RGB/RGBA colors
    const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3]),
        a: rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255
      };
    }

    // Fallback to black
    console.warn('Could not parse color:', colorString);
    return { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * Check if two colors are equal within tolerance
   */
  private colorsEqual(color1: Color, color2: Color, tolerance: number): boolean {
    if (tolerance === 0) {
      return color1.r === color2.r && 
             color1.g === color2.g && 
             color1.b === color2.b && 
             color1.a === color2.a;
    }

    // Calculate color distance
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    const da = color1.a - color2.a;
    
    const distance = Math.sqrt(dr * dr + dg * dg + db * db + da * da);
    const maxDistance = tolerance * Math.sqrt(4 * 255 * 255); // Maximum possible distance
    
    return distance <= maxDistance;
  }

  /**
   * Handle flood fill completion (for undo/redo integration)
   */
  private onFloodFillComplete(coords: CanvasCoordinates, pixelsChanged: number): void {
    // This is where you would integrate with an undo/redo system
    console.debug('Flood fill completed:', { coords, pixelsChanged, settings: this.settings });
    
    // Could emit an event here for external systems
    // this.emit('floodFillComplete', { coords, pixelsChanged, settings: { ...this.settings } });
  }

  /**
   * Set fill color
   */
  setFillColor(color: string): void {
    this.settings.color = color;
  }

  /**
   * Get fill color
   */
  getFillColor(): string {
    return this.settings.color;
  }

  /**
   * Set color tolerance for flood fill
   */
  setTolerance(tolerance: number): void {
    this.settings.tolerance = Math.max(0, Math.min(1, tolerance));
  }

  /**
   * Get color tolerance
   */
  getTolerance(): number {
    return this.settings.tolerance;
  }

  /**
   * Set contiguous mode
   */
  setContiguous(contiguous: boolean): void {
    this.settings.contiguous = contiguous;
  }

  /**
   * Get contiguous mode
   */
  isContiguous(): boolean {
    return this.settings.contiguous;
  }

  /**
   * Set anti-aliasing
   */
  setAntiAlias(antiAlias: boolean): void {
    this.settings.antiAlias = antiAlias;
  }

  /**
   * Get anti-aliasing setting
   */
  isAntiAlias(): boolean {
    return this.settings.antiAlias;
  }

  /**
   * Get all settings
   */
  getSettings(): FloodFillSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<FloodFillSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Check if tool is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if flood fill is currently processing
   */
  isActive(): boolean {
    return this.isProcessing;
  }

  /**
   * Test flood fill at specific coordinates (for testing)
   */
  async testFill(coords: CanvasCoordinates): Promise<boolean> {
    const validation = this.coordinateHandler.validateFloodFillCoordinates(coords);
    if (!validation.isValid) {
      return false;
    }

    try {
      await this.performFloodFill(coords);
      return true;
    } catch (error) {
      console.error('Test flood fill failed:', error);
      return false;
    }
  }

  /**
   * Get tool information for UI
   */
  getToolInfo(): {
    name: string;
    isActive: boolean;
    isEnabled: boolean;
    settings: FloodFillSettings;
  } {
    return {
      name: 'FloodFill',
      isActive: this.isProcessing,
      isEnabled: this.enabled,
      settings: this.getSettings()
    };
  }

  /**
   * Reset tool to default state
   */
  reset(): void {
    this.isProcessing = false;
    this.settings = {
      color: '#FF0000',
      tolerance: 0,
      antiAlias: false,
      contiguous: true
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.isProcessing = false;
    this.enabled = false;
  }
}