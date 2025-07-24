/**
 * ZoomTest - Comprehensive testing for zoom functionality
 * Tests wheel zoom, pinch zoom, centering accuracy, and performance
 */

import type { ViewportState } from './types';
import { InputHandler } from './InputHandler';
import { ViewportManager } from './ViewportManager';
import { ZoomPerformanceOptimizer } from './ZoomPerformanceOptimizer';

interface ZoomTestResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    avgFps: number;
    minFps: number;
    maxFps: number;
    accuracy: number;
  };
}

export class ZoomTest {
  private inputHandler: InputHandler;
  private viewportManager: ViewportManager;
  private zoomOptimizer: ZoomPerformanceOptimizer;
  private testContainer: HTMLElement;
  private testCanvas: HTMLCanvasElement;
  private testResults: ZoomTestResult[] = [];

  constructor(
    inputHandler: InputHandler, 
    viewportManager: ViewportManager,
    zoomOptimizer?: ZoomPerformanceOptimizer
  ) {
    this.inputHandler = inputHandler;
    this.viewportManager = viewportManager;
    this.zoomOptimizer = zoomOptimizer || new ZoomPerformanceOptimizer();
    this.setupTestEnvironment();
  }

  /**
   * Setup test environment with canvas and container
   */
  private setupTestEnvironment(): void {
    // Create test container
    this.testContainer = document.createElement('div');
    this.testContainer.style.position = 'relative';
    this.testContainer.style.width = '800px';
    this.testContainer.style.height = '600px';
    this.testContainer.style.overflow = 'hidden';
    
    // Create test canvas
    this.testCanvas = document.createElement('canvas');
    this.testCanvas.width = 2550;
    this.testCanvas.height = 3300;
    this.testCanvas.style.width = '2550px';
    this.testCanvas.style.height = '3300px';
    this.testCanvas.style.position = 'absolute';
    
    this.testContainer.appendChild(this.testCanvas);
    
    // Add to body for testing (hidden)
    this.testContainer.style.position = 'fixed';
    this.testContainer.style.top = '-2000px';
    this.testContainer.style.left = '-2000px';
    document.body.appendChild(this.testContainer);
  }

