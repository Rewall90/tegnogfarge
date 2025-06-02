"use client"
import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

function CanvasErrorFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-red-600 max-w-md mx-auto p-6">
        <p className="text-lg font-semibold mb-2">Noe gikk galt</p>
        <p className="text-sm text-gray-600 mb-4">
          Det oppstod en feil med fargeleggingsverktøyet. 
          Sjekk at nettleseren din støtter Canvas.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Last siden på nytt
        </button>
      </div>
    </div>
  )
}

export function CanvasErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary FallbackComponent={CanvasErrorFallback}>
      {children}
    </ErrorBoundary>
  )
} 