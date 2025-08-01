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
  purePinchZoom?: boolean; // Skip pan adjustments for two-finger pinch zoom
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
  const { centerX, centerY, zoomFactor, currentState, purePinchZoom = false } = params;

  // Calculate new scale with constraints
  const newScale = Math.max(
    ZOOM_CONFIG.MIN_ZOOM,
    Math.min(ZOOM_CONFIG.MAX_ZOOM, currentState.scale * zoomFactor)
  );

  // For two-finger pinch zoom, apply pure zoom without pan adjustments
  if (purePinchZoom) {
    return {
      scale: newScale,
      panX: currentState.panX, // Keep current pan unchanged
      panY: currentState.panY  // Keep current pan unchanged
    };
  }

  // For mouse wheel zoom, adjust pan to keep the zoom point fixed
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