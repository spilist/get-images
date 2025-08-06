import { getJson } from 'serpapi'
import { InMemoryCache, simpleHash } from '@/lib/cache'

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
}

interface SerpAPIImageResult {
  original?: string
  title?: string
  source?: string
}

interface SerpAPIResponse {
  error?: string
  images_results?: SerpAPIImageResult[]
}

// Simple counter for API key rotation
let apiKeyRotationCounter = 0;

// Initialize cache for search results
const searchCache = new InMemoryCache<SearchResult>({
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 1000,
  cleanupInterval: 60 * 60 * 1000 // 1 hour cleanup interval
});

function getEnvironmentApiKey(): string | undefined {
  const key1 = process.env.SERPAPI_KEY;
  const key2 = process.env.SERPAPI_KEY2;
  
  // If both keys are available, rotate between them
  if (key1 && key2) {
    apiKeyRotationCounter = (apiKeyRotationCounter + 1) % 2;
    return apiKeyRotationCounter === 0 ? key1 : key2;
  }
  
  // Otherwise, return whichever key is available
  return key1 || key2;
}

async function searchImagesWithSerpAPI(query: string, maxResults: number = 3, userApiKey?: string): Promise<SearchResult> {
  // Use user-provided API key if available, otherwise fall back to environment keys with rotation
  const apiKey = userApiKey || getEnvironmentApiKey()
  
  if (!apiKey) {
    return {
      success: false,
      query,
      count: 0,
      images: [],
      error: 'No API key available. Please configure your SERPAPI key in settings or contact administrator.'
    }
  }

  // Generate cache key
  const apiKeyHash = apiKey ? simpleHash(apiKey) : undefined
  const cacheKey = InMemoryCache.generateKey(query, maxResults, apiKeyHash)
  
  // Check cache first
  const cachedResult = searchCache.get(cacheKey)
  if (cachedResult) {
    console.log(`Cache hit for query: "${query}"`)
    return cachedResult
  }

  try {
    const result = await new Promise<SerpAPIResponse>((resolve, reject) => {
      getJson({
        engine: "google",
        api_key: apiKey,
        q: query,
        tbm: "isch", // Image search parameter
        num: maxResults,
        safe: "active"
      }, (json: SerpAPIResponse) => {
        if (json.error) {
          reject(new Error(json.error))
        } else {
          resolve(json)
        }
      })
    })

    const images: ImageResult[] = []
    
    if (result.images_results && Array.isArray(result.images_results)) {
      for (const imageResult of result.images_results.slice(0, maxResults)) {
        if (imageResult.original) {
          images.push({
            url: imageResult.original,
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
    return {
      success: false,
      query,
      count: 0,
      images: [],
      error: error instanceof Error ? error.message : 'Search failed'
    }
  }
}

export async function searchMultipleKeywords(
  keywords: string[], 
  maxKeywords: number = 10, 
  maxResultsPerKeyword: number = 3,
  userApiKey?: string
): Promise<MultipleKeywordsResponse> {
  const limitedKeywords = keywords.slice(0, maxKeywords)
  const results: Record<string, SearchResult> = {}

  // Process keywords sequentially to avoid rate limiting
  for (const keyword of limitedKeywords) {
    results[keyword] = await searchImagesWithSerpAPI(keyword, maxResultsPerKeyword, userApiKey)
    
    // Add small delay between requests to be respectful to the API
    if (limitedKeywords.indexOf(keyword) < limitedKeywords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
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
  userApiKey?: string
): Promise<SearchResult> {
  return searchImagesWithSerpAPI(query, maxResults, userApiKey)
}