import type { 
  ViewportState, 
  ViewportStateListener, 
  UnsubscribeFunction, 
  ContainerSize,
  ViewportBounds 
} from './types';
import { VIEWPORT_CONFIG, DEFAULT_VIEWPORT_STATE, STORAGE_KEYS } from './constants';

/**
 * ViewportManager - Single source of truth for viewport state
 * Handles state management, change notifications, and persistence
 */
export class ViewportManager {
  private state: ViewportState = { ...DEFAULT_VIEWPORT_STATE };
  private listeners: ViewportStateListener[] = [];
  private containerSize: ContainerSize = { width: 800, height: 600 };
  
  constructor() {
    this.loadState();
  }

  // State management
  getState(): ViewportState {
    return { ...this.state };
  }

  setState(newState: Partial<ViewportState>): void {
    const previousState = { ...this.state };
    
    // Apply new state with validation
    this.state = {
      ...this.state,
      ...newState,
    };
    
    // Apply constraints and validation
    this.state = this.validateState(this.state);
    
    // Only notify if state actually changed
    if (!this.statesEqual(previousState, this.state)) {
      this.notifyListeners();
      this.saveState();
    }
  }

  // Individual setters for convenience
  setScale(scale: number): void {
    this.setState({ scale });
  }

  setPan(panX: number, panY: number): void {
    this.setState({ panX, panY });
  }

  setMode(mode: 'zoom' | 'draw'): void {
    this.setState({ mode });
  }

  // Container size management
  setContainerSize(size: ContainerSize): void {
    this.containerSize = size;
    // Re-validate state with new container size
    this.state = this.validateState(this.state);
    this.notifyListeners();
  }

  getContainerSize(): ContainerSize {
    return { ...this.containerSize };
  }

  // Change notifications
  addStateChangeListener(listener: ViewportStateListener): UnsubscribeFunction {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in viewport state listener:', error);
      }
    });
  }

  // State validation and constraints
  private validateState(state: ViewportState): ViewportState {
    const bounds = this.calculateBounds();
    
    // Clamp scale to limits
    const clampedScale = Math.max(
      VIEWPORT_CONFIG.MIN_ZOOM, 
      Math.min(VIEWPORT_CONFIG.MAX_ZOOM, state.scale)
    );
    
    // Calculate pan boundaries
    const scaledWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * clampedScale;
    const scaledHeight = VIEWPORT_CONFIG.CANVAS_HEIGHT * clampedScale;
    
    // Only apply boundaries when canvas fits in container (zoomed out)
    if (scaledWidth <= this.containerSize.width && scaledHeight <= this.containerSize.height) {
      // Center canvas when smaller than container
      const centerX = (this.containerSize.width - scaledWidth) / 2;
      const centerY = (this.containerSize.height - scaledHeight) / 2;
      
      return {
        scale: clampedScale,
        panX: centerX,
        panY: centerY,
        mode: ['zoom', 'draw'].includes(state.mode) ? state.mode : 'draw'
      };
    }
    
    // When zoomed in (canvas larger than container), allow free panning
    return {
      scale: clampedScale,
      panX: state.panX,
      panY: state.panY,
      mode: ['zoom', 'draw'].includes(state.mode) ? state.mode : 'draw'
    };
  }

  private calculateBounds(): ViewportBounds {
    return {
      minScale: VIEWPORT_CONFIG.MIN_ZOOM,
      maxScale: VIEWPORT_CONFIG.MAX_ZOOM,
      canvasWidth: VIEWPORT_CONFIG.CANVAS_WIDTH,
      canvasHeight: VIEWPORT_CONFIG.CANVAS_HEIGHT
    };
  }

  // State persistence
  saveState(): void {
    try {
      const stateToSave = {
        scale: this.state.scale,
        panX: this.state.panX,
        panY: this.state.panY,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.VIEWPORT_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save viewport state:', error);
    }
  }

  loadState(): ViewportState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEWPORT_STATE);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Check if state is recent (within 24 hours)
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      // Apply loaded state (will be validated)
      this.setState({
        scale: parsed.scale,
        panX: parsed.panX,
        panY: parsed.panY,
        mode: 'draw' // Always start in draw mode
      });
      
      return this.getState();
    } catch (error) {
      console.warn('Failed to load viewport state:', error);
      return null;
    }
  }

  // Utility methods
  private statesEqual(state1: ViewportState, state2: ViewportState): boolean {
    return state1.scale === state2.scale && 
           state1.panX === state2.panX && 
           state1.panY === state2.panY &&
           state1.mode === state2.mode;
  }

  // Reset to default state
  reset(): void {
    this.setState({ ...DEFAULT_VIEWPORT_STATE });
  }

  // Fit canvas to container
  fitToContainer(): void {
    const scaleX = this.containerSize.width / VIEWPORT_CONFIG.CANVAS_WIDTH;
    const scaleY = this.containerSize.height / VIEWPORT_CONFIG.CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    this.setState({
      scale,
      panX: 0,
      panY: 0
    });
  }
}