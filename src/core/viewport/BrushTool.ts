/**
 * BrushTool - Enhanced brush tool with CSS transform coordinate support
 * Provides pixel-perfect drawing across all zoom levels
 */

import type { CanvasCoordinates, ViewportMode } from './types';
import { ToolCoordinateHandler } from './ToolCoordinateHandler';
import { ViewportManager } from './ViewportManager';

interface BrushSettings {
  size: number;
  color: string;
  opacity: number;
  hardness: number;
  spacing: number;
}

interface DrawingTool {
  enable?(): void;
  disable?(): void;
  handlePointerStart?(e: PointerEvent): void;
  handlePointerMove?(e: PointerEvent): void;
  handlePointerEnd?(e: PointerEvent): void;
}

export class BrushTool implements DrawingTool {
  private coordinateHandler: ToolCoordinateHandler;
  private viewportManager: ViewportManager;
  private mainCanvas: HTMLCanvasElement;
  private isDrawing = false;
  private lastPoint: CanvasCoordinates | null = null;
  private enabled = true;
  private currentStroke: CanvasCoordinates[] = [];
  
  // Brush settings
  private settings: BrushSettings = {
    size: 10,
    color: '#000000',
    opacity: 1.0,
    hardness: 1.0,
    spacing: 0.1
  };

  constructor(
    coordinateHandler: ToolCoordinateHandler,
    viewportManager: ViewportManager,
    mainCanvas: HTMLCanvasElement
  ) {
    this.coordinateHandler = coordinateHandler;
    this.viewportManager = viewportManager;
    this.mainCanvas = mainCanvas;
  }

  /**
   * Enable the brush tool
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable the brush tool
   */
  disable(): void {
    this.enabled = false;
    this.endDrawing();
  }

  /**
   * Handle pointer start (begin drawing)
   */
  handlePointerStart(e: PointerEvent): void {
    if (!this.enabled || this.viewportManager.getState().mode !== 'draw') {
      return;
    }

    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    if (!this.coordinateHandler.validateCoordinates(coords)) {
      console.warn('Invalid brush coordinates:', coords);
      return;
    }

    this.isDrawing = true;
    this.lastPoint = coords;
    this.currentStroke = [coords];
    
    // Draw initial point
    this.drawPoint(coords);
    
    // Prevent default to avoid browser behaviors
    e.preventDefault();
  }

  /**
   * Handle pointer move (continue drawing)
   */
  handlePointerMove(e: PointerEvent): void {
    if (!this.isDrawing || !this.enabled || this.viewportManager.getState().mode !== 'draw') {
      return;
    }

    const coords = this.coordinateHandler.getCanvasCoordinates(e);
    if (!this.coordinateHandler.validateCoordinates(coords)) {
      console.warn('Invalid brush coordinates during move:', coords);
      return;
    }

    if (this.lastPoint) {
      // Check if we've moved far enough to draw (spacing control)
      const distance = this.coordinateHandler.calculateDistance(this.lastPoint, coords);
      const minDistance = this.settings.size * this.settings.spacing;

      if (distance >= minDistance) {
        this.drawLine(this.lastPoint, coords);
        this.lastPoint = coords;
        this.currentStroke.push(coords);
      }
    } else {
      // Fallback if lastPoint is null
      this.drawPoint(coords);
      this.lastPoint = coords;
      this.currentStroke.push(coords);
    }

    e.preventDefault();
  }

  /**
   * Handle pointer end (finish drawing)
   */
  handlePointerEnd(e: PointerEvent): void {
    if (!this.isDrawing) return;

    this.endDrawing();
    e.preventDefault();
  }

  /**
   * End the current drawing stroke
   */
  private endDrawing(): void {
    this.isDrawing = false;
    this.lastPoint = null;
    
    // Finalize the stroke (could trigger undo/redo system here)
    if (this.currentStroke.length > 0) {
      this.finalizeStroke(this.currentStroke);
      this.currentStroke = [];
    }
  }

