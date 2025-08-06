import React, { useState } from 'react';
import { SearchHistoryEntry } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchHistory } from './search-history';
import { Clock } from 'lucide-react';

export interface SearchHistoryTriggerProps {
  history: SearchHistoryEntry[];
  onRerunSearch: (entry: SearchHistoryEntry) => Promise<void>;
  onRemoveEntry: (keywords: string[]) => void;
  onClearHistory: () => void;
}

export function SearchHistoryTrigger({ 
  history, 
  onRerunSearch, 
  onRemoveEntry, 
  onClearHistory 
}: SearchHistoryTriggerProps) {
  const [open, setOpen] = useState(false);

  const handleRerunSearch = async (entry: SearchHistoryEntry) => {
    await onRerunSearch(entry);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 relative"
          title="Search History"
        >
          <Clock className="h-4 w-4" />
          {history.length > 0 && (
            <>
              <span className="ml-1 text-xs hidden sm:inline">History</span>
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-4">
                {history.length > 9 ? '9+' : history.length}
              </span>
            </>
          )}
          {history.length === 0 && (
            <span className="ml-1 text-xs hidden sm:inline">History</span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search History</DialogTitle>
        </DialogHeader>
        <SearchHistory
          history={history}
          onRerunSearch={handleRerunSearch}
          onRemoveEntry={onRemoveEntry}
          onClearHistory={onClearHistory}
        />
      </DialogContent>
    </Dialog>
  );
}