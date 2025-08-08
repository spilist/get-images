"use client";

import { useTranslation, Trans } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Coffee, ExternalLink, Github, AlertTriangle, Settings, X } from "lucide-react";
import { SettingsDialog } from "@/components/settings-dialog";
import { SearchPanel } from "@/components/search-panel";
import { ImageResultsDisplay } from "@/components/image-results-display";
import { SearchHistoryTrigger } from "@/components/search-history-trigger";
import { useApiKey } from "@/hooks/use-api-key";
import { useImageSearch } from "@/hooks/use-image-search";
import { useImageSelection } from "@/hooks/use-image-selection";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useDemoNotice } from "@/hooks/use-demo-notice";
import { getStoredSearchFilters } from "@/lib/api-key-storage";

export default function Home() {
  const { t } = useTranslation(['common']);
  const { config: apiKeyConfig, updateConfig } = useApiKey();
  const { isLoading, error, results, search, runSampleSearch, currentSearchFilters } = useImageSearch();
  
  // Search history integration
  const handleRerunSearch = async (keywords: string[], searchFilters?: import('@/lib/serpapi.service').SearchFilters) => {
    await search(keywords, apiKeyConfig, searchFilters);
  };
  
  const { history, addToHistory, removeFromHistory, clearHistory, rerunSearch } = useSearchHistory(handleRerunSearch);
  
  const { selectedImages, failedImages, selectImage, handleImageError } = useImageSelection(
    results, 
    addToHistory, 
    currentSearchFilters || undefined
  );
  const { isVisible: isDemoNoticeVisible, closeDemoNotice } = useDemoNotice();

  const handleSearch = async (keywords: string[]) => {
    const searchFilters = getStoredSearchFilters();
    await search(keywords, apiKeyConfig, searchFilters || undefined);
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
              <div className="flex-1 text-left">
                <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('common:homepage.title')}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mb-3">
                  {t('common:homepage.subtitle')} <br />
                  <Trans
                    i18nKey="common:homepage.feedbackText"
                    components={{
                      issueLink: <a href="https://github.com/spilist/get-images/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                    }}
                  />
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Creator info - hidden on mobile, shown on larger screens */}
                <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    <Trans
                      i18nKey="common:homepage.createdBy"
                      components={{
                        authorLink: <a href="https://stdy.blog" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                      }}
                    />
                  </span>
                  <a 
                    href="https://github.com/spilist/get-images" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline transition-colors"
                  >
                    <Github className="h-3 w-3" />
                    {t('common:homepage.github')}
                    <ExternalLink className="h-2 w-2" />
                  </a>
                  <a 
                    href="https://coff.ee/steady.study.dev" 
                    target="_blank" 
                    className="flex items-center gap-1 text-primary hover:underline transition-colors"
                  >
                    <Coffee className="h-3 w-3" />
                    {t('common:homepage.buyMeCoffee')}
                    <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
                <SettingsDialog 
                  onApiKeyChange={updateConfig}
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      data-settings-trigger
                    >
                      <Settings className="h-4 w-4" />
                      {t('common:settings')}
                    </Button>
                  }
                />
              </div>
            </div>
            {/* Mobile creator info - shown only on smaller screens */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground lg:hidden">
              <span className="text-center">
                <Trans
                  i18nKey="common:homepage.createdBy"
                  components={{
                    authorLink: <a href="https://stdy.blog" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                  }}
                />
              </span>
              <a 
                href="https://github.com/spilist/get-images" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('common:homepage.github')}
                <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
              </a>
              <a 
                href="https://coff.ee/steady.study.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('common:homepage.buyMeCoffee')}
                <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
              </a>
            </div>
          </div>
          
          {/* Demo Warning */}
          {isDemoNoticeVisible && (
            <Alert className="mb-4 sm:mb-6 relative" variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-1 pr-8">
                <div>
                  <strong>{t('common:homepage.demoNotice.title')}</strong>{' '}
                  <Trans
                    i18nKey="common:homepage.demoNotice.body"
                    components={{
                      serpapiLink: <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                    }}
                  />
                </div>
                <div>
                  <Trans
                    i18nKey="common:homepage.demoNotice.action"
                    components={{
                      openSettingsButton: (
                        <button
                          onClick={() => document.querySelector<HTMLButtonElement>('[data-settings-trigger]')?.click()}
                          className="text-primary hover:underline font-medium cursor-pointer"
                        />
                      )
                    }}
                  />
                </div>
              </AlertDescription>
              <button
                onClick={closeDemoNotice}
                className="absolute top-2 right-2 p-1 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                aria-label="Close demo notice"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}
          
          {/* Search Section */}
          <Card className="mb-4 sm:mb-6">
            <CardContent>
              <SearchPanel
                isLoading={isLoading}
                onSearch={handleSearch}
                onSample={runSampleSearch}
                selectedImageCount={Object.keys(selectedImages).length}
                onCopy={copyResults}
                apiKeyConfig={apiKeyConfig}
                error={error}
                searchHistoryTrigger={
                  <SearchHistoryTrigger
                    history={history}
                    onRerunSearch={rerunSearch}
                    onRemoveEntry={removeFromHistory}
                    onClearHistory={clearHistory}
                  />
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Image Preview Section - Full Width */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden"> 
        <div className="max-w-7xl mx-auto h-full">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-1">{t('common:homepage.imagePreviewTitle')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('common:homepage.imagePreviewDescription')}</p>
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