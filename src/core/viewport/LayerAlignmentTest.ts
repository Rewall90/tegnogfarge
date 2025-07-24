/**
 * LayerAlignmentTest - Automated testing for layer synchronization
 * Verifies perfect alignment across all canvas layers
 */

import type { ViewportState } from './types';
import { CanvasContainerManager } from './CanvasContainerManager';

export class LayerAlignmentTest {
  private containerManager: CanvasContainerManager;
  private testResults: Array<{
    transform: ViewportState;
    aligned: boolean;
    details: string;
  }> = [];

  constructor(containerManager: CanvasContainerManager) {
    this.containerManager = containerManager;
  }

  /**
   * Draw test patterns on each canvas layer for visual verification
   */
  drawTestPatterns(): void {
    const canvases = this.containerManager.getAllCanvases();
    
    // Background canvas - grid pattern
    const backgroundCanvas = canvases.get('background');
    if (backgroundCanvas) {
      this.drawTestGrid(backgroundCanvas, '#e0e0e0');
    }

    // Fill canvas - dot pattern
    const fillCanvas = canvases.get('fill');
    if (fillCanvas) {
      this.drawTestDots(fillCanvas, '#ff0000');
    }

    // Main canvas - line pattern
    const mainCanvas = canvases.get('main');
    if (mainCanvas) {
      this.drawTestLines(mainCanvas, '#0000ff');
    }

    // Shadow canvas - corner markers
    const shadowCanvas = canvases.get('shadow');
    if (shadowCanvas) {
      this.drawCornerMarkers(shadowCanvas, '#00ff00');
    }
  }

  /**
   * Draw grid pattern for alignment reference
   */
  private drawTestGrid(canvas: HTMLCanvasElement, color: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Draw grid every 100px
    for (let x = 0; x <= 2550; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 3300);
      ctx.stroke();
    }
    
    for (let y = 0; y <= 3300; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2550, y);
      ctx.stroke();
    }
  }

  /**
   * Draw dot pattern at grid intersections
   */
  private drawTestDots(canvas: HTMLCanvasElement, color: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    
    // Draw dots at grid intersections
    for (let x = 0; x <= 2550; x += 200) {
      for (let y = 0; y <= 3300; y += 200) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  /**
   * Draw diagonal lines for alignment testing
   */
  private drawTestLines(canvas: HTMLCanvasElement, color: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw diagonal lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(2550, 3300);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(2550, 0);
    ctx.lineTo(0, 3300);
    ctx.stroke();
  }

  /**
   * Draw corner markers for precise alignment verification
   */
  private drawCornerMarkers(canvas: HTMLCanvasElement, color: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    const markerSize = 20;
    
    // Draw markers at all four corners
    const corners = [
      { x: 0, y: 0 },
      { x: 2550 - markerSize, y: 0 },
      { x: 0, y: 3300 - markerSize },
      { x: 2550 - markerSize, y: 3300 - markerSize }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x, corner.y, markerSize, markerSize);
    });
  }

  /**
   * Run comprehensive alignment tests with various transforms
   */
  runAlignmentTests(): Array<{
    transform: ViewportState;
    aligned: boolean;
    details: string;
  }> {
    this.testResults = [];
    
    // Test transforms covering various scenarios
    const testTransforms: ViewportState[] = [
      // Identity transform
      { scale: 1.0, panX: 0, panY: 0, mode: 'zoom' },
      
      // Zoom only
      { scale: 0.5, panX: 0, panY: 0, mode: 'zoom' },
      { scale: 2.0, panX: 0, panY: 0, mode: 'zoom' },
      { scale: 4.0, panX: 0, panY: 0, mode: 'zoom' },
      { scale: 0.25, panX: 0, panY: 0, mode: 'zoom' },
      
      // Pan only
      { scale: 1.0, panX: -100, panY: -200, mode: 'zoom' },
      { scale: 1.0, panX: 150, panY: 75, mode: 'zoom' },
      
      // Combined zoom and pan
      { scale: 1.5, panX: -50, panY: -100, mode: 'zoom' },
      { scale: 0.8, panX: 200, panY: 150, mode: 'zoom' },
      { scale: 2.5, panX: -300, panY: -400, mode: 'zoom' },
      
      // Edge cases
      { scale: 0.25, panX: 500, panY: 600, mode: 'zoom' },
      { scale: 4.0, panX: -1000, panY: -1200, mode: 'zoom' }
    ];

    testTransforms.forEach(transform => {
      const result = this.testSingleTransform(transform);
      this.testResults.push(result);
    });

    return this.testResults;
  }

  /**
   * Test alignment for a single transform
   */
  private testSingleTransform(transform: ViewportState): {
    transform: ViewportState;
    aligned: boolean;
    details: string;
  } {
    // Apply transform
    this.containerManager.applyTransform(transform);
    
    // Wait for transform to be applied
    return new Promise<{
      transform: ViewportState;
      aligned: boolean;
      details: string;
    }>((resolve) => {
      requestAnimationFrame(() => {
        const alignment = this.containerManager.verifyAlignment();
        
        let details = `Layers: ${alignment.layers.length}, `;
        if (alignment.isAligned) {
          details += 'Perfect alignment achieved';
        } else {
          details += 'Misalignment detected: ';
          alignment.layers.forEach((layer, index) => {
            if (index > 0) {
              const prev = alignment.layers[index - 1];
              const dx = Math.abs(layer.bounds.x - prev.bounds.x);
              const dy = Math.abs(layer.bounds.y - prev.bounds.y);
              if (dx > 1 || dy > 1) {
                details += `${layer.name} offset by (${dx.toFixed(1)}, ${dy.toFixed(1)})px `;
              }
            }
          });
        }

        resolve({
          transform,
          aligned: alignment.isAligned,
          details
        });
      });
    }) as any; // TypeScript workaround for synchronous testing
  }

  /**
   * Generate test report
   */
  generateReport(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    details: Array<{
      transform: ViewportState;
      aligned: boolean;
      details: string;
    }>;
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.aligned).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      details: this.testResults
    };
  }

  /**
   * Clear all test patterns from canvases
   */
  clearTestPatterns(): void {
    const canvases = this.containerManager.getAllCanvases();
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 2550, 3300);
      }
    });
  }

  /**
   * Quick visual verification - draws crosshairs at canvas center
   */
  drawAlignmentCrosshairs(): void {
    const canvases = this.containerManager.getAllCanvases();
    const centerX = 2550 / 2;
    const centerY = 3300 / 2;
    
    canvases.forEach((canvas, name) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const colors = {
        background: '#cccccc',
        fill: '#ff0000',
        main: '#0000ff',
        shadow: '#00ff00'
      };

      ctx.strokeStyle = colors[name as keyof typeof colors] || '#000000';
      ctx.lineWidth = 3;
      
      // Draw crosshair
      ctx.beginPath();
      ctx.moveTo(centerX - 50, centerY);
      ctx.lineTo(centerX + 50, centerY);
      ctx.moveTo(centerX, centerY - 50);
      ctx.lineTo(centerX, centerY + 50);
      ctx.stroke();
    });
  }
}