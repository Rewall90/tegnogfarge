import type { ViewportState, CanvasCoordinates, ScreenCoordinates } from './types';
import { VIEWPORT_CONFIG } from './constants';

interface LogicalCoordinates {
  x: number;  // CSS pixels after transform undo
  y: number;  // CSS pixels after transform undo
}

/**
 * CSSTransformCoordinateMapper - Primary coordinate conversion class
 * Implements the 3-step transformation: screen → logical → canvas pixels
 */
export class CSSTransformCoordinateMapper {
  private viewportState: ViewportState;
  private containerElement: HTMLElement;
  
  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
    this.viewportState = { scale: 1, panX: 0, panY: 0, mode: 'draw' };
  }
  
  /**
   * Update viewport state for coordinate calculations
   */
  updateViewportState(state: ViewportState): void {
    this.viewportState = { ...state };
  }
  
  /**
   * Get current viewport state
   */
  getViewportState(): ViewportState {
    return { ...this.viewportState };
  }
  
  /**
   * Get container bounding rectangle
   */
  getContainerRect(): DOMRect {
    return this.containerElement.getBoundingClientRect();
  }
  
  /**
   * Main coordinate conversion: Screen to Canvas
   * 3-step process: screen → container → logical → canvas pixels
   */
  toCanvasCoords(screenX: number, screenY: number): CanvasCoordinates {
    // Step 1: Screen to container coordinates
    const containerCoords = this.screenToContainer(screenX, screenY);
    
    // Step 2: Undo CSS transform (container to logical)
    const logicalCoords = this.containerToLogical(containerCoords.x, containerCoords.y);
    
    // Step 3: Apply Device Pixel Ratio (logical to canvas)
    const canvasCoords = this.logicalToCanvas(logicalCoords.x, logicalCoords.y);
    
    return canvasCoords;
  }
  
  /**
   * Convert screen coordinates to container-relative coordinates
   */
  private screenToContainer(screenX: number, screenY: number): { x: number, y: number } {
    const rect = this.containerElement.getBoundingClientRect();
    return {
      x: screenX - rect.left,
      y: screenY - rect.top
    };
  }
  
  /**
   * Undo CSS transform to get logical coordinates
   */
  private containerToLogical(containerX: number, containerY: number): LogicalCoordinates {
    // Undo CSS transform: subtract pan, divide by scale
    const logicalX = (containerX - this.viewportState.panX) / this.viewportState.scale;
    const logicalY = (containerY - this.viewportState.panY) / this.viewportState.scale;
    
    return { x: logicalX, y: logicalY };
  }
  
  /**
   * Convert logical coordinates to canvas pixel coordinates
   */
  private logicalToCanvas(logicalX: number, logicalY: number): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    
    // Map to internal canvas pixels with DPR scaling
    const canvasX = Math.round(logicalX * dpr);
    const canvasY = Math.round(logicalY * dpr);
    
    return { x: canvasX, y: canvasY };
  }
  
  /**
   * Reverse conversion: Canvas to Screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): ScreenCoordinates {
    // Step 1: Canvas to logical coordinates
    const logicalCoords = this.canvasToLogical(canvasX, canvasY);
    
    // Step 2: Apply CSS transform (logical to container)
    const containerCoords = this.logicalToContainer(logicalCoords.x, logicalCoords.y);
    
    // Step 3: Container to screen coordinates
    const screenCoords = this.containerToScreen(containerCoords.x, containerCoords.y);
    
    return screenCoords;
  }
  
  /**
   * Convert canvas coordinates to logical coordinates
   */
  private canvasToLogical(canvasX: number, canvasY: number): LogicalCoordinates {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: canvasX / dpr,
      y: canvasY / dpr
    };
  }
  
  /**
   * Apply CSS transform to logical coordinates
   */
  private logicalToContainer(logicalX: number, logicalY: number): { x: number, y: number } {
    return {
      x: logicalX * this.viewportState.scale + this.viewportState.panX,
      y: logicalY * this.viewportState.scale + this.viewportState.panY
    };
  }
  
  /**
   * Convert container coordinates to screen coordinates
   */
  private containerToScreen(containerX: number, containerY: number): ScreenCoordinates {
    const rect = this.containerElement.getBoundingClientRect();
    return {
      x: containerX + rect.left,
      y: containerY + rect.top
    };
  }
  
  /**
   * Check if coordinates are within canvas bounds
   */
  isWithinCanvasBounds(coords: CanvasCoordinates): boolean {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    return coords.x >= 0 && coords.x < maxX && 
           coords.y >= 0 && coords.y < maxY;
  }
  
  /**
   * Clamp coordinates to canvas bounds
   */
  clampToCanvasBounds(coords: CanvasCoordinates): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    return {
      x: Math.max(0, Math.min(maxX - 1, coords.x)),
      y: Math.max(0, Math.min(maxY - 1, coords.y))
    };
  }
  
  /**
   * Get detailed transformation info for debugging
   */
  getTransformationInfo(screenX: number, screenY: number): {
    screen: ScreenCoordinates;
    container: { x: number; y: number };
    logical: LogicalCoordinates;
    canvas: CanvasCoordinates;
    isValid: boolean;
    dpr: number;
    viewport: ViewportState;
  } {
    const containerCoords = this.screenToContainer(screenX, screenY);
    const logicalCoords = this.containerToLogical(containerCoords.x, containerCoords.y);
    const canvasCoords = this.logicalToCanvas(logicalCoords.x, logicalCoords.y);
    
    return {
      screen: { x: screenX, y: screenY },
      container: containerCoords,
      logical: logicalCoords,
      canvas: canvasCoords,
      isValid: this.isWithinCanvasBounds(canvasCoords),
      dpr: window.devicePixelRatio || 1,
      viewport: this.getViewportState()
    };
  }
  
  /**
   * Test coordinate accuracy with known values
   */
  testCoordinateAccuracy(expectedMappings: Array<{
    screen: ScreenCoordinates;
    expected: CanvasCoordinates;
    tolerance?: number;
  }>): {
    passed: number;
    failed: number;
    results: Array<{ passed: boolean; actualCanvas: CanvasCoordinates; expectedCanvas: CanvasCoordinates; error: number }>;
  } {
    const results = expectedMappings.map(mapping => {
      const actualCanvas = this.toCanvasCoords(mapping.screen.x, mapping.screen.y);
      const tolerance = mapping.tolerance || 1;
      
      const errorX = Math.abs(actualCanvas.x - mapping.expected.x);
      const errorY = Math.abs(actualCanvas.y - mapping.expected.y);
      const error = Math.max(errorX, errorY);
      
      return {
        passed: error <= tolerance,
        actualCanvas,
        expectedCanvas: mapping.expected,
        error
      };
    });
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    return { passed, failed, results };
  }
}