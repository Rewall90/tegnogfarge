/**
 * CanvasContainerManager - Layer synchronization for perfect alignment
 * Manages container-based transforms for all canvas layers
 */

import type { ViewportState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class CanvasContainerManager {
  private containerElement: HTMLElement | null = null;
  private canvasLayers = new Map<string, { canvas: HTMLCanvasElement; zIndex: number }>();
  private currentTransform: string = '';
  private isInitialized = false;

  /**
   * Setup the container element for CSS transforms
   */
  setupContainer(containerElement: HTMLElement): void {
    this.containerElement = containerElement;
    this.configureContainerCSS();
    this.isInitialized = true;
  }

  /**
   * Configure container CSS properties for optimal transforms
   */
  private configureContainerCSS(): void {
    if (!this.containerElement) return;

    // Essential properties for smooth transforms
    this.containerElement.style.position = 'absolute';
    this.containerElement.style.transformOrigin = '0 0';
    this.containerElement.style.willChange = 'transform';
    this.containerElement.style.backfaceVisibility = 'hidden';
    
    // Optional GPU acceleration hints
    this.containerElement.style.transform = 'translateZ(0)';
  }

  /**
   * Add a canvas layer to the container with proper configuration
   */
  addCanvas(name: string, canvas: HTMLCanvasElement, zIndex: number): void {
    if (!this.containerElement) {
      throw new Error('Container must be setup before adding canvases');
    }

    this.setupCanvas(canvas, zIndex);
    this.canvasLayers.set(name, { canvas, zIndex });
    
    // Add to container if not already there
    if (!this.containerElement.contains(canvas)) {
      this.containerElement.appendChild(canvas);
    }

    console.log(`Added canvas layer: ${name} with z-index: ${zIndex}`);
  }

  /**
   * Setup individual canvas with consistent properties
   */
  private setupCanvas(canvas: HTMLCanvasElement, zIndex: number): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Set fixed dimensions (2550x3300px) with DPR scaling
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    
    // Position absolutely within container
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = zIndex.toString();
    
    // Prevent individual transforms - container handles all transforms
    canvas.style.transform = 'none';
    canvas.style.transformOrigin = '0 0';
    
    // Apply DPR scaling to context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  /**
   * Apply viewport transform to container (affects all layers)
   */
  applyTransform(state: ViewportState): void {
    if (!this.containerElement) {
      console.warn('Container not initialized for transform application');
      return;
    }

    const transformString = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
    
    // Only update if transform actually changed (performance optimization)
    if (transformString !== this.currentTransform) {
      this.containerElement.style.transform = transformString;
      this.currentTransform = transformString;
    }
  }

  /**
   * Get all canvas layers for external access
   */
  getAllCanvases(): Map<string, HTMLCanvasElement> {
    const canvases = new Map<string, HTMLCanvasElement>();
    this.canvasLayers.forEach((layer, name) => {
      canvases.set(name, layer.canvas);
    });
    return canvases;
  }

  /**
   * Get a specific canvas layer by name
   */
  getCanvas(name: string): HTMLCanvasElement | undefined {
    return this.canvasLayers.get(name)?.canvas;
  }

  /**
   * Remove a canvas layer
   */
  removeCanvas(name: string): boolean {
    const layer = this.canvasLayers.get(name);
    if (layer && this.containerElement) {
      if (this.containerElement.contains(layer.canvas)) {
        this.containerElement.removeChild(layer.canvas);
      }
      this.canvasLayers.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Reset all transforms to identity
   */
  resetTransform(): void {
    if (this.containerElement) {
      this.containerElement.style.transform = 'translate(0px, 0px) scale(1)';
      this.currentTransform = 'translate(0px, 0px) scale(1)';
    }
  }

  /**
   * Get current transform string
   */
  getCurrentTransform(): string {
    return this.currentTransform;
  }

  /**
   * Verify alignment across all layers (for testing)
   */
  verifyAlignment(): {
    isAligned: boolean;
    layers: Array<{ name: string; bounds: DOMRect }>;
  } {
    const layers: Array<{ name: string; bounds: DOMRect }> = [];
    let isAligned = true;
    let referenceBounds: DOMRect | null = null;

    this.canvasLayers.forEach((layer, name) => {
      const bounds = layer.canvas.getBoundingClientRect();
      layers.push({ name, bounds });

      if (!referenceBounds) {
        referenceBounds = bounds;
      } else {
        // Check if bounds match reference (within 1px tolerance for floating point precision)
        const tolerance = 1;
        if (Math.abs(bounds.x - referenceBounds.x) > tolerance ||
            Math.abs(bounds.y - referenceBounds.y) > tolerance ||
            Math.abs(bounds.width - referenceBounds.width) > tolerance ||
            Math.abs(bounds.height - referenceBounds.height) > tolerance) {
          isAligned = false;
        }
      }
    });

    return { isAligned, layers };
  }

  /**
   * Get layer information for debugging
   */
  getLayerInfo(): Array<{
    name: string;
    zIndex: number;
    dimensions: { width: number; height: number };
    position: { x: number; y: number };
  }> {
    const info: Array<{
      name: string;
      zIndex: number;
      dimensions: { width: number; height: number };
      position: { x: number; y: number };
    }> = [];

    this.canvasLayers.forEach((layer, name) => {
      const rect = layer.canvas.getBoundingClientRect();
      info.push({
        name,
        zIndex: layer.zIndex,
        dimensions: {
          width: layer.canvas.width,
          height: layer.canvas.height
        },
        position: {
          x: rect.x,
          y: rect.y
        }
      });
    });

    return info;
  }

  /**
   * Enable GPU acceleration for better performance
   */
  enableGPUAcceleration(): void {
    if (this.containerElement) {
      this.containerElement.style.willChange = 'transform';
      this.containerElement.style.transform = 'translateZ(0)';
    }
  }

  /**
   * Disable GPU acceleration (for cleanup)
   */
  disableGPUAcceleration(): void {
    if (this.containerElement) {
      this.containerElement.style.willChange = 'auto';
    }
  }

  /**
   * Check if container is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.containerElement !== null;
  }

  /**
   * Get container element
   */
  getContainer(): HTMLElement | null {
    return this.containerElement;
  }

  /**
   * Get number of managed layers
   */
  getLayerCount(): number {
    return this.canvasLayers.size;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    // Remove all canvases from container
    this.canvasLayers.forEach((layer, name) => {
      if (this.containerElement && this.containerElement.contains(layer.canvas)) {
        this.containerElement.removeChild(layer.canvas);
      }
    });

    this.canvasLayers.clear();
    this.containerElement = null;
    this.currentTransform = '';
    this.isInitialized = false;
  }

  /**
   * Performance optimization: batch transform updates
   */
  batchTransformUpdate(callback: () => void): void {
    requestAnimationFrame(() => {
      callback();
    });
  }
}