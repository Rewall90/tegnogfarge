/**
 * ToolCoordinateHandler - Unified coordinate mapping for drawing tools
 * Ensures pixel-perfect accuracy across all zoom levels and CSS transforms
 */

import type { CanvasCoordinates, ScreenCoordinates } from './types';
import { CoordinateSystem } from './CoordinateSystem';
import { VIEWPORT_CONFIG } from './constants';

export class ToolCoordinateHandler {
  private coordinateSystem: CoordinateSystem;

  constructor(coordinateSystem: CoordinateSystem) {
    this.coordinateSystem = coordinateSystem;
  }

  /**
   * Get canvas coordinates from pointer event
   * Ensures pixel-perfect accuracy for drawing tools
   */
  getCanvasCoordinates(e: PointerEvent): CanvasCoordinates {
    const coords = this.coordinateSystem.toCanvasCoords(e.clientX, e.clientY);
    
    // Ensure integer coordinates for pixel-perfect drawing
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }

  /**
   * Get canvas coordinates from mouse event (legacy support)
   */
  getCanvasCoordinatesFromMouse(e: MouseEvent): CanvasCoordinates {
    const coords = this.coordinateSystem.toCanvasCoords(e.clientX, e.clientY);
    
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }

  /**
   * Get canvas coordinates from touch event
   */
  getCanvasCoordinatesFromTouch(e: TouchEvent, touchIndex: number = 0): CanvasCoordinates | null {
    if (e.touches.length <= touchIndex) {
      return null;
    }

    const touch = e.touches[touchIndex];
    const coords = this.coordinateSystem.toCanvasCoords(touch.clientX, touch.clientY);
    
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }

  /**
   * Validate coordinates are within canvas bounds
   */
  validateCoordinates(coords: CanvasCoordinates): boolean {
    return this.coordinateSystem.isWithinBounds(coords);
  }

  /**
   * Clamp coordinates to canvas bounds
   */
  clampCoordinates(coords: CanvasCoordinates): CanvasCoordinates {
    return this.coordinateSystem.clampToCanvasBounds(coords);
  }

  /**
   * Validate coordinates specifically for flood fill
   * More strict validation for pixel-perfect flood fill operations
   */
  validateFloodFillCoordinates(coords: CanvasCoordinates): {
    isValid: boolean;
    issues: string[];
    safeCoords?: CanvasCoordinates;
  } {
    const issues: string[] = [];
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;

    // Ensure integer coordinates (critical for flood fill)
    if (!Number.isInteger(coords.x)) {
      issues.push(`X coordinate must be integer, got ${coords.x}`);
    }

    if (!Number.isInteger(coords.y)) {
      issues.push(`Y coordinate must be integer, got ${coords.y}`);
    }

    // Check finite numbers
    if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) {
      issues.push('Coordinates must be finite numbers');
    }

    // Check bounds (accounting for DPR)
    if (coords.x < 0 || coords.x >= maxX) {
      issues.push(`X coordinate out of bounds: ${coords.x} (max: ${maxX - 1})`);
    }

    if (coords.y < 0 || coords.y >= maxY) {
      issues.push(`Y coordinate out of bounds: ${coords.y} (max: ${maxY - 1})`);
    }

    // Generate safe coordinates if there are issues
    let safeCoords: CanvasCoordinates | undefined;
    if (issues.length > 0) {
      safeCoords = {
        x: Math.max(0, Math.min(maxX - 1, Math.round(coords.x))),
        y: Math.max(0, Math.min(maxY - 1, Math.round(coords.y)))
      };
    }

