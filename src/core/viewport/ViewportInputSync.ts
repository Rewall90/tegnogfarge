import type { ViewportState } from './types';
import { ViewportManager } from './ViewportManager';
import { InputHandler } from './InputHandler';

/**
 * ViewportInputSync - Synchronizes input handlers with viewport state
 * Coordinates pan and zoom inputs with the central viewport manager
 */
export class ViewportInputSync {
  private viewportManager: ViewportManager;
  private inputHandler: InputHandler;
  private isActive = false;
  private unsubscribeFunctions: Array<() => void> = [];
  
  constructor(viewportManager: ViewportManager, inputHandler: InputHandler) {
    this.viewportManager = viewportManager;
    this.inputHandler = inputHandler;
  }
  
  /**
   * Start input synchronization
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupInputIntegration();
    
    console.debug('ViewportInputSync started');
  }
  
  /**
   * Stop input synchronization
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Unsubscribe from all input handlers
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    
    console.debug('ViewportInputSync stopped');
  }
  
  /**
   * Setup input handler integration
   */
  private setupInputIntegration(): void {
    // Pan handler updates viewport state
    const unsubscribePan = this.inputHandler.onPan((deltaX, deltaY) => {
      const currentState = this.viewportManager.getState();
      
      // Only allow panning in zoom mode
      if (currentState.mode !== 'zoom') return;
      
      this.viewportManager.setState({
        panX: currentState.panX + deltaX,
        panY: currentState.panY + deltaY
      });
    });
    this.unsubscribeFunctions.push(unsubscribePan);
    
    // Zoom handler updates viewport state
    const unsubscribeZoom = this.inputHandler.onZoom((scaleFactor, centerX, centerY) => {
      const currentState = this.viewportManager.getState();
      
      // Only allow zooming in zoom mode
      if (currentState.mode !== 'zoom') return;
      
      const newScale = currentState.scale * scaleFactor;
      
      // Calculate new pan to keep zoom centered at the cursor position
      const newPanX = centerX - (centerX - currentState.panX) * scaleFactor;
      const newPanY = centerY - (centerY - currentState.panY) * scaleFactor;
      
      this.viewportManager.setState({
        scale: newScale,
        panX: newPanX,
        panY: newPanY
      });
    });
    this.unsubscribeFunctions.push(unsubscribeZoom);
    
    // Mode-specific input handling
    const unsubscribeModeChange = this.viewportManager.addStateChangeListener((state) => {
      // Update input handler based on mode
      if (state.mode === 'zoom') {
        this.inputHandler.enablePanAndZoom();
      } else {
        this.inputHandler.disablePanAndZoom();
      }
    });
    this.unsubscribeFunctions.push(unsubscribeModeChange);
    
    // Apply initial mode
    const initialState = this.viewportManager.getState();
    if (initialState.mode === 'zoom') {
      this.inputHandler.enablePanAndZoom();
    } else {
      this.inputHandler.disablePanAndZoom();
    }
  }
  
  /**
   * Handle programmatic zoom
   */
  zoomTo(scale: number, centerX?: number, centerY?: number): void {
    const currentState = this.viewportManager.getState();
    const containerSize = this.viewportManager.getContainerSize();
    
    // Default to center of container if not provided
    const zoomCenterX = centerX ?? containerSize.width / 2;
    const zoomCenterY = centerY ?? containerSize.height / 2;
    
    // Calculate new pan to keep zoom centered
    const scaleFactor = scale / currentState.scale;
    const newPanX = zoomCenterX - (zoomCenterX - currentState.panX) * scaleFactor;
    const newPanY = zoomCenterY - (zoomCenterY - currentState.panY) * scaleFactor;
    
    this.viewportManager.setState({
      scale,
      panX: newPanX,
      panY: newPanY
    });
  }
  
  /**
   * Handle programmatic pan
   */
  panBy(deltaX: number, deltaY: number): void {
    const currentState = this.viewportManager.getState();
    
    this.viewportManager.setState({
      panX: currentState.panX + deltaX,
      panY: currentState.panY + deltaY
    });
  }
  
  /**
   * Pan to specific position
   */
  panTo(x: number, y: number): void {
    this.viewportManager.setState({
      panX: x,
      panY: y
    });
  }
  
  /**
   * Get input sync status
   */
  getStatus(): {
    isActive: boolean;
    inputEnabled: boolean;
    currentMode: 'zoom' | 'draw';
  } {
    const state = this.viewportManager.getState();
    
    return {
      isActive: this.isActive,
      inputEnabled: state.mode === 'zoom',
      currentMode: state.mode
    };
  }
  
  /**
   * Reset viewport to default
   */
  reset(): void {
    this.viewportManager.reset();
  }
  
  /**
   * Fit canvas to container
   */
  fitToContainer(): void {
    this.viewportManager.fitToContainer();
  }
}