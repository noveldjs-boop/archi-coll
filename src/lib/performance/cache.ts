/**
 * Simple in-memory cache for API responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class Cache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * Get cached data
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cached data
   */
  set(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, { data, timestamp: Date.now(), expiresAt })
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
export const apiCache = new Cache<any>(50, 5 * 60 * 1000) // 50 entries, 5 minutes TTL
export const imageCache = new Cache<string>(20, 60 * 60 * 1000) // 20 entries, 1 hour TTL
export const staticContentCache = new Cache<any>(30, 10 * 60 * 1000) // 30 entries, 10 minutes TTL

/**
 * Fetch with caching
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = apiCache.get(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()

  // Cache the result
  apiCache.set(key, data, ttl)

  return data
}

/**
 * Prefetch data in background
 */
export function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): void {
  fetchWithCache(key, fetcher, ttl).catch((error) => {
    console.error('Prefetch error:', error)
  })
}

/**
 * Invalidate cache by key pattern
 */
export function invalidateCache(pattern: string): void {
  const keys = Array.from(apiCache['cache'].keys())
  const regex = new RegExp(pattern)

  keys.forEach((key) => {
    if (regex.test(key)) {
      apiCache.delete(key)
    }
  })
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  apiCache.clear()
  imageCache.clear()
  staticContentCache.clear()
}
