import { COLOR_THEMES, DEFAULT_THEME_ID, getThemeById, ColorTheme } from './colorConstants';

interface MobileColorPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  onToolsClick: () => void;
  showTools: boolean;
  drawingMode: 'brush' | 'fill' | 'eraser';
  onDrawingModeChange: (mode: 'brush' | 'fill' | 'eraser') => void;
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
}

export function MobileColorPalette({ 
  selectedColor, 
  onColorChange, 
  onUndo, 
  canUndo,
  onToolsClick,
  showTools,
  drawingMode,
  onDrawingModeChange,
  activeThemeId,
  onThemeChange
}: MobileColorPaletteProps) {
  const currentTheme = getThemeById(activeThemeId);
  return (
    <div className={`md:hidden fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg z-50 transition-all duration-300 ${
      showTools ? 'p-4 pb-6' : 'p-4'
    }`}>
      {/* Tools Section - appears above when expanded */}
      <div className={`overflow-hidden transition-all duration-300 ${
        showTools ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'
      }`}>
        <div className="flex justify-center gap-6 py-2">
          <button
            onClick={() => onDrawingModeChange('brush')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              drawingMode === 'brush' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">✏️</span>
            <span className="text-xs">Pensel</span>
          </button>
          
          <button
            onClick={() => onDrawingModeChange('fill')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              drawingMode === 'fill' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🪣</span>
            <span className="text-xs">Fyll</span>
          </button>
          
          <button
            onClick={() => onDrawingModeChange('eraser')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              drawingMode === 'eraser' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🧽</span>
            <span className="text-xs">Viskelær</span>
          </button>
        </div>
      </div>
      
      {/* Main Controls Row */}
      <div className="flex items-center gap-4">
        {/* Tool Button */}
        <button
          onClick={onToolsClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-gray-200 ${
            showTools ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
          aria-label="Toggle tools menu"
        >
          <span className="text-lg">🎨</span>
        </button>
        
        {/* Colors Grid */}
        <div className="flex-1 grid grid-cols-5 gap-3">
          {currentTheme.colors.map((color: string, index: number) => (
            <button
              key={`${activeThemeId}-${index}-${color}`}
              onClick={() => onColorChange(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                selectedColor === color 
                  ? 'border-gray-800 scale-110' 
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 transition-all hover:bg-gray-200 disabled:hover:bg-gray-100"
          aria-label="Undo last action"
        >
          <span className="text-lg">↩️</span>
        </button>
      </div>

      {/* Theme Selector Bar */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                activeThemeId === theme.id 
                  ? 'border-gray-800 scale-110 shadow-md' 
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: theme.displayColor }}
              aria-label={`Select ${theme.name} theme`}
              title={theme.name}
            >
              <span className="text-xs">{theme.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 