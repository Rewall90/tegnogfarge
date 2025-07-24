import type { ViewportState } from './types';
import { ViewportManager } from './ViewportManager';
import { CanvasTransform } from './CanvasTransform';

/**
 * ViewportTransformSync - Synchronizes viewport state with CSS transforms
 * Ensures transform updates are coordinated with viewport state changes
 */
export class ViewportTransformSync {
  private viewportManager: ViewportManager;
  private canvasTransform: CanvasTransform;
  private isActive = false;
  private unsubscribe?: () => void;
  
  constructor(viewportManager: ViewportManager, canvasTransform: CanvasTransform) {
    this.viewportManager = viewportManager;
    this.canvasTransform = canvasTransform;
  }
  
  /**
   * Start synchronization
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Subscribe to viewport state changes
    this.unsubscribe = this.viewportManager.addStateChangeListener((state) => {
      this.updateCSSTransform(state);
    });
    
    // Apply initial state
    const initialState = this.viewportManager.getState();
    this.updateCSSTransform(initialState);
    
    console.debug('ViewportTransformSync started');
  }
  
  /**
   * Stop synchronization
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    
    console.debug('ViewportTransformSync stopped');
  }
  
  /**
   * Update CSS transform based on viewport state
   */
  private updateCSSTransform(state: ViewportState): void {
    // Update canvas transform with viewport state
    this.canvasTransform.updateFromViewportState(state);
  }
  
  /**
   * Force synchronization
   */
  forceSync(): void {
    if (!this.isActive) return;
    
    const currentState = this.viewportManager.getState();
    this.updateCSSTransform(currentState);
  }
  
  /**
   * Get synchronization status
   */
  getStatus(): {
    isActive: boolean;
    currentState: ViewportState;
    transformString: string;
  } {
    const currentState = this.viewportManager.getState();
    const transformString = `translate(${currentState.panX}px, ${currentState.panY}px) scale(${currentState.scale})`;
    
    return {
      isActive: this.isActive,
      currentState,
      transformString
    };
  }
}