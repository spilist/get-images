"use client";

import { useState } from "react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Copy, Search, AlertCircle, CheckCircle2, Coffee, ExternalLink } from "lucide-react";
import { MultipleKeywordsResponse, ImageResult, SelectedImages, SearchState } from "@/types/api";
import { SettingsDialog } from "@/components/settings-dialog";
import { useApiKey } from "@/hooks/use-api-key";

export default function Home() {
  const [keywordsInput, setKeywordsInput] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    results: null,
    selectedImages: {}
  });
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { config: apiKeyConfig, hasUserKey, updateConfig } = useApiKey();

  const parseKeywords = (input: string): string[] => {
    const keywords = input
      .trim() // Remove leading/trailing whitespace from entire input
      .split("\n")
      .map(keyword => keyword.trim()) // Remove leading/trailing whitespace from each keyword
      .filter(keyword => keyword.length > 0); // Remove empty keywords
    
    // Remove duplicates while preserving order (case-sensitive)
    return [...new Set(keywords)];
  };

  // Sample data generator based on sample-result.txt
  const generateSampleData = (): MultipleKeywordsResponse => {
    const sampleImages = {
      "삼계탕": [
        "https://broken-url-1.example.com/fake.jpg", // 의도적으로 실패하는 URL (첫번째)
        "https://broken-url-2.example.com/fake.jpg", // 의도적으로 실패하는 URL (두번째)
        "https://semie.cooking/image/post/recipe/vw/jh/oijlktse/html/110908259jiko.jpg", // 실제 URL (세번째)
        "https://recipe1.ezmember.co.kr/cache/recipe/2019/03/15/c8f9e0f2f1a2b3c4d5e6f7g8h9i0j1k2.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/1234/samgyetang.jpg"
      ],
      "추어탕": [
        "https://upload.wikimedia.org/wikipedia/commons/d/d8/Chueo-tang.jpg", // 실제 URL (첫번째 성공)
        "https://broken-url-3.example.com/fake.jpg", // 의도적으로 실패하는 URL
        "https://recipe1.ezmember.co.kr/cache/recipe/2018/08/12/chueo_tang_recipe.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/5678/chueo-tang.jpg",
        "https://img.danawa.com/prod_img/500000/789/012/img/chueo_tang_bowl.jpg"
      ],
      "장어": [
        "https://broken-url-4.example.com/fake.jpg", // 의도적으로 실패하는 URL (첫번째)
        "http://www.foodnmed.com/news/photo/202107/20316_6039_621.jpg", // 실제 URL (두번째 성공)
        "https://recipe1.ezmember.co.kr/cache/recipe/2020/06/15/grilled_eel_dish.jpg",
        "https://static.wtable.co.kr/image/production/service/recipe/9012/jangeo-gui.jpg",
        "https://img.danawa.com/prod_img/500000/345/678/img/eel_kabayaki.jpg"
      ],
      "전복죽": [
        "https://recipe1.ezmember.co.kr/cache/recipe/2018/07/10/4258a33b05b7f1db4440cae38585fc851.jpg", // 실제 URL (첫번째 성공)
        "https://broken-url-5.example.com/fake.jpg", // 의도적으로 실패하는 URL
        "https://static.wtable.co.kr/image/production/service/recipe/3456/jeonbok-juk.jpg",
        "https://img.danawa.com/prod_img/500000/901/234/img/abalone_porridge.jpg",
        "https://recipe.zenandcook.com/wp-content/uploads/2020/11/jeonbok-juk-abalone-porridge.jpg"
      ],
      "콩국수": [
        "https://broken-url-6.example.com/fake.jpg", // 의도적으로 실패하는 URL (첫번째)
        "https://broken-url-7.example.com/fake.jpg", // 의도적으로 실패하는 URL (두번째)
        "https://broken-url-8.example.com/fake.jpg", // 의도적으로 실패하는 URL (세번째)
        "https://recipe1.ezmember.co.kr/cache/recipe/2020/07/07/282827708657fd643745ce78da6e3bd31.png", // 실제 URL (네번째 성공)
        "https://static.wtable.co.kr/image/production/service/recipe/7890/kongguksu.jpg"
      ]
    };

    const results: Record<string, { success: boolean; query: string; count: number; images: { url: string; title: string; source: string; }[]; error?: string; }> = {};
    Object.entries(sampleImages).forEach(([keyword, urls]) => {
      results[keyword] = {
        success: true,
        query: keyword,
        count: urls.length,
        images: urls.map((url, index) => ({
          url,
          title: `${keyword} 요리법 ${index + 1}`,
          source: new URL(url).hostname
        })),
        error: undefined
      };
    });

    return {
      success: true,
      total_keywords: Object.keys(sampleImages).length,
      results
    };
  };

  const handleSampleDemo = async () => {
    // Set sample keywords
    setKeywordsInput("삼계탕\n추어탕\n장어\n전복죽\n콩국수");
    
    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));
    setFailedImages(new Set());

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const data = generateSampleData();
      
      // Auto-select first available image for each keyword (simplified approach)
      const defaultSelections: SelectedImages = {};
      
      // Simply select the first image for each keyword - let error handling deal with failures
      Object.entries(data.results).forEach(([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          // Always select the first image initially
          defaultSelections[keyword] = result.images[0];
          console.log(`✅ Auto-selected first image for "${keyword}": ${result.images[0].url}`);
        }
      });
      
      console.log(`📋 Auto-selected ${Object.keys(defaultSelections).length} images out of ${Object.keys(data.results).length} keywords`);

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
        error: err instanceof Error ? err.message : "Demo failed"
      }));
    }
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
    setFailedImages(new Set()); // Clear failed images for new search

    try {
      // Prepare request body with optional API key
      const requestBody: {
        keywords: string[];
        max_results_per_keyword: number;
        api_key?: string;
      } = {
        keywords,
        max_results_per_keyword: 5
      };

      // Include user API key if available and valid
      if (apiKeyConfig?.source === 'user' && apiKeyConfig.isValid && apiKeyConfig.apiKey) {
        requestBody.api_key = apiKeyConfig.apiKey;
      }

      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MultipleKeywordsResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Search failed");
      }

      // Auto-select first available image for each keyword (simplified approach)
      const defaultSelections: SelectedImages = {};
      
      // Simply select the first image for each keyword - let error handling deal with failures
      Object.entries(data.results).forEach(([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          // Always select the first image initially
          defaultSelections[keyword] = result.images[0];
          console.log(`✅ Auto-selected first image for "${keyword}": ${result.images[0].url}`);
        }
      });
      
      console.log(`📋 Auto-selected ${Object.keys(defaultSelections).length} images out of ${Object.keys(data.results).length} keywords`);

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

  const handleImageError = (imageUrl: string) => {
    // Check if this failed image was currently selected, and find replacement
    const currentSelections = searchState.selectedImages;
    const affectedKeyword = Object.entries(currentSelections).find(
      ([, image]) => image.url === imageUrl
    )?.[0];
    
    if (affectedKeyword) {
      console.log(`🔄 Selected image failed for "${affectedKeyword}", finding replacement...`);
      // Find replacement immediately with the failed URL
      findNextAvailableImageWithFailedUrl(affectedKeyword, imageUrl);
    }
    
    // Update failed images state
    setFailedImages(prev => new Set([...prev, imageUrl]));
  };;

  const selectImage = (keyword: string, image: ImageResult) => {
    setSearchState(prev => ({
      ...prev,
      selectedImages: {
        ...prev.selectedImages,
        [keyword]: image
      }
    }));
  };

  // Auto-fallback: if selected image fails, try to find next available one
  const findNextAvailableImage = async (keyword: string) => {
    const result = searchState.results?.results[keyword];
    if (!result?.success || !result.images.length) return;

    // Find the next available image that hasn't failed yet
    const availableImages = result.images.filter(img => !failedImages.has(img.url));
    
    if (availableImages.length > 0) {
      // Simply select the next available image without complex testing
      const nextImage = availableImages[0];
      console.log(`🔄 Auto-fallback: Selecting next available image for "${keyword}": ${nextImage.url}`);
      selectImage(keyword, nextImage);
    } else {
      console.log(`⚠️ No more fallback images available for "${keyword}"`);
    }
  };;
  // New function that takes failed URL as parameter to avoid stale state issues
  const findNextAvailableImageWithFailedUrl = (keyword: string, failedUrl: string) => {
    const result = searchState.results?.results[keyword];
    if (!result?.success || !result.images.length) return;

    // Create a new failed set that includes the current failed URL
    const currentFailedUrls = new Set([...failedImages, failedUrl]);
    
    // Find the next available image that hasn't failed
    const availableImages = result.images.filter(img => !currentFailedUrls.has(img.url));
    
    if (availableImages.length > 0) {
      const nextImage = availableImages[0];
      console.log(`🔄 Immediate fallback: Selecting next available image for "${keyword}": ${nextImage.url}`);
      selectImage(keyword, nextImage);
    } else {
      console.log(`⚠️ No more fallback images available for "${keyword}"`);
    }
  };


