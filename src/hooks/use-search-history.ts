import { useState, useEffect, useCallback } from 'react';
import { SearchHistoryEntry } from '@/types/api';
import { SearchFilters } from '@/lib/serpapi.service';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory
} from '@/lib/search-history-storage';

export interface UseSearchHistoryReturn {
  history: SearchHistoryEntry[];
  addToHistory: (keywords: string[], selectedImages: { [keyword: string]: { url: string; title: string; } }, searchFilters?: SearchFilters) => void;
  removeFromHistory: (keywords: string[]) => void;
  clearHistory: () => void;
  rerunSearch: (entry: SearchHistoryEntry) => Promise<void>;
}

export function useSearchHistory(
  onRerunSearch?: (keywords: string[], searchFilters?: SearchFilters) => Promise<void>
): UseSearchHistoryReturn {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const addToHistory = useCallback((
    keywords: string[],
    selectedImages: { [keyword: string]: { url: string; title: string; } },
    searchFilters?: SearchFilters
  ) => {
    addToSearchHistory(keywords, selectedImages, searchFilters);
    setHistory(getSearchHistory()); // Refresh state
  }, []);

  const removeFromHistory = useCallback((keywords: string[]) => {
    removeFromSearchHistory(keywords);
    setHistory(getSearchHistory()); // Refresh state
  }, []);

  const clearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  const rerunSearch = useCallback(async (entry: SearchHistoryEntry) => {
    if (onRerunSearch) {
      await onRerunSearch(entry.keywords, entry.searchFilters);
    }
  }, [onRerunSearch]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    rerunSearch
  };
}