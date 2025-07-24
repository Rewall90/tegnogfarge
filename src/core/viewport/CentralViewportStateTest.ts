import type { ViewportState } from './types';
import { ViewportManager } from './ViewportManager';
import { ViewportStateValidator } from './ViewportStateValidator';
import { ViewportEventSystem } from './ViewportEventSystem';
import { ViewportStatePersistence } from './ViewportStatePersistence';
import { ViewportDebugger } from './ViewportDebugger';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime?: number;
}

/**
 * CentralViewportStateTest - Comprehensive testing for central viewport state
 * Tests state management, synchronization, persistence, and validation
 */
export class CentralViewportStateTest {
  private viewportManager: ViewportManager;
  private validator: ViewportStateValidator;
  private eventSystem: ViewportEventSystem;
  private persistence: ViewportStatePersistence;
  private debugger: ViewportDebugger;
  private testResults: TestResult[] = [];
  
  constructor() {
    this.viewportManager = new ViewportManager();
    this.validator = new ViewportStateValidator();
    this.eventSystem = new ViewportEventSystem(this.viewportManager);
    this.persistence = new ViewportStatePersistence();
    this.debugger = new ViewportDebugger(this.viewportManager);
  }
  
  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting Central Viewport State Tests...');
    
    await this.testStateManagement();
    await this.testStateValidation();
    await this.testBoundaryClamping();
    await this.testEventSystem();
    await this.testStatePersistence();
    await this.testModeManagement();
    await this.testPerformance();
    await this.testEdgeCases();
    
    this.generateReport();
    
