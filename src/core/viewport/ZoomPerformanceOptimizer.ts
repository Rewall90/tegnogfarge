/**
 * ZoomPerformanceOptimizer - Enhanced performance for smooth zooming
 * Implements momentum, smooth scaling, and GPU acceleration optimizations
 */

import type { ViewportState } from './types';

interface ZoomMomentum {
  velocity: number;
  direction: number; // 1 for zoom in, -1 for zoom out
  lastTime: number;
  isActive: boolean;
}

export class ZoomPerformanceOptimizer {
  private rafId: number | null = null;
  private pendingZoom: {
    scale: number;
    centerX: number;
    centerY: number;
  } | null = null;
  private updateCallback: ((state: ViewportState) => void) | null = null;
  private lastUpdateTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private momentum: ZoomMomentum = {
    velocity: 0,
    direction: 0,
    lastTime: 0,
    isActive: false
  };
  
  // Performance thresholds
  private readonly MIN_FRAME_TIME = 16.67; // 60fps target
  private readonly ZOOM_SMOOTHING_FACTOR = 0.15;
  private readonly MOMENTUM_DECAY = 0.95;
  private readonly MIN_VELOCITY = 0.001;
  private readonly FPS_SAMPLE_SIZE = 10;
  
  // Zoom step configuration
  private readonly ZOOM_STEPS = {
    wheel: { in: 1.1, out: 0.9 },
    pinch: { smooth: true },
    keyboard: { in: 1.25, out: 0.8 }
  };

