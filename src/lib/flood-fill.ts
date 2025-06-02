import type { ColorRGB, Point } from '@/types/canvas-coloring'

export class FloodFill {
  private imageData: ImageData
  private tolerance: number
  private width: number
  private height: number
  private pixels: Uint8ClampedArray
  private fillColor: ColorRGB = { r: 0, g: 0, b: 0, a: 255 }
  private startColor: ColorRGB = { r: 0, g: 0, b: 0, a: 255 }
  private pixelsChecked: Set<number>
  private pixelStack: Point[]
  private preserveDetails: boolean

  constructor(
    imageData: ImageData, 
    tolerance: number = 32,
    preserveDetails: boolean = true
  ) {
    this.imageData = imageData
    this.tolerance = tolerance
    this.width = imageData.width
    this.height = imageData.height
    this.pixels = imageData.data
    this.preserveDetails = preserveDetails
    this.pixelsChecked = new Set()
    this.pixelStack = []
  }

  fill(x: number, y: number, fillColor: string): ImageData {
    // Konverter hex til RGB
    this.fillColor = this.hexToRGB(fillColor)
    
    // Få startfarge
    const startPos = (y * this.width + x) * 4
    this.startColor = {
      r: this.pixels[startPos],
      g: this.pixels[startPos + 1],
      b: this.pixels[startPos + 2],
      a: this.pixels[startPos + 3]
    }

    // Hvis start og fyll-farge er like, returner
    if (this.colorsMatch(this.startColor, this.fillColor, 0)) {
      return this.imageData
    }

    // Start flood fill
    this.pixelStack.push({ x, y })
    
    while (this.pixelStack.length > 0) {
      const newPos = this.pixelStack.pop()!
      const pixelPos = (newPos.y * this.width + newPos.x) * 4
      
      // Sjekk om piksel allerede er sjekket
      if (this.pixelsChecked.has(pixelPos)) continue
      this.pixelsChecked.add(pixelPos)
      
      // Hent current pixel color
      const currentColor = {
        r: this.pixels[pixelPos],
        g: this.pixels[pixelPos + 1],
        b: this.pixels[pixelPos + 2],
        a: this.pixels[pixelPos + 3]
      }
      
      // Sjekk om piksel matcher startfarge innenfor toleranse
      if (this.colorsMatch(this.startColor, currentColor, this.tolerance)) {
        // Fyll piksel
        this.pixels[pixelPos] = this.fillColor.r
        this.pixels[pixelPos + 1] = this.fillColor.g
        this.pixels[pixelPos + 2] = this.fillColor.b
        this.pixels[pixelPos + 3] = this.fillColor.a
        
        // Legg til nabopiksler
        this.addNeighbors(newPos.x, newPos.y)
      }
    }
    
    // Apply edge smoothing hvis aktivert
    if (this.preserveDetails) {
      this.smoothEdges()
    }
    
    return this.imageData
  }

  private addNeighbors(x: number, y: number): void {
    // Sjekk alle 8 naboer for bedre fylling
    const neighbors = [
      { x: x - 1, y }, // Venstre
      { x: x + 1, y }, // Høyre
      { x, y: y - 1 }, // Opp
      { x, y: y + 1 }, // Ned
      { x: x - 1, y: y - 1 }, // Øverst venstre
      { x: x + 1, y: y - 1 }, // Øverst høyre
      { x: x - 1, y: y + 1 }, // Nederst venstre
      { x: x + 1, y: y + 1 }  // Nederst høyre
    ]
    
    for (const neighbor of neighbors) {
      if (
        neighbor.x >= 0 && 
        neighbor.x < this.width && 
        neighbor.y >= 0 && 
        neighbor.y < this.height
      ) {
        const pos = (neighbor.y * this.width + neighbor.x) * 4
        if (!this.pixelsChecked.has(pos)) {
          this.pixelStack.push(neighbor)
        }
      }
    }
  }

  private colorsMatch(color1: ColorRGB, color2: ColorRGB, tolerance: number): boolean {
    const dr = Math.abs(color1.r - color2.r)
    const dg = Math.abs(color1.g - color2.g)
    const db = Math.abs(color1.b - color2.b)
    const da = Math.abs(color1.a - color2.a)
    
    return dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance
  }

  private hexToRGB(hex: string): ColorRGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 }
  }

  private smoothEdges(): void {
    // Implementer edge smoothing algoritme for jevnere kanter
    // Dette er en forenklet versjon
    const tempData = new Uint8ClampedArray(this.pixels)
    
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const pos = (y * this.width + x) * 4
        
        // Sjekk om dette er en kantpiksel
        if (this.isEdgePixel(x, y)) {
          // Beregn gjennomsnitt av nabopiksler
          let r = 0, g = 0, b = 0, count = 0
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              
              const nPos = ((y + dy) * this.width + (x + dx)) * 4
              r += tempData[nPos]
              g += tempData[nPos + 1]
              b += tempData[nPos + 2]
              count++
            }
          }
          
          // Anvend utjevning
          this.pixels[pos] = Math.round(r / count)
          this.pixels[pos + 1] = Math.round(g / count)
          this.pixels[pos + 2] = Math.round(b / count)
        }
      }
    }
  }

  private isEdgePixel(x: number, y: number): boolean {
    const pos = (y * this.width + x) * 4
    const currentColor = {
      r: this.pixels[pos],
      g: this.pixels[pos + 1],
      b: this.pixels[pos + 2],
      a: this.pixels[pos + 3]
    }
    
    // Sjekk om noen nabopiksler har forskjellig farge
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nx = x + dx
        const ny = y + dy
        
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const nPos = (ny * this.width + nx) * 4
          const neighborColor = {
            r: this.pixels[nPos],
            g: this.pixels[nPos + 1],
            b: this.pixels[nPos + 2],
            a: this.pixels[nPos + 3]
          }
          
          if (!this.colorsMatch(currentColor, neighborColor, 10)) {
            return true
          }
        }
      }
    }
    
    return false
  }
} 