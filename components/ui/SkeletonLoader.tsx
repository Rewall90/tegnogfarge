import React from 'react'

interface SkeletonLoaderProps {
  className?: string
}

export const ColoringSkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex-1 flex flex-col">
        {/* Verktøylinje skeleton */}
        <div className="bg-white border-b border-gray-200 p-4 flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* SVG Container skeleton */}
        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColoringSkeletonLoader

 