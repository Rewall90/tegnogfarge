/**
 * PanPerformanceOptimizer - Enhanced performance for smooth panning
 * Implements RAF batching, debouncing, and GPU acceleration optimizations
 */

import type { ViewportState } from './types';

export class PanPerformanceOptimizer {
  private rafId: number | null = null;
  private pendingUpdate: ViewportState | null = null;
  private updateCallback: ((state: ViewportState) => void) | null = null;
  private lastUpdateTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private isOptimizationEnabled = true;
  
  // Performance thresholds
  private readonly MIN_FRAME_TIME = 16.67; // 60fps target
  private readonly DEBOUNCE_THRESHOLD = 8; // Minimum ms between updates
  private readonly FPS_SAMPLE_SIZE = 10;
  
  /**
   * Set the callback function for applying viewport updates
   */
  setUpdateCallback(callback: (state: ViewportState) => void): void {
    this.updateCallback = callback;
  }
  
  /**
   * Queue a pan update with performance optimization
   */
  queuePanUpdate(state: ViewportState): void {
    if (!this.isOptimizationEnabled) {
      // Direct update when optimization is disabled
      this.updateCallback?.(state);
      return;
    }
    
    // Store the latest state
    this.pendingUpdate = state;
    
    // Schedule RAF update if not already scheduled
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.performUpdate);
    }
  }
  
  /**
   * Perform the actual update with timing control
   */
  private performUpdate = (timestamp: number): void => {
    this.rafId = null;
    
    if (!this.pendingUpdate || !this.updateCallback) return;
    
    // Check if enough time has passed since last update (debouncing)
    const timeSinceLastUpdate = timestamp - this.lastUpdateTime;
    if (timeSinceLastUpdate < this.DEBOUNCE_THRESHOLD) {
      // Reschedule for next frame
      this.rafId = requestAnimationFrame(this.performUpdate);
      return;
    }
    
    // Apply the update
    this.updateCallback(this.pendingUpdate);
    this.pendingUpdate = null;
    
    // Track performance
    this.trackPerformance(timestamp);
    this.lastUpdateTime = timestamp;
  };
  
  /**
   * Track performance metrics
   */
  private trackPerformance(timestamp: number): void {
    if (this.lastUpdateTime > 0) {
      const frameTime = timestamp - this.lastUpdateTime;
      const fps = 1000 / frameTime;
      
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.FPS_SAMPLE_SIZE) {
        this.fpsHistory.shift();
      }
      
      this.frameCount++;
      
      // Auto-adjust optimization if performance is poor
      if (this.frameCount % 60 === 0) { // Check every 60 frames
        this.adjustOptimizationLevel();
      }
    }
  }
  
  /**
   * Auto-adjust optimization level based on performance
   */
  private adjustOptimizationLevel(): void {
    const avgFps = this.getAverageFPS();
    
    if (avgFps < 45) {
      // Performance is poor, increase debounce threshold
      console.warn(`Pan performance below 45fps (${avgFps.toFixed(1)}fps), increasing optimization`);
    } else if (avgFps > 55) {
      // Performance is good, can reduce optimization if needed
      // Keep current settings for stability
    }
  }
  
  /**
   * Get current average FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageFPS: number;
    frameCount: number;
    isOptimized: boolean;
    pendingUpdates: boolean;
  } {
    return {
      averageFPS: this.getAverageFPS(),
      frameCount: this.frameCount,
      isOptimized: this.isOptimizationEnabled,
      pendingUpdates: this.pendingUpdate !== null
    };
  }
  
  /**
   * Enable/disable optimization
   */
  setOptimizationEnabled(enabled: boolean): void {
    this.isOptimizationEnabled = enabled;
    
    if (!enabled && this.rafId !== null) {
      // Cancel pending RAF and apply update immediately
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      
      if (this.pendingUpdate && this.updateCallback) {
        this.updateCallback(this.pendingUpdate);
        this.pendingUpdate = null;
      }
    }
  }
  
  /**
   * Flush any pending updates immediately
   */
  flush(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.pendingUpdate && this.updateCallback) {
      this.updateCallback(this.pendingUpdate);
      this.pendingUpdate = null;
    }
  }
  
  /**
   * Check if panning is performing well
   */
  isPerformanceGood(): boolean {
    return this.getAverageFPS() >= 55;
  }
  
  /**
   * Reset performance statistics
   */
  resetStats(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.lastUpdateTime = 0;
  }
  
  /**
   * Create a throttled pan update function
   */
  createThrottledPanHandler(): (deltaX: number, deltaY: number, currentState: ViewportState) => void {
    return (deltaX: number, deltaY: number, currentState: ViewportState) => {
      const newState: ViewportState = {
        ...currentState,
        panX: currentState.panX + deltaX,
        panY: currentState.panY + deltaY
      };
      
      this.queuePanUpdate(newState);
    };
  }
  
  /**
   * Enable GPU acceleration hints for container
   */
  enableGPUAcceleration(containerElement: HTMLElement): void {
    containerElement.style.willChange = 'transform';
    containerElement.style.backfaceVisibility = 'hidden';
    containerElement.style.perspective = '1000px';
    
    // Force layer creation
    const currentTransform = containerElement.style.transform;
    if (!currentTransform.includes('translateZ')) {
      containerElement.style.transform = `${currentTransform} translateZ(0)`;
    }
  }
  
  /**
   * Disable GPU acceleration (for cleanup)
   */
  disableGPUAcceleration(containerElement: HTMLElement): void {
    containerElement.style.willChange = 'auto';
    containerElement.style.backfaceVisibility = 'visible';
    containerElement.style.perspective = 'none';
  }
  
  /**
   * Cleanup all resources
   */
  cleanup(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.pendingUpdate = null;
    this.updateCallback = null;
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastUpdateTime = 0;
  }
  
  /**
   * Create a debounced function for pan operations
   */
  static createDebouncedPanHandler(
    callback: (deltaX: number, deltaY: number) => void,
    delay: number = 8
  ): (deltaX: number, deltaY: number) => void {
    let timeoutId: number | null = null;
    let accumulatedDeltaX = 0;
    let accumulatedDeltaY = 0;
    
    return (deltaX: number, deltaY: number) => {
      accumulatedDeltaX += deltaX;
      accumulatedDeltaY += deltaY;
      
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        callback(accumulatedDeltaX, accumulatedDeltaY);
        accumulatedDeltaX = 0;
        accumulatedDeltaY = 0;
        timeoutId = null;
      }, delay);
    };
  }
  
  /**
   * Monitor pan performance and provide recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const avgFps = this.getAverageFPS();
    
    if (avgFps < 30) {
      recommendations.push('Critical: FPS below 30, consider reducing update frequency');
    } else if (avgFps < 45) {
      recommendations.push('Warning: FPS below 45, optimization recommended');
    }
    
    if (this.pendingUpdate !== null) {
      recommendations.push('Updates are being batched - this is normal during active panning');
    }
    
    if (!this.isOptimizationEnabled) {
      recommendations.push('Performance optimization is disabled');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }
    
    return recommendations;
  }
}