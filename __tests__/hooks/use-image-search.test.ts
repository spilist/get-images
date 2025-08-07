/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageSearch } from '@/hooks/use-image-search'
import { ApiKeyConfig } from '@/types/api'
import { mockMultiKeywordResponse, mockKoreanFoodKeywords } from '../fixtures/api-responses'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Set up MSW server with test-specific handlers
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useImageSearch', () => {
  const mockApiKeyConfig: ApiKeyConfig = {
    apiKey: 'test-api-key-12345678',
    source: 'user',
    isValid: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useImageSearch())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.results).toBeNull()
      expect(result.current.currentSearchFilters).toBeNull()
      expect(typeof result.current.search).toBe('function')
      expect(typeof result.current.runSampleSearch).toBe('function')
      expect(typeof result.current.clearResults).toBe('function')
    })
  })

  describe('search functionality', () => {
    it('should handle successful multi-keyword search', async () => {
      // Set up MSW handler for successful response
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      const { result } = renderHook(() => useImageSearch())
      const keywords = ['삼계탕', '김치찌개']

      await act(async () => {
        await result.current.search(keywords, mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.results).toEqual(mockMultiKeywordResponse)
    })

    it('should use environment API key when user key is not provided', async () => {
      // Set up MSW handler for successful response
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['삼계탕'], null)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.results).toEqual(mockMultiKeywordResponse)
    })

    it('should handle search with filters', async () => {
      // Set up MSW handler for successful response
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      const { result } = renderHook(() => useImageSearch())
      const searchFilters = {
        image_type: 'photo',
        size: 'medium',
      }

      await act(async () => {
        await result.current.search(['삼계탕'], mockApiKeyConfig, searchFilters)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.results).toEqual(mockMultiKeywordResponse)
      expect(result.current.currentSearchFilters).toEqual(searchFilters)
    })

    it('should validate maximum keyword limit', async () => {
      const { result } = renderHook(() => useImageSearch())
      const tooManyKeywords = Array(11).fill('keyword')

      await act(async () => {
        await result.current.search(tooManyKeywords, mockApiKeyConfig)
      })

      expect(result.current.error).toBe('Maximum 10 keywords allowed')
      expect(result.current.results).toBeNull()
    })

    it('should validate empty keywords array', async () => {
      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search([], mockApiKeyConfig)
      })

      expect(result.current.error).toBe('Please enter at least one keyword')
      expect(result.current.results).toBeNull()
    })

    it('should handle API key exhaustion error', async () => {
      // Set up MSW handler for exhausted API key
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json({
            success: false,
            error: 'API key quota exhausted',
            results: {},
          })
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('API key quota exhausted')
      expect(result.current.results).toBeNull()
    })

    it('should handle invalid API key error', async () => {
      // Set up MSW handler for invalid API key
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json({
            success: false,
            error: 'Invalid API key',
            results: {},
          })
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Invalid API key')
      expect(result.current.results).toBeNull()
    })

    it('should handle network errors', async () => {
      // Set up MSW handler to simulate network error
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toContain('HTTP error! status: 500')
      expect(result.current.results).toBeNull()
    })

    it('should handle API response with success: false', async () => {
      // Set up MSW handler for failed response
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json({
            success: false,
            error: 'Search failed',
            results: {},
          })
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Search failed')
      expect(result.current.results).toBeNull()
    })
  })

  describe('sample search functionality', () => {
    it('should run sample search successfully', async () => {
      // Set up MSW handler for sample search
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json({
            success: true,
            results: {
              'korean food': {
                keyword: 'korean food',
                success: true,
                results: [
                  {
                    position: 1,
                    thumbnail: 'https://example.com/thumb1.jpg',
                    source: 'example.com',
                    title: 'Korean Food Sample',
                    link: 'https://example.com/image1.jpg',
                  },
                ],
                error: null,
                timestamp: new Date().toISOString(),
              },
            },
            message: 'Successfully searched for 1 keyword(s)',
          })
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.runSampleSearch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.results).toBeTruthy()
      expect(result.current.results?.success).toBe(true)
    })

    it('should simulate loading state during sample search', async () => {
      const { result } = renderHook(() => useImageSearch())

      act(() => {
        result.current.runSampleSearch()
      })

      expect(result.current.isLoading).toBe(true)

      // Wait for the sample search to complete (it has a 1000ms built-in delay)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 2000 })
    })
  })

  describe('clearResults functionality', () => {
    it('should clear results and filters', async () => {
      // First perform a search to have data to clear
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      const { result } = renderHook(() => useImageSearch())

      // Perform search first
      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig, { size: 'large' })
      })

      await waitFor(() => {
        expect(result.current.results).toBeTruthy()
        expect(result.current.currentSearchFilters).toBeTruthy()
      })

      // Clear results
      act(() => {
        result.current.clearResults()
      })

      expect(result.current.results).toBeNull()
      expect(result.current.currentSearchFilters).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('loading states', () => {
    it('should manage loading state during search', async () => {
      // Set up MSW handler with delay
      server.use(
        http.post('/api/scraper', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      const { result } = renderHook(() => useImageSearch())

      act(() => {
        result.current.search(['test'], mockApiKeyConfig)
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should clear error when starting new search', async () => {
      const { result } = renderHook(() => useImageSearch())

      // First set an error by performing an invalid search
      await act(async () => {
        await result.current.search([], mockApiKeyConfig)
      })

      expect(result.current.error).toBeTruthy()

      // Set up successful handler
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(mockMultiKeywordResponse)
        })
      )

      // Perform valid search - should clear error
      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle malformed API response', async () => {
      // Set up MSW handler for malformed response
      server.use(
        http.post('/api/scraper', () => {
          return HttpResponse.json(null)
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toContain('Cannot read properties of null')
      expect(result.current.results).toBeNull()
    })

    it('should handle JSON parse error', async () => {
      // Set up MSW handler for invalid JSON
      server.use(
        http.post('/api/scraper', () => {
          return new Response('invalid json', {
            headers: { 'Content-Type': 'application/json' },
          })
        })
      )

      const { result } = renderHook(() => useImageSearch())

      await act(async () => {
        await result.current.search(['test'], mockApiKeyConfig)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toContain('invalid json')
      expect(result.current.results).toBeNull()
    })
  })
})