;;

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Image Scraper</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mb-3">
                  Search for images using multiple keywords and create your curated list
                </p>
              </div>
              <div className="flex items-start gap-2">
                <SettingsDialog onApiKeyChange={updateConfig} />
              </div>
            </div>
            {/* Mobile-friendly creator info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="text-center">
                Created by <a href="https://stdy.blog" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">배휘동</a>
              </span>
              <a 
                href="https://coff.ee/steady.study.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />
                Buy me a coffee
                <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
              </a>
            </div>
          </div>
          
          {/* Search Section */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="pt-4 sm:pt-6">
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
                
                {/* Buttons - horizontal on mobile, vertical on larger screens */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchState.isLoading}
                    className="flex-1 sm:flex-none sm:w-32"
                    size="sm"
                  >
                    {searchState.isLoading ? "Searching..." : "Search Images"}
                  </Button>
                  <Button 
                    onClick={handleSampleDemo} 
                    disabled={searchState.isLoading}
                    variant="outline"
                    className="flex-1 sm:flex-none sm:w-32"
                    size="sm"
                  >
                    {searchState.isLoading ? "Loading..." : "예시 보기"}
                  </Button>
                  {Object.keys(searchState.selectedImages).length > 0 && (
                    <Button
                      size="sm"
                      variant={copyStatus === "success" ? "default" : "outline"}
                      onClick={copyResults}
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
              </div>
              
              {searchState.isLoading && (
                <div className="space-y-2 mt-4">
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Searching for images...
                  </p>
                </div>
              )}
              {searchState.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Search Error</AlertTitle>
                  <AlertDescription>{searchState.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Image Preview Section - Full Width */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden"> 
        <div className="max-w-7xl mx-auto h-full">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-1">Image Preview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Click to select images (first available one selected automatically)</p>
          </div>
          <div className="h-full overflow-y-auto">
            {searchState.isLoading ? (
              <div className="space-y-4 sm:space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 sm:space-y-3">
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="aspect-square rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchState.results ? (
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(searchState.results.results).map(([keyword, result]) => (
                  <div key={keyword}>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs sm:text-sm">{keyword}</Badge>
                      {result.success ? (
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const availableCount = result.images.filter(image => !failedImages.has(image.url)).length;
                            return `${availableCount} available`;
                          })()}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Failed
                        </Badge>
                      )}
                    </div>
                    
                    {result.success && result.images.length > 0 ? (
                      (() => {
                        const availableImages = result.images.filter(image => !failedImages.has(image.url));
                        return availableImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                            {availableImages.map((image, index) => (
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
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                  onError={() => handleImageError(image.url)}
                                />
                                {searchState.selectedImages[keyword]?.url === image.url && (
                                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary bg-background rounded-full" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4 text-center bg-muted rounded-lg">
                            Images unavailable - all sources failed to load
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4 text-center bg-muted rounded-lg">
                        {result.error || "No images found"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 sm:py-12">
                <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Enter keywords and click search to find images</p>
              </div>
            )}
            
            {copyStatus === "error" && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to copy to clipboard</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}