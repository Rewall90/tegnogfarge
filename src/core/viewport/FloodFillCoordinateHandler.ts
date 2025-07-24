import type { CanvasCoordinates } from './types';
import { CSSTransformCoordinateMapper } from './CSSTransformCoordinateMapper';
import { VIEWPORT_CONFIG } from './constants';

/**
 * FloodFillCoordinateHandler - Specialized coordinate handling for flood fill operations
 * Ensures pixel-perfect integer coordinates for accurate flood fill algorithms
 */
export class FloodFillCoordinateHandler {
  private coordinateMapper: CSSTransformCoordinateMapper;
  
  constructor(coordinateMapper: CSSTransformCoordinateMapper) {
    this.coordinateMapper = coordinateMapper;
  }
  
  /**
   * Get flood fill coordinates from pointer event
   * Critical: Ensures integer coordinates for flood fill accuracy
   */
  getFloodFillCoordinates(e: PointerEvent): CanvasCoordinates {
    const coords = this.coordinateMapper.toCanvasCoords(e.clientX, e.clientY);
    
    // Critical: Ensure integer coordinates for flood fill
    const floodFillCoords = {
      x: Math.round(coords.x),
      y: Math.round(coords.y)
    };
    
    // Validate bounds for safety
    const validation = this.validateFloodFillCoords(floodFillCoords);
    if (!validation.isValid) {
      console.warn('Invalid flood fill coordinates:', validation.issues);
      return validation.safeCoords;
    }
    
    return floodFillCoords;
  }
  
  /**
   * Validate coordinates for flood fill operations
   */
  private validateFloodFillCoords(coords: CanvasCoordinates): {
    isValid: boolean;
    issues: string[];
    safeCoords: CanvasCoordinates;
  } {
    const dpr = window.devicePixelRatio || 1;
    const maxX = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const maxY = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    const issues: string[] = [];
    
    // Critical: Ensure integer coordinates
    if (!Number.isInteger(coords.x) || !Number.isInteger(coords.y)) {
      issues.push('Coordinates must be integers for flood fill');
    }
    
    // Check bounds
    if (coords.x < 0 || coords.x >= maxX) {
      issues.push(`X coordinate out of bounds: ${coords.x}`);
    }
    
    if (coords.y < 0 || coords.y >= maxY) {
      issues.push(`Y coordinate out of bounds: ${coords.y}`);
    }
    
    // Check for valid numbers
    if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) {
      issues.push('Coordinates must be finite numbers');
    }
    
    const safeCoords = {
      x: Math.max(0, Math.min(maxX - 1, Math.round(coords.x))),
      y: Math.max(0, Math.min(maxY - 1, Math.round(coords.y)))
    };
    
