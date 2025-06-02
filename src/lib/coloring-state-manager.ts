import { ColoringState } from '@/types/coloring'

const MAX_UNDO_STACK_SIZE = 20

export class ColoringStateManager {
  private state: ColoringState = {
    regions: new Map<string, string>(),
    undoStack: [],
    redoStack: []
  }

  constructor(private drawingId: string) {
    this.loadState()
  }

  private loadState(): void {
    const stored = localStorage.getItem(`coloring-state-${this.drawingId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        this.state = {
          regions: new Map(Object.entries(parsed.regions)),
          undoStack: parsed.undoStack.map((stack: Record<string, string>) => new Map(Object.entries(stack))),
          redoStack: parsed.redoStack.map((stack: Record<string, string>) => new Map(Object.entries(stack)))
        }
      } catch {
        // If parsing fails, start with empty state
        this.state = {
          regions: new Map(),
          undoStack: [],
          redoStack: []
        }
      }
    }
  }

  private saveState(): void {
    const serialized = {
      regions: Object.fromEntries(this.state.regions),
      undoStack: this.state.undoStack.map(stack => Object.fromEntries(stack)),
      redoStack: this.state.redoStack.map(stack => Object.fromEntries(stack))
    }
    localStorage.setItem(`coloring-state-${this.drawingId}`, JSON.stringify(serialized))
  }

  setRegionColor(regionId: string, color: string): void {
    // Save current state to undo stack
    this.state.undoStack.push(new Map(this.state.regions))
    if (this.state.undoStack.length > MAX_UNDO_STACK_SIZE) {
      this.state.undoStack.shift()
    }

    // Clear redo stack when new change is made
    this.state.redoStack = []

    // Update color
    this.state.regions.set(regionId, color)
    this.saveState()
  }

  undo(): boolean {
    if (this.state.undoStack.length === 0) return false

    // Save current state to redo stack
    this.state.redoStack.push(new Map(this.state.regions))
    if (this.state.redoStack.length > MAX_UNDO_STACK_SIZE) {
      this.state.redoStack.shift()
    }

    // Restore previous state
    const previousState = this.state.undoStack.pop()!
    this.state.regions = previousState
    this.saveState()

    return true
  }

  redo(): boolean {
    if (this.state.redoStack.length === 0) return false

    // Save current state to undo stack
    this.state.undoStack.push(new Map(this.state.regions))
    if (this.state.undoStack.length > MAX_UNDO_STACK_SIZE) {
      this.state.undoStack.shift()
    }

    // Restore next state
    const nextState = this.state.redoStack.pop()!
    this.state.regions = nextState
    this.saveState()

    return true
  }

  getRegionColor(regionId: string): string | undefined {
    return this.state.regions.get(regionId)
  }

  getAllRegionColors(): Map<string, string> {
    return new Map(this.state.regions)
  }

  clear(): void {
    this.state = {
      regions: new Map(),
      undoStack: [],
      redoStack: []
    }
    this.saveState()
  }

  canUndo(): boolean {
    return this.state.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.state.redoStack.length > 0
  }
} 