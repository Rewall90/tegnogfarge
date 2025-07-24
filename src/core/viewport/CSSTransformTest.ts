import type { ViewportState } from './types';
import { CSSTransformApplier } from './CSSTransformApplier';
import { TransformStateManager } from './TransformStateManager';
import { TransformPerformanceOptimizer } from './TransformPerformanceOptimizer';
import { CanvasTransform } from './CanvasTransform';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  performance?: {
    avgTime: number;
    maxTime: number;
    fps?: number;
  };
}

/**
 * CSSTransformTest - Comprehensive testing for CSS transform implementation
 * Tests transform accuracy, performance, and integration
 */
export class CSSTransformTest {
  private container: HTMLElement;
  private transformApplier: CSSTransformApplier;
  private stateManager: TransformStateManager;
  private performanceOptimizer: TransformPerformanceOptimizer;
  private canvasTransform: CanvasTransform;
  private testResults: TestResult[] = [];
  
  constructor() {
    // Create test container
    this.container = this.createTestContainer();
    this.transformApplier = new CSSTransformApplier(this.container);
    this.stateManager = new TransformStateManager(this.transformApplier);
    this.performanceOptimizer = new TransformPerformanceOptimizer(this.container);
    this.canvasTransform = new CanvasTransform();
    this.canvasTransform.setContainerElement(this.container);
  }
  
  /**
   * Create test container
   */
  private createTestContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'css-transform-test-container';
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
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting CSS Transform Tests...');
    
    await this.testTransformStringGeneration();
    await this.testTransformApplication();
    await this.testBatchedUpdates();
    await this.testPerformanceOptimization();
    await this.testZoomCentering();
    await this.testGPUAcceleration();
    await this.testAnimations();
    await this.testEdgeCases();
    await this.testPerformance();
    
    this.generateReport();
    
