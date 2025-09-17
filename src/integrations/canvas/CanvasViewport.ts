import { ViewportManager } from '../../core/viewport/ViewportManager';
import { InputHandler } from '../../core/viewport/InputHandler';
import { RenderingSystem } from '../../core/viewport/RenderingSystem';
import { CanvasLayer } from '../../core/viewport/CanvasLayer';
import { CanvasContainerManager } from '../../core/viewport/CanvasContainerManager';

/**
 * CanvasViewport - Canvas-specific integration layer
 * 
 * Responsibilities:
 * - Coordinate between React components and core viewport system
 * - Manage canvas layers and their lifecycle
 * - Handle canvas-specific initialization and cleanup
 * - Provide simplified API for canvas operations
 */
export class CanvasViewport {
  private viewportManager: ViewportManager;
  private inputHandler: InputHandler;
  private renderingSystem: RenderingSystem;
  private containerManager: CanvasContainerManager;
  private layers: Map<string, CanvasLayer> = new Map();
  private container: HTMLElement | null = null;

  constructor(
    viewportManager: ViewportManager,
    inputHandler: InputHandler,
    renderingSystem: RenderingSystem
  ) {
    this.viewportManager = viewportManager;
    this.inputHandler = inputHandler;
    this.renderingSystem = renderingSystem;
    this.containerManager = new CanvasContainerManager(viewportManager, renderingSystem);
  }

  /**
   * Initialize the canvas viewport with a container element
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    
    // Set up container manager
    this.containerManager.setupContainer(container);
    
    // Set up rendering system
    this.renderingSystem.setContainer(container);
    
    // Set up input handler
    this.inputHandler.attach(container);
  }

  /**
   * Create and register a new canvas layer
   */
  createLayer(id: string, canvas: HTMLCanvasElement, zIndex: number = 0): CanvasLayer {
    if (this.layers.has(id)) {
      throw new Error(`Canvas layer with id '${id}' already exists`);
    }

    // Add canvas to container manager for synchronized transforms
    this.containerManager.addCanvas(id, canvas, zIndex);

    const layer = new CanvasLayer(
      id,
      canvas,
      this.viewportManager,
      this.renderingSystem
    );

    this.layers.set(id, layer);
    return layer;
  }

  /**
   * Get a canvas layer by ID
   */
  getLayer(id: string): CanvasLayer | undefined {
    return this.layers.get(id);
  }

  /**
   * Remove a canvas layer
   */
  removeLayer(id: string): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.destroy();
      this.layers.delete(id);
    }
  }

  /**
   * Get all registered layer IDs
   */
  getLayerIds(): string[] {
    return Array.from(this.layers.keys());
  }

  /**
   * Get the number of registered layers
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenX: number, screenY: number): { x: number, y: number } {
    return this.renderingSystem.screenToCanvas(screenX, screenY);
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): { x: number, y: number } {
    return this.renderingSystem.canvasToScreen(canvasX, canvasY);
  }

  /**
   * Get current viewport state
   */
  getViewportState() {
    return this.viewportManager.getState();
  }

  /**
   * Set viewport state
   */
  setViewportState(updates: Partial<ReturnType<typeof this.getViewportState>>): void {
    this.viewportManager.setState(updates);
  }

  /**
   * Toggle between zoom/pan and drawing modes
   */
  toggleMode(): void {
    this.viewportManager.toggleMode();
  }

  /**
   * Set specific mode
   */
  setMode(mode: 'zoom' | 'draw'): void {
    this.viewportManager.setMode(mode);
  }

  /**
   * Check if currently in zoom mode
   */
  isZoomMode(): boolean {
    return this.viewportManager.getState().mode === 'zoom';
  }

  /**
   * Check if currently in draw mode
   */
  isDrawMode(): boolean {
    return this.viewportManager.getState().mode === 'draw';
  }

  /**
   * Reset viewport to default state
   */
  reset(): void {
    this.viewportManager.setState({
      scale: 1.0,
      offsetX: 0,
      offsetY: 0
    });
  }

  /**
   * Zoom to fit canvas in viewport
   */
  zoomToFit(): void {
    // TODO: Implement zoom to fit logic based on container size
    this.viewportManager.setState({ scale: 0.25 });
  }

  /**
   * Zoom in by a factor
   */
  zoomIn(factor: number = 1.2): void {
    const currentState = this.viewportManager.getState();
    const newScale = Math.min(4.0, currentState.scale * factor);
    this.viewportManager.setState({ scale: newScale });
  }

  /**
   * Zoom out by a factor
   */
  zoomOut(factor: number = 1.2): void {
    const currentState = this.viewportManager.getState();
    const newScale = Math.max(0.25, currentState.scale / factor);
    this.viewportManager.setState({ scale: newScale });
  }

  /**
   * Set zoom level directly
   */
  setZoom(scale: number): void {
    this.viewportManager.setState({ scale });
  }

  /**
   * Pan viewport by offset
   */
  pan(deltaX: number, deltaY: number): void {
    const currentState = this.viewportManager.getState();
    this.viewportManager.setState({
      offsetX: currentState.offsetX + deltaX,
      offsetY: currentState.offsetY + deltaY
    });
  }

  /**
   * Get the container element
   */
  getContainer(): HTMLElement | null {
    return this.container;
  }

  /**
   * Get the viewport manager instance
   */
  getViewportManager(): ViewportManager {
    return this.viewportManager;
  }

  /**
   * Get the input handler instance
   */
  getInputHandler(): InputHandler {
    return this.inputHandler;
  }

  /**
   * Get the rendering system instance
   */
  getRenderingSystem(): RenderingSystem {
    return this.renderingSystem;
  }

  /**
   * Get the container manager instance
   */
  getContainerManager(): CanvasContainerManager {
    return this.containerManager;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clean up all layers
    this.layers.forEach(layer => layer.destroy());
    this.layers.clear();

    // Clean up input handler
    this.inputHandler.detach();

    // Clean up rendering system
    this.renderingSystem.destroy();

    this.container = null;
  }
} 