# Step 2: Add Background Type State

## Location
`src/components/coloring/ColoringApp.tsx`

## Add State Variable
Near the other state declarations, add:

```typescript
const [backgroundType, setBackgroundType] = useState<string>("none");
```

## Update ColoringState Interface
In the `state` declaration, update to include line tracking:

```typescript
const [state, setState] = useState<ColoringState>({
  // ... existing properties
  prevX: null,    // Add this
  prevY: null,    // Add this
  // ... rest of properties
})
```

## Update Type Definition
In `src/types/canvas-coloring.ts`, add to ColoringState interface:

```typescript
export interface ColoringState {
  // ... existing properties
  prevX: number | null;
  prevY: number | null;
}
```

## What It Does
- Tracks background type for smart erasing
- Stores previous coordinates for line drawing

## Next Step
[Update Mouse Event Handlers](./eraser-step-3-mouse-events.md)