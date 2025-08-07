import { getJson } from 'serpapi'
import { InMemoryCache, simpleHash } from '@/lib/cache'
import { getValidApiKey } from '@/lib/api-key-usage'

interface ImageResult {
  url: string
  title: string
  source: string
}

interface SearchResult {
  success: boolean
  query: string
  count: number
  images: ImageResult[]
  error?: string
}

interface MultipleKeywordsResponse {
  success: boolean
  total_keywords: number
  results: Record<string, SearchResult>
  error?: string
}

interface SerpAPIImageResult {
  original?: string
  title?: string
  source?: string
  thumbnail?: string
}

// Search filter types
export type LicenseType = 'f' | 'fc' | 'fm' | 'fmc' | 'cl' | 'ol'
export type AspectRatio = 's' | 't' | 'w' | 'xw'
export type ImageSize = 'i' | 'm' | 'l' | 'qsvga' | 'vga' | 'svga' | 'xga' | 'sxga' | 'uxga' | 'qxga' | 'sxga+' | 'wxga' | 'wsxga' | 'wuxga' | 'wqxga' | 'wquxga' | 'whxga' | 'whsxga' | 'whuxga' | '2mp' | '4mp' | '6mp' | '8mp' | '10mp' | '12mp' | '15mp' | '20mp' | '40mp' | '70mp'
export type ImageType = 'face' | 'photo' | 'clipart' | 'lineart' | 'animated'
export type SafeSearch = 'active' | 'off'

export interface SearchFilters {
  engine?: 'google_images' | 'google_images_light'
  licenses?: LicenseType
  hl?: string // Language code
  start_date?: string // YYYYMMDD format
  imgar?: AspectRatio
  imgsz?: ImageSize
  image_type?: ImageType
  safe?: SafeSearch
}

interface SerpAPIResponse {
  error?: string
  images_results?: SerpAPIImageResult[]
  search_information?: {
    image_results_state?: string
  }
  search_parameters?: {
    q?: string
    image_type?: string
    licenses?: string
  }
}

// Simple counter for API key rotation


// Initialize cache for search results
const searchCache = new InMemoryCache<SearchResult>({
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 1000,
  cleanupInterval: 60 * 60 * 1000 // 1 hour cleanup interval
});

// Error pattern mapping for consistent and maintainable error handling
const SERPAPI_ERROR_MAP = [
  {
    patterns: ["hasn't returned any results for this query", "no results found", "fully empty"],
    message: () => 'No images found with the current filters. Try removing some filters (like image type, license, or date restrictions) to get more results.'
  },
  {
    patterns: ["invalid api key", "unauthorized"],
    message: (userApiKey?: string) => userApiKey 
      ? 'Invalid API key provided. Please check your API key in Settings and ensure it\'s correct. You can get a valid API key from https://serpapi.com/manage-api-key'
      : 'Demo API key is invalid or expired. Please open Settings and provide your own SERPAPI key from https://serpapi.com/manage-api-key'
  },
  {
    patterns: ["run out of searches", "account has run out"],
    message: (userApiKey?: string) => userApiKey
      ? 'Your API key has run out of searches. Please check your SERPAPI account or upgrade your plan at https://serpapi.com/manage-api-key'
      : 'Demo account has run out of searches. Please open Settings and provide your own SERPAPI key to continue using the service.'
  },
  {
    patterns: ["too many requests", "rate limit", "exceeded hourly limit"],
    message: (userApiKey?: string) => userApiKey
      ? 'Rate limit exceeded for your API key. Please wait a moment and try again, or consider upgrading your SERPAPI plan.'
      : 'Demo service rate limit exceeded. Please open Settings and provide your own SERPAPI key for unlimited access.'
  },
  {
    patterns: ["missing", "parameter"],
    message: () => 'Search request is missing required parameters. Please try again with a valid search query.'
  },
  {
    patterns: ["forbidden"],
    message: () => 'Access forbidden. Your API key may not have permission for this type of search. Please check your SERPAPI account settings.'
  },
  {
    patterns: ["not found", "404"],
    message: () => 'Search resource not found. Please try a different search query.'
  },
  {
    patterns: ["server error", "503", "500"],
    message: () => 'SERPAPI server is temporarily unavailable. Please try again in a few moments.'
  }
];

async function getEnvironmentApiKey(): Promise<string | undefined> {
  const validApiKey = await getValidApiKey();
  return validApiKey || process.env.SERPAPI_KEY || undefined;
}

function parseSerpAPIError(errorMessage: string, userApiKey?: string): string {
  const lowerError = errorMessage.toLowerCase();
  
  // Find matching error pattern
  for (const errorItem of SERPAPI_ERROR_MAP) {
    const hasMatch = errorItem.patterns.some(pattern => lowerError.includes(pattern));
    if (hasMatch) {
      return errorItem.message(userApiKey);
    }
  }
  
  // Default fallback error message
  if (userApiKey) {
    return `${errorMessage} Please try again or check your API key in Settings.`;
  } else {
    return `${errorMessage} For reliable access, please provide your own SERPAPI key in Settings.`;
  }
}