    return {
      isValid: issues.length === 0,
      issues,
      safeCoords
    };
  }
  
  /**
   * Get coordinates for image data access
   */
  getImageDataCoordinates(coords: CanvasCoordinates): {
    x: number;
    y: number;
    pixelIndex: number;
    isValid: boolean;
  } {
    const validation = this.validateFloodFillCoords(coords);
    const validCoords = validation.isValid ? coords : validation.safeCoords;
    
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    
    // Calculate pixel index for RGBA array access
    const pixelIndex = (validCoords.y * canvasWidth + validCoords.x) * 4;
    
    return {
      x: validCoords.x,
      y: validCoords.y,
      pixelIndex,
      isValid: validation.isValid
    };
  }
  
  /**
   * Test flood fill coordinate accuracy
   */
  testFloodFillAccuracy(testEvents: Array<{ clientX: number; clientY: number }>): {
    totalTests: number;
    passedTests: number;
    results: Array<{
      input: { x: number; y: number };
      output: CanvasCoordinates;
      isInteger: boolean;
      isValid: boolean;
      withinBounds: boolean;
    }>;
  } {
    const results = testEvents.map(event => {
      const mockEvent = { clientX: event.clientX, clientY: event.clientY } as PointerEvent;
      const output = this.getFloodFillCoordinates(mockEvent);
      const validation = this.validateFloodFillCoords(output);
      
      return {
        input: { x: event.clientX, y: event.clientY },
        output,
        isInteger: Number.isInteger(output.x) && Number.isInteger(output.y),
        isValid: validation.isValid,
        withinBounds: this.coordinateMapper.isWithinCanvasBounds(output)
      };
    });
    
    const passedTests = results.filter(r => r.isInteger && r.isValid && r.withinBounds).length;
    
    return {
      totalTests: results.length,
      passedTests,
      results
    };
  }
  
  /**
   * Validate flood fill region boundaries
   */
  validateFloodFillRegion(
    startCoords: CanvasCoordinates,
    imageData: ImageData
  ): {
    isValid: boolean;
    adjustedCoords: CanvasCoordinates;
    regionInfo: {
      canvasWidth: number;
      canvasHeight: number;
      imageDataWidth: number;
      imageDataHeight: number;
      pixelIndex: number;
    };
  } {
    const validation = this.validateFloodFillCoords(startCoords);
    const adjustedCoords = validation.isValid ? startCoords : validation.safeCoords;
    
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const canvasHeight = VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr;
    
    // Calculate pixel index for image data access
    const pixelIndex = (adjustedCoords.y * imageData.width + adjustedCoords.x) * 4;
    
    // Additional validation against actual image data
    const imageDataValid = adjustedCoords.x >= 0 && 
                          adjustedCoords.x < imageData.width &&
                          adjustedCoords.y >= 0 && 
                          adjustedCoords.y < imageData.height;
    
    return {
      isValid: validation.isValid && imageDataValid,
      adjustedCoords,
      regionInfo: {
        canvasWidth,
        canvasHeight,
        imageDataWidth: imageData.width,
        imageDataHeight: imageData.height,
        pixelIndex
      }
    };
  }
  
  /**
   * Get pixel color at coordinates for flood fill comparison
   */
  getPixelColor(coords: CanvasCoordinates, imageData: ImageData): {
    r: number;
    g: number;
    b: number;
    a: number;
    isValid: boolean;
  } {
    const validation = this.validateFloodFillRegion(coords, imageData);
    
    if (!validation.isValid) {
      return { r: 0, g: 0, b: 0, a: 0, isValid: false };
    }
    
    const pixelIndex = validation.regionInfo.pixelIndex;
    const data = imageData.data;
    
    return {
      r: data[pixelIndex],
      g: data[pixelIndex + 1],
      b: data[pixelIndex + 2],
      a: data[pixelIndex + 3],
      isValid: true
    };
  }
  
  /**
   * Generate safe coordinates for flood fill operation
   */
  generateSafeFloodFillCoords(coords: CanvasCoordinates): CanvasCoordinates {
    const validation = this.validateFloodFillCoords(coords);
    return validation.safeCoords;
  }
  
  /**
   * Batch validate multiple flood fill coordinates
   */
  batchValidateCoordinates(coordsList: CanvasCoordinates[]): {
    validCount: number;
    invalidCount: number;
    validatedCoords: CanvasCoordinates[];
    issues: Array<{ index: number; issues: string[] }>;
  } {
    let validCount = 0;
    let invalidCount = 0;
    const validatedCoords: CanvasCoordinates[] = [];
    const issues: Array<{ index: number; issues: string[] }> = [];
    
    coordsList.forEach((coords, index) => {
      const validation = this.validateFloodFillCoords(coords);
      
      if (validation.isValid) {
        validCount++;
        validatedCoords.push(coords);
      } else {
        invalidCount++;
        validatedCoords.push(validation.safeCoords);
        issues.push({ index, issues: validation.issues });
      }
    });
    
    return {
      validCount,
      invalidCount,
      validatedCoords,
      issues
    };
  }
  
  /**
   * Get debug information for flood fill coordinates
   */
  getFloodFillDebugInfo(e: PointerEvent): {
    screenCoords: { x: number; y: number };
    transformationSteps: {
      container: { x: number; y: number };
      logical: { x: number; y: number };
      canvas: CanvasCoordinates;
      rounded: CanvasCoordinates;
    };
    validation: {
      isValid: boolean;
      issues: string[];
      safeCoords: CanvasCoordinates;
    };
    imageDataInfo: {
      pixelIndex: number;
      canvasWidth: number;
      canvasHeight: number;
    };
  } {
    const screenCoords = { x: e.clientX, y: e.clientY };
    const transformInfo = this.coordinateMapper.getTransformationInfo(e.clientX, e.clientY);
    const rounded = { x: Math.round(transformInfo.canvas.x), y: Math.round(transformInfo.canvas.y) };
    const validation = this.validateFloodFillCoords(rounded);
    
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = VIEWPORT_CONFIG.CANVAS_WIDTH * dpr;
    const pixelIndex = (rounded.y * canvasWidth + rounded.x) * 4;
    
    return {
      screenCoords,
      transformationSteps: {
        container: transformInfo.container,
        logical: transformInfo.logical,
        canvas: transformInfo.canvas,
        rounded
      },
      validation,
      imageDataInfo: {
        pixelIndex,
        canvasWidth,
        canvasHeight: VIEWPORT_CONFIG.CANVAS_HEIGHT * dpr
      }
    };
  }
}