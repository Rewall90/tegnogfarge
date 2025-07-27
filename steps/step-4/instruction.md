# Step 4: Remove EraserTool Class

## Location
`src/components/coloring/ColoringApp.tsx`

## Remove Import
Delete this line near the top:
```typescript
import { EraserTool } from './EraserTool'
```

## Remove Ref
Delete this line:
```typescript
const eraserToolRef = useRef<EraserTool | null>(null);
```

## Remove Initialization
In the useEffect that initializes tools, remove:
```typescript
if (!eraserToolRef.current) {
  eraserToolRef.current = new EraserTool(mainCanvas);
}
```

## Remove Tool Syncing
In the useEffect that syncs settings, remove:
```typescript
const eraserTool = eraserToolRef.current;
if (eraserTool) {
  eraserTool.setSize(state.eraserSize);
}
```

## Delete File
Delete the entire file:
```
src/components/coloring/EraserTool.ts
```

## Next Step
[Update Touch Event Handlers](./eraser-step-5-touch-events.md)