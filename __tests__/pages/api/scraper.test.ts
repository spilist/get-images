/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/scraper/route'
import * as serpapiService from '@/lib/serpapi.service'

// Mock the serpapi service
jest.mock('@/lib/serpapi.service', () => ({
  searchMultipleKeywords: jest.fn(),
  searchSingleKeyword: jest.fn(),
}))

const mockSerpapiService = serpapiService as jest.Mocked<typeof serpapiService>

describe('/api/scraper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST endpoint', () => {
    describe('single keyword search', () => {
      it('should handle single keyword search successfully', async () => {
        const mockResult = {
          success: true,
          query: '삼계탕',
          count: 2,
          images: [
            {
              url: 'https://example.com/samgyetang1.jpg',
              title: '삼계탕 이미지 1',
              source: 'example.com',
            },
            {
              url: 'https://example.com/samgyetang2.jpg',
              title: '삼계탕 이미지 2',
              source: 'test.com',
            },
          ],
        }

        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            query: '삼계탕',
            max_results: 2,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual(mockResult)
        expect(mockSerpapiService.searchSingleKeyword).toHaveBeenCalledWith(
          '삼계탕',
          2,
          undefined,
          undefined,
        )
      })

      it('should use user API key from headers', async () => {
        const mockResult = { success: true, query: '삼계탕', count: 1, images: [] }
        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ query: '삼계탕' }),
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'header-api-key-123',
          },
        })

        await POST(request)

        expect(mockSerpapiService.searchSingleKeyword).toHaveBeenCalledWith(
          '삼계탕',
          3, // default max_results
          'header-api-key-123',
          undefined,
        )
      })

      it('should use user API key from body', async () => {
        const mockResult = { success: true, query: '삼계탕', count: 1, images: [] }
        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            query: '삼계탕',
            api_key: 'body-api-key-456',
          }),
        })

        await POST(request)

        expect(mockSerpapiService.searchSingleKeyword).toHaveBeenCalledWith(
          '삼계탕',
          3,
          'body-api-key-456',
          undefined,
        )
      })

      it('should prioritize header API key over body API key', async () => {
        const mockResult = { success: true, query: '삼계탕', count: 1, images: [] }
        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            query: '삼계탕',
            api_key: 'body-key',
          }),
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'header-key',
          },
        })

        await POST(request)

        expect(mockSerpapiService.searchSingleKeyword).toHaveBeenCalledWith(
          '삼계탕',
          3,
          'header-key',
          undefined,
        )
      })

      it('should pass search filters correctly', async () => {
        const mockResult = { success: true, query: '삼계탕', count: 1, images: [] }
        const searchFilters = {
          image_type: 'photo',
          size: 'large',
          safe: 'off',
        }

        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            query: '삼계탕',
            filters: searchFilters,
          }),
        })

        await POST(request)

        expect(mockSerpapiService.searchSingleKeyword).toHaveBeenCalledWith(
          '삼계탕',
          3,
          undefined,
          searchFilters,
        )
      })

      it('should return 400 for missing query', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ max_results: 5 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Missing required parameter: query or keywords')
        expect(mockSerpapiService.searchSingleKeyword).not.toHaveBeenCalled()
      })

      it('should return 400 for invalid query type', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ query: 123 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Missing or invalid query parameter')
      })
    })

    describe('multiple keywords search', () => {
      it('should handle multiple keywords search successfully', async () => {
        const mockResult = {
          success: true,
          total_keywords: 2,
          results: {
            '삼계탕': {
              success: true,
              query: '삼계탕',
              count: 1,
              images: [
                {
                  url: 'https://example.com/samgyetang.jpg',
                  title: '삼계탕',
                  source: 'example.com',
                },
              ],
            },
            '김치찌개': {
              success: true,
              query: '김치찌개',
              count: 1,
              images: [
                {
                  url: 'https://example.com/kimchi.jpg',
                  title: '김치찌개',
                  source: 'example.com',
                },
              ],
            },
          },
        }

        mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            keywords: ['삼계탕', '김치찌개'],
            max_results_per_keyword: 2,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual(mockResult)
        expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
          ['삼계탕', '김치찌개'],
          10, // default max_keywords
          2,
          undefined,
          undefined,
        )
      })

      it('should use custom max_keywords parameter', async () => {
        const mockResult = {
          success: true,
          total_keywords: 5,
          results: {},
        }

        mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            keywords: ['a', 'b', 'c', 'd', 'e'],
            max_keywords: 5,
            max_results_per_keyword: 1,
          }),
        })

        await POST(request)

        expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
          ['a', 'b', 'c', 'd', 'e'],
          5,
          1,
          undefined,
          undefined,
        )
      })

      it('should pass API key to multiple keywords search', async () => {
        const mockResult = { success: true, total_keywords: 1, results: {} }
        mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            keywords: ['test'],
            api_key: 'multi-key-123',
          }),
        })

        await POST(request)

        expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
          ['test'],
          10,
          3,
          'multi-key-123',
          undefined,
        )
      })

      it('should pass search filters to multiple keywords search', async () => {
        const mockResult = { success: true, total_keywords: 1, results: {} }
        const filters = { image_type: 'clipart', safe: 'active' }

        mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({
            keywords: ['test'],
            filters,
          }),
        })

        await POST(request)

        expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
          ['test'],
          10,
          3,
          undefined,
          filters,
        )
      })

      it('should return 400 for missing keywords', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ max_results_per_keyword: 5 }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Missing required parameter: query or keywords')
      })

      it('should return 400 for empty keywords array', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ keywords: [] }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Keywords must be a non-empty array')
      })

      it('should return 400 for invalid keywords type', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ keywords: 'not-an-array' }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Keywords must be a non-empty array')
      })
    })

    describe('error handling', () => {
      it('should handle service errors gracefully', async () => {
        mockSerpapiService.searchSingleKeyword.mockRejectedValue(
          new Error('SERPAPI service error'),
        )

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('SERPAPI service error')
        expect(console.error).toHaveBeenCalledWith(
          'API route error:',
          expect.any(Error),
        )
      })

      it('should handle JSON parsing errors', async () => {
        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: 'invalid-json',
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toContain('Invalid JSON')
      })

      it('should handle unknown errors', async () => {
        mockSerpapiService.searchSingleKeyword.mockImplementation(() => {
          throw 'String error'
        })

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Internal server error')
      })
    })

    describe('CORS headers', () => {
      it('should include CORS headers in successful responses', async () => {
        const mockResult = { success: true, query: 'test', count: 0, images: [] }
        mockSerpapiService.searchSingleKeyword.mockResolvedValue(mockResult)

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' }),
        })

        const response = await POST(request)

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
          'POST, OPTIONS',
        )
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
          'Content-Type',
        )
      })

      it('should include CORS headers in error responses', async () => {
        mockSerpapiService.searchMultipleKeywords.mockResolvedValue({
          success: true,
          total_keywords: 1,
          results: {},
        })

        const request = new NextRequest('http://localhost:3000/api/scraper', {
          method: 'POST',
          body: JSON.stringify({ keywords: ['test'] }),
        })

        const response = await POST(request)

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
        expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
          'POST, OPTIONS',
        )
        expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
          'Content-Type',
        )
      })
    })
  })

  describe('OPTIONS endpoint', () => {
    it('should handle OPTIONS preflight request', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'POST, OPTIONS',
      )
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type',
      )
    })
  })

  describe('edge cases', () => {

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/scraper', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required parameter: query or keywords')
    })

    it('should handle large keyword arrays', async () => {
      const largeKeywordArray = Array.from({ length: 50 }, (_, i) => `keyword${i}`)
      const mockResult = { success: true, total_keywords: 50, results: {} }

      mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

      const request = new NextRequest('http://localhost:3000/api/scraper', {
        method: 'POST',
        body: JSON.stringify({
          keywords: largeKeywordArray,
          max_keywords: 50,
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
        largeKeywordArray,
        50,
        3,
        undefined,
        undefined,
      )
    })

    it('should handle special characters in keywords', async () => {
      const specialKeywords = ['café', 'naïve', '北京烤鸭', '🍜']
      const mockResult = { success: true, total_keywords: 4, results: {} }

      mockSerpapiService.searchMultipleKeywords.mockResolvedValue(mockResult)

      const request = new NextRequest('http://localhost:3000/api/scraper', {
        method: 'POST',
        body: JSON.stringify({ keywords: specialKeywords }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSerpapiService.searchMultipleKeywords).toHaveBeenCalledWith(
        specialKeywords,
        10,
        3,
        undefined,
        undefined,
      )
    })
  })
})