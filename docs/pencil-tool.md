# Primary Implementation:

  src/core/viewport/BrushTool.ts
  - This is the main pencil/brush tool implementation
  - Contains all the drawing logic, boundary detection, and line drawing
  - Handles both brush mode and eraser mode
  - Includes black pixel detection for coloring book boundaries
  - Uses Bresenham's algorithm for smooth line drawing

  ## Integration & Management:

  src/core/viewport/DrawingToolManager.ts
  - Manages the BrushTool and other drawing tools
  - Handles tool switching and coordination with viewport system
  - Routes events between UI and tools
  - Integrates with the coordinate system for proper zoom/pan support

  ## UI Integration:

  src/components/coloring/ColoringApp.tsx
  - Initializes and connects the DrawingToolManager
  - Routes mouse/touch events to the tool manager
  - Syncs UI state (color, size, mode) with the BrushTool
  - Handles drawing mode switching (brush/eraser/fill)

## Supporting Files:

  - src/core/viewport/ToolCoordinateHandler.ts - Handles coordinate transformations
  - src/core/viewport/CoordinateSystem.ts - Manages viewport coordinate system
  - src/components/coloring/ToolBar.tsx - UI controls for pencil settings
  - src/components/coloring/MobileToolbar/ - Mobile UI for pencil controls

  The core pencil functionality is primarily in BrushTool.ts, which is managed by
  DrawingToolManager.ts and integrated through ColoringApp.tsx.
