import type { ViewportState, CanvasCoordinates, ScreenCoordinates } from './types';
import { CSSTransformCoordinateMapper } from './CSSTransformCoordinateMapper';
import { DevicePixelRatioHandler } from './DevicePixelRatioHandler';
import { FloodFillCoordinateHandler } from './FloodFillCoordinateHandler';
import { ReverseCoordinateMapper } from './ReverseCoordinateMapper';
import { CoordinateBoundsValidator } from './CoordinateBoundsValidator';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    avgTime: number;
    maxTime: number;
    totalOperations: number;
  };
  accuracy?: {
    maxError: number;
    avgError: number;
    pixelPerfect: boolean;
  };
}

/**
 * CoordinateConversionTest - Comprehensive testing for coordinate conversion system
 * Tests 3-step transformation, DPR handling, and pixel-perfect accuracy
 */
export class CoordinateConversionTest {
  private container: HTMLElement;
  private coordinateMapper: CSSTransformCoordinateMapper;
  private dprHandler: DevicePixelRatioHandler;
  private floodFillHandler: FloodFillCoordinateHandler;
  private reverseMapper: ReverseCoordinateMapper;
  private boundsValidator: CoordinateBoundsValidator;
  private testResults: TestResult[] = [];
  
  constructor() {
    // Create test container
    this.container = this.createTestContainer();
    this.coordinateMapper = new CSSTransformCoordinateMapper(this.container);
    this.dprHandler = new DevicePixelRatioHandler();
    this.floodFillHandler = new FloodFillCoordinateHandler(this.coordinateMapper);
    this.reverseMapper = new ReverseCoordinateMapper(this.coordinateMapper);
    this.boundsValidator = new CoordinateBoundsValidator(this.coordinateMapper);
  }
  
  /**
   * Create test container
   */
  private createTestContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'coordinate-test-container';
    container.style.position = 'fixed';
    container.style.top = '-3000px';
    container.style.left = '-3000px';
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.overflow = 'hidden';
    
    document.body.appendChild(container);
    
