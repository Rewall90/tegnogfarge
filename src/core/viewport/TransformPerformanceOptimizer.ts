/**
 * TransformPerformanceOptimizer - Optimizes CSS transform performance
 * Manages GPU acceleration, layout optimization, and render hints
 */
export class TransformPerformanceOptimizer {
  private containerElement: HTMLElement;
  private isGPUEnabled = false;
  private originalStyles: Partial<CSSStyleDeclaration> = {};
  
  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
  }
  
  /**
   * Enable GPU acceleration for transforms
   */
  enableGPUAcceleration(): void {
    if (this.isGPUEnabled) return;
    
    // Store original styles
    this.originalStyles.willChange = this.containerElement.style.willChange;
    this.originalStyles.transform = this.containerElement.style.transform;
    
    // Enable GPU acceleration
    this.containerElement.style.willChange = 'transform';
    
    // Force layer creation with translateZ
    if (!this.containerElement.style.transform.includes('translateZ')) {
      this.containerElement.style.transform += ' translateZ(0)';
    }
    
    this.isGPUEnabled = true;
  }
  
  /**
   * Disable GPU acceleration
   */
  disableGPUAcceleration(): void {
    if (!this.isGPUEnabled) return;
    
    // Restore original styles
    this.containerElement.style.willChange = this.originalStyles.willChange || 'auto';
    
    // Remove translateZ hack
    if (this.containerElement.style.transform.includes('translateZ(0)')) {
      this.containerElement.style.transform = this.containerElement.style.transform
        .replace(/\s*translateZ\(0\)/, '');
    }
    
    this.isGPUEnabled = false;
  }
  
  /**
   * Optimize container for transforms
   */
  optimizeForTransforms(): void {
    // Store original styles
    const styles = this.containerElement.style;
    this.originalStyles = {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      backfaceVisibility: styles.backfaceVisibility,
      perspective: styles.perspective,
      transformStyle: styles.transformStyle
    };
    
    // Apply optimizations
    styles.position = 'absolute';
    styles.top = '0';
    styles.left = '0';
    
    // Optimize rendering
    styles.backfaceVisibility = 'hidden';
    styles.perspective = '1000px';
    styles.transformStyle = 'preserve-3d';
    
    // Prevent text selection during transforms
    styles.userSelect = 'none';
    styles.webkitUserSelect = 'none';
  }
  
  /**
   * Reset optimizations
   */
  resetOptimizations(): void {
    const styles = this.containerElement.style;
    
    // Restore original styles
    Object.entries(this.originalStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        (styles as any)[key] = value;
      }
    });
    
    this.disableGPUAcceleration();
  }
  
  /**
   * Prepare for animation
   */
  prepareForAnimation(): void {
    // Hint browser about upcoming animation
    this.containerElement.style.willChange = 'transform';
    
    // Disable pointer events during animation
    this.containerElement.style.pointerEvents = 'none';
  }
  
  /**
   * Cleanup after animation
   */
  cleanupAfterAnimation(): void {
    // Re-enable pointer events
    this.containerElement.style.pointerEvents = 'auto';
    
    // Consider removing will-change after animation
    // (kept if GPU acceleration is enabled)
    if (!this.isGPUEnabled) {
      this.containerElement.style.willChange = 'auto';
    }
  }
  
  /**
   * Apply performance hints for specific operations
   */
  applyPerformanceHints(operation: 'pan' | 'zoom' | 'idle'): void {
    switch (operation) {
      case 'pan':
        // Optimize for smooth panning
        this.containerElement.style.willChange = 'transform';
        this.containerElement.style.cursor = 'grabbing';
        break;
        
      case 'zoom':
        // Optimize for zoom operations
        this.containerElement.style.willChange = 'transform';
        this.containerElement.style.cursor = 'zoom-in';
        break;
        
      case 'idle':
        // Remove optimization hints when idle
        if (!this.isGPUEnabled) {
          this.containerElement.style.willChange = 'auto';
        }
        this.containerElement.style.cursor = 'default';
        break;
    }
  }
  
  /**
   * Check if GPU acceleration is available
   */
  static isGPUAccelerationAvailable(): boolean {
    // Check for CSS transform support
    if (!('transform' in document.documentElement.style)) {
      return false;
    }
    
    // Check for 3D transform support (indicates GPU acceleration)
    const testElement = document.createElement('div');
    testElement.style.transform = 'translateZ(0)';
    return testElement.style.transform !== '';
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    gpuEnabled: boolean;
    willChange: string;
    hasLayerHints: boolean;
    transform3d: boolean;
  } {
    const styles = window.getComputedStyle(this.containerElement);
    const transform = styles.transform || 'none';
    
    return {
      gpuEnabled: this.isGPUEnabled,
      willChange: styles.willChange,
      hasLayerHints: styles.willChange === 'transform',
      transform3d: transform.includes('matrix3d') || transform.includes('translateZ')
    };
  }
  
  /**
   * Optimize for device pixel ratio
   */
  optimizeForDPR(): void {
    const dpr = window.devicePixelRatio || 1;
    
    if (dpr > 1) {
      // For high DPR displays, ensure crisp rendering
      this.containerElement.style.imageRendering = 'crisp-edges';
      this.containerElement.style.imageRendering = 'pixelated'; // Fallback
    }
  }
  
  /**
   * Monitor performance and adjust optimizations
   */
  private performanceMonitor: number | null = null;
  private frameCount = 0;
  private lastFrameTime = 0;
  
  startPerformanceMonitoring(callback?: (fps: number) => void): void {
    if (this.performanceMonitor) return;
    
    let lastTime = performance.now();
    let frames = 0;
    
    const monitor = (currentTime: number) => {
      frames++;
      
      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = frames;
        frames = 0;
        lastTime = currentTime;
        
        // Adjust optimizations based on FPS
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
          this.applyLowPerformanceOptimizations();
        } else if (fps > 55) {
          this.applyHighPerformanceOptimizations();
        }
        
        callback?.(fps);
      }
      
      this.performanceMonitor = requestAnimationFrame(monitor);
    };
    
    this.performanceMonitor = requestAnimationFrame(monitor);
  }
  
  stopPerformanceMonitoring(): void {
    if (this.performanceMonitor) {
      cancelAnimationFrame(this.performanceMonitor);
      this.performanceMonitor = null;
    }
  }
  
  /**
   * Apply optimizations for low performance scenarios
   */
  private applyLowPerformanceOptimizations(): void {
    // Reduce visual quality for better performance
    this.containerElement.style.imageRendering = 'auto';
    
    // Disable shadows or other expensive effects
    const canvases = this.containerElement.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      canvas.style.filter = 'none';
    });
  }
  
  /**
   * Apply optimizations for high performance scenarios
   */
  private applyHighPerformanceOptimizations(): void {
    // Enable higher quality rendering
    this.containerElement.style.imageRendering = 'high-quality';
    
    // Can enable additional visual effects
    if (!this.isGPUEnabled) {
      this.enableGPUAcceleration();
    }
  }
  
  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getPerformanceMetrics();
    
    if (!metrics.gpuEnabled && TransformPerformanceOptimizer.isGPUAccelerationAvailable()) {
      recommendations.push('Enable GPU acceleration for better performance');
    }
    
    if (!metrics.hasLayerHints) {
      recommendations.push('Add will-change hints for smoother transforms');
    }
    
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 2) {
      recommendations.push('Consider reducing canvas resolution on high-DPR displays');
    }
    
    return recommendations;
  }
}