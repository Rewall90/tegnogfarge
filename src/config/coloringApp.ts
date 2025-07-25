/**
 * Configuration for the coloring app
 */

export const COLORING_APP_CONFIG = {
  /**
   * Whether to use a proxy for loading images to avoid CORS issues
   * Set to true if experiencing "canvas has been tainted by cross-origin data" errors
   */
  USE_IMAGE_PROXY: true,
  
  /**
   * Maximum image dimensions for coloring
   */
  MAX_IMAGE_WIDTH: 2550,
  MAX_IMAGE_HEIGHT: 3300,
  
  /**
   * Default tolerance for flood fill algorithm
   */
  DEFAULT_TOLERANCE: 32,
  
  /**
   * Maximum history steps for undo/redo
   */
  MAX_HISTORY_STEPS: 5,
};