import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

interface Drawing {
  id: string;
  title: string;
  imageUrl: string;
}

export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Drawing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's favorites
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, fetch favorites from API
      // const response = await fetch('/api/favorites');
      // if (!response.ok) throw new Error('Failed to load favorites');
      // const data = await response.json();
      // setFavorites(data.favorites);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 300));
      setFavorites([
        { id: '1', title: 'Lion', imageUrl: '/images/drawings/lion.png' },
        { id: '2', title: 'Butterfly', imageUrl: '/images/drawings/butterfly.png' },
        { id: '3', title: 'Castle', imageUrl: '/images/drawings/castle.png' },
      ]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(async (drawing: Drawing) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      // In a real application, make API call
      // const response = await fetch('/api/favorites', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ drawingId: drawing.id }),
      // });
      // if (!response.ok) throw new Error('Failed to add favorite');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setFavorites(prev => {
        // Check if it's already in favorites to avoid duplicates
        if (prev.some(fav => fav.id === drawing.id)) {
          return prev;
        }
        return [...prev, drawing];
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
      return false;
    }
  }, [isAuthenticated]);

  const removeFavorite = useCallback(async (drawingId: string) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      // In a real application, make API call
      // const response = await fetch(`/api/favorites/${drawingId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to remove favorite');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== drawingId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
      return false;
    }
  }, [isAuthenticated]);

  const isFavorite = useCallback((drawingId: string) => {
    return favorites.some(fav => fav.id === drawingId);
  }, [favorites]);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
} 