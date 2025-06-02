'use client'

interface ToolBarProps {
  tolerance: number
  onToleranceChange: (tolerance: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onDownload: () => void
}

export default function ToolBar({
  tolerance,
  onToleranceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDownload
}: ToolBarProps) {
 return (
   <div className="bg-white border-b border-gray-200 p-4">
     <div className="flex flex-wrap items-center gap-4">
       {/* Undo/Redo */}
       <div className="flex gap-2">
         <button
           onClick={onUndo}
           disabled={!canUndo}
           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           title="Angre (Ctrl+Z)"
         >
           ↶ Angre
         </button>
         <button
           onClick={onRedo}
           disabled={!canRedo}
           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           title="Gjør om (Ctrl+Y)"
         >
           ↷ Gjør om
         </button>
       </div>

       {/* Tolerance slider */}
       <div className="flex items-center gap-3">
         <label htmlFor="tolerance" className="text-sm font-medium text-gray-700">
           Toleranse:
         </label>
         <input
           id="tolerance"
           type="range"
           min="0"
           max="100"
           value={tolerance}
           onChange={(e) => onToleranceChange(Number(e.target.value))}
           className="w-32"
         />
         <span className="text-sm text-gray-600 w-10">{tolerance}</span>
       </div>

       {/* Reset og Download */}
       <div className="flex gap-2 ml-auto">
         <button
           onClick={onReset}
           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
         >
           ↺ Tilbakestill
         </button>
         <button
           onClick={onDownload}
           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
         >
           ⬇ Last ned
         </button>
       </div>
     </div>
   </div>
 )
} 