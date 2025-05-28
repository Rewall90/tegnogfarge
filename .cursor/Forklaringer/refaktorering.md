# ColorPicker Refaktorering - Implementeringsguide

## 🎯 **Mål**
Flytte `ColorPicker.tsx` til `coloring/`-mappen og omdøpe til `ColorPalette.tsx` for bedre semantikk og mappeorganisering.

## 📋 **Oversikt**

### **Før:**
```
components/
├── ColorPicker.tsx          # ❌ Feil plassering og navn
├── coloring/
│   ├── SVGCanvas.tsx
│   └── ColoringInterface.tsx
```

### **Etter:**
```
components/
├── coloring/
│   ├── ColorPalette.tsx     # ✅ Korrekt plassering og navn
│   ├── SVGCanvas.tsx
│   └── ColoringInterface.tsx
```

---

## 🚀 **Implementering**

### **Steg 1: Opprett ny fil med korrekt innhold**

#### 1.1 Opprett ny fil
**Kommando:**
```bash
# Fra rot av prosjektet
touch components/coloring/ColorPalette.tsx
```

#### 1.2 Kopier og oppdater innhold
**Fil:** `components/coloring/ColorPalette.tsx`

```typescript
'use client'
import React, { useState } from 'react'

interface ColorPaletteProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}

export default function ColorPalette({ 
  onColorSelect, 
  selectedColor, 
  suggestedColors,
  className = ''
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  // Standard fargepalett - organisert i kategorier
  const colorCategories = {
    basic: {
      title: 'Grunnfarger',
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
    },
    skin: {
      title: 'Hudtoner',
      colors: ['#FDBCB4', '#EAA985', '#D1A167', '#B08D57', '#8D6A42', '#654321']
    },
    pastels: {
      title: 'Pastellfarger',
      colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFEFD5']
    },
    neutral: {
      title: 'Nøytrale',
      colors: ['#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969', '#000000']
    }
  }

  return (
    <div className={`w-64 bg-white border-r border-gray-200 h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Fargepalett</h3>
        
        {/* Foreslåtte farger fra Sanity */}
        {suggestedColors && suggestedColors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Foreslåtte farger</h4>
            <div className="grid grid-cols-4 gap-2">
              {suggestedColors.map((color, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedColor === color.hex ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorSelect(color.hex)}
                  title={color.name}
                  aria-label={`Velg farge: ${color.name}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard farger organisert i kategorier */}
        {Object.entries(colorCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{category.title}</h4>
            <div className="grid grid-cols-4 gap-2">
              {category.colors.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedColor === color ? 'border-gray-800 ring-2 ring-blue-300' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={color}
                  aria-label={`Velg farge: ${color}`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Custom color picker */}
        <div className="mb-4">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
          >
            🎨 Egendefinert farge
          </button>
          
          {showCustomPicker && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-full h-12 rounded border cursor-pointer"
                aria-label="Velg egendefinert farge"
              />
              <div className="text-xs text-gray-600 mt-2 text-center font-mono">
                {selectedColor.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Valgt farge display */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2 font-medium">Valgt farge:</div>
          <div 
            className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor: selectedColor }}
            title={selectedColor}
          />
          <div className="text-xs text-gray-600 mt-2 text-center font-mono">
            {selectedColor.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **Steg 2: Oppdater types-fil**

#### 2.1 Legg til types
**Fil:** `src/types/coloring.ts`

**Legg til disse typene:**

```typescript
// Fargepalett komponenet
export interface ColorPaletteProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}

// Fargedata struktur
export interface SuggestedColor {
  name: string
  hex: string
}

// Fargekategori struktur  
export interface ColorCategory {
  title: string
  colors: string[]
}

// Standard fargepaletter
export interface ColorCategories {
  basic: ColorCategory
  skin: ColorCategory
  pastels: ColorCategory
  neutral: ColorCategory
}
```

### **Steg 3: Oppdater ColorPalette.tsx med types**

#### 3.1 Importer types
**Fil:** `components/coloring/ColorPalette.tsx`

**Legg til import øverst:**

```typescript
'use client'
import React, { useState } from 'react'
import type { ColorPaletteProps, ColorCategories } from '@/types/coloring'
```

#### 3.2 Fjern lokal interface
**Fjern interface-definisjon (linje 4-9):**

```typescript
// Fjern denne:
interface ColorPaletteProps {
  onColorSelect: (color: string) => void
  selectedColor: string
  suggestedColors?: Array<{ name: string; hex: string }>
  className?: string
}
```

#### 3.3 Type colorCategories konstant
**Oppdater colorCategories-definisjonen:**

```typescript
// Standard fargepalett - organisert i kategorier
const colorCategories: ColorCategories = {
  basic: {
    title: 'Grunnfarger',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
  },
  skin: {
    title: 'Hudtoner',
    colors: ['#FDBCB4', '#EAA985', '#D1A167', '#B08D57', '#8D6A42', '#654321']
  },
  pastels: {
    title: 'Pastellfarger',
    colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFEFD5']
  },
  neutral: {
    title: 'Nøytrale',
    colors: ['#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969', '#000000']
  }
}
```

### **Steg 4: Oppdater import i ColoringInterface.tsx**

#### 4.1 Endre import
**Fil:** `components/coloring/ColoringInterface.tsx`

**Endre fra (linje 2):**
```typescript
import ColorPalette from '../ColorPicker'
```

**Til:**
```typescript
import ColorPalette from './ColorPalette'
```

### **Steg 5: Opprett constants for farger (valgfritt)**

#### 5.1 Opprett constants-fil for farger
**Fil:** `src/constants/colors.ts`

```typescript
import type { ColorCategories } from '@/types/coloring'

// Standard fargepaletter
export const DEFAULT_COLOR_CATEGORIES: ColorCategories = {
  basic: {
    title: 'Grunnfarger',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
  },
  skin: {
    title: 'Hudtoner',
    colors: ['#FDBCB4', '#EAA985', '#D1A167', '#B08D57', '#8D6A42', '#654321']
  },
  pastels: {
    title: 'Pastellfarger',
    colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFEFD5']
  },
  neutral: {
    title: 'Nøytrale',
    colors: ['#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#696969', '#000000']
  }
}

// Hex-farge validering
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

// Ofte brukte farger
export const COMMON_COLORS = {
  PRIMARY: '#3B82F6',      // Blue-500
  SUCCESS: '#10B981',      // Emerald-500
  WARNING: '#F59E0B',      // Amber-500
  ERROR: '#EF4444',        // Red-500
  INFO: '#6366F1',         // Indigo-500
  TRANSPARENT: 'transparent',
  WHITE: '#FFFFFF',
  BLACK: '#000000'
}

// Accessibility-farger (WCAG compliant)
export const ACCESSIBLE_COLORS = {
  HIGH_CONTRAST_TEXT: '#000000',
  HIGH_CONTRAST_BG: '#FFFFFF',
  FOCUS_RING: '#3B82F6',
  DISABLED: '#9CA3AF'
}
```

#### 5.2 Oppdater ColorPalette.tsx med constants
**Fil:** `components/coloring/ColorPalette.tsx`

**Legg til import:**
```typescript
import { DEFAULT_COLOR_CATEGORIES } from '@/constants/colors'
```

**Erstatt hardkodet colorCategories:**
```typescript
// Fjern hardkodet definisjon og bruk:
const colorCategories = DEFAULT_COLOR_CATEGORIES
```

### **Steg 6: Slett gammel fil**

#### 6.1 Fjern gammel ColorPicker.tsx
**Kommando:**
```bash
# Fra rot av prosjektet
rm components/ColorPicker.tsx
```

### **Steg 7: Verifiser imports**

#### 7.1 Sjekk at ingen filer importerer gammel ColorPicker
**Kommando:**
```bash
# Søk etter gamle imports
grep -r "ColorPicker" components/ src/
grep -r "../ColorPicker" components/ src/
```

**Forventet resultat:** Ingen treff (bortsett fra eventuelle kommentarer).

---

## 🧪 **Testing og verifisering**

### **Steg 1: Kjør linting**
```bash
npm run lint
```
**Forventet:** Ingen feil.

### **Steg 2: Kjør TypeScript-sjekking**
```bash
npx tsc --noEmit
```
**Forventet:** Ingen type-feil.

### **Steg 3: Test kompilering**
```bash
npm run build
```
**Forventet:** Vellykket build.

### **Steg 4: Test funksjonalitet**
```bash
npm run dev
```

**Test følgende:**
1. Gå til `/coloring/[id]` 
2. Fargepaletten vises korrekt
3. Foreslåtte farger fra Sanity vises (hvis tilgjengelig)
4. Fargevalg fungerer
5. Custom color picker fungerer
6. Mobile-responsivitet fungerer

---

## 🔍 **Feilsøking**

### **Problem: Import-feil**
**Symptom:** `Module not found: Can't resolve './ColorPalette'`

**Løsning:**
```bash
# Sjekk at filen eksisterer
ls -la components/coloring/ColorPalette.tsx

# Sjekk import-statement i ColoringInterface.tsx
grep -n "ColorPalette" components/coloring/ColoringInterface.tsx
```

### **Problem: Type-feil**
**Symptom:** `Cannot find name 'ColorPaletteProps'`

**Løsning:**
```typescript
// Sjekk at types er definert i src/types/coloring.ts
// Sjekk at import-statement er korrekt
import type { ColorPaletteProps } from '@/types/coloring'
```

### **Problem: Constants-feil**
**Symptom:** `Cannot find name 'DEFAULT_COLOR_CATEGORIES'`

**Løsning:**
```typescript
// Sjekk at constants-filen eksisterer
// Sjekk import-statement
import { DEFAULT_COLOR_CATEGORIES } from '@/constants/colors'
```

---

## 📊 **Sammendrag av endringer**

### **Filer opprettet:**
- ✅ `components/coloring/ColorPalette.tsx`
- ✅ `src/constants/colors.ts` (valgfritt)

### **Filer oppdatert:**
- ✅ `components/coloring/ColoringInterface.tsx` (import endret)
- ✅ `src/types/coloring.ts` (nye types lagt til)

### **Filer slettet:**
- ✅ `components/ColorPicker.tsx` (flyttet og omdøpt)

### **Forbedringer oppnådd:**
- 🎯 **Bedre semantikk** - Navn reflekterer faktisk funksjon
- 🗂️ **Bedre organisering** - Relatert kode holdes sammen
- 🔧 **Maintainability** - Lettere å finne og vedlikeholde
- 📐 **Type safety** - Bedre typing og constants
- 🚀 **Skalerbarhet** - Åpner for generisk ColorPicker senere

---

## 🎉 **Ferdig!**

Du har nå:
- ✅ Flyttet `ColorPicker` til korrekt mappe
- ✅ Omdøpt til semantisk riktig `ColorPalette`
- ✅ Organisert types og constants
- ✅ Forbedret maintainability og skalerbarhet

Din `components/coloring/`-mappe inneholder nå alle relaterte komponenter på et logisk sted! 🚀