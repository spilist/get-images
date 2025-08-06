import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

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

async function searchImagesWithSerpAPI(query: string, maxResults: number = 3, userApiKey?: string): Promise<SearchResult> {
  // Use user-provided API key if available, otherwise fall back to environment
  const apiKey = userApiKey || process.env.SERPAPI_KEY
  
  if (!apiKey) {
    return {
      success: false,
      query,
      count: 0,
      images: [],
      error: 'No API key available. Please configure your SERPAPI key in settings or contact administrator.'
    }
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

    return {
      success: true,
      query,
      count: images.length,
      images
    }
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

async function searchMultipleKeywords(
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract user API key from headers or body
    const userApiKey = request.headers.get('X-API-Key') || body.api_key || undefined
    
    // Handle single query
    if ('query' in body) {
      const { query, max_results = 3 } = body
      
      if (!query || typeof query !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'Missing or invalid query parameter'
        }, { status: 400 })
      }

      const result = await searchImagesWithSerpAPI(query, max_results, userApiKey)
      
      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    // Handle multiple keywords
    else if ('keywords' in body) {
      const { 
        keywords, 
        max_keywords = 10, 
        max_results_per_keyword = 3 
      } = body
      
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Keywords must be a non-empty array'
        }, { status: 400 })
      }

      const result = await searchMultipleKeywords(keywords, max_keywords, max_results_per_keyword, userApiKey)
      
      return NextResponse.json(result, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    else {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: query or keywords'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}