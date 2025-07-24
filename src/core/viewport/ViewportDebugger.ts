import type { ViewportState } from './types';
import { ViewportManager } from './ViewportManager';
import { ViewportStateValidator } from './ViewportStateValidator';

interface DebugInfo {
  currentState: ViewportState;
  containerSize: { width: number; height: number };
  validationReport: any;
  performanceMetrics: {
    stateUpdateCount: number;
    lastUpdateTime: number;
    averageUpdateInterval: number;
  };
  history: ViewportState[];
}

/**
 * ViewportDebugger - Debugging and monitoring tools for viewport state
 * Provides utilities for testing, debugging, and monitoring viewport behavior
 */
export class ViewportDebugger {
  private viewportManager: ViewportManager;
  private validator: ViewportStateValidator;
  private isEnabled = false;
  
  // Debug metrics
  private stateUpdateCount = 0;
  private lastUpdateTime = 0;
  private updateIntervals: number[] = [];
  private stateHistory: ViewportState[] = [];
  private maxHistorySize = 50;
  
  constructor(viewportManager: ViewportManager) {
    this.viewportManager = viewportManager;
    this.validator = new ViewportStateValidator();
  }
  
  /**
   * Enable debug mode
   */
  enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.setupDebugListeners();
    this.injectDebugUI();
    console.log('🔍 Viewport debugging enabled');
  }
  
  /**
   * Disable debug mode
   */
  disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    this.removeDebugUI();
    console.log('🔍 Viewport debugging disabled');
  }
  
  /**
   * Setup debug listeners
   */
  private setupDebugListeners(): void {
    this.viewportManager.addStateChangeListener((state) => {
      if (!this.isEnabled) return;
      
      // Track metrics
      const now = Date.now();
      if (this.lastUpdateTime > 0) {
        const interval = now - this.lastUpdateTime;
        this.updateIntervals.push(interval);
        
        // Keep only last 100 intervals
        if (this.updateIntervals.length > 100) {
          this.updateIntervals.shift();
        }
      }
      
      this.stateUpdateCount++;
      this.lastUpdateTime = now;
      
      // Track history
      this.stateHistory.push({ ...state });
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift();
      }
      
      // Log state changes
      this.logStateChange(state);
      
      // Update debug UI
      this.updateDebugUI();
    });
  }
  
  /**
   * Log state changes
   */
  private logStateChange(state: ViewportState): void {
    console.log('📐 Viewport state changed:', {
      scale: state.scale.toFixed(3),
      panX: state.panX.toFixed(1),
      panY: state.panY.toFixed(1),
      mode: state.mode
    });
  }
  
  /**
   * Get debug information
   */
  getDebugInfo(): DebugInfo {
    const currentState = this.viewportManager.getState();
    const containerSize = this.viewportManager.getContainerSize();
    const validationReport = this.validator.getValidationReport(currentState, containerSize);
    
    const avgInterval = this.updateIntervals.length > 0
      ? this.updateIntervals.reduce((a, b) => a + b, 0) / this.updateIntervals.length
      : 0;
    
    return {
      currentState,
      containerSize,
      validationReport,
      performanceMetrics: {
        stateUpdateCount: this.stateUpdateCount,
        lastUpdateTime: this.lastUpdateTime,
        averageUpdateInterval: avgInterval
      },
      history: [...this.stateHistory]
    };
  }
  
  /**
   * Inject debug UI overlay
   */
  private debugUI: HTMLElement | null = null;
  
  private injectDebugUI(): void {
    if (this.debugUI) return;
    
    // Create debug overlay
    this.debugUI = document.createElement('div');
    this.debugUI.id = 'viewport-debug-ui';
    this.debugUI.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      min-width: 300px;
      pointer-events: none;
      user-select: none;
    `;
    
    document.body.appendChild(this.debugUI);
    this.updateDebugUI();
  }
  
  /**
   * Update debug UI content
   */
  private updateDebugUI(): void {
    if (!this.debugUI || !this.isEnabled) return;
    
    const info = this.getDebugInfo();
    const state = info.currentState;
    
    this.debugUI.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; color: #00ff00;">
        🔍 VIEWPORT DEBUG
      </div>
      <div>Mode: <span style="color: ${state.mode === 'zoom' ? '#ff0' : '#0ff'}">${state.mode.toUpperCase()}</span></div>
      <div>Scale: ${state.scale.toFixed(3)}x</div>
      <div>Pan: (${state.panX.toFixed(1)}, ${state.panY.toFixed(1)})</div>
      <div>Container: ${info.containerSize.width}x${info.containerSize.height}</div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
        <div>Updates: ${info.performanceMetrics.stateUpdateCount}</div>
        <div>Avg Interval: ${info.performanceMetrics.averageUpdateInterval.toFixed(1)}ms</div>
        <div>History: ${info.history.length} states</div>
      </div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
        <div>Valid: ${info.validationReport.isValid ? '✅' : '❌'}</div>
        ${info.validationReport.recommendations.length > 0 ? 
          `<div style="color: #ff0; margin-top: 5px;">⚠️ ${info.validationReport.recommendations[0]}</div>` : ''
        }
      </div>
    `;
  }
  
  /**
   * Remove debug UI
   */
  private removeDebugUI(): void {
    if (this.debugUI && document.body.contains(this.debugUI)) {
      document.body.removeChild(this.debugUI);
      this.debugUI = null;
    }
  }
  
  /**
   * Export debug data
   */
  exportDebugData(): string {
    const debugData = {
      info: this.getDebugInfo(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio
    };
    
    return JSON.stringify(debugData, null, 2);
  }
  
  /**
   * Test viewport boundaries
   */
  testBoundaries(): void {
    console.log('🧪 Testing viewport boundaries...');
    
    const testCases = [
      { scale: 0.1, panX: 0, panY: 0, name: 'Min scale' },
      { scale: 10.0, panX: 0, panY: 0, name: 'Max scale' },
      { scale: 1.0, panX: -5000, panY: 0, name: 'Far left pan' },
      { scale: 1.0, panX: 5000, panY: 0, name: 'Far right pan' },
      { scale: 1.0, panX: 0, panY: -5000, name: 'Far top pan' },
      { scale: 1.0, panX: 0, panY: 5000, name: 'Far bottom pan' }
    ];
    
    testCases.forEach(testCase => {
      const originalState = this.viewportManager.getState();
      this.viewportManager.setState({
        scale: testCase.scale,
        panX: testCase.panX,
        panY: testCase.panY
      });
      
      const newState = this.viewportManager.getState();
      console.log(`Test: ${testCase.name}`, {
        input: { scale: testCase.scale, panX: testCase.panX, panY: testCase.panY },
        output: { scale: newState.scale, panX: newState.panX, panY: newState.panY },
        clamped: newState.scale !== testCase.scale || 
                 newState.panX !== testCase.panX || 
                 newState.panY !== testCase.panY
      });
      
      // Restore original state
      this.viewportManager.setState(originalState);
    });
    
    console.log('✅ Boundary testing complete');
  }
  
  /**
   * Simulate user interactions
   */
  simulateInteractions(): void {
    console.log('🎮 Simulating user interactions...');
    
    // Simulate zoom in
    this.viewportManager.setState({ scale: 2.0 });
    
    // Simulate pan
    setTimeout(() => {
      this.viewportManager.setState({ panX: -100, panY: -50 });
    }, 500);
    
    // Simulate mode switch
    setTimeout(() => {
      this.viewportManager.setMode('zoom');
    }, 1000);
    
    // Simulate zoom out
    setTimeout(() => {
      this.viewportManager.setState({ scale: 0.5 });
    }, 1500);
    
    // Return to draw mode
    setTimeout(() => {
      this.viewportManager.setMode('draw');
      console.log('✅ Interaction simulation complete');
    }, 2000);
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): {
    updateFrequency: number;
    peakUpdateRate: number;
    averageUpdateInterval: number;
    totalUpdates: number;
  } {
    const avgInterval = this.updateIntervals.length > 0
      ? this.updateIntervals.reduce((a, b) => a + b, 0) / this.updateIntervals.length
      : 0;
    
    const minInterval = Math.min(...this.updateIntervals);
    
    return {
      updateFrequency: avgInterval > 0 ? 1000 / avgInterval : 0,
      peakUpdateRate: minInterval > 0 ? 1000 / minInterval : 0,
      averageUpdateInterval: avgInterval,
      totalUpdates: this.stateUpdateCount
    };
  }
  
  /**
   * Reset debug metrics
   */
  reset(): void {
    this.stateUpdateCount = 0;
    this.lastUpdateTime = 0;
    this.updateIntervals = [];
    this.stateHistory = [];
    this.updateDebugUI();
    console.log('🔄 Debug metrics reset');
  }
}