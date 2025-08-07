import { http, HttpResponse } from 'msw'

// SERPAPI response types
interface SerpAPIImageResult {
  position: number
  thumbnail: string
  source: string
  title: string
  link: string
  original?: string
  original_width?: number
  original_height?: number
}

interface SerpAPIResponse {
  images_results?: SerpAPIImageResult[]
  search_metadata?: {
    status: string
    processed_at: string
  }
  error?: string
}

// Mock SERPAPI responses
export const mockSerpAPIResponses = {
  success: (keyword = 'test'): SerpAPIResponse => ({
    images_results: [
      {
        position: 1,
        thumbnail: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT${keyword}1`,
        source: 'example.com',
        title: `${keyword} - Sample Image 1`,
        link: `https://example.com/${keyword}-1.jpg`,
        original: `https://example.com/original/${keyword}-1.jpg`,
        original_width: 800,
        original_height: 600,
      },
      {
        position: 2,
        thumbnail: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT${keyword}2`,
        source: 'test.com',
        title: `${keyword} - Sample Image 2`,
        link: `https://test.com/${keyword}-2.jpg`,
        original: `https://test.com/original/${keyword}-2.jpg`,
        original_width: 1024,
        original_height: 768,
      },
    ],
    search_metadata: {
      status: 'Success',
      processed_at: new Date().toISOString(),
    },
  }),

  exhausted: (): SerpAPIResponse => ({
    error: 'You have reached your monthly search limit. Upgrade your plan or wait until next month.',
  }),

  invalidKey: (): SerpAPIResponse => ({
    error: 'Invalid API key provided. Please check your API key.',
  }),

  rateLimited: (): SerpAPIResponse => ({
    error: 'Rate limit exceeded. Please wait before making another request.',
  }),

  serverError: (): SerpAPIResponse => ({
    error: 'Internal server error. Please try again later.',
  }),

  noResults: (keyword = 'test'): SerpAPIResponse => ({
    images_results: [],
    search_metadata: {
      status: 'Success',
      processed_at: new Date().toISOString(),
    },
  }),
}

// Mock usage API responses
export const mockUsageResponses = {
  success: {
    success: true,
    data: {
      plan: 'Free',
      searches_limit: 100,
      searches_used: 25,
      searches_remaining: 75,
      account_rate_limit_per_hour: 100,
    },
  },

  exhausted: {
    success: true,
    data: {
      plan: 'Free',
      searches_limit: 100,
      searches_used: 100,
      searches_remaining: 0,
      account_rate_limit_per_hour: 100,
    },
  },

  invalidKey: {
    success: false,
    error: 'Invalid API key',
  },
}

// MSW request handlers
export const handlers = [
  // SERPAPI search endpoint
  http.get('https://serpapi.com/search', ({ request }) => {
    const url = new URL(request.url)
    const apiKey = url.searchParams.get('api_key')
    const query = url.searchParams.get('q')
    
    // Handle different API key scenarios
    if (!apiKey) {
      return HttpResponse.json(mockSerpAPIResponses.invalidKey(), { status: 401 })
    }
    
    if (apiKey === 'exhausted-key') {
      return HttpResponse.json(mockSerpAPIResponses.exhausted(), { status: 403 })
    }
    
    if (apiKey === 'invalid-key') {
      return HttpResponse.json(mockSerpAPIResponses.invalidKey(), { status: 401 })
    }
    
    if (apiKey === 'rate-limited-key') {
      return HttpResponse.json(mockSerpAPIResponses.rateLimited(), { status: 429 })
    }
    
    if (apiKey === 'server-error-key') {
      return HttpResponse.json(mockSerpAPIResponses.serverError(), { status: 500 })
    }
    
    if (query === 'no-results') {
      return HttpResponse.json(mockSerpAPIResponses.noResults(query))
    }
    
    // Default successful response
    return HttpResponse.json(mockSerpAPIResponses.success(query || 'test'))
  }),

  // Internal API endpoints
  http.post('/api/scraper', async ({ request }) => {
    const body = await request.json() as any
    const keywords = body.keywords || ['test']
    const apiKey = request.headers.get('X-API-Key') || body.apiKey
    
    if (apiKey === 'exhausted-key') {
      return HttpResponse.json({
        success: false,
        error: 'API key quota exhausted',
        results: {},
      }, { status: 403 })
    }
    
    if (apiKey === 'invalid-key') {
      return HttpResponse.json({
        success: false,
        error: 'Invalid API key',
        results: {},
      }, { status: 401 })
    }
    
    // Simulate successful multi-keyword search
    const results = keywords.reduce((acc: any, keyword: string) => {
      acc[keyword] = {
        keyword,
        success: true,
        results: mockSerpAPIResponses.success(keyword).images_results,
        error: null,
        timestamp: new Date().toISOString(),
      }
      return acc
    }, {})
    
    return HttpResponse.json({
      success: true,
      results,
      message: `Successfully searched for ${keywords.length} keyword(s)`,
    })
  }),

  http.get('/api/usage', ({ request }) => {
    const apiKey = request.headers.get('X-API-Key')
    
    if (apiKey === 'exhausted-key') {
      return HttpResponse.json(mockUsageResponses.exhausted)
    }
    
    if (apiKey === 'invalid-key') {
      return HttpResponse.json(mockUsageResponses.invalidKey, { status: 401 })
    }
    
    return HttpResponse.json(mockUsageResponses.success)
  }),
]

// Handler utilities for tests
export const createSerpAPIHandler = (response: SerpAPIResponse, status = 200) =>
  http.get('https://serpapi.com/search', () => HttpResponse.json(response, { status }))

export const createApiHandler = (endpoint: string, response: any, status = 200) =>
  http.post(endpoint, () => HttpResponse.json(response, { status }))

export const createUsageHandler = (response: any, status = 200) =>
  http.get('/api/usage', () => HttpResponse.json(response, { status }))