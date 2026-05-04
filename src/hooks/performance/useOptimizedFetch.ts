'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce, fetchWithCache, prefetch } from '@/lib/performance'

interface OptimizedFetchOptions {
  debounceMs?: number
  cacheTTL?: number
  prefetchOnHover?: boolean
  prefetchOnFocus?: boolean
}

interface OptimizedFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
  prefetch: () => void
}

/**
 * Optimized fetch hook with caching, debouncing, and prefetching
 */
export function useOptimizedFetch<T>(
  url: string,
  options: OptimizedFetchOptions = {}
): OptimizedFetchResult<T> {
  const {
    debounceMs = 300,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    prefetchOnHover = false,
    prefetchOnFocus = false,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)

  // Fetch function with caching
  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchWithCache(
        url,
        async () => {
          const res = await fetch(url)
          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch data')
          }

          return data.data || data
        },
        cacheTTL
      )

      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [url, cacheTTL])

  // Debounced refetch
  const debouncedRefetch = useCallback(debounce(() => {
    fetchData()
  }, debounceMs), [fetchData, debounceMs])

  // Prefetch function
  const prefetchData = useCallback(() => {
    prefetch(
      url,
      async () => {
        const res = await fetch(url)
        const data = await res.json()
        return data.data || data
      },
      cacheTTL
    )
  }, [url, cacheTTL])

  // Fetch on mount
  useEffect(() => {
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: debouncedRefetch,
    prefetch: prefetchData,
  }
}
