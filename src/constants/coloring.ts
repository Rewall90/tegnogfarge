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

// Standard fargepaletter for ColorPalette
export const DEFAULT_COLOR_CATEGORIES = {
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
}; 