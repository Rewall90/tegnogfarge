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
      '#FDB5A6', '#F4A688', '#E8956A', '#DEB887', '#CD853F',
      '#D2691E', '#A0522D', '#8B4513', '#654321', '#3C2414'
    ]
  },
  {
    id: 'reds',
    name: 'Reds',
    displayColor: '#FF0000',
    icon: '🔴',
    colors: [
      '#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000',
      '#FF4500', '#FF6347', '#FA8072', '#E9967A', '#FFA07A'
    ]
  },
  {
    id: 'yellows',
    name: 'Yellows',
    displayColor: '#FFD700',
    icon: '🟡',
    colors: [
      '#FFFF00', '#FFD700', '#FFEB3B', '#FFF59D', '#FFF176',
      '#FFEE58', '#FFEB3B', '#FDD835', '#F9A825', '#F57F17'
    ]
  },
  {
    id: 'blues',
    name: 'Blues',
    displayColor: '#0000FF',
    icon: '🔵',
    colors: [
      '#87CEEB', '#4169E1', '#0000FF', '#0000CD', '#191970',
      '#1E90FF', '#00BFFF', '#87CEFA', '#B0C4DE', '#4682B4'
    ]
  },
  {
    id: 'greens',
    name: 'Greens',
    displayColor: '#00FF00',
    icon: '🟢',
    colors: [
      '#90EE90', '#00FF00', '#32CD32', '#228B22', '#006400',
      '#ADFF2F', '#7FFF00', '#7CFC00', '#00FF7F', '#00FA9A'
    ]
  },
  {
    id: 'purples',
    name: 'Purples',
    displayColor: '#800080',
    icon: '🟣',
    colors: [
      '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2',
      '#9400D3', '#8B008B', '#800080', '#663399', '#4B0082'
    ]
  },
  {
    id: 'neutrals',
    name: 'Neutrals',
    displayColor: '#808080',
    icon: '⚫',
    colors: [
      '#FFFFFF', '#F5F5F5', '#DCDCDC', '#C0C0C0', '#A9A9A9',
      '#808080', '#696969', '#2F4F4F', '#000000', '#8B4513'
    ]
  },
  {
    id: 'brights',
    name: 'Bright Colors',
    displayColor: '#FF00FF',
    icon: '🌈',
    colors: [
      '#FF00FF', '#00FFFF', '#FF4500', '#FF69B4', '#32CD32',
      '#FFD700', '#FF1493', '#00FF7F', '#1E90FF', '#FF6347'
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