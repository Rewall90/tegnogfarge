import type { CanvasCoordinates, ScreenCoordinates } from './types';
import { CSSTransformCoordinateMapper } from './CSSTransformCoordinateMapper';

interface LogicalCoordinates {
  x: number;
  y: number;
}

/**
 * ReverseCoordinateMapper - Canvas to Screen coordinate conversion
 * For UI elements that need to align with canvas content
 */
export class ReverseCoordinateMapper {
  private coordinateMapper: CSSTransformCoordinateMapper;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateMapper = coordinateMapper;
  }
  
  /**
   * Convert canvas coordinates to screen coordinates
   * Reverse of the main coordinate conversion pipeline
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
    const state = this.coordinateMapper.getViewportState();
    return {
      x: logicalX * state.scale + state.panX,
      y: logicalY * state.scale + state.panY
    };
  }
  
  /**
   * Convert container coordinates to screen coordinates
   */
  private containerToScreen(containerX: number, containerY: number): ScreenCoordinates {
    const rect = this.coordinateMapper.getContainerRect();
    return {
      x: containerX + rect.left,
      y: containerY + rect.top
    };
  }
  
  /**
   * Convert logical coordinates to screen coordinates
   */
  logicalToScreen(logicalX: number, logicalY: number): ScreenCoordinates {
    const containerCoords = this.logicalToContainer(logicalX, logicalY);
    return this.containerToScreen(containerCoords.x, containerCoords.y);
  }
  
  /**
   * Get screen position for canvas rectangle
   */
  canvasRectToScreen(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const topLeft = this.canvasToScreen(rect.x, rect.y);
    const bottomRight = this.canvasToScreen(rect.x + rect.width, rect.y + rect.height);
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }
  
  /**
   * Convert multiple canvas coordinates to screen coordinates
   */
  batchCanvasToScreen(canvasCoords: CanvasCoordinates[]): ScreenCoordinates[] {
    return canvasCoords.map(coord => this.canvasToScreen(coord.x, coord.y));
  }
  
  /**
   * Get screen bounds for entire canvas
   */
  getCanvasScreenBounds(): {
    topLeft: ScreenCoordinates;
    topRight: ScreenCoordinates;
    bottomLeft: ScreenCoordinates;
    bottomRight: ScreenCoordinates;
    width: number;
    height: number;
  } {
    const dpr = window.devicePixelRatio || 1;
    const maxX = 2550 * dpr;
    const maxY = 3300 * dpr;
    
    const topLeft = this.canvasToScreen(0, 0);
    const topRight = this.canvasToScreen(maxX, 0);
    const bottomLeft = this.canvasToScreen(0, maxY);
    const bottomRight = this.canvasToScreen(maxX, maxY);
    
    return {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      width: topRight.x - topLeft.x,
      height: bottomLeft.y - topLeft.y
    };
  }
  
  /**
   * Check if screen coordinates are within canvas bounds
   */
  isScreenCoordWithinCanvas(screenX: number, screenY: number): boolean {
    const canvasCoords = this.coordinateMapper.toCanvasCoords(screenX, screenY);
    return this.coordinateMapper.isWithinCanvasBounds(canvasCoords);
  }
  
  /**
   * Get nearest canvas coordinates for screen position
   */
  getNearestCanvasCoords(screenX: number, screenY: number): {
    coords: CanvasCoordinates;
    isWithinBounds: boolean;
    distance: number;
  } {
    const canvasCoords = this.coordinateMapper.toCanvasCoords(screenX, screenY);
    const isWithinBounds = this.coordinateMapper.isWithinCanvasBounds(canvasCoords);
    
    let nearestCoords = canvasCoords;
    let distance = 0;
    
    if (!isWithinBounds) {
      nearestCoords = this.coordinateMapper.clampToCanvasBounds(canvasCoords);
      
      // Calculate distance to nearest valid point
      const dx = nearestCoords.x - canvasCoords.x;
      const dy = nearestCoords.y - canvasCoords.y;
      distance = Math.sqrt(dx * dx + dy * dy);
    }
    
    return {
      coords: nearestCoords,
      isWithinBounds,
      distance
    };
  }
  
  /**
   * Test reverse coordinate accuracy
   */
  testReverseAccuracy(testCoords: CanvasCoordinates[]): {
    totalTests: number;
    passedTests: number;
    maxError: number;
    avgError: number;
    results: Array<{
      original: CanvasCoordinates;
      screen: ScreenCoordinates;
      backToCanvas: CanvasCoordinates;
      error: number;
      passed: boolean;
    }>;
  } {
    const results = testCoords.map(originalCoords => {
      // Convert to screen and back
      const screenCoords = this.canvasToScreen(originalCoords.x, originalCoords.y);
      const backToCanvas = this.coordinateMapper.toCanvasCoords(screenCoords.x, screenCoords.y);
      
      // Calculate error
      const dx = backToCanvas.x - originalCoords.x;
      const dy = backToCanvas.y - originalCoords.y;
      const error = Math.sqrt(dx * dx + dy * dy);
      
      // Consider test passed if error is less than 1 pixel
      const passed = error < 1.0;
      
      return {
        original: originalCoords,
        screen: screenCoords,
        backToCanvas,
        error,
        passed
      };
    });
    
    const passedTests = results.filter(r => r.passed).length;
    const errors = results.map(r => r.error);
    const maxError = Math.max(...errors);
    const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    
    return {
      totalTests: results.length,
      passedTests,
      maxError,
      avgError,
      results
    };
  }
  
  /**
   * Get transformation info for debugging
   */
  getTransformationDebugInfo(canvasX: number, canvasY: number): {
    canvas: CanvasCoordinates;
    logical: LogicalCoordinates;
    container: { x: number; y: number };
    screen: ScreenCoordinates;
    viewport: any;
    dpr: number;
  } {
    const logical = this.canvasToLogical(canvasX, canvasY);
    const container = this.logicalToContainer(logical.x, logical.y);
    const screen = this.containerToScreen(container.x, container.y);
    
    return {
      canvas: { x: canvasX, y: canvasY },
      logical,
      container,
      screen,
      viewport: this.coordinateMapper.getViewportState(),
      dpr: window.devicePixelRatio || 1
    };
  }
  
  /**
   * Create UI element positioning helper
   */
  createUIPositioner(): {
    positionElement: (element: HTMLElement, canvasX: number, canvasY: number) => void;
    positionRelative: (element: HTMLElement, canvasX: number, canvasY: number, offsetX?: number, offsetY?: number) => void;
    followCanvasPoint: (element: HTMLElement, canvasX: number, canvasY: number) => () => void;
  } {
    return {
      /**
       * Position UI element at canvas coordinates
       */
      positionElement: (element: HTMLElement, canvasX: number, canvasY: number) => {
        const screenCoords = this.canvasToScreen(canvasX, canvasY);
        element.style.position = 'absolute';
        element.style.left = `${screenCoords.x}px`;
        element.style.top = `${screenCoords.y}px`;
      },
      
      /**
       * Position UI element relative to canvas coordinates
       */
      positionRelative: (element: HTMLElement, canvasX: number, canvasY: number, offsetX = 0, offsetY = 0) => {
        const screenCoords = this.canvasToScreen(canvasX, canvasY);
        element.style.position = 'absolute';
        element.style.left = `${screenCoords.x + offsetX}px`;
        element.style.top = `${screenCoords.y + offsetY}px`;
      },
      
      /**
       * Make UI element follow a canvas point
       */
      followCanvasPoint: (element: HTMLElement, canvasX: number, canvasY: number) => {
        const update = () => {
          const screenCoords = this.canvasToScreen(canvasX, canvasY);
          element.style.left = `${screenCoords.x}px`;
          element.style.top = `${screenCoords.y}px`;
        };
        
        // Initial position
        update();
        
        // Return update function for manual calls
        return update;
      }
    };
  }
}