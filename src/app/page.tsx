"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Coffee, ExternalLink, Github } from "lucide-react";
import { SettingsDialog } from "@/components/settings-dialog";
import { SearchPanel } from "@/components/search-panel";
import { ImageResultsDisplay } from "@/components/image-results-display";
import { useApiKey } from "@/hooks/use-api-key";
import { useImageSearch } from "@/hooks/use-image-search";
import { useImageSelection } from "@/hooks/use-image-selection";

export default function Home() {
  const { config: apiKeyConfig, updateConfig } = useApiKey();
  const { isLoading, error, results, search, runSampleSearch } = useImageSearch();
  const { selectedImages, failedImages, selectImage, handleImageError } = useImageSelection(results);

  const handleSearch = async (keywords: string[]) => {
    const apiKey = apiKeyConfig?.source === 'user' && apiKeyConfig.isValid && apiKeyConfig.apiKey 
      ? apiKeyConfig.apiKey 
      : undefined;
    
    await search(keywords, apiKey);
  };

  const copyResults = async () => {
    const results = Object.entries(selectedImages)
      .map(([keyword, image]) => `- ${keyword}: ${image.url}`)
      .join("\n");

    await navigator.clipboard.writeText(results);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">GetImages</h1>
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
                href="https://github.com/spilist/get-images" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                GitHub
                <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
              </a>
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
              <SearchPanel
                isLoading={isLoading}
                onSearch={handleSearch}
                onSample={runSampleSearch}
                selectedImageCount={Object.keys(selectedImages).length}
                onCopy={copyResults}
                apiKeyConfig={apiKeyConfig}
                error={error}
              />
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
            <ImageResultsDisplay
              isLoading={isLoading}
              results={results}
              selectedImages={selectedImages}
              failedImages={failedImages}
              onSelectImage={selectImage}
              onImageError={handleImageError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}