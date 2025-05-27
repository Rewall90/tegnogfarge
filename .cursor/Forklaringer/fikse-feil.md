# Fikse SVG Fargelegging V2.1 - Identifiserte problemer

Denne guiden tar deg gjennom alle identifiserte problemer og hvordan du fikser dem, rangert etter prioritet.

## 🔥 **Kritisk prioritet**

### 1. Fiks import-path inkonsistens

**Problem:** Inkonsistente import-paths i fargeleggingskomponenter.

**Løsning:**

#### 1.1 Oppdater SVGCanvas.tsx
**Fil:** `components/coloring/SVGCanvas.tsx`

**Endre fra (linje 3-4):**
```typescript
import { sanitizeSVG, validateSVGForColoring } from '../../src/lib/svg-sanitizer'
import { ColoringStorage } from '../../src/lib/coloring-storage'
```

**Til:**
```typescript
import { sanitizeSVG, validateSVGForColoring } from '@/lib/svg-sanitizer'
import { ColoringStorage } from '@/lib/coloring-storage'
```

#### 1.2 Oppdater ColoringInterface.tsx
**Fil:** `components/coloring/ColoringInterface.tsx`

**Endre fra (linje 2):**
```typescript
import ColorPalette from '../ColorPicker'
```

**Til:**
```typescript
import ColorPalette from '@/components/ColorPicker'
```

### 2. Fiks TypeScript typing-inkonsistens

**Problem:** Inkonsistent typing av timeout referanse.

**Løsning:**

#### 2.1 Oppdater SVGCanvas.tsx
**Fil:** `components/coloring/SVGCanvas.tsx`

**Endre fra (linje 45):**
```typescript
const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
```

**Til:**
```typescript
const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
```

**Oppdater også cleanup-logikken (linje 380-384):**
```typescript
useEffect(() => {
  return () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
  }
}, [])
```

## ⚠️ **Høy prioritet**

### 3. Fjern duplikatkode - urlForImage

**Problem:** Samme funksjon definert i flere filer.

**Løsning:**

#### 3.1 Fjern duplikat i blog-siden
**Fil:** `src/app/blog/page.tsx`

**Fjern disse linjene (15-22):**
```typescript
// Funksjon for å bygge url for Sanity-bilder
export function urlForImage(source: any) {
  return source ? `https://cdn.sanity.io/images/fn0kjvlp/production/${source.asset._ref
    .replace('image-', '')
    .replace('-jpg', '.jpg')
    .replace('-png', '.png')
    .replace('-webp', '.webp')}` : '/placeholder.jpg';
}
```

**Legg til import øverst i filen:**
```typescript
import { urlForImage } from '@/lib/sanityImageUrl';
```

#### 3.2 Fjern ubrukt formatDate-funksjon
**Fil:** `src/app/blog/page.tsx`

**Fjern disse linjene (8-14):**
```typescript
// Funksjon for å formatere dato
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
```

### 4. Opprett dedicated types-fil

**Problem:** Types spredt utover flere filer.

**Løsning:**

#### 4.1 Opprett ny fil
**Fil:** `src/types/coloring.ts`

```typescript
// Coloring state interface
export interface ColoringState {
  drawingId: string
  coloredRegions: Record<string, string>
  timestamp: number
  version: string
}

// SVG sanitizer options
export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
}

// SVG validation result
export interface SVGValidationResult {
  isValid: boolean
  hasColorableAreas: boolean
  colorableAreasCount: number
  warnings: string[]
}

// Component props interfaces
export interface SVGCanvasProps {
  drawingId: string
  svgContent: string
  currentColor: string
  onSave?: (svgData: string) => void
  onColorChange?: (coloredRegions: Record<string, string>) => void
}

export interface ColoringInterfaceProps {
  drawingId: string
  title: string
  svgContent: string
  downloadUrl?: string
  suggestedColors?: Array<{ name: string; hex: string }>
  backUrl?: string
}

// Sanity-related types
export interface SanityColoringImage {
  _id: string
  title: string
  description?: string
  svgContent?: string
  hasDigitalColoring: boolean
  suggestedColors?: Array<{ name: string; hex: string }>
  imageUrl?: string
  downloadUrl?: string
  category?: {
    title: string
    slug: string
  }
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  _createdAt: string
  _updatedAt: string
}
```

