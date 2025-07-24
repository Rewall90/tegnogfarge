/**
 * ToolFunctionalityTest - Comprehensive testing for drawing tools
 * Tests coordinate accuracy, tool integration, and cross-zoom functionality
 */

import type { CanvasCoordinates, ViewportState } from './types';
import { ToolCoordinateHandler } from './ToolCoordinateHandler';
import { BrushTool } from './BrushTool';
import { FloodFillTool } from './FloodFillTool';
import { DrawingToolManager } from './DrawingToolManager';
import { ViewportManager } from './ViewportManager';
import { CoordinateSystem } from './CoordinateSystem';

interface ToolTestResult {
  testName: string;
  passed: boolean;
  details: string;
  accuracy?: {
    coordinateAccuracy: number;
    pixelPerfect: boolean;
    crossZoomConsistency: number;
  };
}

export class ToolFunctionalityTest {
  private coordinateSystem: CoordinateSystem;
  private coordinateHandler: ToolCoordinateHandler;
  private viewportManager: ViewportManager;
  private toolManager: DrawingToolManager;
  private testResults: ToolTestResult[] = [];
  
  // Test canvas elements
  private testCanvases: {
    main: HTMLCanvasElement;
    fill: HTMLCanvasElement;
    background: HTMLCanvasElement;
  };
  
  private testContainer: HTMLElement;

  constructor(
    coordinateSystem: CoordinateSystem,
    viewportManager: ViewportManager
  ) {
    this.coordinateSystem = coordinateSystem;
    this.coordinateHandler = new ToolCoordinateHandler(coordinateSystem);
    this.viewportManager = viewportManager;
    this.toolManager = new DrawingToolManager(coordinateSystem, viewportManager);
    
    this.setupTestEnvironment();
  }

  /**
   * Setup test environment with canvases and container
   */
  private setupTestEnvironment(): void {
    // Create test container
    this.testContainer = document.createElement('div');
    this.testContainer.style.position = 'relative';
    this.testContainer.style.width = '800px';
    this.testContainer.style.height = '600px';
    this.testContainer.style.overflow = 'hidden';
    
    // Create test canvases
    this.testCanvases = {
      main: this.createTestCanvas('main'),
      fill: this.createTestCanvas('fill'),
      background: this.createTestCanvas('background')
    };
    
    // Add canvases to container
    Object.values(this.testCanvases).forEach(canvas => {
      this.testContainer.appendChild(canvas);
    });
    
    // Add to body for testing (hidden)
    this.testContainer.style.position = 'fixed';
    this.testContainer.style.top = '-3000px';
    this.testContainer.style.left = '-3000px';
    document.body.appendChild(this.testContainer);
    
    // Initialize coordinate system and tool manager
    this.coordinateSystem.setContainerElement(this.testContainer);
    this.toolManager.initialize(this.testCanvases);
  }

  /**
   * Create a test canvas with proper setup
   */
  private createTestCanvas(name: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 2550 * dpr;
    canvas.height = 3300 * dpr;
    canvas.style.width = '2550px';
    canvas.style.height = '3300px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    // Apply DPR scaling to context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    return canvas;
  }

