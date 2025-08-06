import React, { useState } from 'react';
import { SearchHistoryEntry } from '@/types/api';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/search-history-storage';
import { 
  Clock, 
  Search, 
  Trash2, 
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';

export interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onRerunSearch: (entry: SearchHistoryEntry) => Promise<void>;
  onRemoveEntry: (keywords: string[]) => void;
  onClearHistory: () => void;
}

export function SearchHistory({ 
  history, 
  onRerunSearch, 
  onRemoveEntry, 
  onClearHistory 
}: SearchHistoryProps) {
  const [loadingEntryId, setLoadingEntryId] = useState<string | null>(null);
  const [copyingEntryId, setCopyingEntryId] = useState<string | null>(null);

  const handleRerunSearch = async (entry: SearchHistoryEntry) => {
    const entryId = entry.keywords.sort().join('|');
    setLoadingEntryId(entryId);
    try {
      await onRerunSearch(entry);
    } finally {
      setLoadingEntryId(null);
    }
  };

  const handleCopyResults = async (entry: SearchHistoryEntry) => {
    const entryId = entry.keywords.sort().join('|');
    setCopyingEntryId(entryId);
    
    try {
      const results = Object.entries(entry.selectedImages)
        .map(([keyword, image]) => `- ${keyword}: ${image.url}`)
        .join("\n");
      
      await navigator.clipboard.writeText(results);
      
      // Keep the success state for 2 seconds
      setTimeout(() => setCopyingEntryId(null), 2000);
    } catch (error) {
      console.error('Failed to copy results:', error);
      setCopyingEntryId(null);
    }
  };

  const formatFilters = (entry: SearchHistoryEntry) => {
    if (!entry.searchFilters) return [];
    
    const filters = [];
    const { searchFilters } = entry;
    
    if (searchFilters.hl) filters.push(`Language: ${searchFilters.hl}`);
    if (searchFilters.imgar) filters.push(`Aspect: ${searchFilters.imgar}`);
    if (searchFilters.imgsz) filters.push(`Size: ${searchFilters.imgsz}`);
    if (searchFilters.image_type) filters.push(`Type: ${searchFilters.image_type}`);
    if (searchFilters.licenses) filters.push(`License: ${searchFilters.licenses}`);
    if (searchFilters.safe) filters.push(`Safe: ${searchFilters.safe}`);
    if (searchFilters.start_date) {
      const date = searchFilters.start_date;
      const formatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      filters.push(`From: ${formatted}`);
    }
    
    return filters;
  };

  if (history.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Search History</h3>
        <p className="text-sm text-muted-foreground">
          Your recent searches will appear here. Perform a search and select images to build up your history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Search History</h3>
          <span className="text-sm text-muted-foreground">({history.length})</span>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => {
          const entryId = entry.keywords.sort().join('|');
          const isLoading = loadingEntryId === entryId;
          const isCopying = copyingEntryId === entryId;
          const filters = formatFilters(entry);
          const selectedImageCount = Object.keys(entry.selectedImages).length;
          
          return (
            <div
              key={`${entryId}-${index}`}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.keywords.map((keyword, kidx) => (
                      <Badge key={kidx} variant="secondary" className="text-sm px-2 py-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(entry.timestamp)}</span>
                    <span>{selectedImageCount} image{selectedImageCount !== 1 ? 's' : ''} selected</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEntry(entry.keywords)}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Show selected images preview */}
              {selectedImageCount > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {Object.entries(entry.selectedImages).map(([keyword, image]) => (
                    <div key={keyword} className="flex-shrink-0">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('svg')) {
                              parent.innerHTML = '<svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21"/></svg>';
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 truncate w-12" title={keyword}>
                        {keyword}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {filters.map((filter, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyResults(entry)}
                    disabled={selectedImageCount === 0}
                    className="text-xs"
                  >
                    {isCopying ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {isCopying ? 'Copied!' : 'Copy Results'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRerunSearch(entry)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    {isLoading ? 'Searching...' : 'Search Again'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}