/**
 * @jest-environment jsdom
 */
import { 
  apiKeyUsageCache, 
  getAllApiKeyUsage, 
  getValidApiKey, 
  ApiKeyUsage 
} from '@/lib/api-key-usage'

// Mock fetch globally
global.fetch = jest.fn()

describe('ApiKeyUsage', () => {
  const mockValidUsageResponse = {
    plan_searches_left: 75,
    this_month_usage: 25,
    total_searches_left: 75,
    account_rate_limit_per_hour: 100,
  }

  const mockExhaustedUsageResponse = {
    plan_searches_left: 0,
    this_month_usage: 100,
    total_searches_left: 0,
    account_rate_limit_per_hour: 100,
  }

  const mockErrorResponse = {
    error: 'Invalid API key'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    apiKeyUsageCache.clearCache()
    ;(global.fetch as jest.Mock).mockClear()
    
    // Set up test environment variables
    process.env.SERPAPI_KEY = 'test-env-key-1'
    process.env.SERPAPI_KEY2 = 'test-env-key-2'
  })

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SERPAPI_KEY
    delete process.env.SERPAPI_KEY2
    jest.useRealTimers()
  })

  describe('ApiKeyUsageCache', () => {
    it('should fetch and cache API key usage successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidUsageResponse,
      })

      const usage = await apiKeyUsageCache.getUsage('test-api-key')

      expect(usage).toEqual({
        apiKey: 'test-api-key',
        planSearchesLeft: 75,
        thisMonthUsage: 25,
        totalSearchesLeft: 75,
        accountRateLimitPerHour: 100,
        isExhausted: false,
        lastChecked: expect.any(Date),
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://serpapi.com/account.json?api_key=test-api-key'
      )
    })

    it('should return cached usage within cache duration', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidUsageResponse,
      })

      // First call
      const usage1 = await apiKeyUsageCache.getUsage('test-api-key')
      
      // Second call should use cache
      const usage2 = await apiKeyUsageCache.getUsage('test-api-key')

      expect(usage1).toEqual(usage2)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only called once
    })

    it('should refetch after cache expires', async () => {
      jest.useFakeTimers()
      
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockValidUsageResponse, this_month_usage: 30 }),
        })

      // First call
      await apiKeyUsageCache.getUsage('test-api-key')
      
      // Advance time past cache duration (5 minutes)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1)
      
      // Second call should refetch
      const usage2 = await apiKeyUsageCache.getUsage('test-api-key')

      expect(usage2.thisMonthUsage).toBe(30) // Updated value
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      })

      const usage = await apiKeyUsageCache.getUsage('invalid-api-key')

      expect(usage).toEqual({
        apiKey: 'invalid-api-key',
        planSearchesLeft: 0,
        thisMonthUsage: 0,
        totalSearchesLeft: 0,
        accountRateLimitPerHour: 0,
        isExhausted: true,
        lastChecked: expect.any(Date),
        error: 'Invalid API key',
      })
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const usage = await apiKeyUsageCache.getUsage('test-api-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.error).toBe('Network error')
    })

    it('should detect exhausted API keys', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExhaustedUsageResponse,
      })

      const usage = await apiKeyUsageCache.getUsage('exhausted-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.planSearchesLeft).toBe(0)
    })

    it('should handle missing data fields gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      })

      const usage = await apiKeyUsageCache.getUsage('test-api-key')

      expect(usage).toEqual({
        apiKey: 'test-api-key',
        planSearchesLeft: 0,
        thisMonthUsage: 0,
        totalSearchesLeft: 0,
        accountRateLimitPerHour: 0,
        isExhausted: true, // Should be exhausted when plan_searches_left is 0
        lastChecked: expect.any(Date),
      })
    })

    it('should return all cached usage', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExhaustedUsageResponse,
        })

      await apiKeyUsageCache.getUsage('key1')
      await apiKeyUsageCache.getUsage('key2')

      const allUsage = apiKeyUsageCache.getAllCachedUsage()

      expect(allUsage).toHaveLength(2)
      expect(allUsage.find(u => u.apiKey === 'key1')?.isExhausted).toBe(false)
      expect(allUsage.find(u => u.apiKey === 'key2')?.isExhausted).toBe(true)
    })

    it('should clear cache correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidUsageResponse,
      })

      await apiKeyUsageCache.getUsage('test-key')
      expect(apiKeyUsageCache.getAllCachedUsage()).toHaveLength(1)

      apiKeyUsageCache.clearCache()
      expect(apiKeyUsageCache.getAllCachedUsage()).toHaveLength(0)
    })
  })

  describe('getAllApiKeyUsage', () => {
    it('should get usage for all environment API keys', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExhaustedUsageResponse,
        })

      const allUsage = await getAllApiKeyUsage()

      expect(allUsage).toHaveLength(2)
      expect(allUsage[0].apiKey).toBe('test-env-key-1')
      expect(allUsage[1].apiKey).toBe('test-env-key-2')
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://serpapi.com/account.json?api_key=test-env-key-1'
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'https://serpapi.com/account.json?api_key=test-env-key-2'
      )
    })

    it('should handle missing SERPAPI_KEY environment variable', async () => {
      delete process.env.SERPAPI_KEY
      process.env.SERPAPI_KEY2 = 'only-key-2'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidUsageResponse,
      })

      const allUsage = await getAllApiKeyUsage()

      expect(allUsage).toHaveLength(1)
      expect(allUsage[0].apiKey).toBe('only-key-2')
    })

    it('should handle missing SERPAPI_KEY2 environment variable', async () => {
      process.env.SERPAPI_KEY = 'only-key-1'
      delete process.env.SERPAPI_KEY2

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidUsageResponse,
      })

      const allUsage = await getAllApiKeyUsage()

      expect(allUsage).toHaveLength(1)
      expect(allUsage[0].apiKey).toBe('only-key-1')
    })

    it('should return empty array when no environment keys exist', async () => {
      delete process.env.SERPAPI_KEY
      delete process.env.SERPAPI_KEY2

      const allUsage = await getAllApiKeyUsage()

      expect(allUsage).toHaveLength(0)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('getValidApiKey', () => {
    it('should return the first valid (non-exhausted) API key', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExhaustedUsageResponse, // First key exhausted
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse, // Second key valid
        })

      const validKey = await getValidApiKey()

      expect(validKey).toBe('test-env-key-2')
    })

    it('should return null when all API keys are exhausted', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExhaustedUsageResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExhaustedUsageResponse,
        })

      const validKey = await getValidApiKey()

      expect(validKey).toBeNull()
    })

    it('should return null when all API keys have errors', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => mockErrorResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => mockErrorResponse,
        })

      const validKey = await getValidApiKey()

      expect(validKey).toBeNull()
    })

    it('should prioritize first valid key', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse, // First key valid
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse, // Second key also valid
        })

      const validKey = await getValidApiKey()

      expect(validKey).toBe('test-env-key-1') // Should return first valid key
    })

    it('should skip keys with errors but non-exhausted status', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error')) // First key has error
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidUsageResponse, // Second key valid
        })

      const validKey = await getValidApiKey()

      expect(validKey).toBe('test-env-key-2')
    })

    it('should return null when no environment keys are configured', async () => {
      delete process.env.SERPAPI_KEY
      delete process.env.SERPAPI_KEY2

      const validKey = await getValidApiKey()

      expect(validKey).toBeNull()
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle malformed JSON responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const usage = await apiKeyUsageCache.getUsage('test-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.error).toBe('Invalid JSON')
    })

    it('should handle fetch throwing an error', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Fetch failed')
      })

      const usage = await apiKeyUsageCache.getUsage('test-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.error).toBe('Fetch failed')
    })

    it('should handle zero searches left correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockValidUsageResponse,
          plan_searches_left: 0,
        }),
      })

      const usage = await apiKeyUsageCache.getUsage('zero-searches-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.planSearchesLeft).toBe(0)
    })

    it('should handle negative searches left', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockValidUsageResponse,
          plan_searches_left: -5, // Negative value
        }),
      })

      const usage = await apiKeyUsageCache.getUsage('negative-searches-key')

      expect(usage.isExhausted).toBe(true)
      expect(usage.planSearchesLeft).toBe(-5)
    })

    it('should handle very large usage numbers', async () => {
      const largeNumbers = {
        plan_searches_left: 999999999,
        this_month_usage: 123456789,
        total_searches_left: 999999999,
        account_rate_limit_per_hour: 10000,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => largeNumbers,
      })

      const usage = await apiKeyUsageCache.getUsage('large-numbers-key')

      expect(usage.planSearchesLeft).toBe(999999999)
      expect(usage.thisMonthUsage).toBe(123456789)
      expect(usage.isExhausted).toBe(false)
    })
  })
})