  /**
   * Draw a single point
   */
  private drawPoint(coords: CanvasCoordinates): void {
    const ctx = this.mainCanvas.getContext('2d');
    if (!ctx) return;

    this.setupBrushContext(ctx);

    ctx.beginPath();
    ctx.arc(coords.x, coords.y, this.getEffectiveBrushSize() / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw a line between two points
   */
  private drawLine(from: CanvasCoordinates, to: CanvasCoordinates): void {
    const ctx = this.mainCanvas.getContext('2d');
    if (!ctx) return;

    // Use interpolation for smooth lines at high zoom levels
    const points = this.coordinateHandler.getInterpolatedPoints(
      from, 
      to, 
      Math.max(1, this.settings.size * 0.5)
    );

    this.setupBrushContext(ctx);

    // Draw interpolated points for smooth stroke
    for (let i = 1; i < points.length; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();

      // Draw circles at each point for better coverage
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, this.getEffectiveBrushSize() / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Setup canvas context for brush drawing
   */
  private setupBrushContext(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = this.settings.opacity;
    ctx.fillStyle = this.settings.color;
    ctx.strokeStyle = this.settings.color;
    ctx.lineWidth = this.getEffectiveBrushSize();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Apply hardness through globalCompositeOperation or shadow blur
    if (this.settings.hardness < 1.0) {
      ctx.shadowColor = this.settings.color;
      ctx.shadowBlur = (1 - this.settings.hardness) * this.settings.size * 0.5;
    } else {
      ctx.shadowBlur = 0;
    }
  }

  /**
   * Get effective brush size (remains constant in canvas pixels)
   */
  private getEffectiveBrushSize(): number {
    // Brush size remains constant in canvas pixels regardless of zoom level
    // since we draw on the internal canvas which is always 2550x3300
    return this.settings.size;
  }

  /**
   * Finalize stroke (for undo/redo system integration)
   */
  private finalizeStroke(stroke: CanvasCoordinates[]): void {
    // This is where you would integrate with an undo/redo system
    // For now, we just log the stroke completion
    console.debug('Brush stroke completed with', stroke.length, 'points');
    
    // Could emit an event here for external systems
    // this.emit('strokeComplete', { stroke, settings: { ...this.settings } });
  }

  /**
   * Update brush size
   */
  setBrushSize(size: number): void {
    this.settings.size = Math.max(1, Math.min(100, size));
  }

  /**
   * Get current brush size
   */
  getBrushSize(): number {
    return this.settings.size;
  }

  /**
   * Update brush color
   */
  setBrushColor(color: string): void {
    this.settings.color = color;
  }

  /**
   * Get current brush color
   */
  getBrushColor(): string {
    return this.settings.color;
  }

  /**
   * Update brush opacity
   */
  setBrushOpacity(opacity: number): void {
    this.settings.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Get current brush opacity
   */
  getBrushOpacity(): number {
    return this.settings.opacity;
  }

  /**
   * Update brush hardness
   */
  setBrushHardness(hardness: number): void {
    this.settings.hardness = Math.max(0, Math.min(1, hardness));
  }

  /**
   * Get current brush hardness
   */
  getBrushHardness(): number {
    return this.settings.hardness;
  }

  /**
   * Update brush spacing
   */
  setBrushSpacing(spacing: number): void {
    this.settings.spacing = Math.max(0.01, Math.min(2, spacing));
  }

  /**
   * Get current brush spacing
   */
  getBrushSpacing(): number {
    return this.settings.spacing;
  }

  /**
   * Get all brush settings
   */
  getSettings(): BrushSettings {
    return { ...this.settings };
  }

  /**
   * Update all brush settings
   */
  updateSettings(newSettings: Partial<BrushSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Check if tool is currently drawing
   */
  isActive(): boolean {
    return this.isDrawing;
  }

  /**
   * Check if tool is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current stroke points (for real-time preview)
   */
  getCurrentStroke(): CanvasCoordinates[] {
    return [...this.currentStroke];
  }

  /**
   * Clear current stroke (cancel operation)
   */
  cancelCurrentStroke(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.lastPoint = null;
      this.currentStroke = [];
    }
  }

  /**
   * Test drawing at specific coordinates (for testing)
   */
  testDraw(coords: CanvasCoordinates): boolean {
    if (!this.coordinateHandler.validateCoordinates(coords)) {
      return false;
    }

    this.drawPoint(coords);
    return true;
  }

  /**
   * Get tool information for UI
   */
  getToolInfo(): {
    name: string;
    isActive: boolean;
    isEnabled: boolean;
    settings: BrushSettings;
  } {
    return {
      name: 'Brush',
      isActive: this.isDrawing,
      isEnabled: this.enabled,
      settings: this.getSettings()
    };
  }

  /**
   * Reset tool to default state
   */
  reset(): void {
    this.endDrawing();
    this.settings = {
      size: 10,
      color: '#000000',
      opacity: 1.0,
      hardness: 1.0,
      spacing: 0.1
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.endDrawing();
    this.enabled = false;
  }
}