    return this.testResults;
  }
  
  /**
   * Test transform string generation
   */
  private async testTransformStringGeneration(): Promise<void> {
    const testName = 'Transform String Generation';
    
    try {
      const testCases = [
        { state: { scale: 1, panX: 0, panY: 0 }, expected: 'translate(0px, 0px) scale(1)' },
        { state: { scale: 1.5, panX: 100, panY: 200 }, expected: 'translate(100px, 200px) scale(1.5)' },
        { state: { scale: 0.5, panX: -50, panY: -100 }, expected: 'translate(-50px, -100px) scale(0.5)' },
        { state: { scale: 2.5, panX: 300.5, panY: 400.5 }, expected: 'translate(300.5px, 400.5px) scale(2.5)' }
      ];
      
      let passedCount = 0;
      
      testCases.forEach(testCase => {
        const state: ViewportState = { ...testCase.state, mode: 'zoom' };
        this.transformApplier.applyTransform(state);
        const result = this.transformApplier.getCurrentTransform();
        
        if (result === testCase.expected) {
          passedCount++;
        }
      });
      
      const passed = passedCount === testCases.length;
      
      this.testResults.push({
        testName,
        passed,
        details: `${passedCount}/${testCases.length} transform strings correct`
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
   * Test transform application to DOM
   */
  private async testTransformApplication(): Promise<void> {
    const testName = 'Transform DOM Application';
    
    try {
      const state: ViewportState = {
        scale: 1.5,
        panX: 150,
        panY: 75,
        mode: 'zoom'
      };
      
      this.transformApplier.applyTransform(state);
      
      // Check computed style
      const computedStyle = window.getComputedStyle(this.container);
      const transform = computedStyle.transform;
      
      // Check if transform was applied
      const isApplied = transform !== 'none' && transform !== '';
      
      // Verify transform origin
      const transformOrigin = computedStyle.transformOrigin;
      const hasCorrectOrigin = transformOrigin.includes('0px');
      
      const passed = isApplied && hasCorrectOrigin;
      
      this.testResults.push({
        testName,
        passed,
        details: `Transform applied: ${isApplied}, Origin correct: ${hasCorrectOrigin}`
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
   * Test batched updates
   */
  private async testBatchedUpdates(): Promise<void> {
    const testName = 'Batched Transform Updates';
    
    try {
      const startStats = this.stateManager.getStats();
      
      // Schedule multiple rapid updates
      for (let i = 0; i < 10; i++) {
        this.stateManager.batchTransformUpdate({
          scale: 1 + i * 0.1,
          panX: i * 10,
          panY: i * 5,
          mode: 'zoom'
        });
      }
      
      // Wait for batch to complete
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      
      const endStats = this.stateManager.getStats();
      
      // Should have processed far fewer updates than scheduled
      const updateCount = endStats.updateCount - startStats.updateCount;
      const isBatched = updateCount < 10;
      
      const passed = isBatched;
      
      this.testResults.push({
        testName,
        passed,
        details: `Scheduled: 10, Applied: ${updateCount}, Batching working: ${isBatched}`
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
   * Test performance optimization
   */
  private async testPerformanceOptimization(): Promise<void> {
    const testName = 'Performance Optimization';
    
    try {
      // Test GPU acceleration
      this.performanceOptimizer.enableGPUAcceleration();
      const metrics1 = this.performanceOptimizer.getPerformanceMetrics();
      
      // Test optimization for transforms
      this.performanceOptimizer.optimizeForTransforms();
      const styles = window.getComputedStyle(this.container);
      
      // Check optimizations
      const hasGPU = metrics1.gpuEnabled;
      const hasWillChange = styles.willChange === 'transform';
      const hasBackfaceHidden = styles.backfaceVisibility === 'hidden';
      
      const passed = hasGPU && hasWillChange && hasBackfaceHidden;
      
      this.testResults.push({
        testName,
        passed,
        details: `GPU: ${hasGPU}, Will-change: ${hasWillChange}, Backface: ${hasBackfaceHidden}`
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
   * Test zoom centering
   */
  private async testZoomCentering(): Promise<void> {
    const testName = 'Zoom Centering';
    
    try {
      const initialState: ViewportState = {
        scale: 1,
        panX: 0,
        panY: 0,
        mode: 'zoom'
      };
      
      // Apply initial state
      this.stateManager.updateTransform(initialState);
      
      // Zoom at specific point
      const centerX = 400;
      const centerY = 300;
      const newScale = 2;
      
      this.stateManager.zoomAtPoint(newScale, centerX, centerY, initialState);
      
      const resultState = this.stateManager.getLastAppliedState();
      
      // Verify zoom was centered
      const expectedPanX = centerX - (centerX - initialState.panX) * (newScale / initialState.scale);
      const expectedPanY = centerY - (centerY - initialState.panY) * (newScale / initialState.scale);
      
      const isXCorrect = Math.abs(resultState!.panX - expectedPanX) < 0.1;
      const isYCorrect = Math.abs(resultState!.panY - expectedPanY) < 0.1;
      
      const passed = isXCorrect && isYCorrect;
      
      this.testResults.push({
        testName,
        passed,
        details: `X centered: ${isXCorrect}, Y centered: ${isYCorrect}`
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
   * Test GPU acceleration
   */
  private async testGPUAcceleration(): Promise<void> {
    const testName = 'GPU Acceleration';
    
    try {
      // Check availability
      const isAvailable = TransformPerformanceOptimizer.isGPUAccelerationAvailable();
      
      if (!isAvailable) {
        this.testResults.push({
          testName,
          passed: true,
          details: 'GPU acceleration not available on this system'
        });
        return;
      }
      
      // Enable and test
      this.performanceOptimizer.enableGPUAcceleration();
      const transform = this.container.style.transform;
      
      const hasTranslateZ = transform.includes('translateZ');
      const hasWillChange = this.container.style.willChange === 'transform';
      
      const passed = hasTranslateZ && hasWillChange;
      
      this.testResults.push({
        testName,
        passed,
        details: `TranslateZ: ${hasTranslateZ}, Will-change: ${hasWillChange}`
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
   * Test animations
   */
  private async testAnimations(): Promise<void> {
    const testName = 'Transform Animations';
    
    try {
      const startState: ViewportState = {
        scale: 1,
        panX: 0,
        panY: 0,
        mode: 'zoom'
      };
      
      const endState: ViewportState = {
        scale: 2,
        panX: 100,
        panY: 100,
        mode: 'zoom'
      };
      
      // Start animation
      const startTime = performance.now();
      await this.stateManager.animateTo(endState, 200);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      const finalState = this.stateManager.getLastAppliedState();
      
      // Check if animation completed to target
      const reachedTarget = finalState?.scale === endState.scale &&
                           finalState?.panX === endState.panX &&
                           finalState?.panY === endState.panY;
      
      // Check if animation took approximately correct time
      const durationCorrect = duration >= 190 && duration <= 250;
      
      const passed = reachedTarget && durationCorrect;
      
      this.testResults.push({
        testName,
        passed,
        details: `Target reached: ${reachedTarget}, Duration: ${duration.toFixed(0)}ms`,
        performance: {
          avgTime: duration,
          maxTime: duration
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
    const testName = 'Edge Cases';
    
    try {
      let edgeCasesPassed = 0;
      const totalCases = 4;
      
      // Test 1: Very small scale
      this.transformApplier.applyTransform({
        scale: 0.001,
        panX: 0,
        panY: 0,
        mode: 'zoom'
      });
      if (this.transformApplier.getCurrentTransform().includes('0.001')) {
        edgeCasesPassed++;
      }
      
      // Test 2: Very large values
      this.transformApplier.applyTransform({
        scale: 1,
        panX: 10000,
        panY: 10000,
        mode: 'zoom'
      });
      if (this.transformApplier.getCurrentTransform().includes('10000')) {
        edgeCasesPassed++;
      }
      
      // Test 3: Negative values
      this.transformApplier.applyTransform({
        scale: 1,
        panX: -500,
        panY: -500,
        mode: 'zoom'
      });
      if (this.transformApplier.getCurrentTransform().includes('-500')) {
        edgeCasesPassed++;
      }
      
      // Test 4: Decimal precision
      this.transformApplier.applyTransform({
        scale: 1.123456789,
        panX: 123.456789,
        panY: 456.789012,
        mode: 'zoom'
      });
      const transform = this.transformApplier.getCurrentTransform();
      if (transform.includes('1.123456789') && transform.includes('123.456789')) {
        edgeCasesPassed++;
      }
      
      const passed = edgeCasesPassed === totalCases;
      
      this.testResults.push({
        testName,
        passed,
        details: `${edgeCasesPassed}/${totalCases} edge cases handled correctly`
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
    const testName = 'Transform Performance';
    
    try {
      const iterations = 1000;
      const times: number[] = [];
      
      // Warm up
      for (let i = 0; i < 10; i++) {
        this.transformApplier.applyTransform({
          scale: 1,
          panX: 0,
          panY: 0,
          mode: 'zoom'
        });
      }
      
      // Performance test
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        this.transformApplier.applyTransform({
          scale: 1 + (i % 30) * 0.1,
          panX: i % 100,
          panY: i % 100,
          mode: 'zoom'
        });
        
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Should be very fast (< 0.1ms average)
      const passed = avgTime < 0.1;
      
      this.testResults.push({
        testName,
        passed,
        details: `Avg: ${avgTime.toFixed(3)}ms, Max: ${maxTime.toFixed(3)}ms`,
        performance: {
          avgTime,
          maxTime
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
   * Generate test report
   */
  private generateReport(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 CSS Transform Test Report');
    console.log('===========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('\nDetailed Results:');
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.testName}`);
      console.log(`   ${result.details}`);
      if (result.performance) {
        console.log(`   Performance: Avg ${result.performance.avgTime.toFixed(3)}ms`);
      }
    });
    
    if (failedTests === 0) {
      console.log('\n🎉 All CSS transform tests passed!');
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
    
    // Reset components
    this.stateManager.reset();
    this.performanceOptimizer.resetOptimizations();
    this.canvasTransform.cleanup();
    
    this.testResults = [];
  }
}