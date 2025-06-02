import type { CanvasRegion } from '@/types/coloring'

const BOUNDARY_THRESHOLD = 32 // Svart strek: < 32, hvit: >= 240
const FILLABLE_THRESHOLD = 240
const MIN_REGION_SIZE = 100    // Minimum pixels for valid region
const SCAN_STEP = 1 // Alltid 1 for sort-hvitt

export class SmartColoringEngine {
  private regions: Map<string, CanvasRegion> = new Map()
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  // Core functionality
  async initializeFromSVG(container: HTMLElement, svgContent: string): Promise<void> {
    await this.initializeCanvasMode(container, svgContent)
  }

  findRegionAtPoint(x: number, y: number): string | null {
    return this.findCanvasRegionAtPoint(x, y)
  }

  fillRegion(regionId: string, color: string): void {
    this.fillCanvasRegion(regionId, color)
  }

  // Canvas-based methods
  private async initializeCanvasMode(container: HTMLElement, svgContent: string): Promise<void> {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) throw new Error('Could not get canvas context')

    await this.convertSVGToCanvas(svgContent)
    this.binarizeCanvas()
    this.detectRegionsFromPixels()
  }

  private async convertSVGToCanvas(svgContent: string): Promise<void> {
    if (!this.canvas || !this.ctx) return

    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + btoa(svgContent)
    
    await new Promise((resolve) => {
      img.onload = resolve
    })

    this.canvas.width = img.width || 800
    this.canvas.height = img.height || 600

    // White background for region detection
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(img, 0, 0)
  }

  // Binariser canvas: alle ikke-svarte piksler blir helt hvite
  private binarizeCanvas(): void {
    if (!this.ctx || !this.canvas) return
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const avg = (r + g + b) / 3
      if (avg < BOUNDARY_THRESHOLD) {
        // Svart strek
        imageData.data[i] = 0
        imageData.data[i + 1] = 0
        imageData.data[i + 2] = 0
      } else {
        // Hvit fyllbar
        imageData.data[i] = 255
        imageData.data[i + 1] = 255
        imageData.data[i + 2] = 255
      }
    }
    this.ctx.putImageData(imageData, 0, 0)
  }

  private detectRegionsFromPixels(): void {
    if (!this.ctx || !this.canvas) return
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const visited = new Set<string>()
    const regions: CanvasRegion[] = []
    for (let y = 0; y < this.canvas.height; y += SCAN_STEP) {
      for (let x = 0; x < this.canvas.width; x += SCAN_STEP) {
        const pixelKey = `${x},${y}`
        if (visited.has(pixelKey)) continue
        const color = this.getPixelColor(imageData, x, y)
        if (this.isFillablePixel(color) && !this.isBoundaryPixel(color)) {
          const region = this.floodFillRegion(imageData, x, y, visited)
          if (region.pixelCount > MIN_REGION_SIZE) {
            regions.push(region)
          }
        }
      }
    }
    regions.forEach((region, index) => {
      this.regions.set(`region-${index}`, region)
    })
    console.log('[SmartColoringEngine] Antall regioner funnet:', regions.length)
  }

  private isBoundaryPixel(color: { r: number, g: number, b: number }): boolean {
    // Svart strek
    return (color.r + color.g + color.b) / 3 < BOUNDARY_THRESHOLD
  }

  private isFillablePixel(color: { r: number, g: number, b: number }): boolean {
    // Hvit bakgrunn
    return (color.r + color.g + color.b) / 3 >= FILLABLE_THRESHOLD
  }

  private getPixelColor(imageData: ImageData, x: number, y: number): { r: number, g: number, b: number } {
    const index = (y * imageData.width + x) * 4
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2]
    }
  }

  private floodFillRegion(
    imageData: ImageData,
    startX: number,
    startY: number,
    visited: Set<string>
  ): CanvasRegion {
    const queue: [number, number][] = [[startX, startY]]
    const pixels: [number, number][] = []
    let pixelCount = 0

    while (queue.length > 0) {
      const [x, y] = queue.shift()!
      const pixelKey = `${x},${y}`

      if (visited.has(pixelKey)) continue
      visited.add(pixelKey)

      const color = this.getPixelColor(imageData, x, y)
      if (!this.isFillablePixel(color) || this.isBoundaryPixel(color)) continue

      pixels.push([x, y])
      pixelCount++

      // Add neighbors to queue
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
      for (const [dx, dy] of directions) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
          queue.push([nx, ny])
        }
      }
    }

    return {
      id: `region-${this.regions.size}`,
      type: 'CANVAS_PIXELS',
      pixels,
      pixelCount,
      bounds: this.calculateRegionBounds(pixels)
    }
  }

  private calculateRegionBounds(pixels: [number, number][]): DOMRect {
    if (pixels.length === 0) return new DOMRect()

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const [x, y] of pixels) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    return new DOMRect(minX, minY, maxX - minX, maxY - minY)
  }

  private findCanvasRegionAtPoint(x: number, y: number): string | null {
    if (!this.canvas || !this.ctx) return null

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const color = this.getPixelColor(imageData, x, y)

    // If point is on boundary or dark area, return null
    if (!this.isFillablePixel(color) || this.isBoundaryPixel(color)) {
      console.log('[SmartColoringEngine] Klikk på boundary/dark area', { x, y })
      return null
    }

    // Find which region contains this point
    const pixelKey = `${x},${y}`
    for (const [regionId, region] of this.regions) {
      if (region.type === 'CANVAS_PIXELS') {
        if (region.pixels.some(([px, py]) => `${px},${py}` === pixelKey)) {
          console.log('[SmartColoringEngine] Fant region', regionId, 'for punkt', { x, y })
          return regionId
        }
      }
    }
    console.log('[SmartColoringEngine] Ingen region funnet for punkt', { x, y })
    return null
  }

  private fillCanvasRegion(regionId: string, color: string): void {
    const region = this.regions.get(regionId)
    if (!region || region.type !== 'CANVAS_PIXELS' || !this.ctx) return

    // Convert color to RGB
    const rgb = this.hexToRgb(color)
    if (!rgb) return

    // Fill all pixels in the region
    for (const [x, y] of region.pixels) {
      const index = (y * this.canvas!.width + x) * 4
      this.ctx.getImageData(0, 0, this.canvas!.width, this.canvas!.height).data.set([
        rgb.r, rgb.g, rgb.b, 255
      ], index)
    }

    // Update canvas with new image data
    this.ctx.putImageData(
      this.ctx.getImageData(0, 0, this.canvas!.width, this.canvas!.height),
      0, 0
    )
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
} 