    return container;
  }
  
  /**
   * Run all coordinate conversion tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting Coordinate Conversion Tests...');
    
    await this.testBasicCoordinateConversion();
    await this.testThreeStepTransformation();
    await this.testDevicePixelRatioHandling();
    await this.testFloodFillCoordinates();
    await this.testReverseCoordinateMapping();
    await this.testCoordinateBoundsValidation();
    await this.testCSSTransformUndo();
    await this.testViewportStateIntegration();
    await this.testPixelPerfectAccuracy();
    await this.testPerformance();
    await this.testDPRVariations();
    await this.testEdgeCases();
    
    this.generateReport();
    
    return this.testResults;
  }
  
  /**
   * Test basic coordinate conversion
   */
  private async testBasicCoordinateConversion(): Promise<void> {
    const testName = 'Basic Coordinate Conversion';
    
    try {
      // Set up viewport state
      this.coordinateMapper.updateViewportState({
        scale: 1,
        panX: 0,
        panY: 0,
        mode: 'draw'
      });
      
      const testCases = [
        { screen: { x: 100, y: 100 }, expectedRange: { minX: 95, maxX: 105, minY: 95, maxY: 105 } },
        { screen: { x: 400, y: 300 }, expectedRange: { minX: 395, maxX: 405, minY: 295, maxY: 305 } },
        { screen: { x: 0, y: 0 }, expectedRange: { minX: -5, maxX: 5, minY: -5, maxY: 5 } }
      ];
      
      let passedCount = 0;
      const errors: number[] = [];
      
      testCases.forEach(testCase => {
        const result = this.coordinateMapper.toCanvasCoords(testCase.screen.x, testCase.screen.y);
        
        const withinRangeX = result.x >= testCase.expectedRange.minX && result.x <= testCase.expectedRange.maxX;
        const withinRangeY = result.y >= testCase.expectedRange.minY && result.y <= testCase.expectedRange.maxY;
        const isInteger = Number.isInteger(result.x) && Number.isInteger(result.y);
        
        if (withinRangeX && withinRangeY && isInteger) {
          passedCount++;
        }
        
        const errorX = Math.abs(result.x - testCase.screen.x);
        const errorY = Math.abs(result.y - testCase.screen.y);
        errors.push(Math.max(errorX, errorY));
      });
      
      const passed = passedCount === testCases.length;
      const maxError = Math.max(...errors);
      const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `${passedCount}/${testCases.length} conversions correct`,
        accuracy: {
          maxError,
          avgError,
          pixelPerfect: maxError < 1
        }
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
   * Test 3-step transformation pipeline
   */
  private async testThreeStepTransformation(): Promise<void> {
    const testName = '3-Step Transformation Pipeline';
    
    try {
      const screenCoords = { x: 200, y: 150 };
      const transformInfo = this.coordinateMapper.getTransformationInfo(screenCoords.x, screenCoords.y);
      
      // Verify each step
      const hasScreenCoords = transformInfo.screen.x === screenCoords.x && transformInfo.screen.y === screenCoords.y;
      const hasContainerCoords = typeof transformInfo.container.x === 'number' && typeof transformInfo.container.y === 'number';
      const hasLogicalCoords = typeof transformInfo.logical.x === 'number' && typeof transformInfo.logical.y === 'number';
      const hasCanvasCoords = Number.isInteger(transformInfo.canvas.x) && Number.isInteger(transformInfo.canvas.y);
      const hasValidDPR = transformInfo.dpr >= 1;
      
      const allStepsValid = hasScreenCoords && hasContainerCoords && hasLogicalCoords && hasCanvasCoords && hasValidDPR;
      
      this.testResults.push({
        testName,
        passed: allStepsValid,
        details: `Screen: ${hasScreenCoords}, Container: ${hasContainerCoords}, Logical: ${hasLogicalCoords}, Canvas: ${hasCanvasCoords}, DPR: ${hasValidDPR}`
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
   * Test device pixel ratio handling
   */
  private async testDevicePixelRatioHandling(): Promise<void> {
    const testName = 'Device Pixel Ratio Handling';
    
    try {
      const testDPRValues = [1, 1.25, 1.5, 2, 2.5, 3];
      let allTestsPassed = true;
      const results: string[] = [];
      
      const originalDPR = window.devicePixelRatio;
      
      for (const dpr of testDPRValues) {
        // Mock DPR
        Object.defineProperty(window, 'devicePixelRatio', {
          writable: true,
          configurable: true,
          value: dpr
        });
        
        const testCoords = { x: 100, y: 100 };
        const result = this.dprHandler.logicalToCanvasPixel(testCoords.x, testCoords.y);
        
        const expectedX = Math.round(testCoords.x * dpr);
        const expectedY = Math.round(testCoords.y * dpr);
        
        const isCorrect = result.x === expectedX && result.y === expectedY;
        const isInteger = Number.isInteger(result.x) && Number.isInteger(result.y);
        
        if (!isCorrect || !isInteger) {
          allTestsPassed = false;
        }
        
        results.push(`DPR ${dpr}: ${isCorrect && isInteger ? 'PASS' : 'FAIL'}`);
      }
      
      // Restore original DPR
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: originalDPR
      });
      
      this.testResults.push({
        testName,
        passed: allTestsPassed,
        details: results.join(', ')
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
   * Test flood fill coordinate handling
   */
  private async testFloodFillCoordinates(): Promise<void> {
    const testName = 'Flood Fill Coordinate Handling';
    
    try {
      const testEvents = [
        { clientX: 100.5, clientY: 200.3 },
        { clientX: 150.7, clientY: 250.9 },
        { clientX: 50, clientY: 75 }
      ];
      
      const mockEvents = testEvents.map(event => ({
        clientX: event.clientX,
        clientY: event.clientY
      } as PointerEvent));
      
      let integerCount = 0;
      let validCount = 0;
      
      mockEvents.forEach(event => {
        const coords = this.floodFillHandler.getFloodFillCoordinates(event);
        
        if (Number.isInteger(coords.x) && Number.isInteger(coords.y)) {
          integerCount++;
        }
        
        if (this.boundsValidator.isWithinCanvasBounds(coords)) {
          validCount++;
        }
      });
      
      const passed = integerCount === testEvents.length && validCount === testEvents.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `Integer coords: ${integerCount}/${testEvents.length}, Valid bounds: ${validCount}/${testEvents.length}`,
        accuracy: {
          maxError: 0,
          avgError: 0,
          pixelPerfect: integerCount === testEvents.length
        }
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
   * Test reverse coordinate mapping
   */
  private async testReverseCoordinateMapping(): Promise<void> {
    const testName = 'Reverse Coordinate Mapping';
    
    try {
      const testCanvasCoords: CanvasCoordinates[] = [
        { x: 100, y: 100 },
        { x: 500, y: 300 },
        { x: 1000, y: 800 }
      ];
      
      const accuracy = this.reverseMapper.testReverseAccuracy(testCanvasCoords);
      
      const passed = accuracy.passedTests === accuracy.totalTests;
      
      this.testResults.push({
        testName,
        passed,
        details: `${accuracy.passedTests}/${accuracy.totalTests} reverse mappings accurate`,
        accuracy: {
          maxError: accuracy.maxError,
          avgError: accuracy.avgError,
          pixelPerfect: accuracy.maxError < 1
        }
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
   * Test coordinate bounds validation
   */
  private async testCoordinateBoundsValidation(): Promise<void> {
    const testName = 'Coordinate Bounds Validation';
    
    try {
      const validationTests = this.boundsValidator.runValidationTests();
      const passed = validationTests.passedTests === validationTests.totalTests;
      
      this.testResults.push({
        testName,
        passed,
        details: `${validationTests.passedTests}/${validationTests.totalTests} validation tests passed`
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
   * Test CSS transform undoing
   */
  private async testCSSTransformUndo(): Promise<void> {
    const testName = 'CSS Transform Undo';
    
    try {
      const viewportStates: ViewportState[] = [
        { scale: 2, panX: 100, panY: 50, mode: 'zoom' },
        { scale: 0.5, panX: -50, panY: -25, mode: 'zoom' },
        { scale: 1.5, panX: 200, panY: 150, mode: 'zoom' }
      ];
      
      let correctTransformations = 0;
      
      viewportStates.forEach(state => {
        this.coordinateMapper.updateViewportState(state);
        
        // Test known transformation
        const screenCoords = { x: 400, y: 300 };
        const canvasCoords = this.coordinateMapper.toCanvasCoords(screenCoords.x, screenCoords.y);
        
        // Reverse to verify
        const backToScreen = this.reverseMapper.canvasToScreen(canvasCoords.x, canvasCoords.y);
        
        const errorX = Math.abs(backToScreen.x - screenCoords.x);
        const errorY = Math.abs(backToScreen.y - screenCoords.y);
        const totalError = Math.max(errorX, errorY);
        
        if (totalError < 2) { // Allow 2px tolerance for rounding
          correctTransformations++;
        }
      });
      
      const passed = correctTransformations === viewportStates.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `${correctTransformations}/${viewportStates.length} transform undos correct`
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
   * Test viewport state integration
   */
  private async testViewportStateIntegration(): Promise<void> {
    const testName = 'Viewport State Integration';
    
    try {
      const initialState: ViewportState = { scale: 1, panX: 0, panY: 0, mode: 'draw' };
      const updatedState: ViewportState = { scale: 2, panX: 100, panY: 50, mode: 'zoom' };
      
      // Test initial state
      this.coordinateMapper.updateViewportState(initialState);
      const coords1 = this.coordinateMapper.toCanvasCoords(200, 200);
      
      // Test updated state
      this.coordinateMapper.updateViewportState(updatedState);
      const coords2 = this.coordinateMapper.toCanvasCoords(200, 200);
      
      // Coordinates should be different due to state change
      const stateChangeDetected = coords1.x !== coords2.x || coords1.y !== coords2.y;
      
      // State should be correctly stored
      const storedState = this.coordinateMapper.getViewportState();
      const stateCorrect = storedState.scale === updatedState.scale && 
                          storedState.panX === updatedState.panX && 
                          storedState.panY === updatedState.panY;
      
      const passed = stateChangeDetected && stateCorrect;
      
      this.testResults.push({
        testName,
        passed,
        details: `State change detected: ${stateChangeDetected}, State stored correctly: ${stateCorrect}`
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
   * Test pixel-perfect accuracy
   */
  private async testPixelPerfectAccuracy(): Promise<void> {
    const testName = 'Pixel Perfect Accuracy';
    
    try {
      const testCoordinates = [
        { x: 100.1, y: 200.9 },
        { x: 50.5, y: 75.5 },
        { x: 300.7, y: 400.3 }
      ];
      
      let pixelPerfectCount = 0;
      const errors: number[] = [];
      
      testCoordinates.forEach(coord => {
        const canvasCoords = this.coordinateMapper.toCanvasCoords(coord.x, coord.y);
        
        if (Number.isInteger(canvasCoords.x) && Number.isInteger(canvasCoords.y)) {
          pixelPerfectCount++;
        }
        
        // Calculate sub-pixel error
        const errorX = Math.abs(canvasCoords.x - Math.round(canvasCoords.x));
        const errorY = Math.abs(canvasCoords.y - Math.round(canvasCoords.y));
        errors.push(Math.max(errorX, errorY));
      });
      
      const maxError = Math.max(...errors);
      const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
      const passed = pixelPerfectCount === testCoordinates.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `${pixelPerfectCount}/${testCoordinates.length} coordinates pixel-perfect`,
        accuracy: {
          maxError,
          avgError,
          pixelPerfect: passed
        }
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
   * Test performance
   */
  private async testPerformance(): Promise<void> {
    const testName = 'Coordinate Conversion Performance';
    
    try {
      const iterations = 10000;
      const times: number[] = [];
      
      // Warm up
      for (let i = 0; i < 100; i++) {
        this.coordinateMapper.toCanvasCoords(i % 800, i % 600);
      }
      
      // Performance test
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        this.coordinateMapper.toCanvasCoords(i % 800, i % 600);
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Should be very fast (< 0.01ms average)
      const passed = avgTime < 0.01;
      
      this.testResults.push({
        testName,
        passed,
        details: `${iterations} conversions: avg ${avgTime.toFixed(4)}ms, max ${maxTime.toFixed(4)}ms`,
        performance: {
          avgTime,
          maxTime,
          totalOperations: iterations
        }
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
   * Test DPR variations
   */
  private async testDPRVariations(): Promise<void> {
    const testName = 'DPR Variation Handling';
    
    try {
      const testCoordinates = [
        { x: 100, y: 100 },
        { x: 250, y: 175 },
        { x: 400, y: 300 }
      ];
      
      const testAccuracy = this.dprHandler.testDPRAccuracy(testCoordinates);
      const allPixelAligned = testAccuracy.results.every(r => r.isPixelAligned);
      const allScaledCorrectly = testAccuracy.results.every(r => r.scaledCorrectly);
      
      const passed = allPixelAligned && allScaledCorrectly;
      
      this.testResults.push({
        testName,
        passed,
        details: `DPR ${testAccuracy.currentDPR}: Pixel aligned: ${allPixelAligned}, Scaled correctly: ${allScaledCorrectly}`,
        accuracy: {
          maxError: 0,
          avgError: 0,
          pixelPerfect: allPixelAligned
        }
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
   * Test edge cases
   */
  private async testEdgeCases(): Promise<void> {
    const testName = 'Edge Case Handling';
    
    try {
      const edgeCases = [
        { x: 0, y: 0 },
        { x: -100, y: -100 },
        { x: 10000, y: 10000 },
        { x: 0.1, y: 0.1 },
        { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }
      ];
      
      let handledCorrectly = 0;
      
      edgeCases.forEach(coord => {
        try {
          const result = this.coordinateMapper.toCanvasCoords(coord.x, coord.y);
          
          // Should always return valid numbers
          if (Number.isFinite(result.x) && Number.isFinite(result.y)) {
            handledCorrectly++;
          }
        } catch (error) {
          // Edge cases should not throw errors
        }
      });
      
      const passed = handledCorrectly === edgeCases.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `${handledCorrectly}/${edgeCases.length} edge cases handled correctly`
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
   * Generate comprehensive test report
   */
  private generateReport(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    // Calculate accuracy metrics
    const accuracyTests = this.testResults.filter(r => r.accuracy);
    const pixelPerfectTests = accuracyTests.filter(r => r.accuracy!.pixelPerfect).length;
    const avgMaxError = accuracyTests.length > 0 
      ? accuracyTests.reduce((sum, r) => sum + (r.accuracy!.maxError || 0), 0) / accuracyTests.length 
      : 0;
    
    console.log('\n📊 Coordinate Conversion Test Report');
    console.log('===================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (accuracyTests.length > 0) {
      console.log(`\nAccuracy Metrics:`);
      console.log(`Pixel Perfect Tests: ${pixelPerfectTests}/${accuracyTests.length}`);
      console.log(`Average Max Error: ${avgMaxError.toFixed(3)}px`);
    }
    
    console.log('\nDetailed Results:');
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.testName}`);
      console.log(`   ${result.details}`);
      
      if (result.accuracy) {
        console.log(`   Accuracy: Max error ${result.accuracy.maxError.toFixed(3)}px, Pixel perfect: ${result.accuracy.pixelPerfect}`);
      }
      
      if (result.performance) {
        console.log(`   Performance: Avg ${result.performance.avgTime.toFixed(4)}ms per operation`);
      }
    });
    
    if (failedTests === 0) {
      console.log('\n🎉 All coordinate conversion tests passed! System is pixel-perfect and ready for production.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the failures above.');
    }
  }
  
  /**
   * Cleanup test resources
   */
  cleanup(): void {
    // Remove test container
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
    }
    
    this.testResults = [];
  }
}