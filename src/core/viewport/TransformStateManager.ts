import type { ViewportState } from './types';
import { CSSTransformApplier } from './CSSTransformApplier';

/**
 * TransformStateManager - Efficiently manages CSS transform state updates
 * Prevents unnecessary DOM updates and provides batching capabilities
 */
export class TransformStateManager {
  private transformApplier: CSSTransformApplier;
  private lastAppliedState: ViewportState | null = null;
  private pendingUpdate: ViewportState | null = null;
  private updateScheduled = false;
  private updateCount = 0;
  private skippedUpdates = 0;
  
  constructor(transformApplier: CSSTransformApplier) {
    this.transformApplier = transformApplier;
  }
  
  /**
   * Update transform with state change detection
   */
  updateTransform(newState: ViewportState): void {
    // Skip unnecessary updates
    if (this.statesEqual(newState, this.lastAppliedState)) {
      this.skippedUpdates++;
      return;
    }
    
    // Apply transform immediately
    this.transformApplier.applyTransform(newState);
    this.lastAppliedState = { ...newState };
    this.updateCount++;
  }
  
  /**
   * Schedule batched transform update
   */
  batchTransformUpdate(newState: ViewportState): void {
    this.pendingUpdate = newState;
    
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => {
        this.flushBatchedUpdate();
      });
    }
  }
  
  /**
   * Flush any pending batched update
   */
  private flushBatchedUpdate(): void {
    if (this.pendingUpdate && !this.statesEqual(this.pendingUpdate, this.lastAppliedState)) {
      this.transformApplier.applyTransform(this.pendingUpdate);
      this.lastAppliedState = { ...this.pendingUpdate };
      this.updateCount++;
    }
    
    this.pendingUpdate = null;
    this.updateScheduled = false;
  }
  
  /**
   * Force immediate update (bypasses batching and equality checks)
   */
  forceUpdate(state: ViewportState): void {
    this.transformApplier.applyTransform(state);
    this.lastAppliedState = { ...state };
    this.updateCount++;
    
    // Cancel any pending batched update
    this.pendingUpdate = null;
    this.updateScheduled = false;
  }
  
  /**
   * Check if two states are equal
   */
  private statesEqual(state1: ViewportState, state2: ViewportState | null): boolean {
    if (!state2) return false;
    
    return state1.scale === state2.scale && 
           state1.panX === state2.panX && 
           state1.panY === state2.panY;
  }
  
  /**
   * Get last applied state
   */
  getLastAppliedState(): ViewportState | null {
    return this.lastAppliedState ? { ...this.lastAppliedState } : null;
  }
  
  /**
   * Check if update is pending
   */
  hasPendingUpdate(): boolean {
    return this.updateScheduled && this.pendingUpdate !== null;
  }
  
  /**
   * Get pending update state
   */
  getPendingUpdate(): ViewportState | null {
    return this.pendingUpdate ? { ...this.pendingUpdate } : null;
  }
  
  /**
   * Reset manager state
   */
  reset(): void {
    this.lastAppliedState = null;
    this.pendingUpdate = null;
    this.updateScheduled = false;
    this.transformApplier.resetTransform();
  }
  
  /**
   * Get performance statistics
   */
  getStats(): {
    updateCount: number;
    skippedUpdates: number;
    updateRate: number;
    hasPendingUpdate: boolean;
  } {
    const updateRate = this.updateCount > 0 
      ? (this.skippedUpdates / (this.updateCount + this.skippedUpdates)) * 100 
      : 0;
    
    return {
      updateCount: this.updateCount,
      skippedUpdates: this.skippedUpdates,
      updateRate,
      hasPendingUpdate: this.hasPendingUpdate()
    };
  }
  
  /**
   * Reset statistics
   */
  resetStats(): void {
    this.updateCount = 0;
    this.skippedUpdates = 0;
  }
  
  /**
   * Animate to a target state
   */
  animateTo(
    targetState: ViewportState,
    duration: number = 300,
    easing: (t: number) => number = this.easeInOutCubic
  ): Promise<void> {
    return new Promise((resolve) => {
      const startState = this.lastAppliedState || {
        scale: 1,
        panX: 0,
        panY: 0,
        mode: 'draw' as const
      };
      
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easing(progress);
        
        const interpolatedState: ViewportState = {
          scale: this.lerp(startState.scale, targetState.scale, eased),
          panX: this.lerp(startState.panX, targetState.panX, eased),
          panY: this.lerp(startState.panY, targetState.panY, eased),
          mode: targetState.mode
        };
        
        this.forceUpdate(interpolatedState);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
  
  /**
   * Ease in-out cubic easing function
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Handle zoom at point with proper centering
   */
  zoomAtPoint(
    newScale: number,
    centerX: number,
    centerY: number,
    currentState: ViewportState
  ): void {
    const scaleFactor = newScale / currentState.scale;
    
    // Calculate new pan to keep zoom centered
    const newPanX = centerX - (centerX - currentState.panX) * scaleFactor;
    const newPanY = centerY - (centerY - currentState.panY) * scaleFactor;
    
    const newState: ViewportState = {
      scale: newScale,
      panX: newPanX,
      panY: newPanY,
      mode: currentState.mode
    };
    
    this.updateTransform(newState);
  }
}