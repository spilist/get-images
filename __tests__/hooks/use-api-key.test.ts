/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiKey } from '@/hooks/use-api-key'
import { ApiKeyConfig } from '@/types/api'
import * as apiKeyStorage from '@/lib/api-key-storage'
import { clearLocalStorage } from '../setup/test-utils'

// Mock the api-key-storage module
jest.mock('@/lib/api-key-storage', () => ({
  getCurrentApiKeyConfig: jest.fn(),
  getStoredApiKey: jest.fn(),
  storeApiKey: jest.fn(),
  removeStoredApiKey: jest.fn(),
  validateApiKeyFormat: jest.fn(),
  hasUserApiKey: jest.fn(),
}))

const mockApiKeyStorage = apiKeyStorage as jest.Mocked<typeof apiKeyStorage>

describe('useApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearLocalStorage()
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should load user API key configuration on mount', async () => {
      const mockUserConfig: ApiKeyConfig = {
        apiKey: 'user-api-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(mockUserConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.config).toEqual(mockUserConfig)
      expect(result.current.hasUserKey).toBe(true)
      expect(result.current.isValid).toBe(true)
      expect(mockApiKeyStorage.getCurrentApiKeyConfig).toHaveBeenCalledTimes(1)
    })

    it('should load environment API key configuration when no user key exists', async () => {
      const mockEnvConfig: ApiKeyConfig = {
        apiKey: '',
        source: 'environment',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(mockEnvConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.config).toEqual(mockEnvConfig)
      expect(result.current.hasUserKey).toBe(false)
      expect(result.current.isValid).toBe(true)
    })

    it('should handle errors during initialization and fallback to environment config', async () => {
      mockApiKeyStorage.getCurrentApiKeyConfig.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.config).toEqual({
        apiKey: '',
        source: 'environment',
        isValid: true,
      })
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load API key configuration:',
        expect.any(Error),
      )
    })
  })

  describe('configuration updates', () => {
    it('should update configuration when updateConfig is called', async () => {
      const initialConfig: ApiKeyConfig = {
        apiKey: '',
        source: 'environment',
        isValid: true,
      }

      const newUserConfig: ApiKeyConfig = {
        apiKey: 'new-user-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(initialConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasUserKey).toBe(false)

      act(() => {
        result.current.updateConfig(newUserConfig)
      })

      expect(result.current.config).toEqual(newUserConfig)
      expect(result.current.hasUserKey).toBe(true)
      expect(result.current.isValid).toBe(true)
    })

    it('should clear configuration when updateConfig is called with null', async () => {
      const userConfig: ApiKeyConfig = {
        apiKey: 'user-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(userConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasUserKey).toBe(true)

      act(() => {
        result.current.updateConfig(null)
      })

      expect(result.current.config).toBeNull()
      expect(result.current.hasUserKey).toBe(false)
      expect(result.current.isValid).toBe(false)
    })
  })

  describe('configuration refresh', () => {
    it('should handle errors during refresh', async () => {
      const initialConfig: ApiKeyConfig = {
        apiKey: 'initial-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig
        .mockReturnValueOnce(initialConfig)
        .mockImplementationOnce(() => {
          throw new Error('Refresh error')
        })

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.config).toEqual(initialConfig)

      act(() => {
        result.current.refreshConfig()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Configuration should remain unchanged after error
      expect(result.current.config).toEqual(initialConfig)
      expect(console.error).toHaveBeenCalledWith(
        'Failed to refresh API key configuration:',
        expect.any(Error),
      )
    })
  })

  describe('getApiKey functionality', () => {
    it('should return user API key when config has valid user key', async () => {
      const userConfig: ApiKeyConfig = {
        apiKey: 'user-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(userConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const apiKey = result.current.getApiKey()
      expect(apiKey).toBe(userConfig.apiKey)
    })

    it('should return null for invalid user key', async () => {
      const invalidUserConfig: ApiKeyConfig = {
        apiKey: 'invalid-key',
        source: 'user',
        isValid: false,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(invalidUserConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const apiKey = result.current.getApiKey()
      expect(apiKey).toBeNull()
    })

    it('should return null for environment key (let server handle)', async () => {
      const envConfig: ApiKeyConfig = {
        apiKey: '',
        source: 'environment',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(envConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const apiKey = result.current.getApiKey()
      expect(apiKey).toBeNull()
    })

    it('should return null when config is null', async () => {
      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(null)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const apiKey = result.current.getApiKey()
      expect(apiKey).toBeNull()
    })
  })

  describe('derived state properties', () => {
    it('should correctly compute hasUserKey property', async () => {
      const userConfig: ApiKeyConfig = {
        apiKey: 'user-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      const envConfig: ApiKeyConfig = {
        apiKey: '',
        source: 'environment',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(userConfig)

      const { result, rerender } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasUserKey).toBe(true)

      // Update to environment config
      act(() => {
        result.current.updateConfig(envConfig)
      })

      expect(result.current.hasUserKey).toBe(false)
    })

    it('should correctly compute isValid property', async () => {
      const validConfig: ApiKeyConfig = {
        apiKey: 'valid-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      const invalidConfig: ApiKeyConfig = {
        apiKey: 'invalid-key',
        source: 'user',
        isValid: false,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(validConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isValid).toBe(true)

      // Update to invalid config
      act(() => {
        result.current.updateConfig(invalidConfig)
      })

      expect(result.current.isValid).toBe(false)

      // Update to null config
      act(() => {
        result.current.updateConfig(null)
      })

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple rapid updates correctly', async () => {
      const config1: ApiKeyConfig = {
        apiKey: 'key1-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      const config2: ApiKeyConfig = {
        apiKey: 'key2-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig.mockReturnValue(null)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateConfig(config1)
        result.current.updateConfig(config2)
      })

      expect(result.current.config).toEqual(config2)
    })

    it('should handle simultaneous refresh and update operations', async () => {
      const initialConfig: ApiKeyConfig = {
        apiKey: 'initial-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      const refreshedConfig: ApiKeyConfig = {
        apiKey: 'refreshed-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      const updatedConfig: ApiKeyConfig = {
        apiKey: 'updated-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        source: 'user',
        isValid: true,
      }

      mockApiKeyStorage.getCurrentApiKeyConfig
        .mockReturnValueOnce(initialConfig)
        .mockReturnValueOnce(refreshedConfig)

      const { result } = renderHook(() => useApiKey())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.refreshConfig()
        result.current.updateConfig(updatedConfig)
      })

      // The update should take precedence over refresh
      expect(result.current.config).toEqual(updatedConfig)
    })
  })
})