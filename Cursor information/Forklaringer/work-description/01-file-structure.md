# File Structure Setup

## Overview
Create the new directory structure for the CSS Transform-based zoom/pan system. This establishes the foundation for the modular architecture.

## Directory Structure

### Core Viewport System
```
src/core/viewport/
├── ViewportManager.ts          # Central state management (scale, offsetX, offsetY, mode)
├── InputHandler.ts             # Pointer Events API unified input handling
├── RenderingSystem.ts          # CSS transform application and coordination
├── CanvasLayer.ts              # Individual canvas layer management (2550x3300px)
├── types.ts                    # TypeScript interfaces for viewport state
└── constants.ts                # Fixed canvas dimensions and zoom limits
```

### Integration Layer
```
src/integrations/
├── react/
│   ├── useViewport.ts          # React hook for viewport state management
│   └── ViewportProvider.tsx    # Context provider for app-wide viewport access
└── canvas/
    └── CanvasViewport.ts       # Canvas-specific integration layer
```

## File Creation Steps

### Step 1: Create Core Directories
```bash
mkdir -p src/core/viewport
mkdir -p src/integrations/react
mkdir -p src/integrations/canvas
```

### Step 2: Create Type Definitions
Create `src/core/viewport/types.ts`:
```typescript
export interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
  mode: 'zoom' | 'draw';
}

export interface CanvasCoordinates {
  x: number;
  y: number;
}

export interface ScreenCoordinates {
  x: number;
  y: number;
}
```

### Step 3: Create Constants
Create `src/core/viewport/constants.ts`:
```typescript
export const CANVAS_WIDTH = 2550;
export const CANVAS_HEIGHT = 3300;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4.0;
export const DEFAULT_ZOOM = 1.0;
```

### Step 4: Create Placeholder Files
Create empty files with basic structure for:
- `ViewportManager.ts`
- `InputHandler.ts`
- `RenderingSystem.ts`
- `CanvasLayer.ts`
- `useViewport.ts`
- `ViewportProvider.tsx`
- `CanvasViewport.ts`

## File Organization Principles

### Separation of Concerns
- **Core**: Business logic and state management
- **Integrations**: Framework-specific adapters
- **Types**: Shared interfaces and type definitions
- **Constants**: Configuration values

### Dependencies
- Core files have no external dependencies
- Integration files depend only on core
- Clear boundaries between layers
- Easy to test and maintain

### Naming Conventions
- Use descriptive, clear names
- Follow TypeScript conventions
- Group related functionality
- Consistent file extensions

### Success Criteria

#### Directory Structure
- [x] All required directories created successfully (src/core/viewport, src/integrations/react, src/integrations/canvas)
- [x] Directory structure matches specified layout
- [x] Proper nesting and organization
- [x] No conflicting or duplicate folders

#### File Creation
- [x] All placeholder files created (ViewportManager.ts, InputHandler.ts, RenderingSystem.ts, CanvasLayer.ts, useViewport.ts, ViewportProvider.tsx, CanvasViewport.ts)
- [x] Basic TypeScript structure in place
- [x] Types and constants files properly defined (ViewportState, CanvasCoordinates, ScreenCoordinates with proper interfaces)
- [x] Import/export structure ready for implementation

#### Organization Quality
- [x] Clear separation of concerns established (Core business logic separate from React/Canvas integrations)
- [x] Logical grouping of related files (React files in react/, Canvas files in canvas/, Core files in viewport/)
- [x] Consistent naming conventions followed (TypeScript conventions, descriptive names)
- [x] Easy to navigate and understand structure