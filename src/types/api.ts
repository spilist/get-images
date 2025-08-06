export interface ImageResult {
  url: string;
  title: string;
  source: string;
}

export interface SingleQueryResult {
  success: boolean;
  query: string;
  count: number;
  images: ImageResult[];
  error?: string;
}

export interface MultipleKeywordsRequest {
  keywords: string[];
  max_keywords?: number;
  max_results_per_keyword?: number;
}

export interface MultipleKeywordsResponse {
  success: boolean;
  total_keywords: number;
  results: Record<string, SingleQueryResult>;
}

export interface SelectedImages {
  [keyword: string]: ImageResult;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  results: MultipleKeywordsResponse | null;
  selectedImages: SelectedImages;
}

export interface ApiKeyConfig {
  apiKey: string;
  source: 'environment' | 'user';
  isValid: boolean;
}

export interface ApiKeyState {
  config: ApiKeyConfig | null;
  isLoading: boolean;
  error: string | null;
}