Hovedidé:
🧩 All input (mus eller touch) transformeres til riktige koordinater i canvas gjennom:
scss
Kopier
Rediger
RAW_INPUT ⟶ getBoundingClientRect() ⟶ fysisk koordinat ⟶ justert for zoomScale og panOffset
🔍 Detaljert forklaring
📌 1. getBoundingClientRect() brukes
Dette gir posisjonen og størrelsen på canvas-elementet i skjermkoordinater.

js
Kopier
Rediger
const rect = canvas.getBoundingClientRect();
📌 2. Canvasens interne oppløsning brukes for å finne skaleringsforhold
Canvas kan f.eks. ha width = 2048, men vises som 512px bred på skjermen.

js
Kopier
Rediger
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
📌 3. Klikkposisjonen omregnes til korrekt canvas-koordinat
Dette gir deg presise koordinater i den native (store) canvasen, ikke den visuelt skalerte:

js
Kopier
Rediger
const rawX = (e.clientX - rect.left) * scaleX;
const rawY = (e.clientY - rect.top) * scaleY;
📌 4. Zoom korrigeres ved å dele med zoomScale
Dette tar høyde for at bruker ser en forstørret (eller forminsket) canvas, og sørger for at koordinatene peker på korrekt sted i den opprinnelige bitmappen.

js
Kopier
Rediger
const correctedX = rawX / zoomScale;
const correctedY = rawY / zoomScale;
🧪 I noen varianter brukes også panOffsetX og panOffsetY:

js
Kopier
Rediger
const x = (rawX - panOffsetX) / zoomScale;
const y = (rawY - panOffsetY) / zoomScale;
📌 5. Flood fill bruker ImageData og disse koordinatene
Flood fill-funksjonen (basert på ImageData.data) bruker koordinatene til å finne pixel-indeksen:

js
Kopier
Rediger
const index = Math.floor(y) * imageData.width + Math.floor(x);
Deretter utføres flood fill fra akkurat denne pikselen.

✅ Resultat
Uansett om:

brukeren har zoomet inn,

scrollet rundt (pan),

bruker touch eller mus,

… så vil ColoringAI alltid vite nøyaktig hvilken piksel du peker på fordi:

🔁 Alle brukerinteraksjoner blir transformert tilbake til:
css
Kopier
Rediger
→ uendret original koordinat i bakgrunnsbilde
📦 Implementasjonsfunksjoner i ColoringAI
De fleste prosjekter har en dedikert funksjon som:

js
Kopier
Rediger
function getTransformedCoordinates(event, canvas, zoomScale, panOffset) { ... }
Eller i React:

ts
Kopier
Rediger
function useTransformedCoordinates(event: MouseEvent | TouchEvent): { x: number, y: number }
Denne funksjonen gjenbrukes av alle verktøy (flood fill, pencil, etc).

## How Zoom Works with Mouse Positioning and Flood Fill

Your coloring app uses a sophisticated coordinate transformation system to handle zoom and ensure accurate flood fill operations. Here's how it works:

### 1. **Coordinate Transformation Pipeline**

The system transforms mouse coordinates through several steps:

```typescript
// Step 1: Get canvas position on screen
const rect = canvas.getBoundingClientRect();

// Step 2: Calculate canvas scaling (canvas internal size vs display size)
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

// Step 3: Convert mouse position to canvas coordinates
const rawX = (e.clientX - rect.left) * scaleX;
const rawY = (e.clientY - rect.top) * scaleY;

// Step 4: Apply zoom correction
const correctedX = rawX / zoomScale;
const correctedY = rawY / zoomScale;
```

### 2. **Key Functions in Your Code**

**For Mouse Events** (`getScaledCoordinates`):
```typescript
const getScaledCoordinates = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY)
  };
};
```

**For Touch Events** (`getScaledCoordinatesFromTouch`):
```typescript
const getScaledCoordinatesFromTouch = (e: TouchEvent, canvas: HTMLCanvasElement, currentZoomScale: number) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: Math.floor((touch.clientX - rect.left) * scaleX / currentZoomScale),
    y: Math.floor((touch.clientY - rect.top) * scaleY / currentZoomScale)
  };
};
```

### 3. **How Flood Fill Works at 150% Zoom**

When you zoom to 150% and click for flood fill:

1. **Mouse Click Position**: `e.clientX = 300, e.clientY = 200`
2. **Canvas Display Size**: `rect.width = 400px, rect.height = 300px`
3. **Canvas Internal Size**: `canvas.width = 800px, canvas.height = 600px`
4. **Zoom Scale**: `zoomScale = 1.5` (150%)

**Step-by-step calculation**:
```typescript
// Step 1: Calculate scaling factors
const scaleX = 800 / 400 = 2.0
const scaleY = 600 / 300 = 2.0

// Step 2: Convert to canvas coordinates (before zoom)
const rawX = (300 - 0) * 2.0 = 600
const rawY = (200 - 0) * 2.0 = 400

// Step 3: Apply zoom correction
const correctedX = 600 / 1.5 = 400
const correctedY = 400 / 1.5 = 267
```

### 4. **Visual Representation**

```
<code_block_to_apply_changes_from>
```

### 5. **CSS Transform vs Canvas Scaling**

Your app uses **CSS transforms** for zoom (not canvas scaling):

```typescript
zoomStyle: { 
  transform: `scale(${zoomScale}) translate(${panState.offsetX}px, ${panState.offsetY}px)`,
  transformOrigin: 'center center'
}
```

This means:
- The canvas internal resolution stays the same
- Only the visual display is scaled
- All coordinate calculations must account for this scaling

### 6. **Flood Fill Implementation**

When flood fill is triggered:

```typescript
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (state.drawingMode === 'fill') {
    const { x, y } = getScaledCoordinates(e, main);
    
    // These coordinates are now correct for the canvas internal size
    const floodFill = new FloodFill(state.imageData, state.tolerance, 50);
    const { imageData: newImageData, changes, region } = floodFill.fill(x, y, state.currentColor);
  }
};
```

### 7. **Why This Works**

The key insight is that **flood fill operates on the canvas's internal pixel data**, not the visual display. By transforming coordinates correctly:

- ✅ Mouse clicks are accurate regardless of zoom level
- ✅ Flood fill fills the correct pixels
- ✅ Performance is maintained (no canvas redrawing)
- ✅ Memory usage stays constant

### 8. **Pan Offset Handling**

When panning is enabled, additional offset calculations are applied:

```typescript
// For touch events with pan
const panOffsetCanvasX = panState.offsetX * scaleX;
const panOffsetCanvasY = panState.offsetY * scaleY;

const x = Math.floor((rawX - panOffsetCanvasX) / zoomScale);
const y = Math.floor((rawY - panOffsetCanvasY) / zoomScale);
```

This ensures that even when the canvas is panned, flood fill still works at the correct position.

The beauty of this system is that it maintains pixel-perfect accuracy while providing smooth zoom and pan functionality, making it feel natural to users while ensuring the underlying flood fill algorithm always operates on the correct coordinates.