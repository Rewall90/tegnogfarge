import type { ViewportConfig } from './types';

// Fixed canvas dimensions (17:22 aspect ratio)
export const CANVAS_WIDTH = 2550;
export const CANVAS_HEIGHT = 3300;

// Viewport configuration - keeping it simple
export const VIEWPORT_CONFIG: ViewportConfig = {
  // Zoom limits
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4.0,
  
  // Canvas dimensions
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  
  // Input sensitivity
  ZOOM_SENSITIVITY: 0.001,
  
  // Performance
  TARGET_FPS: 60
};

// Default viewport state
export const DEFAULT_VIEWPORT_STATE = {
  scale: 1.0,
  panX: 0,
  panY: 0,
  mode: 'draw' as const
};

// Performance monitoring
export const PERFORMANCE_CONFIG = {
  FPS_SAMPLE_SIZE: 10,
  MAX_FRAME_TIME: 16.67, // ~60fps
  PERFORMANCE_WARNING_THRESHOLD: 30 // fps
};

// Storage keys
export const STORAGE_KEYS = {
  VIEWPORT_STATE: 'viewport-state'
};