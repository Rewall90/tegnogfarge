import React, { useState } from 'react';

interface FavoriteButtonProps {
  initialFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({
  initialFavorited = false,
  onToggle,
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      // Her ville det normalt være en API-kall for å oppdatere favoritt-status
      // For eksempel: await fetch(`/api/favorites/${itemId}`, { method: isFavorited ? 'DELETE' : 'POST' });
      
      const newFavoriteStatus = !isFavorited;
      setIsFavorited(newFavoriteStatus);
      
      // Callback til parent
      if (onToggle) {
        onToggle(newFavoriteStatus);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`focus:outline-none transition-all duration-200 ${className}`}
      aria-label={isFavorited ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${sizeClasses[size]} ${
          isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
} 