    return {
      isValid: issues.length === 0,
      issues,
      safeCoords
    };
  }

  /**
   * Get screen coordinates from canvas coordinates
   * Useful for UI elements that need to align with canvas content
   */
  toScreenCoordinates(canvasX: number, canvasY: number): ScreenCoordinates {
    return this.coordinateSystem.toScreenCoords(canvasX, canvasY);
  }

  /**
   * Check if a line between two points stays within bounds
   */
  isLineWithinBounds(from: CanvasCoordinates, to: CanvasCoordinates): boolean {
    // Check if both endpoints are within bounds
    if (!this.validateCoordinates(from) || !this.validateCoordinates(to)) {
      return false;
    }

    // For performance, we'll just check the endpoints
    // A more thorough implementation would check the entire line
    return true;
  }

  /**
   * Get interpolated points between two coordinates
   * Useful for smooth brush strokes
   */
  getInterpolatedPoints(
    from: CanvasCoordinates, 
    to: CanvasCoordinates, 
    maxDistance: number = 2
  ): CanvasCoordinates[] {
    const points: CanvasCoordinates[] = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxDistance) {
      return [from, to];
    }

    const steps = Math.ceil(distance / maxDistance);
    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 0; i <= steps; i++) {
      points.push({
        x: Math.round(from.x + stepX * i),
        y: Math.round(from.y + stepY * i)
      });
    }

    return points;
  }

  /**
   * Calculate distance between two canvas coordinates
   */
  calculateDistance(from: CanvasCoordinates, to: CanvasCoordinates): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get coordinates adjusted for device pixel ratio
   * For operations that need to account for high-DPI displays
   */
  getHighDPICoordinates(coords: CanvasCoordinates): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: Math.round(coords.x * dpr),
      y: Math.round(coords.y * dpr)
    };
  }

  /**
   * Convert high-DPI coordinates back to logical coordinates
   */
  fromHighDPICoordinates(coords: CanvasCoordinates): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: Math.round(coords.x / dpr),
      y: Math.round(coords.y / dpr)
    };
  }

  /**
   * Get canvas bounds in current coordinate system
   */
  getCanvasBounds(): {
    width: number;
    height: number;
    maxX: number;
    maxY: number;
  } {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: VIEWPORT_CONFIG.CANVAS_WIDTH,
      height: VIEWPORT_CONFIG.CANVAS_HEIGHT,
      maxX: VIEWPORT_CONFIG.CANVAS_WIDTH * dpr - 1,
      maxY: VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr - 1
    };
  }

  /**
   * Round coordinates to nearest pixel
   * Ensures pixel-perfect positioning
   */
  roundToPixel(coords: CanvasCoordinates): CanvasCoordinates {
    return {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
  }

  /**
   * Check if coordinates have changed significantly
   * Useful for optimizing drawing operations
   */
  hasSignificantChange(
    from: CanvasCoordinates, 
    to: CanvasCoordinates, 
    threshold: number = 1
  ): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return dx >= threshold || dy >= threshold;
  }

  /**
   * Get coordinate transformation info for debugging
   */
  getTransformationInfo(screenX: number, screenY: number): {
    screen: { x: number; y: number };
    canvas: CanvasCoordinates;
    isValid: boolean;
    transformSteps: {
      containerCoords: { x: number; y: number };
      logicalCoords: { x: number; y: number };
      canvasCoords: CanvasCoordinates;
    };
  } {
    const canvasCoords = this.getCanvasCoordinates({ clientX: screenX, clientY: screenY } as PointerEvent);
    
    // Get intermediate transformation steps for debugging
    const containerRect = this.coordinateSystem['containerElement']?.getBoundingClientRect();
    const containerCoords = containerRect ? {
      x: screenX - containerRect.left,
      y: screenY - containerRect.top
    } : { x: screenX, y: screenY };

    // This is a simplified version - the actual CoordinateSystem has more complex logic
    const logicalCoords = {
      x: (containerCoords.x - (this.coordinateSystem['viewportState']?.panX || 0)) / (this.coordinateSystem['viewportState']?.scale || 1),
      y: (containerCoords.y - (this.coordinateSystem['viewportState']?.panY || 0)) / (this.coordinateSystem['viewportState']?.scale || 1)
    };

    return {
      screen: { x: screenX, y: screenY },
      canvas: canvasCoords,
      isValid: this.validateCoordinates(canvasCoords),
      transformSteps: {
        containerCoords,
        logicalCoords,
        canvasCoords
      }
    };
  }

  /**
   * Batch process multiple coordinates for efficiency
   */
  batchGetCanvasCoordinates(events: Array<{ clientX: number; clientY: number }>): CanvasCoordinates[] {
    return events.map(event => this.getCanvasCoordinates(event as PointerEvent));
  }

  /**
   * Check if coordinate system is ready for use
   */
  isReady(): boolean {
    return this.coordinateSystem['containerElement'] !== null;
  }
}