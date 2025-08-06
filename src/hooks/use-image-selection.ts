import { useState, useEffect, useCallback } from "react";
import { ImageResult, SelectedImages, MultipleKeywordsResponse } from "@/types/api";

interface UseImageSelectionReturn {
  selectedImages: SelectedImages;
  failedImages: Set<string>;
  selectImage: (keyword: string, image: ImageResult) => void;
  handleImageError: (imageUrl: string) => void;
  clearSelection: () => void;
}

export function useImageSelection(results: MultipleKeywordsResponse | null): UseImageSelectionReturn {
  const [selectedImages, setSelectedImages] = useState<SelectedImages>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Auto-select first available image when new results are set
  useEffect(() => {
    if (results?.results) {
      const defaultSelections: SelectedImages = {};
      
      Object.entries(results.results).forEach(([keyword, result]) => {
        if (result.success && result.images.length > 0) {
          defaultSelections[keyword] = result.images[0];
          console.log(`✅ Auto-selected first image for "${keyword}": ${result.images[0].url}`);
        }
      });
      
      console.log(`📋 Auto-selected ${Object.keys(defaultSelections).length} images out of ${Object.keys(results.results).length} keywords`);
      
      setSelectedImages(defaultSelections);
      setFailedImages(new Set()); // Clear failed images for new search
    }
  }, [results]);

  const selectImage = useCallback((keyword: string, image: ImageResult) => {
    setSelectedImages(prev => ({
      ...prev,
      [keyword]: image
    }));
  }, []);

  const findNextAvailableImage = useCallback((keyword: string, failedUrl: string) => {
    if (!results?.results) return;
    
    const result = results.results[keyword];
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
  }, [results, failedImages, selectImage]);

  const handleImageError = useCallback((imageUrl: string) => {
    // Check if this failed image was currently selected, and find replacement
    const affectedKeyword = Object.entries(selectedImages).find(
      ([, image]) => image.url === imageUrl
    )?.[0];
    
    if (affectedKeyword) {
      console.log(`🔄 Selected image failed for "${affectedKeyword}", finding replacement...`);
      findNextAvailableImage(affectedKeyword, imageUrl);
    }
    
    // Update failed images state
    setFailedImages(prev => new Set([...prev, imageUrl]));
  }, [selectedImages, findNextAvailableImage]);

  const clearSelection = useCallback(() => {
    setSelectedImages({});
    setFailedImages(new Set());
  }, []);

  return {
    selectedImages,
    failedImages,
    selectImage,
    handleImageError,
    clearSelection
  };
}