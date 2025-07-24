// Core viewport system types - keeping it simple

export interface ViewportState {
  scale: number;      // Current zoom level (0.25 to 4.0)
  panX: number;       // Pan offset X in CSS pixels
  panY: number;       // Pan offset Y in CSS pixels  
  mode: 'zoom' | 'draw';
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface CanvasCoordinates extends Coordinates {
  // Canvas pixel coordinates (integer values for flood fill)
}

export interface ScreenCoordinates extends Coordinates {
  // Screen/client coordinates (from pointer events)
}

export interface ContainerSize {
  width: number;
  height: number;
}

export interface ViewportBounds {
  minScale: number;
  maxScale: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ViewportConfig {
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  ZOOM_SENSITIVITY: number;
  TARGET_FPS: number;
}

// Event handler types
export type ViewportStateListener = (state: ViewportState) => void;
export type UnsubscribeFunction = () => void;

// Mode types
export type ViewportMode = 'zoom' | 'draw';