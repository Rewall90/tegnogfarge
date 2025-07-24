import type { ViewportState } from './types';
import { VIEWPORT_CONFIG } from './constants';
import { CanvasContainerManager } from './CanvasContainerManager';

/**
 * CanvasTransform - All CSS transform logic in one place
 * Handles container-based transforms with multi-layer synchronization
 * Now uses CanvasContainerManager for perfect layer alignment
 */
export class CanvasTransform {
  private containerManager: CanvasContainerManager;
  private currentTransform: string = '';

  constructor() {
    this.containerManager = new CanvasContainerManager();
  }

  // Set the container element that will receive CSS transforms
  setContainerElement(element: HTMLElement): void {
    this.containerManager.setupContainer(element);
  }

  // Update transform based on viewport state
  updateFromViewportState(state: ViewportState): void {
    this.applyToAllLayers(state);
  }

  // Add a canvas layer to be managed with proper z-index
  addLayer(name: string, canvas: HTMLCanvasElement, zIndex: number = 0): void {
    this.containerManager.addCanvas(name, canvas, zIndex);
  }

  // Get container element for external operations
  getContainerElement(): HTMLElement | null {
    return this.containerManager.getContainer();
  }

  // Apply transform to all layers via container (perfect synchronization)
  applyToAllLayers(state: ViewportState): void {
    this.containerManager.applyTransform(state);
    this.currentTransform = this.containerManager.getCurrentTransform();
  }

  // Get current transform string
  getCurrentTransform(): string {
    return this.currentTransform;
  }

  // Reset all transforms
  resetAllTransforms(): void {
    this.containerManager.resetTransform();
    this.currentTransform = this.containerManager.getCurrentTransform();
  }

  // Transform validation
  validateTransform(scale: number, panX: number, panY: number): boolean {
    // Check for valid numbers
    if (!Number.isFinite(scale) || !Number.isFinite(panX) || !Number.isFinite(panY)) {
      console.warn('Invalid transform values:', { scale, panX, panY });
      return false;
    }

    // Check scale bounds
    if (scale < VIEWPORT_CONFIG.MIN_ZOOM || scale > VIEWPORT_CONFIG.MAX_ZOOM) {
      console.warn('Scale out of bounds:', scale);
      return false;
    }

    return true;
  }

  // Enable GPU acceleration hints
  enableGPUAcceleration(): void {
    this.containerManager.enableGPUAcceleration();
  }

  // Disable GPU acceleration (for cleanup)
  disableGPUAcceleration(): void {
    this.containerManager.disableGPUAcceleration();
  }

  // Remove a layer
  removeLayer(name: string): boolean {
    return this.containerManager.removeCanvas(name);
  }

  // Check if container is properly set up
  isReady(): boolean {
    return this.containerManager.getContainer() !== null;
  }

  // Get canvas by name
  getLayer(name: string): HTMLCanvasElement | undefined {
    return this.containerManager.getCanvas(name);
  }

  // Apply DPR scaling to a specific canvas context
  applyDPRScaling(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    if (ctx) {
      // Reset any existing scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Apply DPR scaling
      ctx.scale(dpr, dpr);
    }
  }

  // Verify layer alignment (for testing)
  verifyAlignment(): { isAligned: boolean; layers: Array<{ name: string; bounds: DOMRect }> } {
    return this.containerManager.verifyAlignment();
  }

  // Get debug information
  getDebugInfo(): {
    currentTransform: string;
    isReady: boolean;
    layerCount: number;
    containerBounds?: DOMRect;
  } {
    const container = this.containerManager.getContainer();
    return {
      currentTransform: this.currentTransform,
      isReady: this.isReady(),
      layerCount: this.containerManager.getLayerInfo().length,
      containerBounds: container?.getBoundingClientRect()
    };
  }

  // Get container manager for advanced operations
  getContainerManager(): CanvasContainerManager {
    return this.containerManager;
  }

  // Error handling and cleanup
  cleanup(): void {
    this.containerManager.cleanup();
    this.currentTransform = '';
  }

  // Performance optimization: batch transform updates
  batchTransformUpdate(callback: () => void): void {
    requestAnimationFrame(() => {
      callback();
    });
  }

  // Get transform matrix values for advanced operations
  getTransformMatrix(state: ViewportState): {
    a: number; b: number; c: number; d: number; e: number; f: number;
  } {
    return {
      a: state.scale,    // scaleX
      b: 0,              // skewY
      c: 0,              // skewX
      d: state.scale,    // scaleY
      e: state.panX,     // translateX
      f: state.panY      // translateY
    };
  }
}