  /**
   * Set the callback function for applying viewport updates
   */
  setUpdateCallback(callback: (state: ViewportState) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Queue a zoom update with performance optimization
   */
  queueZoomUpdate(
    currentState: ViewportState,
    zoomFactor: number,
    centerX: number,
    centerY: number,
    source: 'wheel' | 'pinch' | 'keyboard' = 'wheel'
  ): void {
    const newScale = this.calculateOptimalScale(currentState.scale, zoomFactor, source);
    const { panX, panY } = this.calculateZoomCenteredPan(currentState, newScale, centerX, centerY);
    
    this.pendingZoom = { scale: newScale, centerX, centerY };
    
    // Update momentum for smooth zooming
    this.updateMomentum(zoomFactor, source);
    
    // Schedule RAF update if not already scheduled
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.performZoomUpdate);
    }
  }

  /**
   * Calculate optimal scale with smoothing and limits
   */
  private calculateOptimalScale(currentScale: number, factor: number, source: 'wheel' | 'pinch' | 'keyboard'): number {
    let newScale: number;
    
    if (source === 'wheel') {
      // Apply smoothing for wheel zoom
      const targetScale = currentScale * factor;
      newScale = currentScale + (targetScale - currentScale) * this.ZOOM_SMOOTHING_FACTOR;
    } else if (source === 'pinch') {
      // Direct scaling for pinch (already smooth from gesture)
      newScale = currentScale * factor;
    } else {
      // Keyboard zoom with larger steps
      newScale = currentScale * factor;
    }
    
    // Clamp to zoom limits
    return Math.max(0.25, Math.min(4.0, newScale));
  }

  /**
   * Calculate new pan position to keep zoom centered
   */
  private calculateZoomCenteredPan(
    currentState: ViewportState,
    newScale: number,
    centerX: number,
    centerY: number
  ): { panX: number; panY: number } {
    // Calculate the point in the canvas that should remain fixed
    const fixedPointX = (centerX - currentState.panX) / currentState.scale;
    const fixedPointY = (centerY - currentState.panY) / currentState.scale;
    
    // Calculate new pan to keep that point under the cursor
    const panX = centerX - fixedPointX * newScale;
    const panY = centerY - fixedPointY * newScale;
    
    return { panX, panY };
  }

  /**
   * Update zoom momentum for smooth experience
   */
  private updateMomentum(zoomFactor: number, source: 'wheel' | 'pinch' | 'keyboard'): void {
    const now = performance.now();
    const deltaTime = now - this.momentum.lastTime;
    
    if (source === 'wheel' && deltaTime < 100) { // Rapid wheel scrolling
      const direction = zoomFactor > 1 ? 1 : -1;
      const velocity = Math.abs(zoomFactor - 1) / (deltaTime / 1000);
      
      this.momentum.velocity = Math.max(this.momentum.velocity * this.MOMENTUM_DECAY, velocity);
      this.momentum.direction = direction;
      this.momentum.isActive = this.momentum.velocity > this.MIN_VELOCITY;
    } else {
      this.momentum.isActive = false;
    }
    
    this.momentum.lastTime = now;
  }

  /**
   * Perform the actual zoom update with timing control
   */
  private performZoomUpdate = (timestamp: number): void => {
    this.rafId = null;
    
    if (!this.pendingZoom || !this.updateCallback) return;
    
    // Apply momentum if active
    let finalScale = this.pendingZoom.scale;
    if (this.momentum.isActive) {
      const momentumFactor = 1 + (this.momentum.velocity * this.momentum.direction * 0.1);
      finalScale = Math.max(0.25, Math.min(4.0, finalScale * momentumFactor));
      this.momentum.velocity *= this.MOMENTUM_DECAY;
      
      if (this.momentum.velocity < this.MIN_VELOCITY) {
        this.momentum.isActive = false;
      }
    }
    
    const newState: ViewportState = {
      scale: finalScale,
      panX: this.pendingZoom.centerX - (this.pendingZoom.centerX / this.pendingZoom.scale) * finalScale,
      panY: this.pendingZoom.centerY - (this.pendingZoom.centerY / this.pendingZoom.scale) * finalScale,
      mode: 'zoom'
    };
    
    // Apply the update
    this.updateCallback(newState);
    this.pendingZoom = null;
    
    // Track performance
    this.trackPerformance(timestamp);
    this.lastUpdateTime = timestamp;
    
    // Continue momentum if still active
    if (this.momentum.isActive) {
      this.rafId = requestAnimationFrame(this.performZoomUpdate);
    }
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
   * Create smooth zoom step calculator
   */
  createSmoothZoomHandler(): (
    currentState: ViewportState,
    direction: 'in' | 'out',
    centerX: number,
    centerY: number,
    source?: 'wheel' | 'pinch' | 'keyboard'
  ) => void {
    return (currentState, direction, centerX, centerY, source = 'wheel') => {
      const steps = this.ZOOM_STEPS[source];
      let factor: number;
      
      if (typeof steps === 'object' && 'in' in steps) {
        factor = direction === 'in' ? steps.in : steps.out;
      } else {
        factor = direction === 'in' ? 1.1 : 0.9;
      }
      
      this.queueZoomUpdate(currentState, factor, centerX, centerY, source);
    };
  }

  /**
   * Apply zoom with adaptive smoothing based on current performance
   */
  applyAdaptiveZoom(
    currentState: ViewportState,
    targetScale: number,
    centerX: number,
    centerY: number
  ): void {
    const currentFPS = this.getAverageFPS();
    let smoothingFactor = this.ZOOM_SMOOTHING_FACTOR;
    
    // Adjust smoothing based on performance
    if (currentFPS < 30) {
      smoothingFactor = 0.05; // Less smoothing for better performance
    } else if (currentFPS > 55) {
      smoothingFactor = 0.25; // More smoothing for smoother experience
    }
    
    const factor = 1 + (targetScale - currentState.scale) * smoothingFactor / currentState.scale;
    this.queueZoomUpdate(currentState, factor, centerX, centerY);
  }

  /**
   * Implement zoom-to-fit functionality
   */
  zoomToFit(
    containerWidth: number,
    containerHeight: number,
    canvasWidth: number = 2550,
    canvasHeight: number = 3300
  ): ViewportState {
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% fit for padding
    
    const clampedScale = Math.max(0.25, Math.min(4.0, scale));
    const panX = (containerWidth - canvasWidth * clampedScale) / 2;
    const panY = (containerHeight - canvasHeight * clampedScale) / 2;
    
    return {
      scale: clampedScale,
      panX,
      panY,
      mode: 'zoom'
    };
  }

  /**
   * Implement zoom-to-actual-size functionality
   */
  zoomToActualSize(
    containerWidth: number,
    containerHeight: number,
    canvasWidth: number = 2550,
    canvasHeight: number = 3300
  ): ViewportState {
    const scale = 1.0; // 100% actual size
    const panX = (containerWidth - canvasWidth) / 2;
    const panY = (containerHeight - canvasHeight) / 2;
    
    return {
      scale,
      panX,
      panY,
      mode: 'zoom'
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageFPS: number;
    frameCount: number;
    momentumActive: boolean;
    pendingZoom: boolean;
  } {
    return {
      averageFPS: this.getAverageFPS(),
      frameCount: this.frameCount,
      momentumActive: this.momentum.isActive,
      pendingZoom: this.pendingZoom !== null
    };
  }

  /**
   * Check if zoom is performing well
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
    this.momentum = {
      velocity: 0,
      direction: 0,
      lastTime: 0,
      isActive: false
    };
  }

  /**
   * Enable GPU acceleration for zoom container
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
   * Configure zoom step sizes based on device capabilities
   */
  configureZoomSteps(deviceType: 'desktop' | 'mobile' | 'tablet'): void {
    switch (deviceType) {
      case 'desktop':
        this.ZOOM_STEPS.wheel.in = 1.1;
        this.ZOOM_STEPS.wheel.out = 0.9;
        this.ZOOM_STEPS.keyboard.in = 1.25;
        this.ZOOM_STEPS.keyboard.out = 0.8;
        break;
      case 'mobile':
        // Smaller steps for more precise mobile control
        this.ZOOM_STEPS.wheel.in = 1.05;
        this.ZOOM_STEPS.wheel.out = 0.95;
        break;
      case 'tablet':
        this.ZOOM_STEPS.wheel.in = 1.08;
        this.ZOOM_STEPS.wheel.out = 0.92;
        break;
    }
  }

  /**
   * Flush any pending zoom updates immediately
   */
  flush(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.pendingZoom && this.updateCallback) {
      const newState: ViewportState = {
        scale: this.pendingZoom.scale,
        panX: 0, // Will be recalculated by viewport manager
        panY: 0,
        mode: 'zoom'
      };
      this.updateCallback(newState);
      this.pendingZoom = null;
    }
  }

  /**
   * Get zoom performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const avgFps = this.getAverageFPS();
    
    if (avgFps < 30) {
      recommendations.push('Critical: Zoom FPS below 30, consider reducing zoom smoothing');
    } else if (avgFps < 45) {
      recommendations.push('Warning: Zoom FPS below 45, optimization recommended');
    }
    
    if (this.momentum.isActive) {
      recommendations.push('Zoom momentum is active - smooth scrolling in progress');
    }
    
    if (this.pendingZoom !== null) {
      recommendations.push('Zoom updates are being batched - this is normal during active zooming');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Zoom performance is optimal');
    }
    
    return recommendations;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.pendingZoom = null;
    this.updateCallback = null;
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastUpdateTime = 0;
    this.momentum = {
      velocity: 0,
      direction: 0,
      lastTime: 0,
      isActive: false
    };
  }
}