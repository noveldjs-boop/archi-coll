/**
 * Improved Cache Configuration
 * Better cache management with TTL, cleanup, and memory efficiency
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  hitCount: number
  missCount: number
}

class AdvancedCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private defaultTTL: number
  private cleanupInterval: NodeJS.Timeout | null

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.cleanupInterval = null
  }

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

    // Update hit count
    entry.hitCount++
    entry.timestamp = Date.now()

    return entry.data
  }

  set(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
      hitCount: 0,
      missCount: 0,
    }

    this.cache.set(key, entry)

    // Clean up oldest entries if at max capacity
    if (this.cache.size >= this.maxSize) {
      this.cleanupOldestEntries()
    }
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  size(): number {
    return this.cache.size
  }

  getStats() {
    return {
      total: this.size(),
      hitCount: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hitCount, 0),
      missCount: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.missCount, 0),
    }
  }

  cleanupOldestEntries(): void {
    const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)

    // Remove oldest entries if over capacity
    if (entries.length > this.maxSize) {
      entries.slice(this.maxSize).forEach(([key]) => {
        this.cache.delete(key)
      })
    }
  }

  startCleanup(intervalMs: number = 5 * 60 * 1000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries()
    }, intervalMs)
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  clearByPattern(pattern: string): void {
    const regex = new RegExp(pattern, 'g')
    const keys = Array.from(this.cache.keys())

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    })
  }

  cleanupExpired(): void {
    const now = Date.now()
    const keys = Array.from(this.cache.keys())

    keys.forEach((key) => {
      const entry = this.cache.get(key)
      if (entry && now > entry.expiresAt) {
        this.cache.delete(key)
      }
    })
  }
}

// Global cache instances with different TTLs
export const shortTermCache = new AdvancedCache<any>(100, 1 * 60 * 1000) // 1 minute
export const mediumTermCache = new AdvancedCache<any>(100, 5 * 60 * 1000) // 5 minutes
export const longTermCache = new AdvancedCache<any>(50, 10 * 60 * 1000) // 10 minutes
export const imageCache = new AdvancedCache<string>(20, 60 * 60 * 1000) // 1 hour

// Start automatic cleanup
shortTermCache.startCleanup() // Clean expired entries every 1 minute
mediumTermCache.startCleanup() // Clean expired entries every 5 minutes
longTermCache.startCleanup() // Clean expired entries every 10 minutes
imageCache.startCleanup() // Clean expired images every 1 minute

// Export cache instances
export const cache = {
  short: shortTermCache,
  medium: mediumTermCache,
  long: longTermCache,
  image: imageCache,
}

// Cache utilities
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cacheKey = `cache_${ttl}`

  const cached = shortTermCache.get(cacheKey)
  if (cached !== null) {
    return cached.data
  }

  const data = await fetcher()

  // Cache the result with specified TTL
  const ttlToUse = ttl || 5 * 60 * 1000
  shortTermCache.set(cacheKey, data, ttlToUse)

  return data
}

/**
 * Get multiple cached items at once
 */
export async function batchGetCached<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>
): Promise<Map<string, T>> {
  const results = new Map<string, T>()
  const promises = keys.map(async (key) => {
    const data = await getCachedData(key, fetcher)
    return [key, data]
  })

  const resolved = await Promise.all(promises)

  resolved.forEach(([key, data]) => {
    results.set(key, data)
  })

  return results
}

/**
 * Clear cache by pattern
 */
export function clearCacheByPattern(pattern: string): void {
  const regex = new RegExp(pattern, 'g')
  const keys = Array.from(shortTermCache.cache.keys())

  keys.forEach((key) => {
    if (regex.test(key)) {
      shortTermCache.delete(key)
    }
  })

  // Also clear medium and long term caches
  mediumTermCache.clearByPattern(pattern)
  longTermCache.clearByPattern(pattern)
}

/**
 * Clear expired entries
 */
export function clearExpiredCache(): void {
  shortTermCache.cleanupExpired()
  mediumTermCache.cleanupExpired()
  longTermCache.cleanupExpired()
  imageCache.cleanupExpired()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    short: shortTermCache.getStats(),
    medium: mediumTermCache.getStats(),
    long: longTermCache.getStats(),
    image: imageCache.getStats(),
  }
}
