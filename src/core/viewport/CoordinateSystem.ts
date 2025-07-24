import type { 
  ViewportState, 
  Coordinates, 
  CanvasCoordinates, 
  ScreenCoordinates,
  ContainerSize 
} from './types';
import { VIEWPORT_CONFIG } from './constants';

/**
 * CoordinateSystem - All coordinate conversion logic in one place
 * Handles 3-step transformation: screen → logical → canvas pixels
 * Critical for pixel-perfect drawing accuracy
 */
export class CoordinateSystem {
  private viewportState: ViewportState;
  private containerElement: HTMLElement | null = null;

  constructor(initialState: ViewportState) {
    this.viewportState = { ...initialState };
  }

  // Update viewport state when it changes
  updateViewportState(state: ViewportState): void {
    this.viewportState = { ...state };
  }

  // Set container element for coordinate calculations
  setContainerElement(element: HTMLElement): void {
    this.containerElement = element;
  }

  /**
   * Main coordinate conversion: Screen to Canvas
   * 3-step process: screen → logical → canvas pixels
   */
  toCanvasCoords(screenX: number, screenY: number): CanvasCoordinates {
    if (!this.containerElement) {
      console.warn('Container element not set for coordinate conversion');
      return { x: Math.round(screenX), y: Math.round(screenY) };
    }

    // Step 1: Screen to container coordinates
    const containerCoords = this.screenToContainer(screenX, screenY);
    
    // Step 2: Undo CSS transform (container to logical)
    const logicalCoords = this.containerToLogical(containerCoords.x, containerCoords.y);
    
    // Step 3: Apply Device Pixel Ratio (logical to canvas)
    const canvasCoords = this.logicalToCanvas(logicalCoords.x, logicalCoords.y);
    
    return canvasCoords;
  }

  /**
   * Reverse conversion: Canvas to Screen coordinates
   * For UI elements that need to align with canvas content
   */
  toScreenCoords(canvasX: number, canvasY: number): ScreenCoordinates {
    if (!this.containerElement) {
      console.warn('Container element not set for coordinate conversion');
      return { x: canvasX, y: canvasY };
    }

    // Step 1: Canvas to logical coordinates
    const logicalCoords = this.canvasToLogical(canvasX, canvasY);
    
    // Step 2: Apply CSS transform (logical to container)
    const containerCoords = this.logicalToContainer(logicalCoords.x, logicalCoords.y);
    
    // Step 3: Container to screen coordinates
    const screenCoords = this.containerToScreen(containerCoords.x, containerCoords.y);
    
    return screenCoords;
  }

  // Step 1: Screen to container coordinate conversion
  private screenToContainer(screenX: number, screenY: number): Coordinates {
    const rect = this.containerElement!.getBoundingClientRect();
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }

  // Step 2: Undo CSS transform (container to logical coordinates)
  private containerToLogical(containerX: number, containerY: number): Coordinates {
    // Undo CSS transform: subtract pan, divide by scale
    const logicalX = (containerX - this.viewportState.panX) / this.viewportState.scale;
    const logicalY = (containerY - this.viewportState.panY) / this.viewportState.scale;
    
    return { x: logicalX, y: logicalY };
  }

  // Step 3: Apply Device Pixel Ratio (logical to canvas pixels)
  private logicalToCanvas(logicalX: number, logicalY: number): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    
    // Map to internal canvas pixels with DPR scaling
    const canvasX = Math.round(logicalX * dpr);
    const canvasY = Math.round(logicalY * dpr);
    
    return { x: canvasX, y: canvasY };
  }

  // Reverse Step 3: Canvas to logical coordinates
  private canvasToLogical(canvasX: number, canvasY: number): Coordinates {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: canvasX / dpr,
      y: canvasY / dpr
    };
  }

  // Reverse Step 2: Apply CSS transform (logical to container)
  private logicalToContainer(logicalX: number, logicalY: number): Coordinates {
    return {
      x: logicalX * this.viewportState.scale + this.viewportState.panX,
      y: logicalY * this.viewportState.scale + this.viewportState.panY
    };
  }

  // Reverse Step 1: Container to screen coordinates
  private containerToScreen(containerX: number, containerY: number): ScreenCoordinates {
    const rect = this.containerElement!.getBoundingClientRect();
    return {
      x: containerX + rect.left,
      y: containerY + rect.top
    };
  }

  // Validation and bounds checking
  isWithinCanvasBounds(coords: CanvasCoordinates): boolean {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    return coords.x >= 0 && coords.x < maxX && 
           coords.y >= 0 && coords.y < maxY;
  }

  clampToCanvasBounds(coords: CanvasCoordinates): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    return {
      x: Math.max(0, Math.min(maxX - 1, coords.x)),
      y: Math.max(0, Math.min(maxY - 1, coords.y))
    };
  }

  // Pixel precision utilities (critical for flood fill)
  ensurePixelPrecision(coords: CanvasCoordinates): CanvasCoordinates {
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }

  // Validate coordinates for flood fill operations
  validateFloodFillCoords(coords: CanvasCoordinates): { 
    isValid: boolean; 
    issues: string[]; 
    safeCoords: CanvasCoordinates;
  } {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    const issues: string[] = [];
    
    // Ensure integer coordinates
    if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) {
      issues.push('Coordinates must be integers for flood fill');
    }
    
    // Check bounds
    if (coords.x < 0 || coords.x >= maxX) {
      issues.push(`X coordinate out of bounds: ${coords.x}`);
    }
    
    if (coords.y < 0 || coords.y >= maxY) {
      issues.push(`Y coordinate out of bounds: ${coords.y}`);
    }
    
    const safeCoords = {
      x: Math.max(0, Math.min(maxX - 1, Math.round(coords.x))),
      y: Math.max(0, Math.min(maxY - 1, Math.round(coords.y)))
    };
    
    return {
      isValid: issues.length === 0,
      issues,
      safeCoords
    };
  }

  // Utility method for getting Device Pixel Ratio info
  getCanvasInfo(): {
    dpr: number;
    logicalSize: { width: number; height: number };
    internalSize: { width: number; height: number };
  } {
    const dpr = window.devicePixelRatio || 1;
    
    return {
      dpr,
      logicalSize: {
        width: VIEWPORT_CONFIG.CANVAS_WIDTH,
        height: VIEWPORT_CONFIG.CANVAS_HEIGHT
      },
      internalSize: {
        width: VIEWPORT_CONFIG.CANVAS_WIDTH * dpr,
        height: VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr
      }
    };
  }
}