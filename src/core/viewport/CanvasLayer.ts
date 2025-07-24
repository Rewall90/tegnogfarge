/**
 * CanvasLayer - Individual canvas layer management
 * Manages 2550x3300px canvas layers with proper setup
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class CanvasLayer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private name: string;

  constructor(name: string, canvas: HTMLCanvasElement) {
    this.name = name;
    this.canvas = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error(`Failed to get 2D context for canvas layer: ${name}`);
    }
    this.context = ctx;
    
    this.setupCanvas();
  }

  /**
   * Setup canvas with fixed dimensions and DPR scaling
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Set fixed canvas dimensions with DPR scaling
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.canvas.style.width = `${CANVAS_WIDTH}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT}px`;
    
    // Position for container transform
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    
    // Prevent individual transforms
    this.canvas.style.transform = 'none';
    this.canvas.style.transformOrigin = '0 0';
    
    // Scale context for DPR
    this.context.scale(dpr, dpr);
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  /**
   * Get layer name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Reset context transformations
   */
  resetTransform(): void {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    // Reapply DPR scaling
    const dpr = window.devicePixelRatio || 1;
    this.context.scale(dpr, dpr);
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT
    };
  }

  /**
   * Check if coordinates are within canvas bounds
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT;
  }
}