import type { ColorRGB } from '@/types/canvas-coloring'

export interface PixelChange {
  index: number;
  oldColor: number;
  newColor: number;
}

export class FloodFill {
  private imageData: ImageData
  private tolerance: number
  private width: number
  private height: number
  private pixels: Uint8ClampedArray
  private pixels32: Uint32Array
  private blackThreshold: number
  private stack: Int32Array
  private stackPtr: number = 0

  constructor(
    imageData: ImageData,
    tolerance: number = 32,
    blackThreshold: number = 50
  ) {
    this.imageData = imageData
    this.tolerance = tolerance
    this.width = imageData.width
    this.height = imageData.height
    this.pixels = imageData.data
    this.pixels32 = new Uint32Array(imageData.data.buffer)
    this.blackThreshold = blackThreshold
    this.stack = new Int32Array(this.width * this.height * 2)
  }

  fill(x: number, y: number, fillColor: string): { imageData: ImageData, changes: PixelChange[] } {
    const fillRGBA = this.hexToRGBA32(fillColor)
    const startPos = y * this.width + x
    const startColor = this.pixels32[startPos]
    const changes: PixelChange[] = [];

    // Ikke fyll hvis startpunkt er svart
    if (this.isProtectedColor(startColor) || this.colorMatches32(startColor, fillRGBA, 0)) {
      return { imageData: this.imageData, changes };
    }

    // Gjenbruk stack-arrayen
    this.stackPtr = 0
    this.stack[this.stackPtr++] = x
    this.stack[this.stackPtr++] = y

    // Scanline flood fill
    while (this.stackPtr > 0) {
      const py = this.stack[--this.stackPtr]
      const px = this.stack[--this.stackPtr]
      let idx = py * this.width + px

      // Hopp over hvis allerede fylt, ikke matcher, eller beskyttet
      if (!this.canFill(this.pixels32[idx], startColor, fillRGBA)) continue

      // Finn venstre kant
      let leftX = px
      let leftIdx = idx
      while (
        leftX > 0 &&
        this.canFill(this.pixels32[leftIdx - 1], startColor, fillRGBA)
      ) {
        leftX--
        leftIdx--
      }

      // Fyll linjen og se etter hull over/under
      let spanAbove = false
      let spanBelow = false
      idx = py * this.width + leftX

      while (
        leftX < this.width &&
        this.canFill(this.pixels32[idx], startColor, fillRGBA)
      ) {
        if (this.pixels32[idx] !== fillRGBA) {
          changes.push({ index: idx, oldColor: this.pixels32[idx], newColor: fillRGBA });
          this.pixels32[idx] = fillRGBA;
        }

        // Sjekk linjen over
        if (py > 0) {
          const aboveIdx = idx - this.width
          if (!spanAbove && this.canFill(this.pixels32[aboveIdx], startColor, fillRGBA)) {
            this.stack[this.stackPtr++] = leftX
            this.stack[this.stackPtr++] = py - 1
            spanAbove = true
          } else if (spanAbove && !this.canFill(this.pixels32[aboveIdx], startColor, fillRGBA)) {
            spanAbove = false
          }
        }

        // Sjekk linjen under
        if (py < this.height - 1) {
          const belowIdx = idx + this.width
          if (!spanBelow && this.canFill(this.pixels32[belowIdx], startColor, fillRGBA)) {
            this.stack[this.stackPtr++] = leftX
            this.stack[this.stackPtr++] = py + 1
            spanBelow = true
          } else if (spanBelow && !this.canFill(this.pixels32[belowIdx], startColor, fillRGBA)) {
            spanBelow = false
          }
        }

        leftX++
        idx++
      }
    }

    return { imageData: this.imageData, changes };
  }

  private canFill(color: number, targetColor: number, fillRGBA: number): boolean {
    // Ikke fyll svarte/mørke piksler
    if (this.isProtectedColor(color)) return false
    // Ikke fyll allerede fylt
    if (color === fillRGBA) return false
    // Toleranse
    if (this.tolerance === 0) return color === targetColor
    return this.colorMatches32(color, targetColor, this.tolerance)
  }

  private colorMatches32(color1: number, color2: number, tolerance: number): boolean {
    if (tolerance === 0) return color1 === color2
    const r1 = color1 & 0xFF
    const g1 = (color1 >> 8) & 0xFF
    const b1 = (color1 >> 16) & 0xFF
    const r2 = color2 & 0xFF
    const g2 = (color2 >> 8) & 0xFF
    const b2 = (color2 >> 16) & 0xFF
    return (
      Math.abs(r1 - r2) <= tolerance &&
      Math.abs(g1 - g2) <= tolerance &&
      Math.abs(b1 - b2) <= tolerance
    )
  }

  private isProtectedColor(color: number): boolean {
    const r = color & 0xFF
    const g = (color >> 8) & 0xFF
    const b = (color >> 16) & 0xFF
    return r < this.blackThreshold && g < this.blackThreshold && b < this.blackThreshold
  }

  private hexToRGBA32(hex: string): number {
    const r = parseInt(hex.substr(1, 2), 16)
    const g = parseInt(hex.substr(3, 2), 16)
    const b = parseInt(hex.substr(5, 2), 16)
    return (255 << 24) | (b << 16) | (g << 8) | r
  }
} 