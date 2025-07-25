/**
 * DrawingToolManager - Unified management for all drawing tools
 * Coordinates tool state with viewport mode and provides unified interface
 */

import type { ViewportMode } from './types';
import { ToolCoordinateHandler } from './ToolCoordinateHandler';
import { ViewportManager } from './ViewportManager';
import { BrushTool } from './BrushTool';
import { FloodFillTool } from './FloodFillTool';
import { CoordinateSystem } from './CoordinateSystem';

interface DrawingTool {
  enable?(): void;
  disable?(): void;
  handlePointerStart?(e: PointerEvent): void;
  handlePointerMove?(e: PointerEvent): void;
  handlePointerEnd?(e: PointerEvent): void;
  isEnabled?(): boolean;
  isActive?(): boolean;
  getToolInfo?(): any;
  cleanup?(): void;
}

interface ToolManagerState {
  activeTool: string | null;
  toolsEnabled: boolean;
  availableTools: string[];
}

export class DrawingToolManager {
  private tools = new Map<string, DrawingTool>();
  private activeTool: string | null = null;
  private toolsEnabled = true;
  private coordinateHandler: ToolCoordinateHandler;
  private viewportManager: ViewportManager;
  
  // Canvas references
  private canvases: {
    main?: HTMLCanvasElement;
    fill?: HTMLCanvasElement;
    background?: HTMLCanvasElement;
    shadow?: HTMLCanvasElement;
  } = {};

  // Tool change callbacks
  private toolChangeCallbacks: Array<(toolName: string | null) => void> = [];
  private stateChangeCallbacks: Array<(state: ToolManagerState) => void> = [];

  constructor(
    coordinateSystem: CoordinateSystem,
    viewportManager: ViewportManager
  ) {
    this.coordinateHandler = new ToolCoordinateHandler(coordinateSystem);
    this.viewportManager = viewportManager;
    
    // Listen to viewport mode changes
    this.viewportManager.addStateChangeListener((state) => {
      this.handleViewportModeChange(state.mode);
    });
  }

  /**
   * Initialize tool manager with canvas references
   */
  initialize(canvases: {
    main?: HTMLCanvasElement;
    fill?: HTMLCanvasElement;
    background?: HTMLCanvasElement;
    shadow?: HTMLCanvasElement;
  }): void {
    this.canvases = { ...canvases };
    this.initializeTools();
  }

  /**
   * Initialize all available tools
   */
  private initializeTools(): void {
    // Initialize brush tool
    if (this.canvases.main) {
      const brushTool = new BrushTool(
        this.coordinateHandler,
        this.viewportManager,
        this.canvases.main
      );
      this.tools.set('brush', brushTool);
    }

    // Initialize flood fill tool
    if (this.canvases.fill) {
      const floodFillTool = new FloodFillTool(
        this.coordinateHandler,
        this.viewportManager,
        this.canvases.fill
      );
      this.tools.set('floodfill', floodFillTool);
    }

    // Set default active tool
    if (this.tools.has('brush')) {
      this.setActiveTool('brush');
    }

    console.debug('DrawingToolManager initialized with tools:', Array.from(this.tools.keys()));
  }

  /**
   * Set the active drawing tool
   */
  setActiveTool(toolName: string): boolean {
    if (!this.tools.has(toolName)) {
      console.warn(`Tool '${toolName}' not found`);
      return false;
    }

    // Deactivate current tool
    if (this.activeTool && this.tools.has(this.activeTool)) {
      const currentTool = this.tools.get(this.activeTool);
      currentTool?.disable?.();
    }

    // Activate new tool
    this.activeTool = toolName;
    const newTool = this.tools.get(toolName);
    
    if (this.toolsEnabled && this.viewportManager.getState().mode === 'draw') {
      newTool?.enable?.();
    }

    // Notify callbacks
    this.notifyToolChange(toolName);
    this.notifyStateChange();

    console.debug(`Active tool changed to: ${toolName}`);
    return true;
  }

  /**
   * Get the currently active tool name
   */
  getActiveTool(): string | null {
    return this.activeTool;
  }

  /**
   * Get the active tool instance
   */
  getActiveToolInstance(): DrawingTool | null {
    return this.activeTool ? this.tools.get(this.activeTool) || null : null;
  }

  /**
   * Handle tool input events
   */
  handleToolInput(e: PointerEvent, eventType: 'start' | 'move' | 'end'): void {
    // Only handle input in draw mode and when tools are enabled
    if (!this.toolsEnabled || 
        this.viewportManager.getState().mode !== 'draw' || 
        !this.activeTool) {
      return;
    }

    const tool = this.tools.get(this.activeTool);
    if (!tool) return;

    try {
      switch (eventType) {
        case 'start':
          tool.handlePointerStart?.(e);
          break;
        case 'move':
          tool.handlePointerMove?.(e);
          break;
        case 'end':
          tool.handlePointerEnd?.(e);
          break;
      }
    } catch (error) {
      console.error(`Error handling ${eventType} event for tool ${this.activeTool}:`, error);
    }
  }

