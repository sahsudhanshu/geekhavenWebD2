import React, { createContext, useContext, useState, useCallback } from 'react';
interface FavoritesState { liked: Set<string>; bookmarked: Set<string>; toggleLiked: (id: string, val?: boolean) => void; toggleBookmarked: (id: string, val?: boolean) => void; }
const FavoritesContext = createContext<FavoritesState | null>(null);
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const toggleLiked = useCallback((id: string, val?: boolean) => {
    setLiked(prev => { const n = new Set(prev); const shouldAdd = val === undefined ? !n.has(id) : val; if (shouldAdd) n.add(id); else n.delete(id); return n; });
  }, []);
  const toggleBookmarked = useCallback((id: string, val?: boolean) => {
    setBookmarked(prev => { const n = new Set(prev); const shouldAdd = val === undefined ? !n.has(id) : val; if (shouldAdd) n.add(id); else n.delete(id); return n; });
  }, []);
  return <FavoritesContext.Provider value={{ liked, bookmarked, toggleLiked, toggleBookmarked }}>{children}</FavoritesContext.Provider>;
};
export const useFavorites = () => useContext(FavoritesContext) as FavoritesState;