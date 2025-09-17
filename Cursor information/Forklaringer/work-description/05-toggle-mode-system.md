# Toggle Mode System

## Overview
Implement a simple zoom/draw mode toggle that disables drawing tools during zoom mode while preserving zoom/pan state when switching between modes.

## Mode State Management

### Mode Definition
```typescript
type ViewportMode = 'zoom' | 'draw';

interface ModeState {
  currentMode: ViewportMode;
  savedZoomState?: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };
}
```

### Mode Manager Implementation
```typescript
class ToggleModeManager {
  private currentMode: ViewportMode = 'draw';
  private savedZoomState: ViewportState | null = null;
  private modeChangeCallbacks: Array<(mode: ViewportMode) => void> = [];
  
  toggleMode(): void {
    const newMode = this.currentMode === 'draw' ? 'zoom' : 'draw';
    this.setMode(newMode);
  }
  
  setMode(mode: ViewportMode): void {
    if (mode === this.currentMode) return;
    
    const currentViewportState = this.viewportManager.getState();
    
    if (mode === 'zoom') {
      // Entering zoom mode - save current state
      this.savedZoomState = { ...currentViewportState };
      this.enableZoomMode();
    } else {
      // Entering draw mode - restore or maintain state
      this.enableDrawMode();
    }
    
    this.currentMode = mode;
    this.notifyModeChange(mode);
  }
  
  private enableZoomMode(): void {
    // Enable zoom/pan interactions
    this.inputHandler.enableZoomInteractions();
    
    // Disable drawing tools
    this.toolManager.disableAllTools();
    
    // Update UI state
    this.updateModeUI('zoom');
  }
  
  private enableDrawMode(): void {
    // Disable zoom/pan interactions
    this.inputHandler.disableZoomInteractions();
    
    // Enable drawing tools
    this.toolManager.enableTools();
    
    // Update UI state
    this.updateModeUI('draw');
  }
  
  getCurrentMode(): ViewportMode {
    return this.currentMode;
  }
  
  getSavedZoomState(): ViewportState | null {
    return this.savedZoomState ? { ...this.savedZoomState } : null;
  }
}
```

## UI Integration

### Toggle Button Component
```typescript
interface ZoomToggleButtonProps {
  currentMode: ViewportMode;
  onToggle: () => void;
}

const ZoomToggleButton: React.FC<ZoomToggleButtonProps> = ({ currentMode, onToggle }) => {
  return (
    <button
      className={`zoom-toggle ${currentMode === 'zoom' ? 'active' : ''}`}
      onClick={onToggle}
      aria-label={currentMode === 'zoom' ? 'Switch to draw mode' : 'Switch to zoom mode'}
    >
      {currentMode === 'zoom' ? (
        <DrawIcon />
      ) : (
        <ZoomIcon />
      )}
      <span>{currentMode === 'zoom' ? 'Draw' : 'Zoom'}</span>
    </button>
  );
};
```

### Visual Feedback
```css
.zoom-toggle {
  padding: 8px 16px;
  border: 2px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-toggle.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.canvas-container.zoom-mode {
  cursor: grab;
}

.canvas-container.zoom-mode:active {
  cursor: grabbing;
}

.canvas-container.draw-mode {
  cursor: crosshair;
}
```

## Tool Integration

### Drawing Tool Disable/Enable
```typescript
class DrawingToolManager {
  private tools = new Map<string, DrawingTool>();
  private toolsEnabled = true;
  
  enableTools(): void {
    this.toolsEnabled = true;
    this.tools.forEach(tool => tool.enable());
    this.updateCursor('crosshair');
  }
  
  disableAllTools(): void {
    this.toolsEnabled = false;
    this.tools.forEach(tool => tool.disable());
    this.updateCursor('grab');
  }
  
  isToolsEnabled(): boolean {
    return this.toolsEnabled;
  }
  
  private updateCursor(cursor: string): void {
    document.querySelector('.canvas-container')?.setAttribute('style', `cursor: ${cursor}`);
  }
}
```

