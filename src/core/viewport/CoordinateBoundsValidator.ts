import type { CanvasCoordinates, ScreenCoordinates } from './types';
import { CSSTransformCoordinateMapper } from './CSSTransformCoordinateMapper';
import { VIEWPORT_CONFIG } from './constants';

/**
 * CoordinateBoundsValidator - Comprehensive coordinate validation and bounds checking
 * Ensures coordinates are valid for all drawing operations
 */
export class CoordinateBoundsValidator {
  private readonly CANVAS_WIDTH = VIEWPORT_CONFIG.CANVAS_WIDTH;
  private readonly CANVAS_HEIGHT = VIEWPORT_CONFIG.CANVAS_HEIGHT;
  private coordinateMapper: CSSTransformCoordinateMapper;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateMapper = coordinateMapper;
  }
  
  /**
   * Check if coordinates are within canvas bounds
   */
  isWithinCanvasBounds(coords: CanvasCoordinates): boolean {
    const dpr = window.devicePixelRatio || 1;
    const maxX = this.CANVAS_WIDTH * dpr;
    const maxY = this.CANVAS_HEIGHT * dpr;
    
    return coords.x >= 0 && coords.x < maxX && 
           coords.y >= 0 && coords.y < maxY;
  }
  
  /**
   * Clamp coordinates to canvas bounds
   */
  clampToCanvasBounds(coords: CanvasCoordinates): CanvasCoordinates {
    const dpr = window.devicePixelRatio || 1;
    const maxX = this.CANVAS_WIDTH * dpr;
    const maxY = this.CANVAS_HEIGHT * dpr;
    
    return {
      x: Math.max(0, Math.min(maxX - 1, coords.x)),
      y: Math.max(0, Math.min(maxY - 1, coords.y))
    };
  }
  
  /**
   * Validate coordinate transformation accuracy
   */
  validateCoordinateTransformation(
    screenCoords: ScreenCoordinates,
    expectedCanvasCoords: CanvasCoordinates,
    tolerance: number = 1
  ): {
    passed: boolean;
    actualCoords: CanvasCoordinates;
    error: number;
    details: string;
  } {
    const actualCanvasCoords = this.coordinateMapper.toCanvasCoords(
      screenCoords.x, 
      screenCoords.y
    );
    
    const errorX = Math.abs(actualCanvasCoords.x - expectedCanvasCoords.x);
    const errorY = Math.abs(actualCanvasCoords.y - expectedCanvasCoords.y);
    const error = Math.max(errorX, errorY);
    
    const passed = error <= tolerance;
    
    return {
      passed,
      actualCoords: actualCanvasCoords,
      error,
      details: passed 
        ? `Transformation accurate (error: ${error.toFixed(2)}px)`
        : `Transformation error: ${error.toFixed(2)}px (tolerance: ${tolerance}px)`
    };
  }
  
  /**
   * Comprehensive coordinate validation
   */
  validateCoordinates(coords: CanvasCoordinates): {
    isValid: boolean;
    issues: string[];
    corrections: {
      clamped: CanvasCoordinates;
      rounded: CanvasCoordinates;
      safe: CanvasCoordinates;
    };
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for finite numbers
    if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) {
      issues.push('Coordinates must be finite numbers');
    }
    
    // Check for NaN
    if (Number.isNaN(coords.x) || Number.isNaN(coords.y)) {
      issues.push('Coordinates cannot be NaN');
    }
    
    // Check bounds
    if (!this.isWithinCanvasBounds(coords)) {
      issues.push('Coordinates are outside canvas bounds');
      recommendations.push('Use clampToCanvasBounds() to ensure valid coordinates');
    }
    
    // Check for integer coordinates (recommended for pixel operations)
    if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) {
      recommendations.push('Consider rounding coordinates for pixel-perfect operations');
    }
    
    // Generate corrections
    const clamped = this.clampToCanvasBounds(coords);
    const rounded = {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
    const safe = this.clampToCanvasBounds(rounded);
    
    return {
      isValid: issues.length === 0,
      issues,
      corrections: {
        clamped,
        rounded,
        safe
      },
      recommendations
    };
  }
  
  /**
   * Batch validate multiple coordinates
   */
  batchValidateCoordinates(coordsList: CanvasCoordinates[]): {
    validCount: number;
    invalidCount: number;
    totalCount: number;
    validationResults: Array<{
      index: number;
      coords: CanvasCoordinates;
      isValid: boolean;
      issues: string[];
      safeCoords: CanvasCoordinates;
    }>;
    summary: {
      outOfBounds: number;
      nonInteger: number;
      nonFinite: number;
    };
  } {
    let validCount = 0;
    let invalidCount = 0;
    let outOfBounds = 0;
    let nonInteger = 0;
    let nonFinite = 0;
    
    const validationResults = coordsList.map((coords, index) => {
      const validation = this.validateCoordinates(coords);
      
      if (validation.isValid) {
        validCount++;
      } else {
        invalidCount++;
        
        // Count specific issues
        if (!this.isWithinCanvasBounds(coords)) outOfBounds++;
        if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) nonInteger++;
        if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) nonFinite++;
      }
      
      return {
        index,
        coords,
        isValid: validation.isValid,
        issues: validation.issues,
        safeCoords: validation.corrections.safe
      };
    });
    
    return {
      validCount,
      invalidCount,
      totalCount: coordsList.length,
      validationResults,
      summary: {
        outOfBounds,
        nonInteger,
        nonFinite
      }
    };
  }
  
  /**
   * Validate drawing region
   */
  validateDrawingRegion(
    startCoords: CanvasCoordinates,
    endCoords: CanvasCoordinates
  ): {
    isValid: boolean;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    clampedRegion: {
      start: CanvasCoordinates;
      end: CanvasCoordinates;
    };
    pixelCount: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Validate individual coordinates
    const startValidation = this.validateCoordinates(startCoords);
    const endValidation = this.validateCoordinates(endCoords);
    
    if (!startValidation.isValid) {
      warnings.push('Start coordinates are invalid');
    }
    
    if (!endValidation.isValid) {
      warnings.push('End coordinates are invalid');
    }
    
    // Calculate bounding box
    const minX = Math.min(startCoords.x, endCoords.x);
    const minY = Math.min(startCoords.y, endCoords.y);
    const maxX = Math.max(startCoords.x, endCoords.x);
    const maxY = Math.max(startCoords.y, endCoords.y);
    
    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
    
    // Clamp region to canvas bounds
    const clampedStart = this.clampToCanvasBounds(startCoords);
    const clampedEnd = this.clampToCanvasBounds(endCoords);
    
    const pixelCount = boundingBox.width * boundingBox.height;
    
    // Performance warnings
    if (pixelCount > 1000000) {
      warnings.push('Large drawing region may impact performance');
    }
    
    return {
      isValid: startValidation.isValid && endValidation.isValid,
      boundingBox,
      clampedRegion: {
        start: clampedStart,
        end: clampedEnd
      },
      pixelCount,
      warnings
    };
  }
  
  /**
   * Get canvas boundary information
   */
  getCanvasBoundaryInfo(): {
    logicalBounds: {
      width: number;
      height: number;
      maxX: number;
      maxY: number;
    };
    internalBounds: {
      width: number;
      height: number;
      maxX: number;
      maxY: number;
    };
    dpr: number;
  } {
    const dpr = window.devicePixelRatio || 1;
    
    return {
      logicalBounds: {
        width: this.CANVAS_WIDTH,
        height: this.CANVAS_HEIGHT,
        maxX: this.CANVAS_WIDTH - 1,
        maxY: this.CANVAS_HEIGHT - 1
      },
      internalBounds: {
        width: this.CANVAS_WIDTH * dpr,
        height: this.CANVAS_HEIGHT * dpr,
        maxX: this.CANVAS_WIDTH * dpr - 1,
        maxY: this.CANVAS_HEIGHT * dpr - 1
      },
      dpr
    };
  }
  
  /**
   * Test coordinate validation with known test cases
   */
  runValidationTests(): {
    totalTests: number;
    passedTests: number;
    testResults: Array<{
      name: string;
      input: CanvasCoordinates;
      expectedValid: boolean;
      actualValid: boolean;
      passed: boolean;
    }>;
  } {
    const dpr = window.devicePixelRatio || 1;
    const maxX = this.CANVAS_WIDTH * dpr;
    const maxY = this.CANVAS_HEIGHT * dpr;
    
    const testCases = [
      { name: 'Valid center point', input: { x: maxX / 2, y: maxY / 2 }, expectedValid: true },
      { name: 'Valid origin', input: { x: 0, y: 0 }, expectedValid: true },
      { name: 'Valid max bounds', input: { x: maxX - 1, y: maxY - 1 }, expectedValid: true },
      { name: 'Invalid negative X', input: { x: -1, y: 100 }, expectedValid: false },
      { name: 'Invalid negative Y', input: { x: 100, y: -1 }, expectedValid: false },
      { name: 'Invalid X too large', input: { x: maxX, y: 100 }, expectedValid: false },
      { name: 'Invalid Y too large', input: { x: 100, y: maxY }, expectedValid: false },
      { name: 'Invalid NaN X', input: { x: NaN, y: 100 }, expectedValid: false },
      { name: 'Invalid Infinity Y', input: { x: 100, y: Infinity }, expectedValid: false },
    ];
    
    const testResults = testCases.map(testCase => {
      const validation = this.validateCoordinates(testCase.input);
      const passed = validation.isValid === testCase.expectedValid;
      
      return {
        name: testCase.name,
        input: testCase.input,
        expectedValid: testCase.expectedValid,
        actualValid: validation.isValid,
        passed
      };
    });
    
    const passedTests = testResults.filter(r => r.passed).length;
    
    return {
      totalTests: testCases.length,
      passedTests,
      testResults
    };
  }
  
  /**
   * Generate validation report
   */
  generateValidationReport(coords: CanvasCoordinates): string {
    const validation = this.validateCoordinates(coords);
    const boundaryInfo = this.getCanvasBoundaryInfo();
    
    let report = `Coordinate Validation Report\n`;
    report += `============================\n`;
    report += `Input: (${coords.x}, ${coords.y})\n`;
    report += `Valid: ${validation.isValid ? 'YES' : 'NO'}\n`;
    
    if (validation.issues.length > 0) {
      report += `\nIssues:\n`;
      validation.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
    }
    
    if (validation.recommendations.length > 0) {
      report += `\nRecommendations:\n`;
      validation.recommendations.forEach(rec => {
        report += `  - ${rec}\n`;
      });
    }
    
    report += `\nCorrections:\n`;
    report += `  Clamped: (${validation.corrections.clamped.x}, ${validation.corrections.clamped.y})\n`;
    report += `  Rounded: (${validation.corrections.rounded.x}, ${validation.corrections.rounded.y})\n`;
    report += `  Safe: (${validation.corrections.safe.x}, ${validation.corrections.safe.y})\n`;
    
    report += `\nCanvas Bounds:\n`;
    report += `  Internal: ${boundaryInfo.internalBounds.width}x${boundaryInfo.internalBounds.height}\n`;
    report += `  DPR: ${boundaryInfo.dpr}\n`;
    
    return report;
  }
}