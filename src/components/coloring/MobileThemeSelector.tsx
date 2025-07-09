import { COLOR_THEMES } from './colorConstants';

interface MobileThemeSelectorProps {
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
}

export function MobileThemeSelector({ 
  activeThemeId, 
  onThemeChange 
}: MobileThemeSelectorProps) {
  // Create circular color palette for each theme
  const createColorWheel = (theme: any) => {
    // Take first 6 colors for the wheel arrangement
    const colors = theme.colors.slice(0, 6);
    
    return (
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Overlapping color circles arranged in a circular pattern */}
        {colors.map((color: string, index: number) => {
          // Calculate position for circular arrangement
          const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
          const radius = 18; // Distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`${theme.id}-${index}-${color}`}
              className="absolute w-6 h-6 rounded-full border border-white shadow-sm transition-all duration-200"
              style={{
                backgroundColor: color,
                transform: `translate(${x}px, ${y}px)`,
                zIndex: 6 - index, // Stack in order
              }}
            />
          );
        })}
        
        {/* Central selected indicator */}
        {activeThemeId === theme.id && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 bg-blue-50 bg-opacity-20 flex items-center justify-center z-10">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          </div>
        )}
        
        {/* Theme icon in center when not selected */}
        {activeThemeId !== theme.id && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-xs bg-white bg-opacity-80 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {theme.icon}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`flex-shrink-0 transition-all duration-300 hover:scale-105 rounded-2xl p-2 ${
              activeThemeId === theme.id 
                ? 'scale-110 bg-blue-50 shadow-md' 
                : 'hover:bg-gray-50'
            }`}
            aria-label={`Select ${theme.name} theme`}
            title={theme.name}
          >
            {createColorWheel(theme)}
            
            {/* Theme name below the wheel */}
            <div className="mt-2 text-xs text-center text-gray-600 font-medium">
              {theme.name.split(' ')[0]} {/* First word only for space */}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 