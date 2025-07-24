import type { ViewportState } from './types';

/**
 * CSSTransformApplier - Handles efficient CSS transform application
 * Manages transform string generation and DOM updates
 */
export class CSSTransformApplier {
  private containerElement: HTMLElement;
  private currentTransform: string = '';
  private transformHistory: string[] = [];
  private maxHistorySize = 10;
  
  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
    this.setupContainer();
  }
  
  /**
   * Setup container element for optimal transforms
   */
  private setupContainer(): void {
    this.containerElement.style.transformOrigin = '0 0';
    this.containerElement.style.willChange = 'transform';
    this.containerElement.style.position = 'absolute';
    this.containerElement.style.backfaceVisibility = 'hidden';
    this.containerElement.style.perspective = '1000px';
  }
  
  /**
   * Apply transform based on viewport state
   */
  applyTransform(state: ViewportState): void {
    const transformString = this.generateTransformString(state);
    
    // Only update if transform actually changed
    if (transformString !== this.currentTransform) {
      this.containerElement.style.transform = transformString;
      this.currentTransform = transformString;
      this.addToHistory(transformString);
    }
  }
  
  /**
   * Generate transform string from viewport state
   */
  private generateTransformString(state: ViewportState): string {
    return `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  }
  
  /**
   * Apply transform with custom string
   */
  applyTransformString(transformString: string): void {
    if (transformString !== this.currentTransform) {
      this.containerElement.style.transform = transformString;
      this.currentTransform = transformString;
      this.addToHistory(transformString);
    }
  }
  
  /**
   * Get current transform string
   */
  getCurrentTransform(): string {
    return this.currentTransform;
  }
  
  /**
   * Reset transform to identity
   */
  resetTransform(): void {
    this.applyTransformString('translate(0px, 0px) scale(1)');
  }
  
  /**
   * Add transform to history
   */
  private addToHistory(transform: string): void {
    this.transformHistory.push(transform);
    if (this.transformHistory.length > this.maxHistorySize) {
      this.transformHistory.shift();
    }
  }
  
  /**
   * Get transform history
   */
  getTransformHistory(): string[] {
    return [...this.transformHistory];
  }
  
  /**
   * Apply zoom at specific point
   */
  applyZoomAtPoint(
    scale: number,
    panX: number,
    panY: number,
    zoomCenterX: number,
    zoomCenterY: number,
    previousScale: number
  ): void {
    // Calculate scale factor
    const scaleFactor = scale / previousScale;
    
    // Calculate new pan to keep zoom centered on point
    const adjustedPanX = zoomCenterX - (zoomCenterX - panX) * scaleFactor;
    const adjustedPanY = zoomCenterY - (zoomCenterY - panY) * scaleFactor;
    
    const transformString = `translate(${adjustedPanX}px, ${adjustedPanY}px) scale(${scale})`;
    this.applyTransformString(transformString);
  }
  
  /**
   * Enable GPU acceleration
   */
  enableGPUAcceleration(): void {
    this.containerElement.style.willChange = 'transform';
    // Force layer creation for better performance
    if (!this.currentTransform.includes('translateZ')) {
      this.containerElement.style.transform += ' translateZ(0)';
    }
  }
  
  /**
   * Disable GPU acceleration
   */
  disableGPUAcceleration(): void {
    this.containerElement.style.willChange = 'auto';
  }
  
  /**
   * Get computed transform matrix
   */
  getComputedTransformMatrix(): DOMMatrix | null {
    const computedStyle = window.getComputedStyle(this.containerElement);
    const transformValue = computedStyle.transform;
    
    if (transformValue === 'none') {
      return new DOMMatrix();
    }
    
    try {
      return new DOMMatrix(transformValue);
    } catch (error) {
      console.warn('Failed to parse transform matrix:', error);
      return null;
    }
  }
  
  /**
   * Set transform origin
   */
  setTransformOrigin(originX: number | string, originY: number | string): void {
    const x = typeof originX === 'number' ? `${originX}px` : originX;
    const y = typeof originY === 'number' ? `${originY}px` : originY;
    this.containerElement.style.transformOrigin = `${x} ${y}`;
  }
  
  /**
   * Get transform origin
   */
  getTransformOrigin(): { x: string; y: string } {
    const origin = this.containerElement.style.transformOrigin.split(' ');
    return {
      x: origin[0] || '0',
      y: origin[1] || '0'
    };
  }
  
  /**
   * Check if transforms are supported
   */
  static isTransformSupported(): boolean {
    return 'transform' in document.documentElement.style;
  }
  
  /**
   * Get debug information
   */
  getDebugInfo(): {
    currentTransform: string;
    transformOrigin: { x: string; y: string };
    historyLength: number;
    gpuAccelerated: boolean;
  } {
    return {
      currentTransform: this.currentTransform,
      transformOrigin: this.getTransformOrigin(),
      historyLength: this.transformHistory.length,
      gpuAccelerated: this.containerElement.style.willChange === 'transform'
    };
  }
}