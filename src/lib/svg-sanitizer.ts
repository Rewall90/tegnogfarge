import type { SanitizeOptions, SVGValidationResult } from '@/types/coloring'
import {
  DEFAULT_ALLOWED_SVG_TAGS,
  DEFAULT_ALLOWED_SVG_ATTRIBUTES,
  FORBIDDEN_SVG_TAGS,
  FORBIDDEN_SVG_ATTRIBUTES
} from '@/constants/coloring'

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

  // Konfigurer DOMPurify
  const cleanSVG = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: true,
    SANITIZE_NAMED_PROPS: true,
    FORBID_TAGS: FORBIDDEN_SVG_TAGS,
    FORBID_ATTR: FORBIDDEN_SVG_ATTRIBUTES
  })

  // Valider at det er gyldig SVG
  if (!cleanSVG.includes('<svg')) {
    throw new Error('Ugyldig SVG-innhold etter sanitering')
  }

  return cleanSVG
}

export function validateSVGForColoring(svgContent: string): SVGValidationResult {
  const warnings: string[] = []
  
  // Client-side guard
  if (typeof window === 'undefined') {
    return {
      isValid: true,
      hasColorableAreas: true,
      colorableAreasCount: 0,
      warnings: ['Validering kun tilgjengelig på client-side']
    }
  }
  
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    
    // Sjekk for parser-feil
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        isValid: false,
        hasColorableAreas: false,
        colorableAreasCount: 0,
        warnings: ['SVG-koden inneholder syntaksfeil']
      }
    }

    // Sjekk for fargeleggbare områder
    const fillableAreas = doc.querySelectorAll('.fillable-area')
    const colorableAreasCount = fillableAreas.length

    if (colorableAreasCount === 0) {
      warnings.push('Ingen områder funnet med class="fillable-area"')
    }

    // Sjekk for data-region attributter
    const areasWithoutRegion = Array.from(fillableAreas).filter(
      area => !area.getAttribute('data-region')
    ).length

    if (areasWithoutRegion > 0) {
      warnings.push(`${areasWithoutRegion} områder mangler data-region attributt`)
    }

    return {
      isValid: true,
      hasColorableAreas: colorableAreasCount > 0,
      colorableAreasCount,
      warnings
    }
  } catch (error) {
    return {
      isValid: false,
      hasColorableAreas: false,
      colorableAreasCount: 0,
      warnings: ['Kunne ikke validere SVG-innhold']
    }
  }
} 