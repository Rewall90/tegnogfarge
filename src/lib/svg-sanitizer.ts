import DOMPurify from 'isomorphic-dompurify'

interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
}

export function sanitizeSVG(svgContent: string, options: SanitizeOptions = {}): string {
  // Client-side guard
  if (typeof window === 'undefined') {
    // Server-side: basic validation only
    if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
      throw new Error('Ugyldig SVG-innhold')
    }
    return svgContent
  }

  const defaultAllowedTags = [
    'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 
    'polygon', 'text', 'tspan', 'defs', 'clipPath', 'mask', 'pattern',
    'linearGradient', 'radialGradient', 'stop', 'use', 'symbol'
  ]

  const defaultAllowedAttributes = [
    'class', 'id', 'data-region', 'data-noninteractive',
    'viewBox', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'd', 'points', 'x1', 'y1', 'x2', 'y2', 'transform',
    'opacity', 'fill-opacity', 'stroke-opacity'
  ]

  const allowedTags = options.allowedTags || defaultAllowedTags
  const allowedAttributes = options.allowedAttributes || defaultAllowedAttributes

  // Konfigurer DOMPurify
  const cleanSVG = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: true,
    SANITIZE_NAMED_PROPS: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'style']
  })

  // Valider at det er gyldig SVG
  if (!cleanSVG.includes('<svg')) {
    throw new Error('Ugyldig SVG-innhold etter sanitering')
  }

  return cleanSVG
}

export function validateSVGForColoring(svgContent: string): {
  isValid: boolean
  hasColorableAreas: boolean
  colorableAreasCount: number
  warnings: string[]
} {
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