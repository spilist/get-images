/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearchHistory } from '@/hooks/use-search-history'
import { SearchHistoryEntry } from '@/types/api'
import * as searchHistoryStorage from '@/lib/search-history-storage'
import { clearLocalStorage } from '../setup/test-utils'

// Mock the search-history-storage module
jest.mock('@/lib/search-history-storage', () => ({
  getSearchHistory: jest.fn(),
  addToSearchHistory: jest.fn(),
  clearSearchHistory: jest.fn(),
  removeFromSearchHistory: jest.fn(),
  formatRelativeTime: jest.fn(),
}))

const mockSearchHistoryStorage = searchHistoryStorage as jest.Mocked<typeof searchHistoryStorage>

describe('useSearchHistory', () => {
  const mockHistory: SearchHistoryEntry[] = [
    {
      keywords: ['삼계탕'],
      selectedImages: {
        '삼계탕': {
          url: 'https://example.com/samgyetang.jpg',
          title: '삼계탕 이미지',
        },
      },
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    },
    {
      keywords: ['김치찌개', '비빔밥'],
      selectedImages: {
        '김치찌개': {
          url: 'https://example.com/kimchi-jjigae.jpg',
          title: '김치찌개 이미지',
        },
        '비빔밥': {
          url: 'https://example.com/bibimbap.jpg',
          title: '비빔밥 이미지',
        },
      },
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      searchFilters: {
        image_type: 'photo',
        size: 'medium',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    clearLocalStorage()
    // Suppress console.log for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty history when storage is empty', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([])

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual([])
      expect(mockSearchHistoryStorage.getSearchHistory).toHaveBeenCalledTimes(1)
    })

    it('should load existing history from storage on mount', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual(mockHistory)
      expect(mockSearchHistoryStorage.getSearchHistory).toHaveBeenCalledTimes(1)
    })

    it('should provide all expected functions', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([])

      const { result } = renderHook(() => useSearchHistory())

      expect(typeof result.current.addToHistory).toBe('function')
      expect(typeof result.current.removeFromHistory).toBe('function')
      expect(typeof result.current.clearHistory).toBe('function')
      expect(typeof result.current.rerunSearch).toBe('function')
    })
  })

  describe('addToHistory functionality', () => {
    it('should add entry to history and refresh state', () => {
      const initialHistory: SearchHistoryEntry[] = []
      const updatedHistory: SearchHistoryEntry[] = [
        {
          keywords: ['떡볶이'],
          selectedImages: {
            '떡볶이': {
              url: 'https://example.com/tteokbokki.jpg',
              title: '떡볶이 이미지',
            },
          },
          timestamp: Date.now(),
        },
      ]

      mockSearchHistoryStorage.getSearchHistory
        .mockReturnValueOnce(initialHistory)
        .mockReturnValueOnce(updatedHistory)

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual(initialHistory)

      act(() => {
        result.current.addToHistory(['떡볶이'], {
          '떡볶이': {
            url: 'https://example.com/tteokbokki.jpg',
            title: '떡볶이 이미지',
          },
        })
      })

      expect(mockSearchHistoryStorage.addToSearchHistory).toHaveBeenCalledWith(
        ['떡볶이'],
        {
          '떡볶이': {
            url: 'https://example.com/tteokbokki.jpg',
            title: '떡볶이 이미지',
          },
        },
        undefined,
      )
      expect(result.current.history).toEqual(updatedHistory)
      expect(mockSearchHistoryStorage.getSearchHistory).toHaveBeenCalledTimes(2)
    })

    it('should add entry with search filters', () => {
      const searchFilters = {
        image_type: 'clipart',
        size: 'large',
      }

      mockSearchHistoryStorage.getSearchHistory
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])

      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.addToHistory(
          ['불고기'],
          {
            '불고기': {
              url: 'https://example.com/bulgogi.jpg',
              title: '불고기 이미지',
            },
          },
          searchFilters,
        )
      })

      expect(mockSearchHistoryStorage.addToSearchHistory).toHaveBeenCalledWith(
        ['불고기'],
        {
          '불고기': {
            url: 'https://example.com/bulgogi.jpg',
            title: '불고기 이미지',
          },
        },
        searchFilters,
      )
    })

    it('should handle multiple keywords and selected images', () => {
      mockSearchHistoryStorage.getSearchHistory
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])

      const { result } = renderHook(() => useSearchHistory())

      const keywords = ['삼계탕', '김치찌개', '비빔밥']
      const selectedImages = {
        '삼계탕': {
          url: 'https://example.com/samgyetang.jpg',
          title: '삼계탕',
        },
        '김치찌개': {
          url: 'https://example.com/kimchi-jjigae.jpg',
          title: '김치찌개',
        },
        '비빔밥': {
          url: 'https://example.com/bibimbap.jpg',
          title: '비빔밥',
        },
      }

      act(() => {
        result.current.addToHistory(keywords, selectedImages)
      })

      expect(mockSearchHistoryStorage.addToSearchHistory).toHaveBeenCalledWith(
        keywords,
        selectedImages,
        undefined,
      )
    })
  })

  describe('removeFromHistory functionality', () => {
    it('should remove entry from history and refresh state', () => {
      const updatedHistory = mockHistory.slice(1) // Remove first item

      mockSearchHistoryStorage.getSearchHistory
        .mockReturnValueOnce(mockHistory)
        .mockReturnValueOnce(updatedHistory)

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual(mockHistory)

      act(() => {
        result.current.removeFromHistory(['삼계탕'])
      })

      expect(mockSearchHistoryStorage.removeFromSearchHistory).toHaveBeenCalledWith(['삼계탕'])
      expect(result.current.history).toEqual(updatedHistory)
      expect(mockSearchHistoryStorage.getSearchHistory).toHaveBeenCalledTimes(2)
    })

    it('should handle removal of non-existent entry gracefully', () => {
      mockSearchHistoryStorage.getSearchHistory
        .mockReturnValueOnce(mockHistory)
        .mockReturnValueOnce(mockHistory)

      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.removeFromHistory(['non-existent-keyword'])
      })

      expect(mockSearchHistoryStorage.removeFromSearchHistory).toHaveBeenCalledWith([
        'non-existent-keyword',
      ])
      expect(result.current.history).toEqual(mockHistory)
    })
  })

  describe('clearHistory functionality', () => {
    it('should clear all history and reset state', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual(mockHistory)

      act(() => {
        result.current.clearHistory()
      })

      expect(mockSearchHistoryStorage.clearSearchHistory).toHaveBeenCalledTimes(1)
      expect(result.current.history).toEqual([])
    })

    it('should handle clearing when history is already empty', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([])

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual([])

      act(() => {
        result.current.clearHistory()
      })

      expect(mockSearchHistoryStorage.clearSearchHistory).toHaveBeenCalledTimes(1)
      expect(result.current.history).toEqual([])
    })
  })

  describe('rerunSearch functionality', () => {
    it('should call onRerunSearch callback when provided', async () => {
      const mockOnRerunSearch = jest.fn().mockResolvedValue(undefined)
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory(mockOnRerunSearch))

      const entryToRerun = mockHistory[0]

      await act(async () => {
        await result.current.rerunSearch(entryToRerun)
      })

      expect(mockOnRerunSearch).toHaveBeenCalledWith(entryToRerun.keywords, entryToRerun.searchFilters)
    })

    it('should handle rerun with search filters', async () => {
      const mockOnRerunSearch = jest.fn().mockResolvedValue(undefined)
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory(mockOnRerunSearch))

      const entryWithFilters = mockHistory[1] // Has search filters

      await act(async () => {
        await result.current.rerunSearch(entryWithFilters)
      })

      expect(mockOnRerunSearch).toHaveBeenCalledWith(
        entryWithFilters.keywords,
        entryWithFilters.searchFilters,
      )
    })

    it('should handle rerun without onRerunSearch callback', async () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory())

      // Should not throw error when no callback is provided
      await act(async () => {
        await result.current.rerunSearch(mockHistory[0])
      })

      // No assertions needed - just ensuring it doesn't throw
    })

    it('should handle rerun search callback errors', async () => {
      const mockOnRerunSearch = jest.fn().mockRejectedValue(new Error('Rerun failed'))
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue(mockHistory)

      const { result } = renderHook(() => useSearchHistory(mockOnRerunSearch))

      // Should not throw error even if callback fails
      await act(async () => {
        try {
          await result.current.rerunSearch(mockHistory[0])
        } catch (error) {
          // Expected to catch error from callback
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockOnRerunSearch).toHaveBeenCalled()
    })
  })

  describe('state synchronization', () => {
    it('should maintain consistent state across multiple operations', () => {
      let currentHistory = [...mockHistory]
      
      mockSearchHistoryStorage.getSearchHistory.mockImplementation(() => [...currentHistory])

      const { result } = renderHook(() => useSearchHistory())

      expect(result.current.history).toEqual(currentHistory)

      // Add new entry
      const newEntry: SearchHistoryEntry = {
        keywords: ['새로운검색'],
        selectedImages: {
          '새로운검색': {
            url: 'https://example.com/new-search.jpg',
            title: '새로운 검색',
          },
        },
        timestamp: Date.now(),
      }

      currentHistory.unshift(newEntry)
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([...currentHistory])

      act(() => {
        result.current.addToHistory(newEntry.keywords, newEntry.selectedImages)
      })

      expect(result.current.history).toEqual(currentHistory)

      // Remove entry
      currentHistory = currentHistory.filter(entry => entry.keywords[0] !== '삼계탕')
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([...currentHistory])

      act(() => {
        result.current.removeFromHistory(['삼계탕'])
      })

      expect(result.current.history).toEqual(currentHistory)

      // Clear all
      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle storage errors gracefully during initialization', () => {
      mockSearchHistoryStorage.getSearchHistory.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw error
      const { result } = renderHook(() => useSearchHistory())

      // Should default to empty array when error occurs
      expect(result.current.history).toEqual([])
    })

    it('should handle rapid successive operations', () => {
      mockSearchHistoryStorage.getSearchHistory.mockReturnValue([])

      const { result } = renderHook(() => useSearchHistory())

      act(() => {
        result.current.addToHistory(['test1'], { test1: { url: 'url1', title: 'title1' } })
        result.current.addToHistory(['test2'], { test2: { url: 'url2', title: 'title2' } })
        result.current.removeFromHistory(['test1'])
      })

      expect(mockSearchHistoryStorage.addToSearchHistory).toHaveBeenCalledTimes(2)
      expect(mockSearchHistoryStorage.removeFromSearchHistory).toHaveBeenCalledTimes(1)
    })
  })
})