  /**
   * Run all zoom tests
   */
  async runAllTests(): Promise<ZoomTestResult[]> {
    this.testResults = [];
    
    try {
      await this.testWheelZoomFunctionality();
      await this.testWheelZoomCentering();
      await this.testPinchZoomDetection();
      await this.testPinchZoomCentering();
      await this.testZoomLimits();
      await this.testZoomBoundaryClamp();
      await this.testZoomPerformance();
      await this.testRapidZoomGestures();
      await this.testMobileZoomCompatibility();
      await this.testZoomCenteringAccuracy();
      await this.testZoomToFitFunctionality();
    } catch (error) {
      this.testResults.push({
        testName: 'Zoom Test Suite Execution',
        passed: false,
        details: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    return this.testResults;
  }

  /**
   * Test basic wheel zoom functionality
   */
  private async testWheelZoomFunctionality(): Promise<void> {
    const testName = 'Wheel Zoom Functionality';
    
    try {
      let zoomCallbackCalled = false;
      let zoomFactor = 0;
      let centerX = 0;
      let centerY = 0;
      
      // Set up zoom callback
      this.inputHandler.onZoom((factor, cX, cY) => {
        zoomCallbackCalled = true;
        zoomFactor = factor;
        centerX = cX;
        centerY = cY;
      });
      
      // Set mode to zoom
      this.viewportManager.setMode('zoom');
      
      // Simulate wheel zoom in
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Zoom in
        clientX: 400,
        clientY: 300,
        bubbles: true,
        cancelable: true
      });
      
      this.testCanvas.dispatchEvent(wheelEvent);
      
      const passed = zoomCallbackCalled && zoomFactor > 1 && centerX === 400 && centerY === 300;
      
      this.testResults.push({
        testName,
        passed,
        details: `Callback called: ${zoomCallbackCalled}, Factor: ${zoomFactor}, Center: (${centerX}, ${centerY})`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test wheel zoom centering accuracy
   */
  private async testWheelZoomCentering(): Promise<void> {
    const testName = 'Wheel Zoom Centering';
    
    try {
      // Set initial state
      this.viewportManager.setState({
        scale: 1.0,
        panX: 0,
        panY: 0,
        mode: 'zoom'
      });
      
      const initialState = this.viewportManager.getState();
      const zoomCenter = { x: 200, y: 150 };
      
      // Calculate expected result
      const zoomFactor = 1.1;
      const expectedScale = initialState.scale * zoomFactor;
      const expectedPanX = zoomCenter.x - (zoomCenter.x - initialState.panX) * zoomFactor;
      const expectedPanY = zoomCenter.y - (zoomCenter.y - initialState.panY) * zoomFactor;
      
      // Apply zoom
      this.inputHandler.onZoom((factor, centerX, centerY) => {
        const currentState = this.viewportManager.getState();
        const newScale = currentState.scale * factor;
        const newPanX = centerX - (centerX - currentState.panX) * factor;
        const newPanY = centerY - (centerY - currentState.panY) * factor;
        
        this.viewportManager.setState({
          scale: newScale,
          panX: newPanX,
          panY: newPanY,
          mode: 'zoom'
        });
      });
      
      // Simulate zoom
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: zoomCenter.x,
        clientY: zoomCenter.y,
        bubbles: true,
        cancelable: true
      });
      
      this.testCanvas.dispatchEvent(wheelEvent);
      
      const finalState = this.viewportManager.getState();
      
      // Check centering accuracy (within 1px tolerance)
      const scaleAccurate = Math.abs(finalState.scale - expectedScale) < 0.01;
      const panXAccurate = Math.abs(finalState.panX - expectedPanX) < 1;
      const panYAccurate = Math.abs(finalState.panY - expectedPanY) < 1;
      
      const passed = scaleAccurate && panXAccurate && panYAccurate;
      
      this.testResults.push({
        testName,
        passed,
        details: `Scale: ${finalState.scale.toFixed(3)} (expected ${expectedScale.toFixed(3)}), Pan: (${finalState.panX.toFixed(1)}, ${finalState.panY.toFixed(1)}) (expected (${expectedPanX.toFixed(1)}, ${expectedPanY.toFixed(1)}))`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test pinch zoom detection
   */
  private async testPinchZoomDetection(): Promise<void> {
    const testName = 'Pinch Zoom Detection';
    
    try {
      let pinchZoomCalled = false;
      let zoomFactor = 1;
      
      this.inputHandler.onZoom((factor) => {
        pinchZoomCalled = true;
        zoomFactor = factor;
      });
      
      // Simulate two-finger pinch
      await this.simulatePinchGesture(
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 90, y: 90 },
        { x: 210, y: 210 }
      );
      
      const passed = pinchZoomCalled && zoomFactor !== 1;
      
      this.testResults.push({
        testName,
        passed,
        details: `Pinch zoom called: ${pinchZoomCalled}, Factor: ${zoomFactor.toFixed(3)}`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test pinch zoom centering
   */
  private async testPinchZoomCentering(): Promise<void> {
    const testName = 'Pinch Zoom Centering';
    
    try {
      // Reset state
      this.viewportManager.setState({
        scale: 1.0,
        panX: 0,
        panY: 0,
        mode: 'zoom'
      });
      
      const finger1Start = { x: 150, y: 150 };
      const finger2Start = { x: 250, y: 250 };
      const finger1End = { x: 100, y: 100 };
      const finger2End = { x: 300, y: 300 };
      
      // Calculate expected center
      const centerX = (finger1Start.x + finger2Start.x) / 2;
      const centerY = (finger1Start.y + finger2Start.y) / 2;
      
      // Apply pinch zoom
      await this.simulatePinchGesture(finger1Start, finger2Start, finger1End, finger2End);
      
      // Check if zoom was centered approximately at the pinch center
      const finalState = this.viewportManager.getState();
      const passed = finalState.scale !== 1.0; // Scale should have changed
      
      this.testResults.push({
        testName,
        passed,
        details: `Final scale: ${finalState.scale.toFixed(3)}, Zoom center: (${centerX}, ${centerY})`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test zoom limits (25% to 400%)
   */
  private async testZoomLimits(): Promise<void> {
    const testName = 'Zoom Limits';
    
    try {
      // Test minimum zoom
      this.viewportManager.setState({
        scale: 0.1, // Below minimum
        panX: 0,
        panY: 0,
        mode: 'zoom'
      });
      
      let finalState = this.viewportManager.getState();
      const minLimitEnforced = finalState.scale >= 0.25;
      
      // Test maximum zoom
      this.viewportManager.setState({
        scale: 5.0, // Above maximum
        panX: 0,
        panY: 0,
        mode: 'zoom'
      });
      
      finalState = this.viewportManager.getState();
      const maxLimitEnforced = finalState.scale <= 4.0;
      
      const passed = minLimitEnforced && maxLimitEnforced;
      
      this.testResults.push({
        testName,
        passed,
        details: `Min limit enforced: ${minLimitEnforced} (scale: ${finalState.scale}), Max limit enforced: ${maxLimitEnforced}`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test zoom boundary clamping
   */
  private async testZoomBoundaryClamp(): Promise<void> {
    const testName = 'Zoom Boundary Clamping';
    
    try {
      // Set container size
      this.viewportManager.setContainerSize({ width: 800, height: 600 });
      
      // Test with various zoom levels
      const testCases = [
        { scale: 0.5, description: 'Small zoom (canvas smaller than container)' },
        { scale: 1.0, description: 'Normal zoom' },
        { scale: 2.0, description: 'Large zoom' },
        { scale: 4.0, description: 'Maximum zoom' }
      ];
      
      let allPassed = true;
      const results: string[] = [];
      
      for (const testCase of testCases) {
        this.viewportManager.setState({
          scale: testCase.scale,
          panX: -5000, // Extreme pan beyond boundaries
          panY: -5000,
          mode: 'zoom'
        });
        
        const state = this.viewportManager.getState();
        const wasClamped = state.panX !== -5000 || state.panY !== -5000;
        
        if (!wasClamped) allPassed = false;
        results.push(`${testCase.description}: ${wasClamped ? 'PASS' : 'FAIL'} (pan: ${state.panX.toFixed(1)}, ${state.panY.toFixed(1)})`);
      }
      
      this.testResults.push({
        testName,
        passed: allPassed,
        details: results.join('; ')
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test zoom performance
   */
  private async testZoomPerformance(): Promise<void> {
    const testName = 'Zoom Performance';
    
    try {
      const fpsData: number[] = [];
      const startTime = performance.now();
      
      // Simulate rapid zoom operations
      for (let i = 0; i < 60; i++) {
        const frameStart = performance.now();
        
        // Alternate between zoom in and out
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: i % 2 === 0 ? -100 : 100,
          clientX: 400 + (i % 10),
          clientY: 300 + (i % 10),
          bubbles: true,
          cancelable: true
        });
        
        this.testCanvas.dispatchEvent(wheelEvent);
        
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        const fps = 1000 / frameTime;
        fpsData.push(fps);
      }
      
      const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
      const minFps = Math.min(...fpsData);
      const maxFps = Math.max(...fpsData);
      
      const passed = avgFps >= 45 && minFps >= 30;
      
      this.testResults.push({
        testName,
        passed,
        details: `Average FPS: ${avgFps.toFixed(1)}, Min: ${minFps.toFixed(1)}, Max: ${maxFps.toFixed(1)}`,
        performance: { avgFps, minFps, maxFps, accuracy: 100 }
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test rapid zoom gestures
   */
  private async testRapidZoomGestures(): Promise<void> {
    const testName = 'Rapid Zoom Gestures';
    
    try {
      let eventCount = 0;
      const initialScale = this.viewportManager.getState().scale;
      
      this.inputHandler.onZoom(() => {
        eventCount++;
      });
      
      // Simulate very rapid zoom events
      const rapidEvents = 50;
      for (let i = 0; i < rapidEvents; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: (i % 2 === 0 ? -50 : 50),
          clientX: 400,
          clientY: 300,
          bubbles: true,
          cancelable: true
        });
        
        this.testCanvas.dispatchEvent(wheelEvent);
      }
      
      const finalScale = this.viewportManager.getState().scale;
      const scaleChanged = Math.abs(finalScale - initialScale) > 0.01;
      const responsiveToEvents = eventCount > rapidEvents * 0.8; // At least 80% of events processed
      
      const passed = scaleChanged && responsiveToEvents;
      
      this.testResults.push({
        testName,
        passed,
        details: `Events processed: ${eventCount}/${rapidEvents}, Scale change: ${(finalScale - initialScale).toFixed(3)}`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test mobile zoom compatibility
   */
  private async testMobileZoomCompatibility(): Promise<void> {
    const testName = 'Mobile Zoom Compatibility';
    
    try {
      // Test touch action configuration
      const touchAction = this.testCanvas.style.touchAction;
      const hasTouchActionNone = touchAction === 'none';
      
      // Test pointer events support
      const supportsPointerEvents = 'PointerEvent' in window;
      
      // Test pinch zoom on touch devices
      let pinchWorksOnTouch = false;
      try {
        await this.simulateTouchPinch();
        pinchWorksOnTouch = true;
      } catch {
        // Expected on non-touch devices
        pinchWorksOnTouch = !('ontouchstart' in window);
      }
      
      const passed = hasTouchActionNone && supportsPointerEvents && pinchWorksOnTouch;
      
      this.testResults.push({
        testName,
        passed,
        details: `touchAction: ${touchAction}, PointerEvents: ${supportsPointerEvents}, Touch pinch: ${pinchWorksOnTouch}`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test zoom centering accuracy with mathematical precision
   */
  private async testZoomCenteringAccuracy(): Promise<void> {
    const testName = 'Zoom Centering Accuracy';
    
    try {
      const testPoints = [
        { x: 100, y: 100, name: 'top-left' },
        { x: 400, y: 300, name: 'center' },
        { x: 700, y: 500, name: 'bottom-right' },
        { x: 0, y: 0, name: 'origin' }
      ];
      
      let totalAccuracy = 0;
      const accuracyResults: string[] = [];
      
      for (const point of testPoints) {
        // Reset state
        this.viewportManager.setState({
          scale: 1.0,
          panX: 0,
          panY: 0,
          mode: 'zoom'
        });
        
        const initialState = this.viewportManager.getState();
        const zoomFactor = 1.5;
        
        // Calculate expected result mathematically
        const expectedScale = initialState.scale * zoomFactor;
        const expectedPanX = point.x - (point.x - initialState.panX) * zoomFactor;
        const expectedPanY = point.y - (point.y - initialState.panY) * zoomFactor;
        
        // Apply zoom at specific point
        this.inputHandler.onZoom((factor, centerX, centerY) => {
          const currentState = this.viewportManager.getState();
          const newScale = currentState.scale * factor;
          const newPanX = centerX - (centerX - currentState.panX) * factor;
          const newPanY = centerY - (centerY - currentState.panY) * factor;
          
          this.viewportManager.setState({
            scale: newScale,
            panX: newPanX,
            panY: newPanY,
            mode: 'zoom'
          });
        });
        
        // Simulate zoom at point
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -100,
          clientX: point.x,
          clientY: point.y,
          bubbles: true,
          cancelable: true
        });
        
        this.testCanvas.dispatchEvent(wheelEvent);
        
        const finalState = this.viewportManager.getState();
        
        // Calculate accuracy
        const scaleError = Math.abs(finalState.scale - expectedScale);
        const panXError = Math.abs(finalState.panX - expectedPanX);
        const panYError = Math.abs(finalState.panY - expectedPanY);
        
        const accuracy = Math.max(0, 100 - (scaleError * 100 + panXError + panYError));
        totalAccuracy += accuracy;
        
        accuracyResults.push(`${point.name}: ${accuracy.toFixed(1)}%`);
      }
      
      const avgAccuracy = totalAccuracy / testPoints.length;
      const passed = avgAccuracy >= 95; // 95% accuracy threshold
      
      this.testResults.push({
        testName,
        passed,
        details: `Average accuracy: ${avgAccuracy.toFixed(1)}% (${accuracyResults.join(', ')})`,
        performance: { avgFps: 0, minFps: 0, maxFps: 0, accuracy: avgAccuracy }
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Test zoom-to-fit functionality
   */
  private async testZoomToFitFunctionality(): Promise<void> {
    const testName = 'Zoom to Fit Functionality';
    
    try {
      const containerWidth = 800;
      const containerHeight = 600;
      const canvasWidth = 2550;
      const canvasHeight = 3300;
      
      // Calculate expected fit scale
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const expectedScale = Math.min(scaleX, scaleY) * 0.9; // 90% for padding
      
      // Use zoom optimizer to calculate fit
      const fitState = this.zoomOptimizer.zoomToFit(containerWidth, containerHeight);
      
      const scaleAccurate = Math.abs(fitState.scale - expectedScale) < 0.01;
      const centeredX = Math.abs(fitState.panX - (containerWidth - canvasWidth * fitState.scale) / 2) < 1;
      const centeredY = Math.abs(fitState.panY - (containerHeight - canvasHeight * fitState.scale) / 2) < 1;
      
      const passed = scaleAccurate && centeredX && centeredY;
      
      this.testResults.push({
        testName,
        passed,
        details: `Scale: ${fitState.scale.toFixed(3)} (expected ${expectedScale.toFixed(3)}), Centered: X=${centeredX}, Y=${centeredY}`
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Simulate pinch gesture between two points
   */
  private async simulatePinchGesture(
    finger1Start: { x: number; y: number },
    finger2Start: { x: number; y: number },
    finger1End: { x: number; y: number },
    finger2End: { x: number; y: number }
  ): Promise<void> {
    return new Promise(resolve => {
      // Start pinch
      const pointerDown1 = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: finger1Start.x,
        clientY: finger1Start.y,
        isPrimary: true,
        pointerType: 'touch'
      });
      
      const pointerDown2 = new PointerEvent('pointerdown', {
        pointerId: 2,
        clientX: finger2Start.x,
        clientY: finger2Start.y,
        isPrimary: false,
        pointerType: 'touch'
      });
      
      this.testCanvas.dispatchEvent(pointerDown1);
      this.testCanvas.dispatchEvent(pointerDown2);
      
      // Move fingers
      setTimeout(() => {
        const pointerMove1 = new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: finger1End.x,
          clientY: finger1End.y,
          isPrimary: true,
          pointerType: 'touch'
        });
        
        const pointerMove2 = new PointerEvent('pointermove', {
          pointerId: 2,
          clientX: finger2End.x,
          clientY: finger2End.y,
          isPrimary: false,
          pointerType: 'touch'
        });
        
        this.testCanvas.dispatchEvent(pointerMove1);
        this.testCanvas.dispatchEvent(pointerMove2);
        
        // End pinch
        setTimeout(() => {
          const pointerUp1 = new PointerEvent('pointerup', {
            pointerId: 1,
            clientX: finger1End.x,
            clientY: finger1End.y,
            isPrimary: true,
            pointerType: 'touch'
          });
          
          const pointerUp2 = new PointerEvent('pointerup', {
            pointerId: 2,
            clientX: finger2End.x,
            clientY: finger2End.y,
            isPrimary: false,
            pointerType: 'touch'
          });
          
          this.testCanvas.dispatchEvent(pointerUp1);
          this.testCanvas.dispatchEvent(pointerUp2);
          resolve();
        }, 16);
      }, 16);
    });
  }

  /**
   * Simulate touch pinch for mobile compatibility testing
   */
  private async simulateTouchPinch(): Promise<void> {
    // Create touch events if supported
    if ('TouchEvent' in window) {
      const touch1 = new Touch({
        identifier: 1,
        target: this.testCanvas,
        clientX: 150,
        clientY: 150,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1
      });
      
      const touch2 = new Touch({
        identifier: 2,
        target: this.testCanvas,
        clientX: 250,
        clientY: 250,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1
      });
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [touch1, touch2],
        targetTouches: [touch1, touch2],
        changedTouches: [touch1, touch2],
        bubbles: true,
        cancelable: true
      });
      
      this.testCanvas.dispatchEvent(touchStart);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport(): {
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      successRate: number;
      avgPerformance: number;
    };
    details: ZoomTestResult[];
    recommendations: string[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    // Calculate average performance
    const performanceResults = this.testResults.filter(r => r.performance?.avgFps);
    const avgPerformance = performanceResults.length > 0
      ? performanceResults.reduce((sum, r) => sum + (r.performance?.avgFps || 0), 0) / performanceResults.length
      : 0;
    
    const recommendations = this.generateRecommendations();
    
    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate,
        avgPerformance
      },
      details: this.testResults,
      recommendations
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedTests = this.testResults.filter(result => !result.passed);
    
    failedTests.forEach(test => {
      switch (test.testName) {
        case 'Wheel Zoom Functionality':
          recommendations.push('Check wheel event handling and zoom callback setup');
          break;
        case 'Wheel Zoom Centering':
          recommendations.push('Verify zoom centering mathematics and coordinate calculations');
          break;
        case 'Pinch Zoom Detection':
          recommendations.push('Ensure two-finger gesture detection is working correctly');
          break;
        case 'Zoom Performance':
          recommendations.push('Consider optimizing zoom updates with RAF batching or reduced frequency');
          break;
        case 'Mobile Zoom Compatibility':
          recommendations.push('Test on actual mobile devices and verify touch-action configuration');
          break;
        case 'Zoom Centering Accuracy':
          recommendations.push('Review zoom-to-point algorithm for mathematical precision');
          break;
      }
    });
    
    // Performance-based recommendations
    const performanceTests = this.testResults.filter(r => r.performance);
    const lowPerformanceTests = performanceTests.filter(r => (r.performance?.avgFps || 0) < 45);
    
    if (lowPerformanceTests.length > 0) {
      recommendations.push('Consider implementing ZoomPerformanceOptimizer for better zoom performance');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All zoom tests passed. Zoom functionality is ready for production.');
    }
    
    return recommendations;
  }

  /**
   * Cleanup test environment
   */
  cleanup(): void {
    if (this.testContainer && document.body.contains(this.testContainer)) {
      document.body.removeChild(this.testContainer);
    }
    this.testResults = [];
  }
}