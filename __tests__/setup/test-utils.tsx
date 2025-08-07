import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test utilities for common operations
export const createMockApiKeyConfig = (overrides = {}) => ({
  apiKey: 'test-api-key-12345678',
  source: 'user' as const,
  isValid: true,
  ...overrides,
})

export const createMockSearchResult = (keyword = 'test', overrides = {}) => ({
  keyword,
  success: true,
  results: [
    {
      position: 1,
      thumbnail: `https://example.com/thumb-${keyword}.jpg`,
      source: 'example.com',
      title: `Sample ${keyword} Image`,
      link: `https://example.com/full-${keyword}.jpg`,
      original: `https://example.com/original-${keyword}.jpg`,
      original_width: 800,
      original_height: 600,
    },
  ],
  error: null,
  timestamp: new Date().toISOString(),
  ...overrides,
})

export const createMockSearchHistory = () => [
  {
    id: '1',
    query: '삼계탕',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    resultCount: 10,
  },
  {
    id: '2', 
    query: '김치찌개',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    resultCount: 8,
  },
]

export const createMockUsageResponse = (overrides = {}) => ({
  success: true,
  data: {
    plan: 'Free',
    searches_limit: 100,
    searches_used: 25,
    searches_remaining: 75,
    account_rate_limit_per_hour: 100,
    ...overrides,
  },
})

// Helper to wait for async operations
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to create mock environment
export const mockEnvironment = (env: Record<string, string>) => {
  const originalEnv = { ...process.env }
  Object.assign(process.env, env)
  return () => {
    process.env = originalEnv
  }
}

// Helper to clear all localStorage
export const clearLocalStorage = () => {
  window.localStorage.clear()
}

// Helper to set up localStorage with test data
export const setupLocalStorageWithApiKey = (apiKey = 'test-api-key') => {
  window.localStorage.setItem('serpapi-key', apiKey)
}

// Mock implementations for hooks
export const createMockImageSearchHook = () => ({
  search: jest.fn(),
  generateSampleSearch: jest.fn(),
  isLoading: false,
  error: null,
  results: {},
  hasSearched: false,
  clearResults: jest.fn(),
})

export const createMockApiKeyHook = () => ({
  apiKey: null,
  setApiKey: jest.fn(),
  clearApiKey: jest.fn(),
  validateApiKey: jest.fn(),
  showXSSWarning: false,
  setShowXSSWarning: jest.fn(),
})

export const createMockSearchHistoryHook = () => ({
  history: [],
  addToHistory: jest.fn(),
  clearHistory: jest.fn(),
  removeFromHistory: jest.fn(),
})