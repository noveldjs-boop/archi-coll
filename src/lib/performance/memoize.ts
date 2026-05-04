/**
 * Simple memoization utility for caching expensive function results
 */

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Memoize with TTL (time-to-live)
 * @param func - Function to memoize
 * @param ttl - Time to live in milliseconds
 * @param keyGenerator - Optional key generator
 * @returns Memoized function
 */
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttl: number,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const now = Date.now()

    const cached = cache.get(key)
    if (cached && now - cached.timestamp < ttl) {
      return cached.value
    }

    const result = func(...args)
    cache.set(key, { value: result, timestamp: now })

    // Clean up expired entries
    setTimeout(() => {
      const entry = cache.get(key)
      if (entry && Date.now() - entry.timestamp >= ttl) {
        cache.delete(key)
      }
    }, ttl)

    return result
  }
}

/**
 * Clear memoization cache
 */
export function clearCache<T extends (...args: any[]) => any>(memoized: T): void {
  const cached = memoized as any
  if (cached.cache) {
    cached.cache.clear()
  }
}

/**
 * Get cache size
 */
export function getCacheSize<T extends (...args: any[]) => any>(memoized: T): number {
  const cached = memoized as any
  return cached.cache?.size || 0
}
