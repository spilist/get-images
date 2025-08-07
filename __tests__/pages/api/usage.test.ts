/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/usage/route'
import * as apiKeyUsage from '@/lib/api-key-usage'
import * as apiKeyStorage from '@/lib/api-key-storage'

// Mock dependencies
jest.mock('@/lib/api-key-usage', () => ({
  getAllApiKeyUsage: jest.fn(),
  apiKeyUsageCache: {
    getUsage: jest.fn(),
  },
}))

jest.mock('@/lib/api-key-storage', () => ({
  getStoredApiKey: jest.fn(),
}))

const mockApiKeyUsage = apiKeyUsage as jest.Mocked<typeof apiKeyUsage>
const mockApiKeyStorage = apiKeyStorage as jest.Mocked<typeof apiKeyStorage>

describe('/api/usage', () => {
  const mockEnvUsage1 = {
    apiKey: 'env-key-1234567890123456',
    planSearchesLeft: 75,
    thisMonthUsage: 25,
    totalSearchesLeft: 75,
    accountRateLimitPerHour: 100,
    isExhausted: false,
    lastChecked: '2024-01-15T10:00:00.000Z',
  }

  const mockEnvUsage2 = {
    apiKey: 'env-key-2234567890123456',
    planSearchesLeft: 0,
    thisMonthUsage: 100,
    totalSearchesLeft: 0,
    accountRateLimitPerHour: 100,
    isExhausted: true,
    lastChecked: '2024-01-15T10:00:00.000Z',
  }

  const mockUserUsage = {
    apiKey: 'user-key-3234567890123456',
    planSearchesLeft: 50,
    thisMonthUsage: 50,
    totalSearchesLeft: 50,
    accountRateLimitPerHour: 100,
    isExhausted: false,
    lastChecked: '2024-01-15T10:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up environment variables
    process.env.SERPAPI_KEY = 'env-key-1234567890123456'
    process.env.SERPAPI_KEY2 = 'env-key-2234567890123456'
    
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.SERPAPI_KEY
    delete process.env.SERPAPI_KEY2
  })

  describe('GET endpoint', () => {
    it('should return environment key usage with masked keys', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1, mockEnvUsage2])
      mockApiKeyStorage.getStoredApiKey.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.usages).toHaveLength(2)
      
      expect(data.usages[0]).toEqual({
        ...mockEnvUsage1,
        apiKey: '****3456', // Masked to show only last 4 chars
        keyType: 'environment',
      })
      
      expect(data.usages[1]).toEqual({
        ...mockEnvUsage2,
        apiKey: '****3456', // Masked to show only last 4 chars
        keyType: 'environment',
      })
    })

    it('should include user key usage when provided via header', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1])
      mockApiKeyUsage.apiKeyUsageCache.getUsage.mockResolvedValue(mockUserUsage)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': 'user-key-3234567890123456',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.usages).toHaveLength(2) // 1 env + 1 user

      // Check environment key
      expect(data.usages[0].keyType).toBe('environment')
      expect(data.usages[0].apiKey).toBe('****3456')

      // Check user key
      expect(data.usages[1]).toEqual({
        ...mockUserUsage,
        apiKey: '****3456', // Masked user key
        keyType: 'user',
      })

      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).toHaveBeenCalledWith(
        'user-key-3234567890123456',
      )
    })

    it('should include user key usage when provided via stored key', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([])
      mockApiKeyStorage.getStoredApiKey.mockReturnValue('stored-user-key-123456')
      mockApiKeyUsage.apiKeyUsageCache.getUsage.mockResolvedValue(mockUserUsage)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usages).toHaveLength(1) // Only user key

      expect(data.usages[0].keyType).toBe('user')
      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).toHaveBeenCalledWith(
        'stored-user-key-123456',
      )
    })

    it('should not duplicate user key if it matches environment key', async () => {
      const envKey = 'env-key-1234567890123456'
      
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([
        { ...mockEnvUsage1, apiKey: envKey },
      ])
      
      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': envKey, // Same as environment key
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usages).toHaveLength(1) // Only environment key, no duplicate
      expect(data.usages[0].keyType).toBe('environment')
      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).not.toHaveBeenCalled()
    })

    it('should handle empty environment keys', async () => {
      delete process.env.SERPAPI_KEY
      delete process.env.SERPAPI_KEY2
      
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([])
      mockApiKeyStorage.getStoredApiKey.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.usages).toHaveLength(0)
    })

    it('should handle user key when no environment keys exist', async () => {
      delete process.env.SERPAPI_KEY
      delete process.env.SERPAPI_KEY2
      
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([])
      mockApiKeyUsage.apiKeyUsageCache.getUsage.mockResolvedValue(mockUserUsage)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': 'user-only-key-123456',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usages).toHaveLength(1)
      expect(data.usages[0].keyType).toBe('user')
    })

    it('should prioritize header API key over stored API key', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([])
      mockApiKeyStorage.getStoredApiKey.mockReturnValue('stored-key-123')
      mockApiKeyUsage.apiKeyUsageCache.getUsage.mockResolvedValue(mockUserUsage)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': 'header-key-456',
        },
      })

      await GET(request)

      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).toHaveBeenCalledWith(
        'header-key-456',
      )
      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).not.toHaveBeenCalledWith(
        'stored-key-123',
      )
    })
  })

  describe('error handling', () => {
    it('should handle getAllApiKeyUsage errors', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockRejectedValue(
        new Error('Environment key fetch failed'),
      )
      mockApiKeyStorage.getStoredApiKey.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Environment key fetch failed')
      expect(console.error).toHaveBeenCalledWith(
        'API usage check error:',
        expect.any(Error),
      )
    })

    it('should handle user key usage fetch errors gracefully', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1])
      mockApiKeyUsage.apiKeyUsageCache.getUsage.mockRejectedValue(
        new Error('User key fetch failed'),
      )

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': 'failing-user-key',
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User key fetch failed')
    })

    it('should handle getStoredApiKey errors gracefully', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1])
      mockApiKeyStorage.getStoredApiKey.mockImplementation(() => {
        throw new Error('Storage access error')
      })

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Storage access error')
    })

    it('should handle unknown errors', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockImplementation(() => {
        throw 'Unknown error type'
      })

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Storage access error')
    })
  })


  describe('edge cases', () => {
    it('should handle user key that matches SERPAPI_KEY2', async () => {
      const envKey2 = 'env-key-2234567890123456'
      
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1, mockEnvUsage2])

      const request = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
        headers: {
          'X-API-Key': envKey2, // Matches SERPAPI_KEY2
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usages).toHaveLength(2) // Only env keys, no duplicate user key
      expect(mockApiKeyUsage.apiKeyUsageCache.getUsage).not.toHaveBeenCalled()
    })

    it('should handle concurrent requests gracefully', async () => {
      mockApiKeyUsage.getAllApiKeyUsage.mockResolvedValue([mockEnvUsage1])
      mockApiKeyStorage.getStoredApiKey.mockReturnValue(null)

      const request1 = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })
      const request2 = new NextRequest('http://localhost:3000/api/usage', {
        method: 'GET',
      })

      const [response1, response2] = await Promise.all([GET(request1), GET(request2)])

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.success).toBe(true)
      expect(data2.success).toBe(true)
    })
  })
})