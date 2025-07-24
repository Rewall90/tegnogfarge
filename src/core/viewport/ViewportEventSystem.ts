import type { ViewportState, UnsubscribeFunction } from './types';
import { ViewportManager } from './ViewportManager';
import { CanvasTransform } from './CanvasTransform';
import { CoordinateSystem } from './CoordinateSystem';

interface ViewportEventCallbacks {
  onStateChange?: (state: ViewportState) => void;
  onScaleChange?: (scale: number) => void;
  onPanChange?: (panX: number, panY: number) => void;
  onModeChange?: (mode: 'zoom' | 'draw') => void;
}

/**
 * ViewportEventSystem - Coordinates viewport state synchronization
 * Manages state changes and synchronizes with all dependent systems
 */
export class ViewportEventSystem {
  private viewportManager: ViewportManager;
  private canvasTransform?: CanvasTransform;
  private coordinateSystem?: CoordinateSystem;
  private unsubscribes: UnsubscribeFunction[] = [];
  private callbacks: ViewportEventCallbacks = {};
  
  constructor(viewportManager: ViewportManager) {
    this.viewportManager = viewportManager;
  }
  
  /**
   * Subscribe to state changes with callbacks
   */
  subscribeToStateChanges(callback: (state: ViewportState) => void): UnsubscribeFunction {
    const unsubscribe = this.viewportManager.addStateChangeListener(callback);
    this.unsubscribes.push(unsubscribe);
    
    // Return unsubscribe function
    return () => {
      const index = this.unsubscribes.indexOf(unsubscribe);
      if (index > -1) {
        this.unsubscribes.splice(index, 1);
      }
      unsubscribe();
    };
  }
  
  /**
   * Set system references for synchronization
   */
  setSystems(systems: {
    canvasTransform?: CanvasTransform;
    coordinateSystem?: CoordinateSystem;
  }): void {
    this.canvasTransform = systems.canvasTransform;
    this.coordinateSystem = systems.coordinateSystem;
  }
  
  /**
   * Initialize synchronization with all systems
   */
  initializeSync(): void {
    // Main state change handler
    this.subscribeToStateChanges((state) => {
      this.handleStateChange(state);
    });
  }
  
  /**
   * Handle viewport state changes
   */
  private handleStateChange(state: ViewportState): void {
    const previousState = this.getPreviousState();
    
    // Synchronize with CSS transform system
    if (this.canvasTransform) {
      this.syncWithTransformSystem(state);
    }
    
    // Synchronize with coordinate mapper
    if (this.coordinateSystem) {
      this.syncWithCoordinateMapper(state);
    }
    
    // Trigger specific callbacks
    if (state.scale !== previousState?.scale) {
      this.callbacks.onScaleChange?.(state.scale);
    }
    
    if (state.panX !== previousState?.panX || state.panY !== previousState?.panY) {
      this.callbacks.onPanChange?.(state.panX, state.panY);
    }
    
    if (state.mode !== previousState?.mode) {
      this.callbacks.onModeChange?.(state.mode);
    }
    
    // General state change callback
    this.callbacks.onStateChange?.(state);
    
    // Store current state as previous
    this.storePreviousState(state);
  }
  
  /**
   * Synchronize with CSS transform system
   */
  private syncWithTransformSystem(state: ViewportState): void {
    if (!this.canvasTransform) return;
    
    this.canvasTransform.updateFromViewportState(state);
  }
  
  /**
   * Synchronize with coordinate mapper
   */
  private syncWithCoordinateMapper(state: ViewportState): void {
    if (!this.coordinateSystem) return;
    
    this.coordinateSystem.updateViewportState(state);
  }
  
  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: ViewportEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Trigger manual state update
   */
  triggerStateUpdate(): void {
    const currentState = this.viewportManager.getState();
    this.handleStateChange(currentState);
  }
  
  /**
   * Get current synchronization status
   */
  getSyncStatus(): {
    isTransformSynced: boolean;
    isCoordinateSystemSynced: boolean;
    activeListeners: number;
  } {
    return {
      isTransformSynced: !!this.canvasTransform,
      isCoordinateSystemSynced: !!this.coordinateSystem,
      activeListeners: this.unsubscribes.length
    };
  }
  
  /**
   * Store previous state for comparison
   */
  private previousState: ViewportState | null = null;
  
  private storePreviousState(state: ViewportState): void {
    this.previousState = { ...state };
  }
  
  private getPreviousState(): ViewportState | null {
    return this.previousState;
  }
  
  /**
   * Batch state updates
   */
  private batchTimeout: number | null = null;
  private pendingUpdates: Partial<ViewportState> = {};
  
  batchStateUpdate(updates: Partial<ViewportState>, delay: number = 16): void {
    // Accumulate updates
    this.pendingUpdates = { ...this.pendingUpdates, ...updates };
    
    // Clear existing timeout
    if (this.batchTimeout !== null) {
      clearTimeout(this.batchTimeout);
    }
    
    // Set new timeout
    this.batchTimeout = window.setTimeout(() => {
      this.viewportManager.setState(this.pendingUpdates);
      this.pendingUpdates = {};
      this.batchTimeout = null;
    }, delay);
  }
  
  /**
   * Force immediate state sync
   */
  forceSync(): void {
    const state = this.viewportManager.getState();
    this.syncWithTransformSystem(state);
    this.syncWithCoordinateMapper(state);
  }
  
  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
    
    if (this.batchTimeout !== null) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}