    return this.testResults;
  }
  
  /**
   * Test basic state management
   */
  private async testStateManagement(): Promise<void> {
    const testName = 'State Management';
    const startTime = performance.now();
    
    try {
      // Test initial state
      const initialState = this.viewportManager.getState();
      const isInitialValid = initialState.scale === 1.0 && 
                            initialState.panX === 0 && 
                            initialState.panY === 0 &&
                            initialState.mode === 'draw';
      
      // Test state updates
      this.viewportManager.setState({
        scale: 2.0,
        panX: 100,
        panY: 50
      });
      
      const updatedState = this.viewportManager.getState();
      const isUpdateCorrect = updatedState.scale === 2.0 && 
                             updatedState.panX === 100 && 
                             updatedState.panY === 50;
      
      // Test partial updates
      this.viewportManager.setScale(1.5);
      const partialUpdate = this.viewportManager.getState();
      const isPartialCorrect = partialUpdate.scale === 1.5 && 
                              partialUpdate.panX === 100; // Pan should remain
      
      const passed = isInitialValid && isUpdateCorrect && isPartialCorrect;
      
      this.testResults.push({
        testName,
        passed,
        details: `Initial: ${isInitialValid}, Update: ${isUpdateCorrect}, Partial: ${isPartialCorrect}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test state validation
   */
  private async testStateValidation(): Promise<void> {
    const testName = 'State Validation';
    const startTime = performance.now();
    
    try {
      // Test valid state
      const validState: ViewportState = {
        scale: 1.5,
        panX: 0,
        panY: 0,
        mode: 'draw'
      };
      
      const validResult = this.validator.validateState(validState);
      
      // Test invalid states
      const invalidStates = [
        { scale: -1, panX: 0, panY: 0, mode: 'draw' as const },
        { scale: 1, panX: NaN, panY: 0, mode: 'draw' as const },
        { scale: 1, panX: 0, panY: Infinity, mode: 'draw' as const },
        { scale: 1, panX: 0, panY: 0, mode: 'invalid' as any }
      ];
      
      const invalidResults = invalidStates.map(state => 
        this.validator.validateState(state as ViewportState)
      );
      
      const allInvalid = invalidResults.every(result => !result.isValid);
      
      // Test sanitization
      const sanitized = this.validator.sanitizeState({
        scale: 100,
        panX: NaN,
        panY: undefined,
        mode: undefined
      });
      
      const isSanitized = sanitized.scale <= 4.0 && 
                         sanitized.panX === 0 && 
                         sanitized.mode === 'draw';
      
      const passed = validResult.isValid && allInvalid && isSanitized;
      
      this.testResults.push({
        testName,
        passed,
        details: `Valid: ${validResult.isValid}, Invalid detection: ${allInvalid}, Sanitization: ${isSanitized}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test boundary clamping
   */
  private async testBoundaryClamping(): Promise<void> {
    const testName = 'Boundary Clamping';
    const startTime = performance.now();
    
    try {
      // Set container size
      this.viewportManager.setContainerSize({ width: 800, height: 600 });
      
      // Test scale clamping
      this.viewportManager.setState({ scale: 10.0 });
      const clampedScale = this.viewportManager.getState().scale;
      const isScaleClamped = clampedScale === 4.0; // Max scale
      
      // Test pan clamping at different scales
      this.viewportManager.setState({
        scale: 0.5,
        panX: -5000,
        panY: -5000
      });
      
      const clampedState = this.viewportManager.getState();
      const isPanClamped = clampedState.panX > -5000 && clampedState.panY > -5000;
      
      // Test centering when canvas is smaller than container
      this.viewportManager.setState({
        scale: 0.1,
        panX: 0,
        panY: 0
      });
      
      const centeredState = this.viewportManager.getState();
      const isCentered = centeredState.scale === 0.25 && // Min scale
                        centeredState.panX > 0 && 
                        centeredState.panY > 0;
      
      const passed = isScaleClamped && isPanClamped && isCentered;
      
      this.testResults.push({
        testName,
        passed,
        details: `Scale clamping: ${isScaleClamped}, Pan clamping: ${isPanClamped}, Centering: ${isCentered}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test event system
   */
  private async testEventSystem(): Promise<void> {
    const testName = 'Event System';
    const startTime = performance.now();
    
    try {
      let eventCount = 0;
      let lastState: ViewportState | null = null;
      
      // Subscribe to state changes
      const unsubscribe = this.eventSystem.subscribeToStateChanges((state) => {
        eventCount++;
        lastState = state;
      });
      
      // Initialize sync
      this.eventSystem.initializeSync();
      
      // Trigger state changes
      this.viewportManager.setState({ scale: 1.5 });
      this.viewportManager.setPan(50, 50);
      this.viewportManager.setMode('zoom');
      
      // Test batched updates
      this.eventSystem.batchStateUpdate({ scale: 2.0, panX: 100 }, 0);
      
      // Wait for batch to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const hasEvents = eventCount >= 4;
      const correctLastState = lastState?.scale === 2.0 && lastState?.panX === 100;
      
      // Cleanup
      unsubscribe();
      
      const passed = hasEvents && correctLastState;
      
      this.testResults.push({
        testName,
        passed,
        details: `Event count: ${eventCount}, Last state correct: ${correctLastState}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test state persistence
   */
  private async testStatePersistence(): Promise<void> {
    const testName = 'State Persistence';
    const startTime = performance.now();
    
    try {
      // Clear any existing state
      this.persistence.clearState();
      
      // Save a specific state
      const stateToSave: ViewportState = {
        scale: 1.75,
        panX: 150,
        panY: 75,
        mode: 'zoom'
      };
      
      const saved = this.persistence.saveState(stateToSave);
      
      // Load the state
      const loaded = this.persistence.loadState();
      
      const isLoaded = loaded !== null &&
                      loaded.scale === 1.75 &&
                      loaded.panX === 150 &&
                      loaded.panY === 75 &&
                      loaded.mode === 'draw'; // Always loads in draw mode
      
      // Test metadata
      const metadata = this.persistence.getStateMetadata();
      const hasMetadata = metadata.hasState && metadata.stateAge !== undefined;
      
      // Test export/import
      const exported = this.persistence.exportState();
      const imported = exported ? this.persistence.importState(exported) : false;
      
      const passed = saved && isLoaded && hasMetadata && imported;
      
      this.testResults.push({
        testName,
        passed,
        details: `Save: ${saved}, Load: ${isLoaded}, Metadata: ${hasMetadata}, Export/Import: ${imported}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test mode management
   */
  private async testModeManagement(): Promise<void> {
    const testName = 'Mode Management';
    const startTime = performance.now();
    
    try {
      // Test initial mode
      const initialMode = this.viewportManager.getState().mode;
      const isInitialDraw = initialMode === 'draw';
      
      // Test mode switching
      this.viewportManager.setMode('zoom');
      const zoomMode = this.viewportManager.getState().mode;
      const isZoomSet = zoomMode === 'zoom';
      
      // Test mode validation
      this.viewportManager.setState({ mode: 'invalid' as any });
      const validatedMode = this.viewportManager.getState().mode;
      const isModeValidated = validatedMode === 'draw'; // Should default to draw
      
      const passed = isInitialDraw && isZoomSet && isModeValidated;
      
      this.testResults.push({
        testName,
        passed,
        details: `Initial: ${isInitialDraw}, Zoom set: ${isZoomSet}, Validation: ${isModeValidated}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test performance
   */
  private async testPerformance(): Promise<void> {
    const testName = 'Performance';
    const startTime = performance.now();
    
    try {
      const iterations = 1000;
      let stateChanges = 0;
      
      // Subscribe to count state changes
      const unsubscribe = this.viewportManager.addStateChangeListener(() => {
        stateChanges++;
      });
      
      // Rapid state updates
      const updateStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.viewportManager.setState({
          scale: 1 + (i % 30) * 0.1,
          panX: i % 100,
          panY: i % 100
        });
      }
      const updateTime = performance.now() - updateStart;
      
      // Calculate metrics
      const avgUpdateTime = updateTime / iterations;
      const isPerformant = avgUpdateTime < 1; // Less than 1ms per update
      
      unsubscribe();
      
      const passed = isPerformant;
      
      this.testResults.push({
        testName,
        passed,
        details: `${iterations} updates in ${updateTime.toFixed(2)}ms, avg: ${avgUpdateTime.toFixed(3)}ms`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
      });
    }
  }
  
  /**
   * Test edge cases
   */
  private async testEdgeCases(): Promise<void> {
    const testName = 'Edge Cases';
    const startTime = performance.now();
    
    try {
      // Test empty state update
      const beforeEmpty = this.viewportManager.getState();
      this.viewportManager.setState({});
      const afterEmpty = this.viewportManager.getState();
      const emptyUpdateOk = JSON.stringify(beforeEmpty) === JSON.stringify(afterEmpty);
      
      // Test rapid mode switching
      let modeChangeCount = 0;
      const unsubscribe = this.viewportManager.addStateChangeListener(() => {
        modeChangeCount++;
      });
      
      for (let i = 0; i < 10; i++) {
        this.viewportManager.setMode(i % 2 === 0 ? 'zoom' : 'draw');
      }
      
      const rapidModeOk = modeChangeCount === 10;
      
      // Test reset functionality
      this.viewportManager.setState({ scale: 3, panX: 200, panY: 200 });
      this.viewportManager.reset();
      const resetState = this.viewportManager.getState();
      const resetOk = resetState.scale === 1 && resetState.panX === 0 && resetState.panY === 0;
      
      unsubscribe();
      
      const passed = emptyUpdateOk && rapidModeOk && resetOk;
      
      this.testResults.push({
        testName,
        passed,
        details: `Empty update: ${emptyUpdateOk}, Rapid mode: ${rapidModeOk}, Reset: ${resetOk}`,
        executionTime: performance.now() - startTime
      });
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime
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
    const totalTime = this.testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0);
    
    console.log('\n📊 Central Viewport State Test Report');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log('\nDetailed Results:');
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const time = result.executionTime ? ` (${result.executionTime.toFixed(2)}ms)` : '';
      console.log(`${icon} ${result.testName}${time}`);
      console.log(`   ${result.details}`);
    });
    
    if (failedTests === 0) {
      console.log('\n🎉 All tests passed! Central viewport state is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the failures above.');
    }
  }
  
  /**
   * Cleanup test resources
   */
  cleanup(): void {
    this.viewportManager.reset();
    this.persistence.clearState();
    this.eventSystem.cleanup();
    this.debugger.disable();
    this.testResults = [];
  }
}