export interface ViewportState {
  scale: number;
  panX: number;
  panY: number;
}

export interface ZoomParams {
  centerX: number;
  centerY: number;
  zoomFactor: number;
  currentState: ViewportState;
}

export interface ZoomResult {
  scale: number;
  panX: number;
  panY: number;
}

export const ZOOM_CONFIG = {
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4.0,
};

/**
 * Calculates new zoom and pan values for transform-origin: center center
 * This ensures consistent behavior across all input methods
 */
export function calculateZoom(params: ZoomParams): ZoomResult {
  const { centerX, centerY, zoomFactor, currentState } = params;

  // Calculate new scale with constraints
  const newScale = Math.max(
    ZOOM_CONFIG.MIN_ZOOM,
    Math.min(ZOOM_CONFIG.MAX_ZOOM, currentState.scale * zoomFactor)
  );

  // For transform-origin: center center, we need to adjust the pan to keep the zoom point fixed
  // centerX and centerY are relative to the container center (can be negative)
  const scaleChange = newScale / currentState.scale;
  
  // Calculate the new pan values to keep the mouse/touch point fixed during zoom
  // Since scaling happens around the center, we need to adjust for the scale change
  const newPanX = currentState.panX + centerX * (1 - scaleChange);
  const newPanY = currentState.panY + centerY * (1 - scaleChange);
  
  return {
    scale: newScale,
    panX: newPanX,
    panY: newPanY
  };
}