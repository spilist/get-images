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
import { Copy, Search, AlertCircle, CheckCircle2 } from "lucide-react";
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
    return input
      .split("\n")
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
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
      
      // Auto-select first available image for each keyword
      const defaultSelections: SelectedImages = {};
      const newFailedImages = new Set<string>();
      
      // Test image availability and auto-select first working image
      const testImagePromises = Object.entries(data.results).map(async ([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          // Test each image until we find one that loads
          for (const image of result.images) {
            try {
              await new Promise<void>((resolve, reject) => {
                const img = document.createElement('img');
                const timeoutId = setTimeout(() => {
                  img.src = ''; // Stop loading
                  reject(new Error('Timeout'));
                }, 3000);
                
                img.onload = () => {
                  clearTimeout(timeoutId);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeoutId);
                  reject(new Error('Load failed'));
                };
                img.src = image.url;
              });
              
              // If we get here, the image loaded successfully
              defaultSelections[keyword] = image;
              console.log(`✅ Auto-selected working image for "${keyword}": ${image.url}`);
              break;
            } catch {
              // Image failed to load, try next one
              newFailedImages.add(image.url);
              console.log(`❌ Image failed for "${keyword}": ${image.url}`);
            }
          }
          
          // If no image worked, log it
          if (!defaultSelections[keyword]) {
            console.log(`⚠️ No working images found for "${keyword}"`);
          }
        }
      });
      
      // Wait for all image tests to complete
      await Promise.allSettled(testImagePromises);
      
      // Update failed images state once with all results
      setFailedImages(newFailedImages);

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

      // Auto-select first available image for each keyword
      const defaultSelections: SelectedImages = {};
      const newFailedImages = new Set<string>();
      
      // Test image availability and auto-select first working image
      const testImagePromises = Object.entries(data.results).map(async ([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          // Test each image until we find one that loads
          for (const image of result.images) {
            try {
              await new Promise<void>((resolve, reject) => {
                const img = document.createElement('img');
                const timeoutId = setTimeout(() => {
                  img.src = ''; // Stop loading
                  reject(new Error('Timeout'));
                }, 3000);
                
                img.onload = () => {
                  clearTimeout(timeoutId);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeoutId);
                  reject(new Error('Load failed'));
                };
                img.src = image.url;
              });
              
              // If we get here, the image loaded successfully
              defaultSelections[keyword] = image;
              console.log(`✅ Auto-selected working image for "${keyword}": ${image.url}`);
              break;
            } catch {
              // Image failed to load, try next one
              newFailedImages.add(image.url);
              console.log(`❌ Image failed for "${keyword}": ${image.url}`);
            }
          }
          
          // If no image worked, log it
          if (!defaultSelections[keyword]) {
            console.log(`⚠️ No working images found for "${keyword}"`);
          }
        }
      });
      
      // Wait for all image tests to complete
      await Promise.allSettled(testImagePromises);
      
      // Update failed images state once with all results
      setFailedImages(newFailedImages);

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
    setFailedImages(prev => new Set([...prev, imageUrl]));
    
    // Check if this failed image was currently selected, and find replacement
    const currentSelections = searchState.selectedImages;
    const affectedKeyword = Object.entries(currentSelections).find(
      ([, image]) => image.url === imageUrl
    )?.[0];
    
    if (affectedKeyword) {
      console.log(`🔄 Selected image failed for "${affectedKeyword}", finding replacement...`);
      // Use a small delay to ensure state is updated
      setTimeout(() => findNextAvailableImage(affectedKeyword), 100);
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

  // Auto-fallback: if selected image fails, try to find next available one
  const findNextAvailableImage = async (keyword: string) => {
    const result = searchState.results?.results[keyword];
    if (!result?.success || !result.images.length) return;

    const availableImages = result.images.filter(img => !failedImages.has(img.url));
    
    for (const image of availableImages) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = document.createElement('img');
          const timeoutId = setTimeout(() => {
            img.src = '';
            reject(new Error('Timeout'));
          }, 2000); // Shorter timeout for fallback
          
          img.onload = () => {
            clearTimeout(timeoutId);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Load failed'));
          };
          img.src = image.url;
        });
        
        // Found a working image, select it
        console.log(`🔄 Auto-fallback: Selected working image for "${keyword}": ${image.url}`);
        selectImage(keyword, image);
        return;
      } catch {
        // This image also failed, mark it and try next
        setFailedImages(prev => new Set([...prev, image.url]));
      }
    }
    
    console.log(`⚠️ No fallback images available for "${keyword}"`);
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <div className="flex justify-between items-start">
              <div></div> {/* Empty div for spacing */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Image Search & Preview</h1>
                <p className="text-muted-foreground">Search for images using multiple keywords and create your curated list</p>
              </div>
              <div className="flex items-start gap-2">
                <SettingsDialog onApiKeyChange={updateConfig} />
              </div>
            </div>
          </div>
          
          {/* Search Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4" />
                    <span className="text-sm font-medium">Keywords (max 10)</span>
                    <Badge variant="outline" className="text-xs">
                      {parseKeywords(keywordsInput).length}/10
                    </Badge>
                    <Badge 
                      variant={hasUserKey ? "default" : "secondary"} 
                      className="text-xs"
                      title={hasUserKey ? "Using your personal SERPAPI key" : "Using environment SERPAPI key"}
                    >
                      {hasUserKey ? "Personal Key" : "Env Key"}
                    </Badge>
                  </div>
                  <Textarea
                    placeholder="삼계탕&#10;추어탕&#10;김치찌개&#10;된장찌개"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-6">
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchState.isLoading}
                    className="w-32"
                  >
                    {searchState.isLoading ? "Searching..." : "Search Images"}
                  </Button>
                  <Button 
                    onClick={handleSampleDemo} 
                    disabled={searchState.isLoading}
                    variant="outline"
                    className="w-32"
                  >
                    {searchState.isLoading ? "Loading..." : "예시 보기"}
                  </Button>
                  {Object.keys(searchState.selectedImages).length > 0 && (
                    <Button
                      size="sm"
                      variant={copyStatus === "success" ? "default" : "outline"}
                      onClick={copyResults}
                      className="flex items-center gap-2 w-32"
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
      <div className="flex-1 p-4 overflow-hidden"> 
        <div className="max-w-7xl mx-auto h-full">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Image Preview</h2>
            <p className="text-sm text-muted-foreground">Click to select images (first available one selected automatically)</p>
          </div>
          <div className="h-full overflow-y-auto">
            {searchState.isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-20" />
                    <div className="grid grid-cols-5 gap-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="aspect-square rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchState.results ? (
              <div className="space-y-8">
                {Object.entries(searchState.results.results).map(([keyword, result]) => (
                  <div key={keyword}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{keyword}</Badge>
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
                          <div className="grid grid-cols-5 gap-3">
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
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
                                  onError={() => handleImageError(image.url)}
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
                            Images unavailable - all sources failed to load
                          </div>
                        );
                      })()
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