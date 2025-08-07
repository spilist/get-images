/**
 * @jest-environment jsdom
 */
import { searchMultipleKeywords, searchSingleKeyword } from '@/lib/serpapi.service'
import { InMemoryCache } from '@/lib/cache'
import * as apiKeyUsage from '@/lib/api-key-usage'

// Mock dependencies
jest.mock('@/lib/api-key-usage', () => ({
  getValidApiKey: jest.fn(),
}))

jest.mock('serpapi', () => ({
  getJson: jest.fn(),
}))

jest.mock('@/lib/cache')

const mockApiKeyUsage = apiKeyUsage as jest.Mocked<typeof apiKeyUsage>
const { getJson } = require('serpapi')

// Mock InMemoryCache
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  size: jest.fn(),
  cleanup: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(InMemoryCache as jest.Mock).mockImplementation(() => mockCache)
  InMemoryCache.generateKey = jest.fn().mockImplementation((...args) => args.join(':'))
  
  // Mock environment variables
  process.env.SERPAPI_KEY = 'env-test-key'
  
  // Suppress console logs for cleaner test output
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
  delete process.env.SERPAPI_KEY
})

describe('SERPAPI Service', () => {
  const mockSerpAPIResponse = {
    images_results: [
      {
        original: 'https://example.com/samgyetang1.jpg',
        title: '삼계탕 - Korean Ginseng Chicken Soup',
        source: 'koreanfood.com',
        thumbnail: 'https://example.com/thumb1.jpg',
      },
      {
        original: 'https://example.com/samgyetang2.jpg',
        title: '집에서 만드는 삼계탕',
        source: 'recipe.co.kr',
        thumbnail: 'https://example.com/thumb2.jpg',
      },
    ],
    search_information: {
      image_results_state: 'Results returned',
    },
  }

  describe('searchSingleKeyword', () => {
    it('should search for single keyword successfully', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('valid-api-key')
      mockCache.get.mockReturnValue(null) // No cache hit
      getJson.mockImplementation((params: any, callback: any) => {
        callback(mockSerpAPIResponse)
      })

      const result = await searchSingleKeyword('삼계탕', 2)

      expect(result.success).toBe(true)
      expect(result.query).toBe('삼계탕')
      expect(result.count).toBe(2)
      expect(result.images).toHaveLength(2)
      expect(result.images[0].url).toBe('https://example.com/samgyetang1.jpg')
      expect(result.images[0].title).toBe('삼계탕 - Korean Ginseng Chicken Soup')
      expect(result.images[0].source).toBe('koreanfood.com')
      expect(result.error).toBeUndefined()
    })

    it('should use user API key when provided', async () => {
      const userApiKey = 'user-provided-key'
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        expect(params.api_key).toBe(userApiKey)
        callback(mockSerpAPIResponse)
      })

      await searchSingleKeyword('삼계탕', 2, userApiKey)

      expect(getJson).toHaveBeenCalledWith(
        expect.objectContaining({
          api_key: userApiKey,
          q: '삼계탕',
          engine: 'google_images',
          tbm: 'isch',
          num: 2,
          safe: 'active',
        }),
        expect.any(Function),
      )
    })

    it('should fall back to environment API key when no user key provided', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('env-fallback-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        expect(params.api_key).toBe('env-fallback-key')
        callback(mockSerpAPIResponse)
      })

      await searchSingleKeyword('삼계탕', 2)

      expect(mockApiKeyUsage.getValidApiKey).toHaveBeenCalled()
    })


    it('should handle search filters correctly', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      
      const searchFilters = {
        image_type: 'photo' as const,
        imgsz: 'l' as const,
        licenses: 'f' as const,
        safe: 'off' as const,
      }

      getJson.mockImplementation((params: any, callback: any) => {
        expect(params.image_type).toBe('photo')
        expect(params.imgsz).toBe('l')
        expect(params.licenses).toBe('f')
        expect(params.safe).toBe('off')
        callback(mockSerpAPIResponse)
      })

      await searchSingleKeyword('삼계탕', 2, undefined, searchFilters)
    })

    it('should handle thumbnail fallback when original URL missing', async () => {
      const responseWithThumbnails = {
        images_results: [
          {
            thumbnail: 'https://example.com/thumb-only1.jpg',
            title: 'Thumbnail Only 1',
            source: 'example.com',
          },
          {
            original: 'https://example.com/original2.jpg',
            thumbnail: 'https://example.com/thumb2.jpg',
            title: 'Has Original 2',
            source: 'test.com',
          },
        ],
      }

      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback(responseWithThumbnails)
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.images[0].url).toBe('https://example.com/thumb-only1.jpg')
      expect(result.images[1].url).toBe('https://example.com/original2.jpg')
    })

    it('should handle API key exhaustion error', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('exhausted-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: 'Account has run out of searches for this month.' })
      })

      const result = await searchSingleKeyword('삼계탕', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Demo account has run out of searches')
      expect(result.images).toHaveLength(0)
    })

    it('should handle invalid API key error', async () => {
      const userApiKey = 'invalid-user-key'
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: 'Invalid API key provided' })
      })

      const result = await searchSingleKeyword('삼계탕', 2, userApiKey)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid API key provided')
      expect(result.error).toContain('check your API key in Settings')
    })

    it('should handle rate limiting error', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('rate-limited-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: 'Too many requests. Rate limit exceeded.' })
      })

      const result = await searchSingleKeyword('삼계탕', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Demo service rate limit exceeded')
    })

    it('should handle no results found', async () => {
      const noResultsResponse = {
        search_information: {
          image_results_state: 'Fully empty',
        },
        images_results: [],
      }

      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback(noResultsResponse)
      })

      const result = await searchSingleKeyword('nonexistent-query', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No images found with the current filters')
      expect(result.images).toHaveLength(0)
    })

    it('should handle missing API key scenario', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue(null)
      delete process.env.SERPAPI_KEY

      const result = await searchSingleKeyword('삼계탕', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No API key available')
      expect(getJson).not.toHaveBeenCalled()
    })

  })

  describe('searchMultipleKeywords', () => {
    beforeEach(() => {
      // Mock delay to speed up tests
      jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
        cb()
        return {} as any
      })
    })

    it('should search multiple keywords successfully', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      
      getJson.mockImplementation((params: any, callback: any) => {
        const query = params.q
        callback({
          images_results: [
            {
              original: `https://example.com/${query}1.jpg`,
              title: `${query} image 1`,
              source: 'example.com',
            },
          ],
        })
      })

      const keywords = ['삼계탕', '김치찌개', '비빔밥']
      const result = await searchMultipleKeywords(keywords, 10, 1)

      expect(result.success).toBe(true)
      expect(result.total_keywords).toBe(3)
      expect(Object.keys(result.results)).toHaveLength(3)
      expect(result.results['삼계탕'].success).toBe(true)
      expect(result.results['김치찌개'].success).toBe(true)
      expect(result.results['비빔밥'].success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should limit keywords to maxKeywords parameter', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback(mockSerpAPIResponse)
      })

      const keywords = ['k1', 'k2', 'k3', 'k4', 'k5']
      const result = await searchMultipleKeywords(keywords, 3, 1)

      expect(result.total_keywords).toBe(3)
      expect(Object.keys(result.results)).toHaveLength(3)
      expect(result.results).toHaveProperty('k1')
      expect(result.results).toHaveProperty('k2')
      expect(result.results).toHaveProperty('k3')
      expect(result.results).not.toHaveProperty('k4')
      expect(result.results).not.toHaveProperty('k5')
    })

    it('should handle mixed success and failure results', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      
      getJson.mockImplementation((params: any, callback: any) => {
        if (params.q === 'failing-keyword') {
          callback({ error: 'No results found for this query' })
        } else {
          callback(mockSerpAPIResponse)
        }
      })

      const keywords = ['삼계탕', 'failing-keyword', '비빔밥']
      const result = await searchMultipleKeywords(keywords, 10, 1)

      expect(result.success).toBe(true) // Overall success because some keywords succeeded
      expect(result.total_keywords).toBe(3)
      expect(result.results['삼계탕'].success).toBe(true)
      expect(result.results['failing-keyword'].success).toBe(false)
      expect(result.results['비빔밥'].success).toBe(true)
    })


    it('should add delays between API requests', async () => {
      const realSetTimeout = global.setTimeout
      const mockSetTimeout = jest.fn().mockImplementation((cb: any) => {
        cb()
        return {} as any
      })
      global.setTimeout = mockSetTimeout

      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback(mockSerpAPIResponse)
      })

      const keywords = ['k1', 'k2', 'k3']
      await searchMultipleKeywords(keywords, 10, 1)

      // Should have 2 delays (between 3 keywords)
      expect(mockSetTimeout).toHaveBeenCalledTimes(2)
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 200)

      global.setTimeout = realSetTimeout
    })

    it('should pass search filters to individual searches', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      
      const searchFilters = {
        image_type: 'photo' as const,
        safe: 'off' as const,
      }

      getJson.mockImplementation((params: any, callback: any) => {
        expect(params.image_type).toBe('photo')
        expect(params.safe).toBe('off')
        callback(mockSerpAPIResponse)
      })

      await searchMultipleKeywords(['삼계탕'], 10, 1, undefined, searchFilters)

      expect(getJson).toHaveBeenCalledWith(
        expect.objectContaining({
          image_type: 'photo',
          safe: 'off',
        }),
        expect.any(Function),
      )
    })

    it('should use user API key for all searches when provided', async () => {
      const userApiKey = 'user-multi-key'
      mockCache.get.mockReturnValue(null)
      
      getJson.mockImplementation((params: any, callback: any) => {
        expect(params.api_key).toBe(userApiKey)
        callback(mockSerpAPIResponse)
      })

      await searchMultipleKeywords(['삼계탕', '김치찌개'], 10, 1, userApiKey)

      expect(getJson).toHaveBeenCalledTimes(2)
      expect(mockApiKeyUsage.getValidApiKey).not.toHaveBeenCalled()
    })
  })

  describe('error handling and mapping', () => {
    it('should map "no results" errors correctly for user API key', async () => {
      const userApiKey = 'user-key-123'
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: "hasn't returned any results for this query" })
      })

      const result = await searchSingleKeyword('rare-query', 2, userApiKey)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No images found with the current filters')
      expect(result.error).toContain('Try removing some filters')
    })

    it('should map rate limiting errors correctly for environment key', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('env-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: 'exceeded hourly limit for requests' })
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Demo service rate limit exceeded')
      expect(result.error).toContain('provide your own SERPAPI key')
    })

    it('should handle unknown errors with fallback message', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ error: 'Some unknown SERPAPI error' })
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Some unknown SERPAPI error')
      expect(result.error).toContain('provide your own SERPAPI key in Settings')
    })

    it('should handle JavaScript errors during search', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation(() => {
        throw new Error('JavaScript error during search')
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.success).toBe(false)
      expect(result.error).toContain('JavaScript error during search')
      expect(console.error).toHaveBeenCalledWith(
        'SerpAPI search error:',
        expect.any(Error),
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty images_results array', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ images_results: [] })
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
      expect(result.images).toHaveLength(0)
    })

    it('should handle malformed SERPAPI response', async () => {
      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback({ malformed: 'response' })
      })

      const result = await searchSingleKeyword('test', 2)

      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
      expect(result.images).toHaveLength(0)
    })

    it('should respect maxResults parameter for image slicing', async () => {
      const largeResponse = {
        images_results: Array.from({ length: 10 }, (_, i) => ({
          original: `https://example.com/image${i}.jpg`,
          title: `Image ${i}`,
          source: 'example.com',
        })),
      }

      mockApiKeyUsage.getValidApiKey.mockResolvedValue('test-key')
      mockCache.get.mockReturnValue(null)
      getJson.mockImplementation((params: any, callback: any) => {
        callback(largeResponse)
      })

      const result = await searchSingleKeyword('test', 3)

      expect(result.images).toHaveLength(3)
      expect(result.count).toBe(3)
    })
  })
})