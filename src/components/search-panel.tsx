"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Search, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApiKeyConfig {
  source: 'user' | 'environment';
  isValid: boolean;
  apiKey?: string;
}

interface SearchPanelProps {
  isLoading: boolean;
  onSearch: (keywords: string[]) => void;
  onSample: () => void;
  selectedImageCount: number;
  onCopy: () => Promise<void>;
  apiKeyConfig: ApiKeyConfig | null;
  error: string | null;
  searchHistoryTrigger?: React.ReactNode;
}

export function SearchPanel({
  isLoading,
  onSearch,
  onSample,
  selectedImageCount,
  onCopy,
  apiKeyConfig,
  error,
  searchHistoryTrigger
}: SearchPanelProps) {
  const { t } = useTranslation(['search', 'common']);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const parseKeywords = (input: string): string[] => {
    const keywords = input
      .trim()
      .split("\n")
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
    
    return [...new Set(keywords)];
  };

  const handleSearch = () => {
    const keywords = parseKeywords(keywordsInput);
    onSearch(keywords);
  };

  const handleSample = () => {
    setKeywordsInput(t('search:sampleKeywords'));
    onSample();
  };

  const handleCopy = async () => {
    try {
      await onCopy();
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const hasUserKey = apiKeyConfig?.source === 'user';

  // Shared button styles for consistency and easier maintenance
  const buttonBaseClasses = "flex-1 sm:flex-none sm:w-32 h-10 sm:h-9 text-sm";

  return (
    <div className="space-y-4">
      {/* Keywords input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">{t('search:keywords')}</span>
          </div>
          {searchHistoryTrigger && (
            <div className="flex-shrink-0">
              {searchHistoryTrigger}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('search:keywordsInstruction')}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {parseKeywords(keywordsInput).length}/10
          </Badge>
          {(() => {
            const rawKeywords = keywordsInput
              .trim()
              .split("\n")
              .map(keyword => keyword.trim())
              .filter(keyword => keyword.length > 0);
            const uniqueKeywords = parseKeywords(keywordsInput);
            const duplicateCount = rawKeywords.length - uniqueKeywords.length;
            
            return duplicateCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                -{duplicateCount} {duplicateCount > 1 ? t('search:duplicates') : t('search:duplicate')}
              </Badge>
            ) : null;
          })()}
          <Badge 
            variant={hasUserKey ? "default" : "secondary"} 
            className="text-xs"
            title={hasUserKey ? t('search:personalKeyTooltip') : t('search:envKeyTooltip')}
          >
            {hasUserKey ? t('search:personalKey') : t('search:envKey')}
          </Badge>
        </div>
        <Textarea
          placeholder={t('search:placeholder')}
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
          className="min-h-16 sm:min-h-20 resize-none text-sm"
        />
      </div>
      
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className={buttonBaseClasses}
        >
          {isLoading ? t('search:loadingResults') : t('search:searchImages')}
        </Button>
        <Button 
          onClick={handleSample} 
          disabled={isLoading}
          variant="outline"
          className={buttonBaseClasses}
        >
          {isLoading ? t('common:loading') : t('search:examples')}
        </Button>
        {selectedImageCount > 0 && (
          <Button
            variant={copyStatus === "success" ? "default" : "outline"}
            onClick={handleCopy}
            className={`${buttonBaseClasses} flex items-center justify-center gap-2`}
          >
            {copyStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copyStatus === "success" ? t('search:copySuccess') : t('search:copyUrls')}
          </Button>
        )}
      </div>
      
      {isLoading && (
        <div className="space-y-2 mt-4">
          <Progress value={33} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Searching for images...
          </p>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {copyStatus === "error" && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to copy to clipboard</AlertDescription>
        </Alert>
      )}
    </div>
  );
}