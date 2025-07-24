/**
 * RenderLoop - Basic RAF rendering with minimal performance monitoring
 * Coordinates render timing and provides simple FPS tracking
 */
export class RenderLoop {
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private readonly maxFpsHistory = 10;

  // Callbacks
  private beforeRenderCallbacks: Array<() => void> = [];
  private afterRenderCallbacks: Array<() => void> = [];

  // Start the render loop
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.scheduleFrame();
  }

  // Stop the render loop
  stop(): void {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Schedule the next frame
  private scheduleFrame(): void {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame((currentTime) => {
      this.renderFrame(currentTime);
      this.scheduleFrame();
    });
  }

  // Render a single frame
  private renderFrame(currentTime: number): void {
    // Calculate frame time and FPS
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      this.updateFpsHistory(fps);
    }

    // Execute before render callbacks
    this.executeCallbacks(this.beforeRenderCallbacks);

    // Main render logic would go here if needed
    // For now, we just coordinate timing

    // Execute after render callbacks
    this.executeCallbacks(this.afterRenderCallbacks);

    this.frameCount++;
  }

  // Execute callbacks safely
  private executeCallbacks(callbacks: Array<() => void>): void {
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in render callback:', error);
      }
    });
  }

  // Update FPS history for averaging
  private updateFpsHistory(fps: number): void {
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.maxFpsHistory) {
      this.fpsHistory.shift();
    }
  }

  // Get current FPS (averaged)
  getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  // Get instantaneous FPS
  getInstantaneousFPS(): number {
    return this.fpsHistory.length > 0 ? Math.round(this.fpsHistory[this.fpsHistory.length - 1]) : 0;
  }

  // Get frame count
  getFrameCount(): number {
    return this.frameCount;
  }

  // Check if render loop is running
  isActive(): boolean {
    return this.isRunning;
  }

  // Register before render callback
  onBeforeRender(callback: () => void): () => void {
    this.beforeRenderCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.beforeRenderCallbacks.indexOf(callback);
      if (index > -1) {
        this.beforeRenderCallbacks.splice(index, 1);
      }
    };
  }

  // Register after render callback
  onAfterRender(callback: () => void): () => void {
    this.afterRenderCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.afterRenderCallbacks.indexOf(callback);
      if (index > -1) {
        this.afterRenderCallbacks.splice(index, 1);
      }
    };
  }

  // Get performance stats
  getPerformanceStats(): {
    fps: number;
    instantFPS: number;
    frameCount: number;
    isRunning: boolean;
    averageFrameTime: number;
  } {
    const fps = this.getCurrentFPS();
    const averageFrameTime = fps > 0 ? 1000 / fps : 0;

    return {
      fps,
      instantFPS: this.getInstantaneousFPS(),
      frameCount: this.frameCount,
      isRunning: this.isRunning,
      averageFrameTime
    };
  }

  // Check if performance is good
  isPerformanceGood(threshold = 55): boolean {
    return this.getCurrentFPS() >= threshold;
  }

  // Reset statistics
  resetStats(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
  }

  // Request a single frame (useful for one-off renders)
  requestSingleFrame(callback: () => void): void {
    requestAnimationFrame(() => {
      this.executeCallbacks([callback]);
    });
  }

  // Cleanup
  cleanup(): void {
    this.stop();
    this.beforeRenderCallbacks = [];
    this.afterRenderCallbacks = [];
    this.fpsHistory = [];
    this.frameCount = 0;
  }

  // Throttle a function to run at most once per frame
  throttleToFrame<T extends (...args: any[]) => void>(fn: T): T {
    let scheduled = false;
    
    return ((...args: any[]) => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          fn(...args);
        });
      }
    }) as T;
  }

  // Debounce a function to run after a delay, canceling previous calls
  debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timeoutId: number | null = null;
    
    return ((...args: any[]) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        fn(...args);
        timeoutId = null;
      }, delay);
    }) as T;
  }
}