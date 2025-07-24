/**
 * MobileGestureTest - Testing utilities for mobile pan gestures
 * Comprehensive testing for touch panning, browser conflict prevention, and performance
 */

import type { ViewportState } from './types';
import { InputHandler } from './InputHandler';
import { ViewportManager } from './ViewportManager';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    avgFps: number;
    minFps: number;
    maxFps: number;
  };
}

export class MobileGestureTest {
  private inputHandler: InputHandler;
  private viewportManager: ViewportManager;
  private testContainer: HTMLElement;
  private testCanvas: HTMLCanvasElement;
  private testResults: TestResult[] = [];

  constructor(inputHandler: InputHandler, viewportManager: ViewportManager) {
    this.inputHandler = inputHandler;
    this.viewportManager = viewportManager;
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
    this.testContainer.style.border = '1px solid #ccc';
    
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
    this.testContainer.style.top = '-1000px';
    this.testContainer.style.left = '-1000px';
    document.body.appendChild(this.testContainer);
  }

  /**
   * Run all mobile gesture tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    try {
      await this.testPointerEventsSetup();
      await this.testTouchActionPrevention();
      await this.testPointerCapture();
      await this.testPanGestureDetection();
      await this.testBoundaryClampingMobile();
      await this.testIOSSafariCompatibility();
      await this.testAndroidChromeCompatibility();
      await this.testPanPerformanceMobile();
      await this.testRapidGestures();
      await this.testMultiTouchHandling();
    } catch (error) {
      this.testResults.push({
        testName: 'Test Suite Execution',
        passed: false,
        details: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    return this.testResults;
  }

  /**
   * Test Pointer Events API setup
   */
  private async testPointerEventsSetup(): Promise<void> {
    const testName = 'Pointer Events API Setup';
    
    try {
      // Check if touchAction is properly set
      const touchAction = this.testCanvas.style.touchAction;
      const hasTouchActionNone = touchAction === 'none';
      
      // Check if pointer events are supported
      const supportsPointerEvents = 'PointerEvent' in window;
      
      // Check if event listeners are attached
      const hasEventListeners = this.inputHandler.isReady();
      
      const passed = hasTouchActionNone && supportsPointerEvents && hasEventListeners;
      
      this.testResults.push({
        testName,
        passed,
        details: `touchAction: ${touchAction}, PointerEvents: ${supportsPointerEvents}, EventListeners: ${hasEventListeners}`
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
   * Test touch action prevention
   */
  private async testTouchActionPrevention(): Promise<void> {
    const testName = 'Touch Action Prevention';
    
    try {
      // Simulate touch event and check if browser zoom is prevented
      const touchEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        isPrimary: true,
        pointerType: 'touch'
      });
      
      let preventedDefault = false;
      const originalPreventDefault = touchEvent.preventDefault;
      touchEvent.preventDefault = () => {
        preventedDefault = true;
        originalPreventDefault.call(touchEvent);
      };
      
      // Dispatch event
      this.testCanvas.dispatchEvent(touchEvent);
      
      this.testResults.push({
        testName,
        passed: preventedDefault,
        details: `preventDefault called: ${preventedDefault}, touchAction: ${this.testCanvas.style.touchAction}`
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
   * Test pointer capture functionality
   */
  private async testPointerCapture(): Promise<void> {
    const testName = 'Pointer Capture';
    
    try {
      // Mock setPointerCapture to track calls
      let captureCalled = false;
      const originalSetPointerCapture = this.testCanvas.setPointerCapture;
      this.testCanvas.setPointerCapture = (pointerId: number) => {
        captureCalled = true;
        return originalSetPointerCapture.call(this.testCanvas, pointerId);
      };
      
      // Simulate pointer down
      const pointerDown = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        isPrimary: true
      });
      
      this.testCanvas.dispatchEvent(pointerDown);
      
      // Restore original method
      this.testCanvas.setPointerCapture = originalSetPointerCapture;
      
      this.testResults.push({
        testName,
        passed: captureCalled,
        details: `setPointerCapture called: ${captureCalled}`
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
   * Test pan gesture detection
   */
  private async testPanGestureDetection(): Promise<void> {
    const testName = 'Pan Gesture Detection';
    
    try {
      let panCallbackCalled = false;
      let deltaX = 0;
      let deltaY = 0;
      
      // Set up pan callback
      this.inputHandler.onPan((dx, dy) => {
        panCallbackCalled = true;
        deltaX = dx;
        deltaY = dy;
      });
      
      // Set mode to zoom
      this.viewportManager.setMode('zoom');
      
      // Simulate pan gesture
      await this.simulatePanGesture(100, 100, 200, 150);
      
      const passed = panCallbackCalled && Math.abs(deltaX - 100) < 5 && Math.abs(deltaY - 50) < 5;
      
      this.testResults.push({
        testName,
        passed,
        details: `Pan callback called: ${panCallbackCalled}, deltaX: ${deltaX}, deltaY: ${deltaY}`
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
   * Test boundary clamping on mobile
   */
  private async testBoundaryClampingMobile(): Promise<void> {
    const testName = 'Boundary Clamping Mobile';
    
    try {
      // Set container size
      this.viewportManager.setContainerSize({ width: 800, height: 600 });
      
      // Test extreme pan beyond boundaries
      const initialState = this.viewportManager.getState();
      
      // Try to pan way beyond boundaries
      this.viewportManager.setState({
        ...initialState,
        panX: 5000, // Way beyond boundary
        panY: 5000
      });
      
      const finalState = this.viewportManager.getState();
      
      // Check if pan was clamped
      const wasClamped = finalState.panX !== 5000 && finalState.panY !== 5000;
      const isWithinBounds = finalState.panX <= 0 && finalState.panY <= 0;
      
      this.testResults.push({
        testName,
        passed: wasClamped && isWithinBounds,
        details: `Initial pan attempt: (5000, 5000), Final pan: (${finalState.panX}, ${finalState.panY}), Clamped: ${wasClamped}`
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
   * Test iOS Safari compatibility
   */
  private async testIOSSafariCompatibility(): Promise<void> {
    const testName = 'iOS Safari Compatibility';
    
    try {
      // Simulate iOS Safari user agent
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
      
      // Test specific iOS Safari issues
      const touchActionSupported = CSS.supports('touch-action', 'none');
      const pointerEventsSupported = 'PointerEvent' in window;
      
      // Test viewport meta tag (important for iOS)
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = viewportMeta !== null;
      
      const passed = touchActionSupported && pointerEventsSupported;
      
      this.testResults.push({
        testName,
        passed,
        details: `iOS Safari: ${isIOSSafari}, touchAction supported: ${touchActionSupported}, PointerEvents: ${pointerEventsSupported}, Viewport meta: ${hasViewportMeta}`
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
   * Test Android Chrome compatibility
   */
  private async testAndroidChromeCompatibility(): Promise<void> {
    const testName = 'Android Chrome Compatibility';
    
    try {
      // Simulate Android Chrome
      const isAndroidChrome = /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent);
      
      // Test Android-specific features
      const touchActionSupported = CSS.supports('touch-action', 'none');
      const passiveEventsSupported = this.testPassiveEventSupport();
      
      const passed = touchActionSupported && passiveEventsSupported;
      
      this.testResults.push({
        testName,
        passed,
        details: `Android Chrome: ${isAndroidChrome}, touchAction: ${touchActionSupported}, Passive events: ${passiveEventsSupported}`
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
   * Test pan performance on mobile
   */
  private async testPanPerformanceMobile(): Promise<void> {
    const testName = 'Pan Performance Mobile';
    
    try {
      const fpsData: number[] = [];
      let frameCount = 0;
      const startTime = performance.now();
      
      // Simulate rapid pan movements
      for (let i = 0; i < 60; i++) {
        const frameStart = performance.now();
        
        await this.simulatePanGesture(
          100 + i,
          100 + i,
          150 + i,
          150 + i
        );
        
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        const fps = 1000 / frameTime;
        fpsData.push(fps);
        frameCount++;
      }
      
      const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
      const minFps = Math.min(...fpsData);
      const maxFps = Math.max(...fpsData);
      
      const passed = avgFps >= 45 && minFps >= 30;
      
      this.testResults.push({
        testName,
        passed,
        details: `Average FPS: ${avgFps.toFixed(1)}, Min: ${minFps.toFixed(1)}, Max: ${maxFps.toFixed(1)}`,
        performance: { avgFps, minFps, maxFps }
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
   * Test rapid gesture handling
   */
  private async testRapidGestures(): Promise<void> {
    const testName = 'Rapid Gesture Handling';
    
    try {
      let eventCount = 0;
      
      this.inputHandler.onPan(() => {
        eventCount++;
      });
      
      // Simulate very rapid pan events
      const rapidEvents = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < rapidEvents; i++) {
        await this.simulatePanGesture(i, i, i + 1, i + 1);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const eventsPerSecond = (eventCount / duration) * 1000;
      
      const passed = eventCount > 0 && eventsPerSecond > 100; // Should handle >100 events/sec
      
      this.testResults.push({
        testName,
        passed,
        details: `Events processed: ${eventCount}, Events/sec: ${eventsPerSecond.toFixed(1)}, Duration: ${duration.toFixed(1)}ms`
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
   * Test multi-touch handling
   */
  private async testMultiTouchHandling(): Promise<void> {
    const testName = 'Multi-touch Handling';
    
    try {
      // Simulate two-finger gesture (should not trigger pan)
      let panCalled = false;
      
      this.inputHandler.onPan(() => {
        panCalled = true;
      });
      
      // Simulate two simultaneous touches
      const touch1 = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        isPrimary: true
      });
      
      const touch2 = new PointerEvent('pointerdown', {
        pointerId: 2,
        clientX: 200,
        clientY: 200,
        isPrimary: false
      });
      
      this.testCanvas.dispatchEvent(touch1);
      this.testCanvas.dispatchEvent(touch2);
      
      // Move both touches (should not trigger pan)
      const move1 = new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 120,
        clientY: 120,
        isPrimary: true
      });
      
      const move2 = new PointerEvent('pointermove', {
        pointerId: 2,
        clientX: 220,
        clientY: 220,
        isPrimary: false
      });
      
      this.testCanvas.dispatchEvent(move1);
      this.testCanvas.dispatchEvent(move2);
      
      const passed = !panCalled; // Pan should not be called with two touches
      
      this.testResults.push({
        testName,
        passed,
        details: `Two-finger gesture should not trigger pan. Pan called: ${panCalled}`
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
   * Simulate a pan gesture
   */
  private async simulatePanGesture(startX: number, startY: number, endX: number, endY: number): Promise<void> {
    return new Promise(resolve => {
      // Pointer down
      const pointerDown = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: startX,
        clientY: startY,
        isPrimary: true
      });
      
      this.testCanvas.dispatchEvent(pointerDown);
      
      // Pointer move
      setTimeout(() => {
        const pointerMove = new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: endX,
          clientY: endY,
          isPrimary: true
        });
        
        this.testCanvas.dispatchEvent(pointerMove);
        
        // Pointer up
        setTimeout(() => {
          const pointerUp = new PointerEvent('pointerup', {
            pointerId: 1,
            clientX: endX,
            clientY: endY,
            isPrimary: true
          });
          
          this.testCanvas.dispatchEvent(pointerUp);
          resolve();
        }, 16); // ~60fps timing
      }, 16);
    });
  }

  /**
   * Test passive event support
   */
  private testPassiveEventSupport(): boolean {
    let passiveSupported = false;
    
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      
      window.addEventListener('test', () => {}, options);
      window.removeEventListener('test', () => {}, options);
    } catch (err) {
      passiveSupported = false;
    }
    
    return passiveSupported;
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
    };
    details: TestResult[];
    recommendations: string[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    const recommendations = this.generateRecommendations();
    
    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate
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
        case 'Pointer Events API Setup':
          recommendations.push('Ensure Pointer Events API is properly configured with touchAction: none');
          break;
        case 'Touch Action Prevention':
          recommendations.push('Verify preventDefault is called on touch events to prevent browser gestures');
          break;
        case 'Pan Performance Mobile':
          recommendations.push('Consider optimizing pan performance with RAF batching or reducing update frequency');
          break;
        case 'iOS Safari Compatibility':
          recommendations.push('Test on actual iOS devices and ensure viewport meta tag is configured');
          break;
        case 'Android Chrome Compatibility':
          recommendations.push('Verify passive event listeners and touch-action support on Android');
          break;
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('All mobile gesture tests passed. Pan functionality is ready for mobile deployment.');
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