#### 4.2 Oppdater svg-sanitizer.ts
**Fil:** `src/lib/svg-sanitizer.ts`

**Legg til import øverst:**
```typescript
import type { SanitizeOptions, SVGValidationResult } from '@/types/coloring'
```

**Fjern lokale interface-definisjoner (linje 3-6):**
```typescript
// Fjern denne:
interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
}
```

**Oppdater funksjonssignaturer:**
```typescript
export function validateSVGForColoring(svgContent: string): SVGValidationResult {
  // resten av koden forblir det samme
}
```

#### 4.3 Oppdater coloring-storage.ts
**Fil:** `src/lib/coloring-storage.ts`

**Legg til import øverst:**
```typescript
import type { ColoringState } from '@/types/coloring'
```

**Fjern lokal interface-definisjon (linje 1-6):**
```typescript
// Fjern denne:
interface ColoringState {
  drawingId: string
  coloredRegions: Record<string, string>
  timestamp: number
  version: string
}
```

#### 4.4 Oppdater komponent-filer
**Fil:** `components/coloring/SVGCanvas.tsx`

**Legg til import:**
```typescript
import type { SVGCanvasProps } from '@/types/coloring'
```

**Fjern lokal interface-definisjon (linje 6-12):**
```typescript
// Fjern denne:
interface SVGCanvasProps {
  drawingId: string
  svgContent: string
  currentColor: string
  onSave?: (svgData: string) => void
  onColorChange?: (coloredRegions: Record<string, string>) => void
}
```

**Fil:** `components/coloring/ColoringInterface.tsx`

**Legg til import:**
```typescript
import type { ColoringInterfaceProps } from '@/types/coloring'
```

**Fjern lokal interface-definisjon (linje 6-13).**

### 5. Opprett constants-fil

**Problem:** Magic numbers og strings spredt i koden.

**Løsning:**

#### 5.1 Opprett ny fil
**Fil:** `src/constants/coloring.ts`

```typescript
// LocalStorage konfiguration
export const STORAGE_KEY = 'coloring_auto_save'
export const STORAGE_VERSION = '1.0'
export const MAX_STORAGE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 dager
export const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit

// Auto-save konfiguration
export const AUTO_SAVE_DELAY = 1000 // 1 sekund

// SVG sanitizer konfiguration
export const DEFAULT_ALLOWED_SVG_TAGS = [
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 
  'polygon', 'text', 'tspan', 'defs', 'clipPath', 'mask', 'pattern',
  'linearGradient', 'radialGradient', 'stop', 'use', 'symbol'
]

export const DEFAULT_ALLOWED_SVG_ATTRIBUTES = [
  'class', 'id', 'data-region', 'data-noninteractive',
  'viewBox', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'd', 'points', 'x1', 'y1', 'x2', 'y2', 'transform',
  'opacity', 'fill-opacity', 'stroke-opacity'
]

export const FORBIDDEN_SVG_TAGS = ['script', 'object', 'embed', 'link', 'style']
export const FORBIDDEN_SVG_ATTRIBUTES = [
  'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'style'
]

// Undo stack konfiguration
export const MAX_UNDO_STACK_SIZE = 20

// Canvas konfiguration
export const DEFAULT_CANVAS_SIZE = {
  width: 800,
  height: 600
}
```

#### 5.2 Oppdater coloring-storage.ts
**Fil:** `src/lib/coloring-storage.ts`

**Legg til import øverst:**
```typescript
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_STORAGE_AGE,
  MAX_STORAGE_SIZE
} from '@/constants/coloring'
```

**Fjern konstant-definisjoner (linje 8-11):**
```typescript
// Fjern disse:
const STORAGE_KEY = 'coloring_auto_save'
const STORAGE_VERSION = '1.0'
const MAX_STORAGE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 dager
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit
```

#### 5.3 Oppdater svg-sanitizer.ts
**Fil:** `src/lib/svg-sanitizer.ts`

**Legg til import øverst:**
```typescript
import {
  DEFAULT_ALLOWED_SVG_TAGS,
  DEFAULT_ALLOWED_SVG_ATTRIBUTES,
  FORBIDDEN_SVG_TAGS,
  FORBIDDEN_SVG_ATTRIBUTES
} from '@/constants/coloring'
```