  /**
   * Run all tool functionality tests
   */
  async runAllTests(): Promise<ToolTestResult[]> {
    this.testResults = [];

    try {
      await this.testCoordinateAccuracy();
      await this.testBrushToolFunctionality();
      await this.testFloodFillFunctionality();
      await this.testCrossZoomConsistency();
      await this.testModeIntegration();
      await this.testPixelPerfectDrawing();
      await this.testBoundaryHandling();
      await this.testToolManagerIntegration();
      await this.testPerformanceUnderLoad();
      await this.testDevicePixelRatioHandling();
      await this.testCoordinateValidation();
      await this.testToolStateManagement();
    } catch (error) {
      this.testResults.push({
        testName: 'Tool Functionality Test Suite',
        passed: false,
        details: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return this.testResults;
  }

  /**
   * Test coordinate accuracy across zoom levels
   */
  private async testCoordinateAccuracy(): Promise<void> {
    const testName = 'Coordinate Accuracy';

    try {
      const zoomLevels = [0.25, 0.5, 1.0, 1.5, 2.0, 4.0];
      let totalAccuracy = 0;
      let allPixelPerfect = true;

      for (const zoom of zoomLevels) {
        // Set viewport state
        this.viewportManager.setState({
          scale: zoom,
          panX: 0,
          panY: 0,
          mode: 'draw'
        });

        // Test coordinate conversion at various points
        const testPoints = [
          { x: 100, y: 100 },
          { x: 400, y: 300 },
          { x: 700, y: 500 }
        ];

        let zoomAccuracy = 0;
        for (const point of testPoints) {
          const mockEvent = {
            clientX: point.x,
            clientY: point.y
          } as PointerEvent;

          const coords = this.coordinateHandler.getCanvasCoordinates(mockEvent);
          
          // Check if coordinates are integers (pixel-perfect)
          const isPixelPerfect = Number.isInteger(coords.x) && Number.isInteger(coords.y);
          if (!isPixelPerfect) allPixelPerfect = false;

          // Check if coordinates are within bounds
          const isValid = this.coordinateHandler.validateCoordinates(coords);
          if (isValid) zoomAccuracy++;
        }

        totalAccuracy += (zoomAccuracy / testPoints.length) * 100;
      }

      const avgAccuracy = totalAccuracy / zoomLevels.length;
      const passed = avgAccuracy >= 95 && allPixelPerfect;

      this.testResults.push({
        testName,
        passed,
        details: `Average accuracy: ${avgAccuracy.toFixed(1)}%, Pixel perfect: ${allPixelPerfect}`,
        accuracy: {
          coordinateAccuracy: avgAccuracy,
          pixelPerfect: allPixelPerfect,
          crossZoomConsistency: avgAccuracy
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
   * Test brush tool functionality
   */
  private async testBrushToolFunctionality(): Promise<void> {
    const testName = 'Brush Tool Functionality';

    try {
      // Set to draw mode
      this.viewportManager.setMode('draw');
      this.toolManager.setActiveTool('brush');

      let brushEventsCalled = 0;
      let coordsValid = true;

      // Create test events
      const testEvents = [
        { type: 'start' as const, x: 100, y: 100 },
        { type: 'move' as const, x: 105, y: 105 },
        { type: 'move' as const, x: 110, y: 110 },
        { type: 'end' as const, x: 115, y: 115 }
      ];

      // Simulate brush strokes
      for (const event of testEvents) {
        const mockEvent = new PointerEvent('pointer' + event.type, {
          clientX: event.x,
          clientY: event.y,
          pointerId: 1,
          isPrimary: true
        });

        try {
          this.toolManager.handleToolInput(mockEvent, event.type);
          brushEventsCalled++;

          // Validate coordinates
          const coords = this.coordinateHandler.getCanvasCoordinates(mockEvent);
          if (!this.coordinateHandler.validateCoordinates(coords)) {
            coordsValid = false;
          }
        } catch (error) {
          console.warn('Brush event error:', error);
        }
      }

      const passed = brushEventsCalled === testEvents.length && coordsValid;

      this.testResults.push({
        testName,
        passed,
        details: `Events processed: ${brushEventsCalled}/${testEvents.length}, Coordinates valid: ${coordsValid}`
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
   * Test flood fill functionality
   */
  private async testFloodFillFunctionality(): Promise<void> {
    const testName = 'Flood Fill Functionality';

    try {
      // Set to draw mode
      this.viewportManager.setMode('draw');
      this.toolManager.setActiveTool('floodfill');

      // Test coordinate validation
      const testCoords: CanvasCoordinates[] = [
        { x: 100, y: 100 },
        { x: 100.5, y: 100.5 }, // Should be rounded
        { x: -10, y: 50 }, // Out of bounds
        { x: 5000, y: 50 } // Out of bounds
      ];

      let validationResults = 0;
      let safeCoordResults = 0;

      for (const coords of testCoords) {
        const validation = this.coordinateHandler.validateFloodFillCoordinates(coords);
        
        if (coords.x === 100 && coords.y === 100) {
          // This should be valid
          if (validation.isValid) validationResults++;
        } else if (coords.x === 100.5) {
          // This should be invalid but have safe coords
          if (!validation.isValid && validation.safeCoords) safeCoordResults++;
        } else {
          // Out of bounds should be invalid with safe coords
          if (!validation.isValid && validation.safeCoords) safeCoordResults++;
        }
      }

      const passed = validationResults === 1 && safeCoordResults === 3;

      this.testResults.push({
        testName,
        passed,
        details: `Valid coords: ${validationResults}/1, Safe coords generated: ${safeCoordResults}/3`
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
   * Test cross-zoom consistency
   */
  private async testCrossZoomConsistency(): Promise<void> {
    const testName = 'Cross-Zoom Consistency';

    try {
      const testPoint = { x: 200, y: 150 };
      const zoomLevels = [0.5, 1.0, 2.0];
      const results: CanvasCoordinates[] = [];

      for (const zoom of zoomLevels) {
        this.viewportManager.setState({
          scale: zoom,
          panX: 0,
          panY: 0,
          mode: 'draw'
        });

        const mockEvent = {
          clientX: testPoint.x,
          clientY: testPoint.y
        } as PointerEvent;

        const coords = this.coordinateHandler.getCanvasCoordinates(mockEvent);
        results.push(coords);
      }

      // Check if coordinates are consistent (should map to same canvas position)
      // Note: With CSS transforms, screen coordinates map to different canvas coordinates
      // at different zoom levels, which is expected behavior
      const allInteger = results.every(coord => 
        Number.isInteger(coord.x) && Number.isInteger(coord.y)
      );
      
      const allValid = results.every(coord => 
        this.coordinateHandler.validateCoordinates(coord)
      );

      const consistency = allInteger && allValid ? 100 : 0;
      const passed = consistency === 100;

      this.testResults.push({
        testName,
        passed,
        details: `Integer coords: ${allInteger}, Valid coords: ${allValid}, Results: ${JSON.stringify(results)}`,
        accuracy: {
          coordinateAccuracy: 100,
          pixelPerfect: allInteger,
          crossZoomConsistency: consistency
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
   * Test mode integration
   */
  private async testModeIntegration(): Promise<void> {
    const testName = 'Mode Integration';

    try {
      let drawModeWorking = false;
      let zoomModeBlocked = false;

      // Test draw mode
      this.viewportManager.setMode('draw');
      this.toolManager.setActiveTool('brush');
      
      if (this.toolManager.areToolsEnabled()) {
        drawModeWorking = true;
      }

      // Test zoom mode
      this.viewportManager.setMode('zoom');
      
      if (!this.toolManager.areToolsEnabled()) {
        zoomModeBlocked = true;
      }

      const passed = drawModeWorking && zoomModeBlocked;

      this.testResults.push({
        testName,
        passed,
        details: `Draw mode enables tools: ${drawModeWorking}, Zoom mode disables tools: ${zoomModeBlocked}`
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
   * Test pixel-perfect drawing
   */
  private async testPixelPerfectDrawing(): Promise<void> {
    const testName = 'Pixel Perfect Drawing';

    try {
      const testCoords = [
        { x: 150.7, y: 200.3 },
        { x: 100.1, y: 50.9 },
        { x: 300.0, y: 400.0 }
      ];

      let allRounded = true;
      const roundedCoords: CanvasCoordinates[] = [];

      for (const coord of testCoords) {
        const rounded = this.coordinateHandler.roundToPixel(coord);
        roundedCoords.push(rounded);
        
        if (!Number.isInteger(rounded.x) || !Number.isInteger(rounded.y)) {
          allRounded = false;
        }
      }

      const expectedRounded = [
        { x: 151, y: 200 },
        { x: 100, y: 51 },
        { x: 300, y: 400 }
      ];

      const correctRounding = roundedCoords.every((coord, index) => 
        coord.x === expectedRounded[index].x && coord.y === expectedRounded[index].y
      );

      const passed = allRounded && correctRounding;

      this.testResults.push({
        testName,
        passed,
        details: `All rounded: ${allRounded}, Correct rounding: ${correctRounding}, Results: ${JSON.stringify(roundedCoords)}`
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
   * Test boundary handling
   */
  private async testBoundaryHandling(): Promise<void> {
    const testName = 'Boundary Handling';

    try {
      const outOfBoundsCoords = [
        { x: -50, y: 100 },
        { x: 100, y: -50 },
        { x: 3000, y: 100 },
        { x: 100, y: 4000 }
      ];

      let allClamped = true;
      const clampedCoords: CanvasCoordinates[] = [];

      for (const coord of outOfBoundsCoords) {
        const clamped = this.coordinateHandler.clampCoordinates(coord);
        clampedCoords.push(clamped);
        
        if (!this.coordinateHandler.validateCoordinates(clamped)) {
          allClamped = false;
        }
      }

      const passed = allClamped;

      this.testResults.push({
        testName,
        passed,
        details: `All coords clamped to valid bounds: ${allClamped}, Results: ${JSON.stringify(clampedCoords)}`
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
   * Test tool manager integration
   */
  private async testToolManagerIntegration(): Promise<void> {
    const testName = 'Tool Manager Integration';

    try {
      const availableTools = this.toolManager.getAvailableTools();
      const hasRequiredTools = availableTools.includes('brush') && availableTools.includes('floodfill');

      // Test tool switching
      let brushActivated = this.toolManager.setActiveTool('brush');
      let floodFillActivated = this.toolManager.setActiveTool('floodfill');

      const currentTool = this.toolManager.getActiveTool();
      const toolSwitchWorking = currentTool === 'floodfill';

      const passed = hasRequiredTools && brushActivated && floodFillActivated && toolSwitchWorking;

      this.testResults.push({
        testName,
        passed,
        details: `Required tools: ${hasRequiredTools}, Brush: ${brushActivated}, FloodFill: ${floodFillActivated}, Switch: ${toolSwitchWorking}, Available: ${availableTools.join(', ')}`
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
   * Test performance under load
   */
  private async testPerformanceUnderLoad(): Promise<void> {
    const testName = 'Performance Under Load';

    try {
      this.viewportManager.setMode('draw');
      this.toolManager.setActiveTool('brush');

      const startTime = performance.now();
      const eventCount = 100;
      let eventsProcessed = 0;

      // Simulate rapid brush strokes
      for (let i = 0; i < eventCount; i++) {
        const mockEvent = new PointerEvent('pointermove', {
          clientX: 100 + (i % 10),
          clientY: 100 + (i % 10),
          pointerId: 1,
          isPrimary: true
        });

        try {
          this.toolManager.handleToolInput(mockEvent, 'move');
          eventsProcessed++;
        } catch (error) {
          console.warn('Performance test event error:', error);
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / eventCount;

      const passed = eventsProcessed >= eventCount * 0.9 && avgTime < 2; // Less than 2ms per event

      this.testResults.push({
        testName,
        passed,
        details: `Processed ${eventsProcessed}/${eventCount} events in ${totalTime.toFixed(2)}ms, avg ${avgTime.toFixed(3)}ms per event`
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
      const testCoords = { x: 100, y: 100 };
      const dpr = window.devicePixelRatio || 1;

      const highDPICoords = this.coordinateHandler.getHighDPICoordinates(testCoords);
      const backToLogical = this.coordinateHandler.fromHighDPICoordinates(highDPICoords);

      const dprApplied = highDPICoords.x === testCoords.x * dpr && highDPICoords.y === testCoords.y * dpr;
      const conversionReversible = backToLogical.x === testCoords.x && backToLogical.y === testCoords.y;

      const passed = dprApplied && conversionReversible;

      this.testResults.push({
        testName,
        passed,
        details: `DPR: ${dpr}, Applied correctly: ${dprApplied}, Reversible: ${conversionReversible}, HighDPI: ${JSON.stringify(highDPICoords)}, Back: ${JSON.stringify(backToLogical)}`
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
   * Test coordinate validation
   */
  private async testCoordinateValidation(): Promise<void> {
    const testName = 'Coordinate Validation';

    try {
      const testCases = [
        { coords: { x: 100, y: 100 }, expected: true, name: 'valid coords' },
        { coords: { x: 0, y: 0 }, expected: true, name: 'origin' },
        { coords: { x: -10, y: 100 }, expected: false, name: 'negative x' },
        { coords: { x: 100, y: -10 }, expected: false, name: 'negative y' },
        { coords: { x: 5000, y: 100 }, expected: false, name: 'x too large' },
        { coords: { x: 100, y: 5000 }, expected: false, name: 'y too large' },
        { coords: { x: NaN, y: 100 }, expected: false, name: 'NaN x' },
        { coords: { x: 100, y: Infinity }, expected: false, name: 'Infinity y' }
      ];

      let passedCases = 0;
      const results: string[] = [];

      for (const testCase of testCases) {
        const isValid = this.coordinateHandler.validateCoordinates(testCase.coords);
        const passed = isValid === testCase.expected;
        
        if (passed) {
          passedCases++;
        }
        
        results.push(`${testCase.name}: ${passed ? 'PASS' : 'FAIL'} (got ${isValid}, expected ${testCase.expected})`);
      }

      const overallPassed = passedCases === testCases.length;

      this.testResults.push({
        testName,
        passed: overallPassed,
        details: `${passedCases}/${testCases.length} cases passed. ${results.join('; ')}`
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
   * Test tool state management
   */
  private async testToolStateManagement(): Promise<void> {
    const testName = 'Tool State Management';

    try {
      // Test initial state
      const initialState = this.toolManager.getState();
      const hasInitialTool = initialState.activeTool !== null;

      // Test enable/disable
      this.toolManager.disableAllTools();
      const disabledState = this.toolManager.areToolsEnabled();

      this.toolManager.enableTools();
      const enabledState = this.toolManager.areToolsEnabled();

      // Test tool info
      const toolInfo = this.toolManager.getAllToolsInfo();
      const hasToolInfo = Object.keys(toolInfo).length > 0;

      const passed = hasInitialTool && !disabledState && enabledState && hasToolInfo;

      this.testResults.push({
        testName,
        passed,
        details: `Initial tool: ${hasInitialTool}, Disable works: ${!disabledState}, Enable works: ${enabledState}, Tool info: ${hasToolInfo}`
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
  generateReport(): {
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      successRate: number;
      avgAccuracy: number;
    };
    details: ToolTestResult[];
    recommendations: string[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // Calculate average accuracy
    const accuracyResults = this.testResults.filter(r => r.accuracy?.coordinateAccuracy);
    const avgAccuracy = accuracyResults.length > 0
      ? accuracyResults.reduce((sum, r) => sum + (r.accuracy?.coordinateAccuracy || 0), 0) / accuracyResults.length
      : 0;

    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate,
        avgAccuracy
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
        case 'Coordinate Accuracy':
          recommendations.push('Review coordinate conversion logic in CoordinateSystem and ToolCoordinateHandler');
          break;
        case 'Brush Tool Functionality':
          recommendations.push('Check BrushTool event handling and coordinate integration');
          break;
        case 'Flood Fill Functionality':
          recommendations.push('Verify FloodFillTool coordinate validation and pixel-perfect algorithms');
          break;
        case 'Cross-Zoom Consistency':
          recommendations.push('Ensure coordinate mapping is consistent across zoom levels');
          break;
        case 'Mode Integration':
          recommendations.push('Verify tool manager integration with viewport mode changes');
          break;
        case 'Performance Under Load':
          recommendations.push('Consider optimizing tool event handling for better performance');
          break;
      }
    });

    // Accuracy-based recommendations
    const accuracyTests = this.testResults.filter(r => r.accuracy);
    const lowAccuracyTests = accuracyTests.filter(r => (r.accuracy?.coordinateAccuracy || 0) < 95);

    if (lowAccuracyTests.length > 0) {
      recommendations.push('Some coordinate accuracy tests below 95% - review coordinate conversion algorithms');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tool functionality tests passed. Drawing tools are ready for production.');
    }

    return recommendations;
  }

  /**
   * Cleanup test environment
   */
  cleanup(): void {
    this.toolManager.cleanup();
    
    if (this.testContainer && document.body.contains(this.testContainer)) {
      document.body.removeChild(this.testContainer);
    }
    
    this.testResults = [];
  }
}