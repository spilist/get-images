/**
 * @jest-environment jsdom
 */
import { InMemoryCache, simpleHash } from '@/lib/cache'

describe('InMemoryCache', () => {
  let cache: InMemoryCache<string>

  beforeEach(() => {
    jest.useFakeTimers()
    // Suppress console.log for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('constructor and initialization', () => {
    it('should initialize with default options', () => {
      cache = new InMemoryCache()
      const stats = cache.getStats()

      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(1000)
    })

    it('should initialize with custom options', () => {
      cache = new InMemoryCache({
        defaultTTL: 1000,
        maxSize: 50,
        cleanupInterval: 5000,
      })

      const stats = cache.getStats()
      expect(stats.maxSize).toBe(50)
    })

    it('should start automatic cleanup timer', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval')
      
      cache = new InMemoryCache({
        cleanupInterval: 30000,
      })

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000,
      )
    })
  })

  describe('generateKey static method', () => {
    it('should generate key from query and maxResults', () => {
      const key = InMemoryCache.generateKey('삼계탕', 5)
      expect(key).toBe('삼계탕:5')
    })

    it('should normalize query to lowercase and trim', () => {
      const key = InMemoryCache.generateKey('  SAMGYETANG  ', 3)
      expect(key).toBe('samgyetang:3')
    })

    it('should include API key hash when provided', () => {
      const key = InMemoryCache.generateKey('삼계탕', 5, 'abcdef123456789')
      expect(key).toBe('삼계탕:5:abcdef12')
    })

    it('should include filters hash when provided', () => {
      const key = InMemoryCache.generateKey('삼계탕', 5, undefined, 'xyz789abc123')
      expect(key).toBe('삼계탕:5:xyz789ab')
    })

    it('should include both API key and filters hash', () => {
      const key = InMemoryCache.generateKey('삼계탕', 5, 'api123456789', 'filter123456789')
      expect(key).toBe('삼계탕:5:api12345:filter12')
    })
  })

  describe('basic cache operations', () => {
    beforeEach(() => {
      cache = new InMemoryCache({
        defaultTTL: 60000, // 1 minute
        maxSize: 3,
      })
    })

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('exists', 'value')
      
      expect(cache.has('exists')).toBe(true)
      expect(cache.has('notexists')).toBe(false)
    })

    it('should delete keys', () => {
      cache.set('todelete', 'value')
      expect(cache.has('todelete')).toBe(true)
      
      const deleted = cache.delete('todelete')
      expect(deleted).toBe(true)
      expect(cache.has('todelete')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      expect(cache.getStats().size).toBe(2)
      
      cache.clear()
      expect(cache.getStats().size).toBe(0)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('TTL and expiration', () => {
    beforeEach(() => {
      cache = new InMemoryCache({
        defaultTTL: 1000, // 1 second
      })
    })

    it('should return valid values before expiration', () => {
      cache.set('key1', 'value1')
      
      // Move time forward but not past TTL
      jest.advanceTimersByTime(500)
      
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return null for expired entries', () => {
      cache.set('key1', 'value1')
      
      // Move time past TTL
      jest.advanceTimersByTime(1001)
      
      expect(cache.get('key1')).toBeNull()
    })

    it('should remove expired entries when accessed', () => {
      cache.set('key1', 'value1')
      expect(cache.getStats().size).toBe(1)
      
      jest.advanceTimersByTime(1001)
      cache.get('key1') // This should remove the expired entry
      
      expect(cache.getStats().size).toBe(0)
    })

    it('should use custom TTL when provided', () => {
      cache.set('short', 'value', 500) // 0.5 second TTL
      cache.set('long', 'value', 2000) // 2 second TTL
      
      // After 1 second, short should expire but long should remain
      jest.advanceTimersByTime(1000)
      
      expect(cache.get('short')).toBeNull()
      expect(cache.get('long')).toBe('value')
    })
  })

  describe('size management', () => {
    beforeEach(() => {
      cache = new InMemoryCache({
        maxSize: 2,
        defaultTTL: 60000,
      })
    })

    it('should enforce maximum size by removing oldest entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      expect(cache.getStats().size).toBe(2)
      
      // Adding third item should remove first
      cache.set('key3', 'value3')
      
      expect(cache.getStats().size).toBe(2)
      expect(cache.get('key1')).toBeNull() // Oldest removed
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('should handle max size of 1', () => {
      cache = new InMemoryCache({ maxSize: 1 })
      
      cache.set('first', 'value1')
      cache.set('second', 'value2')
      
      expect(cache.getStats().size).toBe(1)
      expect(cache.get('first')).toBeNull()
      expect(cache.get('second')).toBe('value2')
    })
  })

  describe('cleanup functionality', () => {
    beforeEach(() => {
      cache = new InMemoryCache({
        defaultTTL: 1000,
        cleanupInterval: 5000,
      })
    })

    it('should remove expired entries during cleanup', () => {
      cache.set('key1', 'value1', 500) // Expires in 0.5s
      cache.set('key2', 'value2', 2000) // Expires in 2s
      
      expect(cache.getStats().size).toBe(2)
      
      // Move time forward to expire first entry
      jest.advanceTimersByTime(1000)
      
      // Manually trigger cleanup
      cache.cleanup()
      
      expect(cache.getStats().size).toBe(1)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
    })

    it('should log cleanup statistics', () => {
      cache.set('key1', 'value1', 500)
      cache.set('key2', 'value2', 500)
      
      jest.advanceTimersByTime(1000)
      cache.cleanup()
      
      expect(console.log).toHaveBeenCalledWith(
        'Cache cleanup: removed 2 expired entries',
      )
    })

    it('should not log when no entries are removed', () => {
      cache.set('key1', 'value1', 2000)
      
      jest.advanceTimersByTime(1000) // Not expired yet
      cache.cleanup()
      
      expect(console.log).not.toHaveBeenCalled()
    })

    it('should run automatic cleanup on interval', () => {
      const cleanupSpy = jest.spyOn(cache, 'cleanup')
      
      // Add expired entry
      cache.set('key1', 'value1', 500)
      jest.advanceTimersByTime(1000)
      
      // Trigger cleanup interval
      jest.advanceTimersByTime(5000)
      
      expect(cleanupSpy).toHaveBeenCalled()
    })
  })

  describe('destroy method', () => {
    it('should clear timers and cache on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      cache = new InMemoryCache()
      cache.set('key1', 'value1')
      
      expect(cache.getStats().size).toBe(1)
      
      cache.destroy()
      
      expect(cache.getStats().size).toBe(0)
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should handle multiple destroy calls gracefully', () => {
      cache = new InMemoryCache()
      
      expect(() => {
        cache.destroy()
        cache.destroy()
      }).not.toThrow()
    })
  })

  describe('complex scenarios', () => {
    beforeEach(() => {
      cache = new InMemoryCache({
        defaultTTL: 2000,
        maxSize: 3,
      })
    })

    it('should handle mixed operations correctly', () => {
      // Add entries
      cache.set('a', 'value-a', 1000)
      cache.set('b', 'value-b', 3000)
      cache.set('c', 'value-c', 2000)
      
      expect(cache.getStats().size).toBe(3)
      
      // Move time to expire first entry
      jest.advanceTimersByTime(1500)
      
      // Check that 'a' is expired (this will remove it from cache)
      expect(cache.get('a')).toBeNull() // Expired and removed
      
      // Now add new entry - should fit in the space freed by expired 'a'
      cache.set('d', 'value-d')
      
      expect(cache.get('b')).toBe('value-b') // Should still exist
      expect(cache.get('c')).toBe('value-c') // Should still exist  
      expect(cache.get('d')).toBe('value-d') // New entry
    })

    it('should handle rapid operations', () => {
      // Rapidly add many entries
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`)
      }
      
      // Should only keep last 3 due to maxSize
      expect(cache.getStats().size).toBe(3)
      expect(cache.get('key7')).toBe('value7')
      expect(cache.get('key8')).toBe('value8')
      expect(cache.get('key9')).toBe('value9')
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      cache = new InMemoryCache()
    })

    it('should handle empty string keys', () => {
      cache.set('', 'empty-key-value')
      expect(cache.get('')).toBe('empty-key-value')
    })

    it('should handle null values', () => {
      cache.set('null-key', null as any)
      expect(cache.get('null-key')).toBeNull()
    })

    it('should handle undefined values', () => {
      cache.set('undefined-key', undefined as any)
      expect(cache.get('undefined-key')).toBe(undefined)
    })

    it('should handle zero TTL', () => {
      cache.set('zero-ttl', 'value', 0)
      
      // Move time forward by 1ms to ensure expiration
      jest.advanceTimersByTime(1)
      
      // Should immediately expire
      expect(cache.get('zero-ttl')).toBeNull()
    })

    it('should handle negative TTL', () => {
      cache.set('negative-ttl', 'value', -1000)
      
      // Should immediately expire
      expect(cache.get('negative-ttl')).toBeNull()
    })
  })
})

describe('simpleHash utility', () => {
  it('should generate consistent hash for same input', () => {
    const input = 'test-api-key-123456789'
    const hash1 = simpleHash(input)
    const hash2 = simpleHash(input)
    
    expect(hash1).toBe(hash2)
    expect(typeof hash1).toBe('string')
  })

  it('should generate different hashes for different inputs', () => {
    const hash1 = simpleHash('input1')
    const hash2 = simpleHash('input2')
    
    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty string', () => {
    const hash = simpleHash('')
    expect(hash).toBe('0')
  })

  it('should handle unicode characters', () => {
    const hash1 = simpleHash('삼계탕')
    const hash2 = simpleHash('김치찌개')
    
    expect(hash1).not.toBe(hash2)
    expect(typeof hash1).toBe('string')
    expect(typeof hash2).toBe('string')
  })

  it('should return hexadecimal string', () => {
    const hash = simpleHash('test123')
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000)
    const hash = simpleHash(longString)
    
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })
})