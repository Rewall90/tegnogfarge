import type { ColoringState } from '@/types/coloring'
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_STORAGE_AGE,
  MAX_STORAGE_SIZE
} from '@/constants/coloring'

export class ColoringStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  private static getStorageSize(): number {
    if (!this.isClient()) return 0
    
    let total = 0
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
    } catch {}
    return total
  }

  static save(drawingId: string, colors: Record<string, string>): boolean {
    if (!this.isClient()) return false
    
    try {
      const state: ColoringState = {
        colors: colors,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      }
      
      const stateString = JSON.stringify(state)
      
      // Sjekk størrelse før lagring
      if (this.getStorageSize() + stateString.length > MAX_STORAGE_SIZE) {
        console.warn('localStorage nær full - rydder opp')
        this.cleanupOldColorings()
        
        // Prøv igjen etter cleanup
        if (this.getStorageSize() + stateString.length > MAX_STORAGE_SIZE) {
          console.warn('Ikke nok plass i localStorage')
          return false
        }
      }
      
      localStorage.setItem(`${STORAGE_KEY}_${drawingId}`, stateString)
      return true
    } catch {}
    return false
  }

  static load(drawingId: string): Record<string, string> | null {
    if (!this.isClient()) return null
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${drawingId}`)
      if (!stored) return null

      const state: ColoringState = JSON.parse(stored)
      
      // Sjekk alder
      if (Date.now() - state.timestamp > MAX_STORAGE_AGE) {
        this.clear(drawingId)
        return null
      }

      // Sjekk versjon
      if (state.version !== STORAGE_VERSION) {
        this.clear(drawingId)
        return null
      }

      return state.colors || null
    } catch {}
    return null
  }

  static clear(drawingId: string): void {
    if (!this.isClient()) return
    
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${drawingId}`)
    } catch {}
  }

  static hasStoredColoring(drawingId: string): boolean {
    return this.load(drawingId) !== null
  }

  static cleanupOldColorings(): void {
    if (!this.isClient()) return
    
    const cutoffTime = Date.now() - MAX_STORAGE_AGE
    
    try {
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEY)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              const state: ColoringState = JSON.parse(stored)
              if (state.timestamp < cutoffTime) {
                keysToRemove.push(key)
              }
            } catch {}
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      if (keysToRemove.length > 0) {
        console.log(`Ryddet opp ${keysToRemove.length} gamle fargelegginger`)
      }
    } catch {}
  }
} 