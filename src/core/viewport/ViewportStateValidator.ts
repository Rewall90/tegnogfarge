import type { ViewportState, ViewportBounds } from './types';
import { VIEWPORT_CONFIG } from './constants';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ViewportStateValidator - Validates and sanitizes viewport state
 * Ensures state consistency and prevents invalid values
 */
export class ViewportStateValidator {
  private bounds: ViewportBounds = {
    minScale: VIEWPORT_CONFIG.MIN_ZOOM,
    maxScale: VIEWPORT_CONFIG.MAX_ZOOM,
    canvasWidth: VIEWPORT_CONFIG.CANVAS_WIDTH,
    canvasHeight: VIEWPORT_CONFIG.CANVAS_HEIGHT
  };

  /**
   * Validate viewport state
   */
  validateState(state: ViewportState): ValidationResult {
    const errors: string[] = [];
    
    // Validate scale
    if (!Number.isFinite(state.scale) || state.scale <= 0) {
      errors.push('Scale must be a positive finite number');
    }
    
    if (state.scale < this.bounds.minScale || state.scale > this.bounds.maxScale) {
      errors.push(`Scale must be between ${this.bounds.minScale} and ${this.bounds.maxScale}`);
    }
    
    // Validate offsets
    if (!Number.isFinite(state.panX) || !Number.isFinite(state.panY)) {
      errors.push('Pan values must be finite numbers');
    }
    
    // Validate mode
    if (!['zoom', 'draw'].includes(state.mode)) {
      errors.push('Mode must be either "zoom" or "draw"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Sanitize partial state to ensure valid values
   */
  sanitizeState(state: Partial<ViewportState>): ViewportState {
    return {
      scale: this.sanitizeScale(state.scale),
      panX: this.sanitizeNumber(state.panX, 0),
      panY: this.sanitizeNumber(state.panY, 0),
      mode: this.sanitizeMode(state.mode)
    };
  }
  
  /**
   * Sanitize scale value
   */
  private sanitizeScale(scale: number | undefined): number {
    if (!Number.isFinite(scale)) {
      return 1.0;
    }
    return Math.max(this.bounds.minScale, Math.min(this.bounds.maxScale, scale!));
  }
  
  /**
   * Sanitize numeric value
   */
  private sanitizeNumber(value: number | undefined, defaultValue: number): number {
    return Number.isFinite(value) ? value! : defaultValue;
  }
  
  /**
   * Sanitize mode value
   */
  private sanitizeMode(mode: 'zoom' | 'draw' | undefined): 'zoom' | 'draw' {
    return ['zoom', 'draw'].includes(mode!) ? mode! : 'draw';
  }
  
  /**
   * Check if state is within bounds
   */
  checkBounds(state: ViewportState, containerSize: { width: number; height: number }): {
    inBounds: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    
    // Calculate scaled canvas size
    const scaledWidth = this.bounds.canvasWidth * state.scale;
    const scaledHeight = this.bounds.canvasHeight * state.scale;
    
    // Check if canvas is at least partially visible
    if (state.panX + scaledWidth < 0) {
      violations.push('Canvas is completely off-screen to the left');
    }
    
    if (state.panX > containerSize.width) {
      violations.push('Canvas is completely off-screen to the right');
    }
    
    if (state.panY + scaledHeight < 0) {
      violations.push('Canvas is completely off-screen to the top');
    }
    
    if (state.panY > containerSize.height) {
      violations.push('Canvas is completely off-screen to the bottom');
    }
    
    return {
      inBounds: violations.length === 0,
      violations
    };
  }
  
  /**
   * Get detailed validation report
   */
  getValidationReport(state: ViewportState, containerSize: { width: number; height: number }): {
    isValid: boolean;
    stateValidation: ValidationResult;
    boundsCheck: { inBounds: boolean; violations: string[] };
    recommendations: string[];
  } {
    const stateValidation = this.validateState(state);
    const boundsCheck = this.checkBounds(state, containerSize);
    const recommendations: string[] = [];
    
    // Generate recommendations
    if (!stateValidation.isValid) {
      recommendations.push('Fix validation errors before proceeding');
    }
    
    if (!boundsCheck.inBounds) {
      recommendations.push('Consider resetting viewport or using fitToContainer()');
    }
    
    if (state.scale < 0.5) {
      recommendations.push('Very low zoom level may impact usability');
    }
    
    if (state.scale > 3.0) {
      recommendations.push('High zoom level may cause performance issues');
    }
    
    return {
      isValid: stateValidation.isValid && boundsCheck.inBounds,
      stateValidation,
      boundsCheck,
      recommendations
    };
  }
}