  /**
   * Enable all tools
   */
  enableTools(): void {
    this.toolsEnabled = true;
    
    // Only enable tools if in draw mode
    if (this.viewportManager.getState().mode === 'draw') {
      this.tools.forEach(tool => tool.enable?.());
    }
    
    this.updateCursor('crosshair');
    this.notifyStateChange();
    console.debug('Tools enabled');
  }

  /**
   * Disable all tools
   */
  disableAllTools(): void {
    this.toolsEnabled = false;
    this.tools.forEach(tool => tool.disable?.());
    this.updateCursor('grab');
    this.notifyStateChange();
    console.debug('All tools disabled');
  }

  /**
   * Check if tools are enabled
   */
  areToolsEnabled(): boolean {
    return this.toolsEnabled;
  }

  /**
   * Handle viewport mode changes
   */
  private handleViewportModeChange(mode: ViewportMode): void {
    if (mode === 'zoom') {
      this.disableAllTools();
    } else if (mode === 'draw') {
      this.enableTools();
    }
  }

  /**
   * Get list of available tools
   */
  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool information
   */
  getToolInfo(toolName: string): any {
    const tool = this.tools.get(toolName);
    return tool?.getToolInfo?.() || null;
  }

  /**
   * Get all tools information
   */
  getAllToolsInfo(): Record<string, any> {
    const info: Record<string, any> = {};
    this.tools.forEach((tool, name) => {
      info[name] = tool.getToolInfo?.() || { name, isActive: false, isEnabled: false };
    });
    return info;
  }

  /**
   * Get manager state
   */
  getState(): ToolManagerState {
    return {
      activeTool: this.activeTool,
      toolsEnabled: this.toolsEnabled,
      availableTools: this.getAvailableTools()
    };
  }

  /**
   * Update cursor based on mode
   */
  private updateCursor(cursor: string): void {
    // Find container element and update cursor
    const containerElement = this.coordinateHandler['coordinateSystem']['containerElement'];
    if (containerElement) {
      containerElement.style.cursor = cursor;
    }
  }

  /**
   * Add tool change callback
   */
  onToolChange(callback: (toolName: string | null) => void): () => void {
    this.toolChangeCallbacks.push(callback);
    
    return () => {
      const index = this.toolChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.toolChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add state change callback
   */
  onStateChange(callback: (state: ToolManagerState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify tool change callbacks
   */
  private notifyToolChange(toolName: string | null): void {
    this.toolChangeCallbacks.forEach(callback => {
      try {
        callback(toolName);
      } catch (error) {
        console.error('Error in tool change callback:', error);
      }
    });
  }

  /**
   * Notify state change callbacks
   */
  private notifyStateChange(): void {
    const state = this.getState();
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    });
  }

  /**
   * Register a custom tool
   */
  registerTool(name: string, tool: DrawingTool): boolean {
    if (this.tools.has(name)) {
      console.warn(`Tool '${name}' already exists`);
      return false;
    }

    this.tools.set(name, tool);
    this.notifyStateChange();
    console.debug(`Custom tool '${name}' registered`);
    return true;
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): boolean {
    if (!this.tools.has(name)) {
      return false;
    }

    // If this was the active tool, deactivate it
    if (this.activeTool === name) {
      this.activeTool = null;
      this.notifyToolChange(null);
    }

    // Cleanup and remove the tool
    const tool = this.tools.get(name);
    tool?.cleanup?.();
    this.tools.delete(name);
    
    this.notifyStateChange();
    console.debug(`Tool '${name}' unregistered`);
    return true;
  }

  /**
   * Check if coordinate handler is ready
   */
  isReady(): boolean {
    return this.coordinateHandler.isReady();
  }

  /**
   * Get coordinate handler for external use
   */
  getCoordinateHandler(): ToolCoordinateHandler {
    return this.coordinateHandler;
  }

  /**
   * Handle canvas resize or DPR changes
   */
  handleCanvasResize(): void {
    // Notify all tools of potential coordinate system changes
    console.debug('Canvas resize detected, tools may need to update');
  }

  /**
   * Reset all tools to default state
   */
  resetAllTools(): void {
    this.tools.forEach(tool => {
      if ('reset' in tool && typeof tool.reset === 'function') {
        tool.reset();
      }
    });
    console.debug('All tools reset to default state');
  }

  /**
   * Get performance metrics for active tools
   */
  getPerformanceMetrics(): {
    activeTool: string | null;
    toolsEnabled: boolean;
    activeToolState: any;
  } {
    const activeToolInstance = this.getActiveToolInstance();
    return {
      activeTool: this.activeTool,
      toolsEnabled: this.toolsEnabled,
      activeToolState: activeToolInstance?.getToolInfo?.() || null
    };
  }

  /**
   * Force tool update (useful for external state changes)
   */
  forceUpdate(): void {
    const currentMode = this.viewportManager.getState().mode;
    this.handleViewportModeChange(currentMode);
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    // Cleanup all tools
    this.tools.forEach(tool => tool.cleanup?.());
    this.tools.clear();
    
    // Clear callbacks
    this.toolChangeCallbacks = [];
    this.stateChangeCallbacks = [];
    
    // Reset state
    this.activeTool = null;
    this.toolsEnabled = false;
    
    console.debug('DrawingToolManager cleaned up');
  }
}