**Erstatt hardkodede arrays (linje 17-35):**
```typescript
// Endre fra:
const defaultAllowedTags = [
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 
  'polygon', 'text', 'tspan', 'defs', 'clipPath', 'mask', 'pattern',
  'linearGradient', 'radialGradient', 'stop', 'use', 'symbol'
]

// Til:
const allowedTags = options.allowedTags || DEFAULT_ALLOWED_SVG_TAGS
const allowedAttributes = options.allowedAttributes || DEFAULT_ALLOWED_SVG_ATTRIBUTES
```

**Oppdater DOMPurify-konfiguration:**
```typescript
const cleanSVG = DOMPurify.sanitize(svgContent, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: allowedAttributes,
  ALLOW_DATA_ATTR: true,
  SANITIZE_NAMED_PROPS: true,
  FORBID_TAGS: FORBIDDEN_SVG_TAGS,
  FORBID_ATTR: FORBIDDEN_SVG_ATTRIBUTES
})
```

#### 5.4 Oppdater SVGCanvas.tsx
**Fil:** `components/coloring/SVGCanvas.tsx`

**Legg til import:**
```typescript
import { AUTO_SAVE_DELAY, MAX_UNDO_STACK_SIZE } from '@/constants/coloring'
```

**Oppdater auto-save delay (linje 67):**
```typescript
autoSaveTimeoutRef.current = setTimeout(() => {
  const success = ColoringStorage.save(drawingId, regions)
  if (!success) {
    console.warn('Auto-save feilet - localStorage kan være full')
  }
}, AUTO_SAVE_DELAY) // I stedet for hardkodet 1000
```

**Oppdater undo stack størrelse (linje 142):**
```typescript
setUndoStack(prev => {
  const newStack = [...prev, { ...coloredRegions }]
  return newStack.slice(-MAX_UNDO_STACK_SIZE) // I stedet for hardkodet -20
})
```

## 📈 **Middels prioritet**

### 6. Legg til error boundaries

**Problem:** Ingen feilhåndtering på komponent-nivå.

**Løsning:**

#### 6.1 Opprett ErrorBoundary-komponent
**Fil:** `components/ui/ErrorBoundary.tsx`

```typescript
'use client'
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ColoringErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ColoringErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600 max-w-md mx-auto p-6">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2">Noe gikk galt</p>
            <p className="text-sm text-gray-600 mb-4">
              Det oppstod en feil med fargeleggingsverktøyet.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Prøv igjen
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Last siden på nytt
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ColoringErrorBoundary
```

#### 6.2 Oppdater ColoringInterface.tsx
**Fil:** `components/coloring/ColoringInterface.tsx`

**Legg til import:**
```typescript
import ColoringErrorBoundary from '@/components/ui/ErrorBoundary'
```

**Wrap SVGCanvas i error boundary (rundt linje 118):**
```typescript
<div className="flex-1 min-h-0">
  <ColoringErrorBoundary>
    <SVGCanvas
      drawingId={drawingId}
      svgContent={svgContent}
      currentColor={currentColor}
      onSave={handleSave}
      onColorChange={handleColorChange}
    />
  </ColoringErrorBoundary>
</div>
```

### 7. Forbedre loading states

**Problem:** Grunnleggende loading spinner.

**Løsning:**

#### 7.1 Opprett skeleton loader
**Fil:** `components/ui/SkeletonLoader.tsx`

```typescript
import React from 'react'

interface SkeletonLoaderProps {
  className?: string
}

export const ColoringSkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex-1 flex flex-col">
        {/* Verktøylinje skeleton */}
        <div className="bg-white border-b border-gray-200 p-4 flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* SVG Container skeleton */}
        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColoringSkeletonLoader
```

#### 7.2 Oppdater SVGCanvas.tsx
**Fil:** `components/coloring/SVGCanvas.tsx`

**Legg til import:**
```typescript
import ColoringSkeletonLoader from '@/components/ui/SkeletonLoader'
```

**Erstatt loading-state (linje 427-435):**
```typescript
if (isLoading) {
  return <ColoringSkeletonLoader />
}
```

### 8. Implementer lazy loading av DOMPurify

**Problem:** DOMPurify lastes alltid, selv på server.

**Løsning:**

#### 8.1 Oppdater svg-sanitizer.ts
**Fil:** `src/lib/svg-sanitizer.ts`

