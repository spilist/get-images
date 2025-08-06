"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Search } from "lucide-react";
import { ImageResult, SelectedImages, MultipleKeywordsResponse } from "@/types/api";

interface ImageThumbnailProps {
  image: ImageResult;
  isSelected: boolean;
  onClick: () => void;
  onError: () => void;
}

function ImageThumbnail({ image, isSelected, onClick, onError }: ImageThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
        isSelected
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
        onError={onError}
      />
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary bg-background rounded-full" />
        </div>
      )}
    </button>
  );
}

interface KeywordImageGridProps {
  keyword: string;
  result: {
    success: boolean;
    query: string;
    count: number;
    images: ImageResult[];
    error?: string;
  };
  selectedImages: SelectedImages;
  failedImages: Set<string>;
  onSelectImage: (keyword: string, image: ImageResult) => void;
  onImageError: (imageUrl: string) => void;
}

function KeywordImageGrid({
  keyword,
  result,
  selectedImages,
  failedImages,
  onSelectImage,
  onImageError
}: KeywordImageGridProps) {
  return (
    <div>
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
                <ImageThumbnail
                  key={index}
                  image={image}
                  isSelected={selectedImages[keyword]?.url === image.url}
                  onClick={() => onSelectImage(keyword, image)}
                  onError={() => onImageError(image.url)}
                />
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
  );
}

interface ImageResultsDisplayProps {
  isLoading: boolean;
  results: MultipleKeywordsResponse | null;
  selectedImages: SelectedImages;
  failedImages: Set<string>;
  onSelectImage: (keyword: string, image: ImageResult) => void;
  onImageError: (imageUrl: string) => void;
}

export function ImageResultsDisplay({
  isLoading,
  results,
  selectedImages,
  failedImages,
  onSelectImage,
  onImageError
}: ImageResultsDisplayProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (results) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {Object.entries(results.results).map(([keyword, result]) => (
          <KeywordImageGrid
            key={keyword}
            keyword={keyword}
            result={result}
            selectedImages={selectedImages}
            failedImages={failedImages}
            onSelectImage={onSelectImage}
            onImageError={onImageError}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center text-muted-foreground py-8 sm:py-12">
      <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
      <p className="text-sm sm:text-base">Enter keywords and click search to find images</p>
    </div>
  );
}