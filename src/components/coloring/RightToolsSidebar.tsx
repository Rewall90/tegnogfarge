'use client'

interface RightToolsSidebarProps {
  drawingMode?: 'pencil' | 'fill' | 'eraser'
  onDrawingModeChange?: (mode: 'pencil' | 'fill' | 'eraser') => void
  pencilSize?: number
  onPencilSizeChange?: (size: number) => void
  eraserSize?: number
  onEraserSizeChange?: (size: number) => void
  onUndo?: () => void
  onRedo?: () => void
  onReset?: () => void
  onDownload?: () => void
  onToggleZoom?: () => void
  currentMode?: 'draw' | 'zoom'
  canUndo?: boolean
  canRedo?: boolean
  className?: string
}

export default function RightToolsSidebar({
  drawingMode,
  onDrawingModeChange,
  pencilSize,
  onPencilSizeChange,
  eraserSize,
  onEraserSizeChange,
  onUndo,
  onRedo,
  onReset,
  onDownload,
  onToggleZoom,
  currentMode,
  canUndo,
  canRedo,
  className = ""
}: RightToolsSidebarProps) {

  return (
    <div className={`w-full h-full bg-[#FEFAF6] border-l border-gray-200 grid overflow-hidden ${className}`}
         style={{
           display: 'grid',
           gridTemplateRows: 'auto auto auto auto',
           height: '100%'
         }}>
      
      {/* Tool Selection Section */}
      <div className="p-4 border-b border-gray-200 bg-[#FEFAF6]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-600">Verktøy:</label>
        </div>
        <div className="flex flex-col items-center gap-2">
          {/* Pencil Tool */}
          <button
            onClick={() => onDrawingModeChange?.('pencil')}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              drawingMode === 'pencil' 
                ? 'border-blue-600 scale-110' 
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
          >
            <img 
              className="w-full h-full rounded-full" 
              src="/images/pencil-flood-eraser/pencil.png" 
              alt="Pencil tool"
            />
          </button>
          
          {/* Fill Tool */}
          <button
            onClick={() => onDrawingModeChange?.('fill')}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              drawingMode === 'fill' 
                ? 'border-green-600 scale-110' 
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
          >
            <img 
              className="w-full h-full rounded-full" 
              src="/images/pencil-flood-eraser/floodandfill.png" 
              alt="Flood fill tool"
            />
          </button>
          
          {/* Eraser Tool */}
          <button
            onClick={() => onDrawingModeChange?.('eraser')}
            className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
              drawingMode === 'eraser' 
                ? 'border-red-600 scale-110' 
                : 'border-[#E5E7EB] hover:border-gray-300'
            }`}
          >
            <img 
              className="w-full h-full rounded-full" 
              src="/images/pencil-flood-eraser/eraser.png" 
              alt="Eraser tool"
            />
          </button>
        </div>
      </div>

      {/* Action Tools Section */}
      <div className="p-4 border-b border-gray-200 bg-[#FEFAF6]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-600">Handlinger:</label>
        </div>
        <div className="flex flex-col items-center gap-2">
          {/* Zoom Tool */}
          <button 
           onClick={onToggleZoom}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             currentMode === 'zoom'
               ? 'border-blue-600 bg-blue-50 scale-110'
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 10.5H7.5M10.5 7.5V13.5" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Undo */}
          <button 
           onClick={onUndo}
           disabled={!canUndo}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             !canUndo 
               ? 'border-gray-200 opacity-50 cursor-not-allowed' 
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V3H7M21 17V21H17M3 3L9 9M21 21L15 15M9 3H21V15M3 9V21H15" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Redo */}
          <button 
           onClick={onRedo}
           disabled={!canRedo}
           className={`relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer ${
             !canRedo 
               ? 'border-gray-200 opacity-50 cursor-not-allowed' 
               : 'border-[#E5E7EB] hover:border-gray-300'
           }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 7V3H17M3 17V21H7M21 3L15 9M3 21L9 15M15 3H3V15M21 9V21H9" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Download */}
          <button 
           onClick={onDownload}
           className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer border-[#E5E7EB] hover:border-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="#4E5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Reset */}
          <button 
           onClick={onReset}
           className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 border-2 rounded-full cursor-pointer border-[#E5E7EB] hover:border-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M11.6523 21.2334C10.3984 21.2334 9.22363 20.9961 8.12793 20.5215C7.03223 20.0527 6.06543 19.4023 5.22754 18.5703C4.39551 17.7441 3.74512 16.7832 3.27637 15.6875C2.80762 14.5859 2.57324 13.4082 2.57324 12.1543C2.57324 10.9004 2.80762 9.72559 3.27637 8.62988C3.74512 7.52832 4.39551 6.56152 5.22754 5.72949C6.06543 4.89746 7.03223 4.24707 8.12793 3.77832C9.22363 3.30957 10.3984 3.0752 11.6523 3.0752C12.9062 3.0752 14.0811 3.30957 15.1768 3.77832C16.2783 4.24707 17.2451 4.89746 18.0771 5.72949C18.9092 6.56152 19.5596 7.52832 20.0283 8.62988C20.4971 9.72559 20.7314 10.9004 20.7314 12.1543H18.9385C18.9385 11.1465 18.751 10.2031 18.376 9.32422C18.001 8.43945 17.4766 7.66602 16.8027 7.00391C16.1348 6.33594 15.3613 5.81445 14.4824 5.43945C13.6035 5.05859 12.6602 4.86816 11.6523 4.86816C10.6445 4.86816 9.69824 5.05859 8.81348 5.43945C7.93457 5.81445 7.16113 6.33594 6.49316 7.00391C5.83105 7.66602 5.30957 8.43945 4.92871 9.32422C4.55371 10.2031 4.36621 11.1465 4.36621 12.1543C4.36621 13.1621 4.55371 14.1055 4.92871 14.9844C5.30957 15.8633 5.83105 16.6367 6.49316 17.3047C7.16113 17.9727 7.93457 18.4941 8.81348 18.8691C9.69824 19.25 10.6445 19.4404 11.6523 19.4404C12.4375 19.4404 13.1846 19.3232 13.8936 19.0889C14.6025 18.8545 15.2529 18.5264 15.8447 18.1045C16.4424 17.6768 16.9609 17.1729 17.4004 16.5928C17.5762 16.3877 17.7812 16.2588 18.0156 16.2061C18.2559 16.1533 18.4814 16.2031 18.6924 16.3555C18.8975 16.502 19.0146 16.7012 19.0439 16.9531C19.0732 17.2051 18.9912 17.4512 18.7979 17.6914C18.2646 18.4062 17.623 19.0303 16.873 19.5635C16.123 20.0967 15.3027 20.5068 14.4121 20.7939C13.5215 21.0869 12.6016 21.2334 11.6523 21.2334ZM21.6982 10.4141C21.915 10.4141 22.0791 10.4609 22.1904 10.5547C22.3018 10.6484 22.3545 10.7715 22.3486 10.9238C22.3486 11.0762 22.2871 11.2344 22.1641 11.3984L20.1162 14.2373C19.9814 14.4365 19.8174 14.5361 19.624 14.5361C19.4307 14.5303 19.2637 14.4307 19.123 14.2373L17.084 11.3896C16.9668 11.2256 16.9053 11.0703 16.8994 10.9238C16.8994 10.7715 16.9521 10.6484 17.0576 10.5547C17.1631 10.4609 17.3242 10.4141 17.541 10.4141H21.6982Z" fill="#4E5969"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Size Control Section - Basic inline sliders only */}
      <div className="p-4 border-b border-gray-200 bg-[#FEFAF6] flex-1">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-gray-600">Størrelse:</label>
        </div>
        
        {/* Pencil Size Control */}
        {drawingMode === 'pencil' && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">Pensel størrelse: {pencilSize}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={pencilSize || 25}
              onChange={(e) => onPencilSizeChange?.(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Eraser Size Control */}
        {drawingMode === 'eraser' && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">Viskelær størrelse: {eraserSize}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={eraserSize || 10}
              onChange={(e) => onEraserSizeChange?.(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Fill mode info */}
        {drawingMode === 'fill' && (
          <div className="text-xs text-gray-500 text-center">
            Fyll-verktøy krever ikke størrelse innstilling
          </div>
        )}
      </div>
    </div>
  )
}