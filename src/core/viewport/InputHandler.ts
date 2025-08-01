import type { ViewportState, ViewportMode } from './types';

/**
 * InputHandler - Unified input management for mouse, touch, and gestures
 * Uses Pointer Events API for consistent cross-device behavior
 */
export class InputHandler {
  private canvas: HTMLCanvasElement | null = null;
  private currentMode: ViewportMode = 'draw';
  
  // Gesture tracking
  private activePointers = new Map<number, { x: number; y: number }>();
  private isPanning = false;
  private isZooming = false;
  private initialPinchDistance = 0;
  private lastPanPosition = { x: 0, y: 0 };

  // Event callbacks
  private onZoomCallback: ((scale: number, centerX: number, centerY: number) => void) | null = null;
  private onPanCallback: ((deltaX: number, deltaY: number) => void) | null = null;
  private onDrawCallback: ((x: number, y: number, eventType: 'start' | 'move' | 'end') => void) | null = null;

  // Set the canvas element to attach events to
  setCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvas) {
      this.removeEventListeners();
    }
    
    this.canvas = canvas;
    this.attachEventListeners();
  }

  // Set current mode
  setMode(mode: ViewportMode): void {
    this.currentMode = mode;
    this.resetGestureState();
  }

  // Event callback setters
  onZoom(callback: (scale: number, centerX: number, centerY: number) => void): void {
    this.onZoomCallback = callback;
  }

  onPan(callback: (deltaX: number, deltaY: number) => void): void {
    this.onPanCallback = callback;
  }

  onDraw(callback: (x: number, y: number, eventType: 'start' | 'move' | 'end') => void): void {
    this.onDrawCallback = callback;
  }

  // Attach event listeners
  private attachEventListeners(): void {
    if (!this.canvas) return;

    // Use Pointer Events API for unified handling
    this.canvas.style.touchAction = 'none'; // Prevent browser zoom/scroll
    
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerEnd);
    this.canvas.addEventListener('pointercancel', this.handlePointerEnd);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  // Remove event listeners
  private removeEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerEnd);
    this.canvas.removeEventListener('pointercancel', this.handlePointerEnd);
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }

  // Pointer down handler
  private handlePointerDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.canvas?.setPointerCapture(e.pointerId);

    // Track pointer
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 2 && this.currentMode === 'zoom') {
      // Two pointers = pinch zoom (ONLY when zoom mode is active)
      // Stop any ongoing pan immediately when second finger is added
      if (this.isPanning) {
        this.isPanning = false;
      }
      this.startPinchZoom();
    } else if (this.activePointers.size === 1) {
      if (this.currentMode === 'zoom') {
        // Single pointer in zoom mode = pan (ONLY with exactly 1 finger)
        this.startPan(e);
      } else if (this.currentMode === 'draw') {
        // Single pointer in draw mode = drawing
        this.startDraw(e);
      }
    } else {
      // 3+ fingers - stop pan immediately
      if (this.isPanning) {
        this.isPanning = false;
      }
    }
  };

  // Pointer move handler
  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.activePointers.has(e.pointerId)) return;

    // Update pointer position
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 2 && this.isZooming && this.currentMode === 'zoom') {
      // Handle pinch zoom (ONLY in zoom mode)
      this.updatePinchZoom();
    } else if (this.activePointers.size === 1) {
      if (this.isPanning && this.currentMode === 'zoom') {
        // Handle pan (ONLY with exactly 1 finger)
        this.updatePan(e);
      } else if (this.currentMode === 'draw') {
        // Handle drawing
        this.updateDraw(e);
      }
    } else {
      // More than 2 fingers, 0 fingers, or wrong mode - stop pan immediately
      if (this.isPanning) {
        this.isPanning = false;
      }
      // Also stop zoom if not in zoom mode
      if (this.activePointers.size === 2 && this.currentMode !== 'zoom' && this.isZooming) {
        this.isZooming = false;
      }
    }
  };

  // Pointer end handler
  private handlePointerEnd = (e: PointerEvent): void => {
    this.activePointers.delete(e.pointerId);

    if (this.activePointers.size < 2) {
      this.isZooming = false;
    }

    if (this.activePointers.size === 0) {
      this.isPanning = false;
      if (this.currentMode === 'draw' && this.onDrawCallback) {
        this.onDrawCallback(e.clientX, e.clientY, 'end');
      }
    }
    
    // Pan will automatically stop/start based on finger count in handlePointerMove
    // No complex state management needed here
  };

  // Mouse wheel handler
  private handleWheel = (e: WheelEvent): void => {
    if (this.currentMode !== 'zoom') return;

    e.preventDefault();

    if (!this.canvas || !this.onZoomCallback) return;

    const rect = this.canvas.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    // Calculate zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    this.onZoomCallback(zoomFactor, centerX, centerY);
  };

  // Start pinch zoom
  private startPinchZoom(): void {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length !== 2) return;

    this.isZooming = true;
    this.initialPinchDistance = this.calculateDistance(pointers[0], pointers[1]);
  }

  // Update pinch zoom
  private updatePinchZoom(): void {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length !== 2 || !this.onZoomCallback) return;

    const currentDistance = this.calculateDistance(pointers[0], pointers[1]);
    if (this.initialPinchDistance === 0) return;

    // Calculate zoom factor
    const zoomFactor = currentDistance / this.initialPinchDistance;
    
    // Calculate center point
    const centerX = (pointers[0].x + pointers[1].x) / 2;
    const centerY = (pointers[0].y + pointers[1].y) / 2;

    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const localCenterX = centerX - rect.left;
    const localCenterY = centerY - rect.top;

    this.onZoomCallback(zoomFactor, localCenterX, localCenterY);
    this.initialPinchDistance = currentDistance;
  }

  // Start pan
  private startPan(e: PointerEvent): void {
    this.isPanning = true;
    this.lastPanPosition = { x: e.clientX, y: e.clientY };
  }

  // Update pan
  private updatePan(e: PointerEvent): void {
    if (!this.isPanning || !this.onPanCallback) return;
    
    // CRITICAL: Never allow pan during pinch zoom or with more than 1 finger
    if (this.isZooming || this.activePointers.size !== 1) {
      this.isPanning = false;
      return;
    }

    const deltaX = e.clientX - this.lastPanPosition.x;
    const deltaY = e.clientY - this.lastPanPosition.y;

    this.onPanCallback(deltaX, deltaY);
    
    this.lastPanPosition = { x: e.clientX, y: e.clientY };
  }

  // Start draw
  private startDraw(e: PointerEvent): void {
    if (this.onDrawCallback) {
      this.onDrawCallback(e.clientX, e.clientY, 'start');
    }
  }

  // Update draw
  private updateDraw(e: PointerEvent): void {
    if (this.onDrawCallback) {
      this.onDrawCallback(e.clientX, e.clientY, 'move');
    }
  }

  // Calculate distance between two points
  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Reset gesture state
  private resetGestureState(): void {
    this.activePointers.clear();
    this.isPanning = false;
    this.isZooming = false;
    this.initialPinchDistance = 0;
  }

  // Prevent browser zoom (utility method)
  preventBrowserZoom(e: Event): void {
    e.preventDefault();
  }

  // Cleanup
  cleanup(): void {
    this.removeEventListeners();
    this.resetGestureState();
    this.canvas = null;
    this.onZoomCallback = null;
    this.onPanCallback = null;
    this.onDrawCallback = null;
  }

  // Check if input handler is ready
  isReady(): boolean {
    return this.canvas !== null;
  }

  // Get current gesture state (for debugging)
  getGestureState(): {
    activePointers: number;
    isPanning: boolean;
    isZooming: boolean;
    mode: ViewportMode;
  } {
    return {
      activePointers: this.activePointers.size,
      isPanning: this.isPanning,
      isZooming: this.isZooming,
      mode: this.currentMode
    };
  }
}