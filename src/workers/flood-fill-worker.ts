import { FillRegion } from '@/lib/flood-fill'

// Worker-spesifikk PixelChange-type som passer til worker-implementasjonen
interface PixelChange {
  x: number;
  y: number;
  oldColor: number[];
  newColor: number[];
}

type WorkerMessage = {
  id: number;
  action: 'floodFill';
  imageData: ArrayBuffer;
  width: number;
  height: number;
  x: number;
  y: number;
  fillColor: string;
  tolerance: number;
  maxPoints?: number;
}

type WorkerResponse = {
  id: number;
  action: 'floodFill';
  changes: PixelChange[];
  region: FillRegion;
  performance: {
    totalTime: number;
    processedPixels: number;
    changedPixels: number;
  };
}

// Dette er en standalone implementation av flood fill algoritmen
// som kan kjøre i en Web Worker (uten å importere fra andre moduler)
class FloodFillWorker {
  private imageData: Uint8ClampedArray;
  private width: number;
  private height: number;
  private tolerance: number;
  private maxPoints: number;
  private processedPixels = 0;
  private changedPixels = 0;

  constructor(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    tolerance: number,
    maxPoints = 1000000
  ) {
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.tolerance = tolerance;
    this.maxPoints = maxPoints;
  }

  // Hjelpefunksjon: Sjekk om to farger er like (innenfor toleransen)
  private colorsMatch(
    r1: number, g1: number, b1: number,
    r2: number, g2: number, b2: number
  ): boolean {
    const diffR = Math.abs(r1 - r2);
    const diffG = Math.abs(g1 - g2);
    const diffB = Math.abs(b1 - b2);
    const diff = Math.max(diffR, diffG, diffB);
    return diff <= this.tolerance;
  }

  private getPixel(x: number, y: number): [number, number, number, number] {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return [0, 0, 0, 0]; // Utenfor bildet
    }
    const idx = (y * this.width + x) * 4;
    return [
      this.imageData[idx],     // R
      this.imageData[idx + 1], // G
      this.imageData[idx + 2], // B
      this.imageData[idx + 3]  // A
    ];
  }

  private setPixel(x: number, y: number, r: number, g: number, b: number, a: number = 255): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const idx = (y * this.width + x) * 4;
    this.imageData[idx] = r;
    this.imageData[idx + 1] = g;
    this.imageData[idx + 2] = b;
    this.imageData[idx + 3] = a;
  }

  // Konverter hex farge til RGB
  private hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
  }

  fill(x: number, y: number, fillColor: string): { changes: PixelChange[]; region: FillRegion } {
    const startTime = performance.now();
    this.processedPixels = 0;
    this.changedPixels = 0;
    
    // Sjekk om startpunktet er gyldig
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return { 
        changes: [], 
        region: { points: [], color: fillColor, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } } 
      };
    }

    // Konverter fyllfargen til RGB
    const [fillR, fillG, fillB] = this.hexToRgb(fillColor);

    // Hent startfargen
    const [targetR, targetG, targetB, targetA] = this.getPixel(x, y);

    // Hvis startpunktet er transparent, avbryt
    if (targetA === 0) {
      return { 
        changes: [], 
        region: { points: [], color: fillColor, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } } 
      };
    }

    // Hvis startfargen er lik fyllfargen, avbryt
    if (
      targetR === fillR &&
      targetG === fillG &&
      targetB === fillB
    ) {
      return { 
        changes: [], 
        region: { points: [], color: fillColor, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } } 
      };
    }

    // Stack-basert floodfill (mer effektivt enn rekursiv)
    const stack: [number, number][] = [[x, y]];
    const changes: PixelChange[] = [];
    const regionPoints: [number, number][] = [];
    
    // For dirty rectangle tracking
    let minX = x;
    let minY = y;
    let maxX = x;
    let maxY = y;

    // Visited map (faster than checking pixel values repeatedly)
    const visited = new Set<string>();
    const pixelKey = (px: number, py: number) => `${px},${py}`;
    visited.add(pixelKey(x, y));

    while (stack.length > 0 && this.processedPixels < this.maxPoints) {
      this.processedPixels++;
      
      const [curX, curY] = stack.pop()!;
      
      // Hent nåværende farge
      const [r, g, b, a] = this.getPixel(curX, curY);
      
      // Sjekk om fargen matcher målfargen
      if (a > 0 && this.colorsMatch(r, g, b, targetR, targetG, targetB)) {
        // Endre fargen
        this.setPixel(curX, curY, fillR, fillG, fillB);
        this.changedPixels++;
        
        // Registrer endringen
        changes.push({
          x: curX,
          y: curY,
          oldColor: [r, g, b, a] as number[],
          newColor: [fillR, fillG, fillB, 255] as number[]
        });
        
        // Legg til i region
        regionPoints.push([curX, curY]);
        
        // Oppdater bounds
        minX = Math.min(minX, curX);
        minY = Math.min(minY, curY);
        maxX = Math.max(maxX, curX);
        maxY = Math.max(maxY, curY);
        
        // Legg til nabopiksler til stack
        const neighbors: [number, number][] = [
          [curX + 1, curY], // Høyre
          [curX - 1, curY], // Venstre
          [curX, curY + 1], // Ned
          [curX, curY - 1]  // Opp
        ];
        
        for (const [nx, ny] of neighbors) {
          const key = pixelKey(nx, ny);
          if (
            nx >= 0 && nx < this.width &&
            ny >= 0 && ny < this.height &&
            !visited.has(key)
          ) {
            visited.add(key);
            stack.push([nx, ny]);
          }
        }
      }
    }

    const endTime = performance.now();
    console.log(`[Worker] Flood fill completed in ${endTime - startTime}ms`);
    console.log(`[Worker] Processed ${this.processedPixels} pixels, changed ${this.changedPixels} pixels`);

    return {
      changes,
      region: {
        points: regionPoints,
        color: fillColor,
        bounds: { minX, minY, maxX, maxY }
      }
    };
  }
}

// Web Worker event handling
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, action, imageData, width, height, x, y, fillColor, tolerance, maxPoints } = event.data;
  
  if (action === 'floodFill') {
    const startTime = performance.now();
    
    // Konverter ArrayBuffer til Uint8ClampedArray
    const pixelData = new Uint8ClampedArray(imageData);
    
    // Utfør floodfill
    const floodFill = new FloodFillWorker(pixelData, width, height, tolerance, maxPoints);
    const { changes, region } = floodFill.fill(x, y, fillColor);
    
    const endTime = performance.now();
    
    // Send resultatet tilbake
    const response: WorkerResponse = {
      id,
      action: 'floodFill',
      changes,
      region,
      performance: {
        totalTime: endTime - startTime,
        processedPixels: floodFill['processedPixels'],
        changedPixels: floodFill['changedPixels']
      }
    };
    
    self.postMessage(response);
  }
};

// TypeScript type definitions for Web Workers
export {}; 