### Input Handler Mode Awareness
```typescript
class ModeAwareInputHandler {
  private currentMode: ViewportMode = 'draw';
  
  handlePointerDown(e: PointerEvent): void {
    if (this.currentMode === 'zoom') {
      this.handleZoomPointerDown(e);
    } else {
      this.handleDrawPointerDown(e);
    }
  }
  
  private handleZoomPointerDown(e: PointerEvent): void {
    // Start pan operation
    this.panHandler.startPan(e);
  }
  
  private handleDrawPointerDown(e: PointerEvent): void {
    // Pass to active drawing tool
    const coords = this.coordinateMapper.toCanvasCoords(e.clientX, e.clientY);
    this.toolManager.handleToolStart(coords, e);
  }
  
  setMode(mode: ViewportMode): void {
    this.currentMode = mode;
    this.updateEventHandlers();
  }
}
```

## State Preservation

### Zoom State Persistence
```typescript
class ViewportStatePersistence {
  private readonly STORAGE_KEY = 'viewport-zoom-state';
  
  saveZoomState(state: ViewportState): void {
    const stateToSave = {
      scale: state.scale,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
  }
  
  loadZoomState(): ViewportState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Check if state is recent (within 1 hour)
      if (Date.now() - parsed.timestamp > 3600000) {
        return null;
      }
      
      return {
        scale: parsed.scale,
        offsetX: parsed.offsetX,
        offsetY: parsed.offsetY,
        mode: 'draw'
      };
    } catch {
      return null;
    }
  }
}
```

## Implementation Steps

### Step 1: Create Mode Manager
- Implement toggle mode state management
- Add mode change event system
- Create state preservation logic

### Step 2: Update UI Components
- Add toggle button to toolbar
- Implement visual feedback for current mode
- Update cursor styles based on mode

### Step 3: Integrate with Input Handler
- Route events based on current mode
- Disable/enable appropriate interactions
- Maintain clean separation between modes

### Step 4: Tool Integration
- Connect drawing tools with mode state
- Implement tool disable/enable functionality
- Ensure tools respect mode boundaries

## Testing Strategy

### Mode Toggle Tests
- Test rapid mode switching
- Verify state preservation across toggles
- Check UI updates correctly

### Tool Integration Tests
- Verify drawing tools disabled in zoom mode
- Test zoom/pan disabled in draw mode
- Check clean transitions between modes

### State Persistence Tests
- Test zoom state preservation
- Verify state restoration on page reload
- Check edge cases and error handling

### Success Criteria

#### Functional Requirements
- [x] Toggle button switches between zoom and draw modes (ToggleMode.toggle() and ZoomToggleButton component fully implemented)
- [x] Drawing tools properly disabled during zoom mode (InputHandler routes events based on currentMode, disables drawing in zoom mode)
- [x] Zoom/pan interactions disabled during draw mode (Mode-aware event routing prevents zoom/pan in draw mode)
- [x] Zoom state preserved when switching to draw mode (ToggleMode.preserveState() and savedZoomState implementation)
- [x] Clear visual feedback for current mode (ZoomToggleButton provides icons, labels, and visual states)

#### UI Requirements
- [x] Toggle button clearly indicates current mode (Button shows 🔍 for zoom, ✏️ for draw with color-coded states)
- [x] Cursor changes appropriately based on mode (Mode-specific cursor styles: grab/grabbing for zoom, crosshair for draw)
- [x] Smooth transitions between mode states (CSS transitions and React state management provide smooth UX)
- [x] Accessible button with proper ARIA labels (aria-label and keyboard navigation support implemented)
- [x] Consistent visual design with app theme (Tailwind classes with customizable size and styling options)

#### Integration Requirements
- [x] Input handler correctly routes events by mode (InputHandler.setMode() with mode-aware pointer event routing)
- [x] All drawing tools respect mode state (Mode checking in event handlers prevents tool activation in zoom mode)
- [x] No conflicts between zoom and draw interactions (Clean separation through currentMode checks in all event handlers)
- [x] Clean separation of concerns between modes (ToggleMode class manages mode state, InputHandler handles routing, UI components handle display)
- [x] State preservation works reliably across sessions (ViewportStatePersistence with localStorage, validation, and error handling)