async function searchImagesWithSerpAPI(query: string, maxResults: number = 3, userApiKey?: string, filters?: SearchFilters): Promise<SearchResult> {
  // Use user-provided API key if available, otherwise fall back to environment keys with rotation
  const apiKey = userApiKey || await getEnvironmentApiKey()
  
  if (!apiKey) {
    return {
      success: false,
      query,
      count: 0,
      images: [],
      error: 'No API key available. Please configure your SERPAPI key in settings or contact administrator.'
    }
  }

  // Generate cache key including filters
  const apiKeyHash = apiKey ? simpleHash(apiKey) : undefined
  const filtersHash = filters ? simpleHash(JSON.stringify(filters)) : undefined
  const cacheKey = InMemoryCache.generateKey(query, maxResults, apiKeyHash, filtersHash)
  
  // Check cache first
  const cachedResult = searchCache.get(cacheKey)
  
  if (cachedResult) {
    console.log(`Cache hit for query: "${query}"`)
    return cachedResult
  }

  try {
    const result = await new Promise<SerpAPIResponse>((resolve, reject) => {
      const searchParams: Record<string, string | number> = {
        engine: filters?.engine || "google_images",
        api_key: apiKey,
        q: query,
        tbm: "isch", // Image search parameter
        num: maxResults,
        safe: filters?.safe || "active"
      }

      // Add optional filters if provided
      if (filters?.licenses) searchParams.licenses = filters.licenses
      if (filters?.hl) searchParams.hl = filters.hl
      if (filters?.start_date) searchParams.start_date = filters.start_date
      if (filters?.imgar) searchParams.imgar = filters.imgar
      if (filters?.imgsz) searchParams.imgsz = filters.imgsz
      if (filters?.image_type) searchParams.image_type = filters.image_type

      getJson(searchParams, (json: SerpAPIResponse) => {
        if (json.error) {
          reject(new Error(json.error))
        } else {
          resolve(json)
        }
      })
    })

    const images: ImageResult[] = []
    
    // Check if results are empty due to filters
    if (result.search_information?.image_results_state === "Fully empty" || 
        (result.error && result.error.toLowerCase().includes("hasn't returned any results"))) {
      return {
        success: false,
        query,
        count: 0,
        images: [],
        error: parseSerpAPIError("No results found with current filters", userApiKey)
      }
    }
    
    if (result.images_results && Array.isArray(result.images_results)) {
      for (const imageResult of result.images_results.slice(0, maxResults)) {
        if (imageResult.original) {
          images.push({
            url: imageResult.original,
            title: imageResult.title || '',
            source: imageResult.source || ''
          })
        } else if (imageResult.thumbnail) {
          images.push({
            url: imageResult.thumbnail,
            title: imageResult.title || '',
            source: imageResult.source || ''
          })
        }
      }
    }

    const searchResult: SearchResult = {
      success: true,
      query,
      count: images.length,
      images
    }

    // Cache successful result
    searchCache.set(cacheKey, searchResult)
    console.log(`Cached result for query: "${query}" with ${images.length} images`)

    return searchResult
  } catch (error) {
    console.error('SerpAPI search error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Search failed'
    
    // Parse SERPAPI specific error messages and provide user-friendly responses
    const userFriendlyError = parseSerpAPIError(errorMessage, userApiKey)
    
    return {
      success: false,
      query,
      count: 0,
      images: [],
      error: userFriendlyError
    }
  }
}

export async function searchMultipleKeywords(
  keywords: string[], 
  maxKeywords: number = 10, 
  maxResultsPerKeyword: number = 3,
  userApiKey?: string,
  filters?: SearchFilters
): Promise<MultipleKeywordsResponse> {
  const limitedKeywords = keywords.slice(0, maxKeywords)
  const results: Record<string, SearchResult> = {}
  
  let hasAnySuccess = false
  let firstError: string | undefined

  // Process keywords sequentially to avoid rate limiting
  for (const keyword of limitedKeywords) {
    const result = await searchImagesWithSerpAPI(keyword, maxResultsPerKeyword, userApiKey, filters)
    results[keyword] = result
    
    if (result.success) {
      hasAnySuccess = true
    } else if (!firstError) {
      // Capture the first error for the overall response
      firstError = result.error
    }
    
    // Add small delay between requests to be respectful to the API
    if (limitedKeywords.indexOf(keyword) < limitedKeywords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // If no searches succeeded, return the error response
  if (!hasAnySuccess && firstError) {
    return {
      success: false,
      total_keywords: limitedKeywords.length,
      results,
      error: firstError
    }
  }

  return {
    success: true,
    total_keywords: limitedKeywords.length,
    results
  }
}

export async function searchSingleKeyword(
  query: string,
  maxResults: number = 3,
  userApiKey?: string,
  filters?: SearchFilters
): Promise<SearchResult> {
  return searchImagesWithSerpAPI(query, maxResults, userApiKey, filters)
}