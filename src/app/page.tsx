"use client";

import { useState } from "react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Copy, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { MultipleKeywordsResponse, ImageResult, SelectedImages, SearchState } from "@/types/api";

export default function Home() {
  const [keywordsInput, setKeywordsInput] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    results: null,
    selectedImages: {}
  });
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const parseKeywords = (input: string): string[] => {
    return input
      .split("\n")
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  };

  const handleSearch = async () => {
    const keywords = parseKeywords(keywordsInput);
    
    if (keywords.length === 0) {
      setSearchState(prev => ({ ...prev, error: "Please enter at least one keyword" }));
      return;
    }
    
    if (keywords.length > 10) {
      setSearchState(prev => ({ ...prev, error: "Maximum 10 keywords allowed" }));
      return;
    }

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          max_results_per_keyword: 3
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MultipleKeywordsResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Search failed");
      }

      // Auto-select first image for each keyword
      const defaultSelections: SelectedImages = {};
      Object.entries(data.results).forEach(([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          defaultSelections[keyword] = result.images[0];
        }
      });

      setSearchState({
        isLoading: false,
        error: null,
        results: data,
        selectedImages: defaultSelections
      });
    } catch (err) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Search failed"
      }));
    }
  };

  const selectImage = (keyword: string, image: ImageResult) => {
    setSearchState(prev => ({
      ...prev,
      selectedImages: {
        ...prev.selectedImages,
        [keyword]: image
      }
    }));
  };

  const copyResults = async () => {
    const results = Object.entries(searchState.selectedImages)
      .map(([keyword, image]) => `- ${keyword}: ${image.url}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(results);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Image Search & Preview</h1>
          <p className="text-muted-foreground">Search for images using multiple keywords and create your curated list</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Keywords
                </CardTitle>
                <CardDescription>
                  Enter keywords, one per line (max 10)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="삼계탕&#10;추어탕&#10;김치찌개&#10;된장찌개"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchState.isLoading}
                    className="flex-1"
                  >
                    {searchState.isLoading ? "Searching..." : "Search Images"}
                  </Button>
                  <Badge variant="outline">
                    {parseKeywords(keywordsInput).length}/10
                  </Badge>
                </div>
                {searchState.isLoading && (
                  <div className="space-y-2">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Searching for images...
                    </p>
                  </div>
                )}
                {searchState.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Search Error</AlertTitle>
                    <AlertDescription>{searchState.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Image Preview */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
                <CardDescription>
                  Click to select images (first one selected by default)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchState.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="aspect-square" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchState.results ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {Object.entries(searchState.results.results).map(([keyword, result]) => (
                      <div key={keyword}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{keyword}</Badge>
                          {result.success ? (
                            <Badge variant="outline" className="text-xs">
                              {result.count} found
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Failed
                            </Badge>
                          )}
                        </div>
                        
                        {result.success && result.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {result.images.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => selectImage(keyword, image)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                  searchState.selectedImages[keyword]?.url === image.url
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <Image
                                  src={image.url}
                                  alt={image.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                                {searchState.selectedImages[keyword]?.url === image.url && (
                                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-primary bg-background rounded-full" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-lg">
                            {result.error || "No images found"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter keywords and click search to find images</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Selected Results */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Selected Results
                  {Object.keys(searchState.selectedImages).length > 0 && (
                    <Button
                      size="sm"
                      variant={copyStatus === "success" ? "default" : "outline"}
                      onClick={copyResults}
                      className="flex items-center gap-2"
                    >
                      {copyStatus === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copyStatus === "success" ? "Copied!" : "Copy All"}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your curated keyword-image pairs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(searchState.selectedImages).length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(searchState.selectedImages).map(([keyword, image]) => (
                      <div key={keyword} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className="shrink-0">{keyword}</Badge>
                        </div>
                        <div className="text-sm font-mono bg-muted p-2 rounded text-xs break-all">
                          {image.url}
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src={image.url}
                            alt={image.title}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f3f4f6'/%3E%3C/svg%3E";
                            }}
                          />
                          <span className="text-xs text-muted-foreground truncate">
                            {image.title || "Untitled"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select images to see your results here</p>
                  </div>
                )}
                
                {copyStatus === "error" && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to copy to clipboard</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
