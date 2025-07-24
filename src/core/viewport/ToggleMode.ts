import type { ViewportMode, ViewportState } from './types';

/**
 * ToggleMode - Simple mode switching between zoom and draw
 * Handles state preservation and tool management
 */
export class ToggleMode {
  private currentMode: ViewportMode = 'draw';
  private savedZoomState: Partial<ViewportState> | null = null;
  private modeChangeCallbacks: Array<(mode: ViewportMode) => void> = [];

  // Get current mode
  getCurrentMode(): ViewportMode {
    return this.currentMode;
  }

  // Toggle between zoom and draw modes
  toggle(): void {
    const newMode = this.currentMode === 'draw' ? 'zoom' : 'draw';
    this.setMode(newMode);
  }

  // Set specific mode
  setMode(mode: ViewportMode): void {
    if (mode === this.currentMode) return;

    const previousMode = this.currentMode;
    this.currentMode = mode;

    if (mode === 'zoom') {
      this.enterZoomMode();
    } else {
      this.enterDrawMode();
    }

    this.notifyModeChange(mode, previousMode);
  }

  // Switch to zoom mode
  switchToZoom(): void {
    this.setMode('zoom');
  }

  // Switch to draw mode
  switchToDraw(): void {
    this.setMode('draw');
  }

  // Enter zoom mode
  private enterZoomMode(): void {
    // Mode is now zoom - viewport state will handle this
    // Drawing tools will be disabled by the tool manager
  }

  // Enter draw mode
  private enterDrawMode(): void {
    // Mode is now draw - viewport state will handle this
    // Drawing tools will be enabled by the tool manager
  }

  // State preservation
  preserveState(state: Partial<ViewportState>): void {
    this.savedZoomState = { ...state };
  }

  restoreState(): Partial<ViewportState> | null {
    return this.savedZoomState ? { ...this.savedZoomState } : null;
  }

  getSavedZoomState(): Partial<ViewportState> | null {
    return this.savedZoomState ? { ...this.savedZoomState } : null;
  }

  // Mode change notifications
  addModeChangeCallback(callback: (mode: ViewportMode) => void): () => void {
    this.modeChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.modeChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.modeChangeCallbacks.splice(index, 1);
      }
    };
  }

  private notifyModeChange(newMode: ViewportMode, previousMode: ViewportMode): void {
    this.modeChangeCallbacks.forEach(callback => {
      try {
        callback(newMode);
      } catch (error) {
        console.error('Error in mode change callback:', error);
      }
    });
  }

  // Tool management helpers (these will be called by external tool managers)
  enableDrawingTools(): void {
    // This method is called by external tool managers
    // when switching to draw mode
  }

  disableDrawingTools(): void {
    // This method is called by external tool managers
    // when switching to zoom mode
  }

  // Check if drawing tools should be enabled
  shouldDrawingToolsBeEnabled(): boolean {
    return this.currentMode === 'draw';
  }

  // Check if zoom interactions should be enabled
  shouldZoomInteractionsBeEnabled(): boolean {
    return this.currentMode === 'zoom';
  }

  // Reset to default mode
  reset(): void {
    this.currentMode = 'draw';
    this.savedZoomState = null;
    this.notifyModeChange('draw', 'zoom');
  }

  // Get mode display information
  getModeDisplayInfo(): { 
    mode: ViewportMode; 
    label: string; 
    icon: string; 
    description: string; 
  } {
    return {
      mode: this.currentMode,
      label: this.currentMode === 'zoom' ? 'Zoom' : 'Draw',
      icon: this.currentMode === 'zoom' ? '🔍' : '✏️',
      description: this.currentMode === 'zoom' 
        ? 'Zoom and pan mode - drawing disabled' 
        : 'Drawing mode - use tools to color'
    };
  }

  // Cleanup
  cleanup(): void {
    this.modeChangeCallbacks = [];
    this.savedZoomState = null;
  }
}