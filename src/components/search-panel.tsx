"use client";

import { useState } from "react";
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
}

export function SearchPanel({
  isLoading,
  onSearch,
  onSample,
  selectedImageCount,
  onCopy,
  apiKeyConfig,
  error
}: SearchPanelProps) {
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
    setKeywordsInput("삼계탕\n추어탕\n장어\n전복죽\n콩국수");
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

  return (
    <div className="space-y-4">
      {/* Keywords input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium">Keywords (max 10)</span>
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
                -{duplicateCount} duplicate{duplicateCount > 1 ? 's' : ''}
              </Badge>
            ) : null;
          })()}
          <Badge 
            variant={hasUserKey ? "default" : "secondary"} 
            className="text-xs"
            title={hasUserKey ? "Using your personal SERPAPI key" : "Using environment SERPAPI key"}
          >
            {hasUserKey ? "Personal" : "Env Key"}
          </Badge>
        </div>
        <Textarea
          placeholder="삼계탕&#10;추어탕&#10;김치찌개&#10;된장찌개"
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
          className="flex-1 sm:flex-none sm:w-32"
          size="sm"
        >
          {isLoading ? "Searching..." : "Search Images"}
        </Button>
        <Button 
          onClick={handleSample} 
          disabled={isLoading}
          variant="outline"
          className="flex-1 sm:flex-none sm:w-32"
          size="sm"
        >
          {isLoading ? "Loading..." : "예시 보기"}
        </Button>
        {selectedImageCount > 0 && (
          <Button
            size="sm"
            variant={copyStatus === "success" ? "default" : "outline"}
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-32"
          >
            {copyStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copyStatus === "success" ? "Copied!" : "Copy All"}
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