// Color theme interface
export interface ColorTheme {
  id: string;
  name: string;
  displayColor: string; // Representative color for theme button
  colors: string[];     // Color variations within this family
  icon: string;         // Emoji icon for theme
}

// Define color family themes
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'skin',
    name: 'Skin Tones',
    displayColor: '#F4A688',
    icon: '🟤',
    colors: [
      '#FFEEDD', '#FFE4CC', '#FFDAB9', '#FFD0A6', '#FFC193',
      '#FFB380', '#F4A460', '#E89654', '#D2691E', '#A0522D'
    ]
  },
  {
    id: 'reds',
    name: 'Reds',
    displayColor: '#FF0000',
    icon: '🔴',
    colors: [
      '#FFE5E5', '#FFCCCC', '#FFB3B3', '#FF9999', '#FF8080',
      '#FF6666', '#FF4D4D', '#FF3333', '#FF1A1A', '#CC0000'
    ]
  },
  {
    id: 'yellows',
    name: 'Yellows',
    displayColor: '#FFD700',
    icon: '🟡',
    colors: [
      '#FFFEF0', '#FFFDE0', '#FFFACD', '#FFF8DC', '#FFFF99',
      '#FFFF66', '#FFFF33', '#FFD700', '#FFC700', '#FFB300'
    ]
  },
  {
    id: 'blues',
    name: 'Blues',
    displayColor: '#0000FF',
    icon: '🔵',
    colors: [
      '#E6F2FF', '#CCDFFF', '#B3D1FF', '#99C2FF', '#80B3FF',
      '#66A3FF', '#4D94FF', '#3385FF', '#1A75FF', '#0066CC'
    ]
  },
  {
    id: 'greens',
    name: 'Greens',
    displayColor: '#00FF00',
    icon: '🟢',
    colors: [
      '#E6FFE6', '#CCFFCC', '#B3FFB3', '#99FF99', '#80FF80',
      '#66FF66', '#4DFF4D', '#33FF33', '#1AFF1A', '#00CC00'
    ]
  },
  {
    id: 'purples',
    name: 'Purples',
    displayColor: '#800080',
    icon: '🟣',
    colors: [
      '#F3E6F3', '#E6CCE6', '#D9B3D9', '#CC99CC', '#BF80BF',
      '#B366B3', '#A64DA6', '#993399', '#8C1A8C', '#800080'
    ]
  },
  {
    id: 'neutrals',
    name: 'Neutrals',
    displayColor: '#808080',
    icon: '⚫',
    colors: [
      '#FFFFFF', '#F2F2F2', '#E6E6E6', '#D9D9D9', '#CCCCCC',
      '#B3B3B3', '#999999', '#808080', '#666666', '#333333'
    ]
  },
  {
    id: 'brights',
    name: 'Bright Colors',
    displayColor: '#FF00FF',
    icon: '🌈',
    colors: [
      '#FF00FF', '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB',
      '#87CEEB', '#00BFFF', '#1E90FF', '#0000FF', '#4B0082'
    ]
  }
];

// Default theme
export const DEFAULT_THEME_ID = 'skin';

// Helper function to get theme by ID
export function getThemeById(id: string): ColorTheme {
  return COLOR_THEMES.find(theme => theme.id === id) || COLOR_THEMES[0];
}

// Legacy export for backward compatibility
export const AVAILABLE_COLORS = COLOR_THEMES[0].colors;
export type AvailableColor = string; 