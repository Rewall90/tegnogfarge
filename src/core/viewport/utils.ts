import type { ViewportState, CanvasCoordinates, ViewportBounds } from './types';
import { VIEWPORT_CONFIG } from './constants';

/**
 * Utility functions for viewport calculations and validation
 * Helper functions used across the viewport system
 */

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Check if a number is within a range (inclusive)
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Round to pixel precision (important for flood fill accuracy)
 */
export function roundToPixel(value: number): number {
  return Math.round(value);
}

/**
 * Round coordinates to pixel precision
 */
export function roundCoordsToPixel(coords: CanvasCoordinates): CanvasCoordinates {
  return {
    x: roundToPixel(coords.x),
    y: roundToPixel(coords.y)
  };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  p1: { x: number; y: number }, 
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Validate viewport state values
 */
export function isValidViewportState(state: Partial<ViewportState>): boolean {
  // Check scale
  if (state.scale !== undefined) {
    if (!Number.isFinite(state.scale) || 
        state.scale < VIEWPORT_CONFIG.MIN_ZOOM || 
        state.scale > VIEWPORT_CONFIG.MAX_ZOOM) {
      return false;
    }
  }

  // Check pan values
  if (state.panX !== undefined && !Number.isFinite(state.panX)) {
    return false;
  }
  if (state.panY !== undefined && !Number.isFinite(state.panY)) {
    return false;
  }

  // Check mode
  if (state.mode !== undefined && !['zoom', 'draw'].includes(state.mode)) {
    return false;
  }

  return true;
}

/**
 * Calculate viewport bounds based on container size and canvas dimensions
 */
export function calculateViewportBounds(
  containerWidth: number,
  containerHeight: number,
  scale: number
): ViewportBounds {
  const scaledCanvasWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * scale;
  const scaledCanvasHeight = VIEWPORT_CONFIG.CANVAS_HEIGHT * scale;

  // Calculate maximum pan values to keep canvas visible
  const maxPanX = Math.max(0, containerWidth - scaledCanvasWidth);
  const maxPanY = Math.max(0, containerHeight - scaledCanvasHeight);
  
  // Minimum pan is negative when canvas is larger than container
  const minPanX = Math.min(0, containerWidth - scaledCanvasWidth);
  const minPanY = Math.min(0, containerHeight - scaledCanvasHeight);

  return {
    minPanX,
    maxPanX,
    minPanY,
    maxPanY,
    scaledCanvasWidth,
    scaledCanvasHeight
  };
}

/**
 * Check if coordinates are within canvas bounds
 */
export function isWithinCanvasBounds(coords: CanvasCoordinates): boolean {
  return coords.x >= 0 && 
         coords.x < VIEWPORT_CONFIG.CANVAS_WIDTH &&
         coords.y >= 0 && 
         coords.y < VIEWPORT_CONFIG.CANVAS_HEIGHT;
}

/**
 * Clamp coordinates to canvas bounds
 */
export function clampToCanvasBounds(coords: CanvasCoordinates): CanvasCoordinates {
  return {
    x: clamp(coords.x, 0, VIEWPORT_CONFIG.CANVAS_WIDTH - 1),
    y: clamp(coords.y, 0, VIEWPORT_CONFIG.CANVAS_HEIGHT - 1)
  };
}

/**
 * Get optimal zoom level to fit canvas in container
 */
export function calculateFitToContainerZoom(
  containerWidth: number,
  containerHeight: number
): number {
  const scaleX = containerWidth / VIEWPORT_CONFIG.CANVAS_WIDTH;
  const scaleY = containerHeight / VIEWPORT_CONFIG.CANVAS_HEIGHT;
  
  // Use the smaller scale to ensure entire canvas fits
  const optimalScale = Math.min(scaleX, scaleY);
  
  // Clamp to viewport zoom limits
  return clamp(optimalScale, VIEWPORT_CONFIG.MIN_ZOOM, VIEWPORT_CONFIG.MAX_ZOOM);
}

/**
 * Calculate centered pan position for a given scale and container size
 */
export function calculateCenteredPan(
  containerWidth: number,
  containerHeight: number,
  scale: number
): { panX: number; panY: number } {
  const scaledCanvasWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * scale;
  const scaledCanvasHeight = VIEWPORT_CONFIG.CANVAS_HEIGHT * scale;

  const panX = (containerWidth - scaledCanvasWidth) / 2;
  const panY = (containerHeight - scaledCanvasHeight) / 2;

  return { panX, panY };
}

/**
 * Throttle function execution to once per animation frame
 */
export function throttleToFrame<T extends (...args: any[]) => void>(fn: T): T {
  let scheduled = false;
  
  return ((...args: any[]) => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn(...args);
      });
    }
  }) as T;
}

/**
 * Debounce function execution with a delay
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T, 
  delay: number
): T {
  let timeoutId: number | null = null;
  
  return ((...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;
}

/**
 * Format performance stats for display
 */
export function formatPerformanceStats(stats: {
  fps: number;
  frameCount: number;
  averageFrameTime: number;
}): string {
  return `FPS: ${stats.fps} | Frames: ${stats.frameCount} | Avg: ${stats.averageFrameTime.toFixed(1)}ms`;
}

/**
 * Generate a unique ID for viewport instances
 */
export function generateViewportId(): string {
  return `viewport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone viewport state (for undo/redo functionality)
 */
export function cloneViewportState(state: ViewportState): ViewportState {
  return {
    scale: state.scale,
    panX: state.panX,
    panY: state.panY,
    mode: state.mode
  };
}

/**
 * Compare two viewport states for equality
 */
export function areViewportStatesEqual(
  state1: ViewportState, 
  state2: ViewportState,
  tolerance = 0.001
): boolean {
  return Math.abs(state1.scale - state2.scale) < tolerance &&
         Math.abs(state1.panX - state2.panX) < tolerance &&
         Math.abs(state1.panY - state2.panY) < tolerance &&
         state1.mode === state2.mode;
}

/**
 * Convert viewport state to URL-safe string (for sharing/bookmarking)
 */
export function viewportStateToString(state: ViewportState): string {
  return `${state.scale.toFixed(3)},${state.panX.toFixed(0)},${state.panY.toFixed(0)},${state.mode}`;
}

/**
 * Parse viewport state from URL-safe string
 */
export function viewportStateFromString(str: string): ViewportState | null {
  try {
    const [scaleStr, panXStr, panYStr, mode] = str.split(',');
    
    const state: ViewportState = {
      scale: parseFloat(scaleStr),
      panX: parseFloat(panXStr),
      panY: parseFloat(panYStr),
      mode: mode as 'zoom' | 'draw'
    };

    return isValidViewportState(state) ? state : null;
  } catch {
    return null;
  }
}