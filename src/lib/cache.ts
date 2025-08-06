interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  defaultTTL?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  cleanupInterval?: number // Cleanup interval in milliseconds
}

export class InMemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number
  private readonly maxSize: number
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.defaultTTL ?? 24 * 60 * 60 * 1000 // 24 hours default
    this.maxSize = options.maxSize ?? 1000
    
    // Start automatic cleanup
    const cleanupInterval = options.cleanupInterval ?? 60 * 60 * 1000 // 1 hour default
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval)
  }

  /**
   * Generate a normalized cache key from query parameters
   */
  static generateKey(query: string, maxResults: number, apiKeyHash?: string, filtersHash?: string): string {
    const normalizedQuery = query.toLowerCase().trim()
    const keyParts = [normalizedQuery, maxResults.toString()]
    
    if (apiKeyHash) {
      keyParts.push(apiKeyHash.substring(0, 8)) // Use first 8 chars of hash
    }
    
    if (filtersHash) {
      keyParts.push(filtersHash.substring(0, 8)) // Use first 8 chars of filters hash
    }
    
    return keyParts.join(':')
  }

  /**
   * Get value from cache if it exists and hasn't expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    const now = Date.now()
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set value in cache with optional custom TTL
   */
  set(key: string, value: T, customTTL?: number): void {
    const ttl = customTTL ?? this.defaultTTL
    
    // If at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Check if key exists and hasn't expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }

  /**
   * Destroy the cache and cleanup timers
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// Create a simple hash function for API keys
export function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}