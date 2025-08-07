import { SearchHistoryEntry } from '@/types/api';
import { SearchFilters } from './serpapi.service';

const SEARCH_HISTORY_STORAGE_KEY = 'search_history';
const MAX_HISTORY_ENTRIES = 10;

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const history: SearchHistoryEntry[] = JSON.parse(stored);
    
    // Validate the stored data structure
    if (!Array.isArray(history)) return [];
    
    return history.filter(entry => 
      entry && 
      Array.isArray(entry.keywords) && 
      entry.keywords.length > 0 &&
      typeof entry.selectedImages === 'object' &&
      typeof entry.timestamp === 'number'
    );
  } catch (error) {
    console.error('Failed to retrieve search history:', error);
    return [];
  }
}

export function addToSearchHistory(
  keywords: string[],
  selectedImages: { [keyword: string]: { url: string; title: string; } },
  searchFilters?: SearchFilters
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentHistory = getSearchHistory();
    
    // Remove any existing entry with the same keywords combination AND filters
    const keywordsKey = keywords.sort().join('|');
    const filtersKey = searchFilters ? JSON.stringify(searchFilters) : '';
    const combinedKey = `${keywordsKey}:${filtersKey}`;
    
    const filteredHistory = currentHistory.filter(entry => {
      const entryKeywordsKey = entry.keywords.sort().join('|');
      const entryFiltersKey = entry.searchFilters ? JSON.stringify(entry.searchFilters) : '';
      const entryCombinedKey = `${entryKeywordsKey}:${entryFiltersKey}`;
      return entryCombinedKey !== combinedKey;
    });
    
    // Create new entry
    const newEntry: SearchHistoryEntry = {
      keywords,
      selectedImages,
      timestamp: Date.now(),
      searchFilters
    };
    
    // Add to the beginning of the array (most recent first)
    const updatedHistory = [newEntry, ...filteredHistory];
    
    // Keep only the last MAX_HISTORY_ENTRIES
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ENTRIES);
    
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
    
    console.log(`💾 Added to search history: [${keywords.join(', ')}] with ${Object.keys(selectedImages).length} selected images`);
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    console.log('🗑️ Search history cleared');
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

export function removeFromSearchHistory(keywords: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentHistory = getSearchHistory();
    const keywordsKey = keywords.sort().join('|');
    const filteredHistory = currentHistory.filter(
      entry => entry.keywords.sort().join('|') !== keywordsKey
    );
    
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
    console.log(`🗑️ Removed from search history: [${keywords.join(', ')}]`);
  } catch (error) {
    console.error('Failed to remove from search history:', error);
  }
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older entries, show the actual date
  return new Date(timestamp).toLocaleDateString();
}