/**
 * RenderingSystem - CSS transform application and coordination
 * Handles the application of CSS transforms to viewport elements
 */

import type { ViewportState } from './types';

export class RenderingSystem {
  private containerElement: HTMLElement | null = null;
  private canvasLayers = new Map<string, HTMLCanvasElement>();
  private currentTransform: string = '';

  /**
   * Set the container element that will receive CSS transforms
   */
  setContainer(element: HTMLElement): void {
    this.containerElement = element;
    this.setupContainer();
  }

  /**
   * Setup container for optimal CSS transforms
   */
  private setupContainer(): void {
    if (!this.containerElement) return;

    this.containerElement.style.transformOrigin = '0 0';
    this.containerElement.style.willChange = 'transform';
    this.containerElement.style.position = 'absolute';
  }

  /**
   * Add a canvas layer to be managed
   */
  addCanvas(name: string, canvas: HTMLCanvasElement): void {
    this.canvasLayers.set(name, canvas);
    
    // Add to container if not already there
    if (this.containerElement && !this.containerElement.contains(canvas)) {
      this.containerElement.appendChild(canvas);
    }
  }

  /**
   * Apply viewport state to all managed elements
   */
  applyViewportState(state: ViewportState): void {
    if (!this.containerElement) {
      console.warn('Container element not set for rendering');
      return;
    }

    const transformString = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
    
    // Only update if transform actually changed
    if (transformString !== this.currentTransform) {
      this.containerElement.style.transform = transformString;
      this.currentTransform = transformString;
    }
  }

  /**
   * Reset all transforms
   */
  reset(): void {
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
   * Cleanup
   */
  cleanup(): void {
    this.canvasLayers.clear();
    this.containerElement = null;
    this.currentTransform = '';
  }
}