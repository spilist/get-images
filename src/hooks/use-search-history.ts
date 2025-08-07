import { useState, useEffect, useCallback } from 'react';
import { SearchHistoryEntry } from '@/types/api';
import { SearchFilters } from '@/lib/serpapi.service';
import { SearchFiltersWithLabels } from '@/lib/filter-labels';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory
} from '@/lib/search-history-storage';

export interface UseSearchHistoryReturn {
  history: SearchHistoryEntry[];
  addToHistory: (keywords: string[], selectedImages: { [keyword: string]: { url: string; title: string; } }, searchFilters?: SearchFiltersWithLabels) => void;
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
    try {
      setHistory(getSearchHistory());
    } catch (error) {
      // If storage fails, default to empty array
      console.warn('Failed to load search history:', error);
      setHistory([]);
    }
  }, []);

  const addToHistory = useCallback((
    keywords: string[],
    selectedImages: { [keyword: string]: { url: string; title: string; } },
    searchFilters?: SearchFiltersWithLabels
  ) => {
    try {
      addToSearchHistory(keywords, selectedImages, searchFilters);
      setHistory(getSearchHistory()); // Refresh state
    } catch (error) {
      // If storage operation fails, continue with current state
      console.warn('Failed to add to search history:', error);
    }
  }, []);

  const removeFromHistory = useCallback((keywords: string[]) => {
    try {
      removeFromSearchHistory(keywords);
      setHistory(getSearchHistory()); // Refresh state
    } catch (error) {
      // If storage operation fails, continue with current state
      console.warn('Failed to remove from search history:', error);
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      clearSearchHistory();
      setHistory([]);
    } catch (error) {
      // If storage operation fails, still clear local state
      console.warn('Failed to clear search history from storage:', error);
      setHistory([]);
    }
  }, []);

  const rerunSearch = useCallback(async (entry: SearchHistoryEntry) => {
    if (onRerunSearch) {
      try {
        await onRerunSearch(entry.keywords, entry.searchFilters);
      } catch (error) {
        // Allow the error to propagate to the caller for proper handling
        throw error;
      }
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