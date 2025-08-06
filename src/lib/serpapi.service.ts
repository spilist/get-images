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
  error?: string
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

function parseSerpAPIError(errorMessage: string, userApiKey?: string): string {
  const lowerError = errorMessage.toLowerCase()
  
  // Check for specific SERPAPI error patterns
  if (lowerError.includes('invalid api key') || lowerError.includes('unauthorized')) {
    if (userApiKey) {
      return 'Invalid API key provided. Please check your API key in Settings and ensure it\'s correct. You can get a valid API key from https://serpapi.com/manage-api-key'
    } else {
      return 'Demo API key is invalid or expired. Please open Settings and provide your own SERPAPI key from https://serpapi.com/manage-api-key'
    }
  }
  
  if (lowerError.includes('run out of searches') || lowerError.includes('account has run out')) {
    if (userApiKey) {
      return 'Your API key has run out of searches. Please check your SERPAPI account or upgrade your plan at https://serpapi.com/manage-api-key'
    } else {
      return 'Demo account has run out of searches. Please open Settings and provide your own SERPAPI key to continue using the service.'
    }
  }
  
  if (lowerError.includes('too many requests') || lowerError.includes('rate limit') || lowerError.includes('exceeded hourly limit')) {
    if (userApiKey) {
      return 'Rate limit exceeded for your API key. Please wait a moment and try again, or consider upgrading your SERPAPI plan.'
    } else {
      return 'Demo service rate limit exceeded. Please open Settings and provide your own SERPAPI key for unlimited access.'
    }
  }
  
  if (lowerError.includes('missing') && lowerError.includes('parameter')) {
    return 'Search request is missing required parameters. Please try again with a valid search query.'
  }
  
  if (lowerError.includes('forbidden')) {
    return 'Access forbidden. Your API key may not have permission for this type of search. Please check your SERPAPI account settings.'
  }
  
  if (lowerError.includes('not found') || lowerError.includes('404')) {
    return 'Search resource not found. Please try a different search query.'
  }
  
  if (lowerError.includes('server error') || lowerError.includes('503') || lowerError.includes('500')) {
    return 'SERPAPI server is temporarily unavailable. Please try again in a few moments.'
  }
  
  // Default fallback error message
  if (userApiKey) {
    return `Search failed: ${errorMessage}. Please try again or check your API key in Settings.`
  } else {
    return `Demo search failed: ${errorMessage}. For reliable access, please provide your own SERPAPI key in Settings.`
  }
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
  userApiKey?: string
): Promise<MultipleKeywordsResponse> {
  const limitedKeywords = keywords.slice(0, maxKeywords)
  const results: Record<string, SearchResult> = {}
  
  let hasAnySuccess = false
  let firstError: string | undefined

  // Process keywords sequentially to avoid rate limiting
  for (const keyword of limitedKeywords) {
    const result = await searchImagesWithSerpAPI(keyword, maxResultsPerKeyword, userApiKey)
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
  userApiKey?: string
): Promise<SearchResult> {
  return searchImagesWithSerpAPI(query, maxResults, userApiKey)
}