**Erstatt import øverst:**
```typescript
// Fjern:
import DOMPurify from 'isomorphic-dompurify'

// Legg til lazy loading i sanitizeSVG-funksjonen:
export async function sanitizeSVG(svgContent: string, options: SanitizeOptions = {}): Promise<string> {
  // Client-side guard
  if (typeof window === 'undefined') {
    // Server-side: basic validation only
    if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
      throw new Error('Ugyldig SVG-innhold')
    }
    return svgContent
  }

  // Lazy load DOMPurify
  const DOMPurify = await import('isomorphic-dompurify').then(mod => mod.default)

  const allowedTags = options.allowedTags || DEFAULT_ALLOWED_SVG_TAGS
  const allowedAttributes = options.allowedAttributes || DEFAULT_ALLOWED_SVG_ATTRIBUTES

  // Resten av funksjonen forblir det samme...
}
```

#### 8.2 Oppdater SVGCanvas.tsx
**Fil:** `components/coloring/SVGCanvas.tsx`

**Oppdater sanitizedSVG memoization (linje 175-185):**
```typescript
const sanitizedSVG = useMemo(() => {
  if (!svgContent) return Promise.resolve('')
  
  return sanitizeSVG(svgContent).catch(error => {
    console.error('SVG sanitering feilet:', error)
    return ''
  })
}, [svgContent])

// Oppdater useEffect for å håndtere Promise:
useEffect(() => {
  const initializeSVG = async () => {
    const sanitized = await sanitizedSVG
    
    if (!sanitized) {
      setError('Ingen gyldig SVG-innhold')
      setIsLoading(false)
      return
    }

    // Resten av initialiseringslogikken...
  }
  
  initializeSVG()
}, [sanitizedSVG, handleSVGClick, coloredRegions, applyColorsToSVG])
```

## 🔧 **Lav prioritet**

### 9. Forbedre Sanity Schema types

**Problem:** Ikke-eksporterte interfaces i schema.

**Løsning:**

#### 9.1 Oppdater drawingImage.ts
**Fil:** `sanity-schema/drawingImage.ts`

**Fjern lokale interfaces (linje 3-15):**
```typescript
// Fjern disse:
interface ColorPreviewSelection {
  title?: string
  hex?: string
}

interface DrawingPreviewSelection {
  title?: string
  media?: any
  hasDigital?: boolean
  category?: string
  svgContent?: string
}
```

**Erstatt med inline types i preview-funksjonene:**
```typescript
prepare(selection: { title?: string; hex?: string }) {
  // ...
}
```

### 10. Legg til GitHub Actions environment variables

**Problem:** Sanity-konfiguration ikke i CI/CD.

**Løsning:**

#### 10.1 Oppdater GitHub workflow
**Fil:** `.github/workflows/basic-ci.yml`

**Legg til environment-seksjoner i jobber:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
      NEXT_PUBLIC_SANITY_DATASET: ${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
    
    steps:
    # resten av stegene...
```

## ✅ **Verifisering**

Etter at du har implementert alle fikser:

### 1. Kjør linting
```bash
npm run lint
```

### 2. Kjør build
```bash
npm run build
```

### 3. Test fargeleggingsfunksjonalitet
```bash
npm run dev
# Gå til /coloring/[id] og test at alt fungerer
```

### 4. Sjekk imports
```bash
# Søk etter gamle import-paths:
grep -r "../../src/lib/" components/
# Skal returnere ingen resultater
```

### 5. Verifiser types
```bash
npx tsc --noEmit
# Skal ikke ha type-feil
```

## 📋 **Sammendrag av endringer**

- ✅ **7 filer oppdatert** med bedre import-paths
- ✅ **3 nye filer opprettet** (types, constants, error boundary)
- ✅ **2 filer ryddet** for duplikatkode
- ✅ **Async/await pattern** implementert for lazy loading
- ✅ **Error boundaries** lagt til for bedre brukeropplevelse
- ✅ **Constants utskilt** for bedre maintainability
- ✅ **Types samlet** i dedicated fil

**Estimert tid:** 2-3 timer for alle fikser.
**Risiko:** Lav - mest refaktorering og organisering.

---

🎯 **Målet er en mer maintainbar, skalerbar og robust SVG-fargeleggingsapplikasjon!**