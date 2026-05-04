'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { fetchWithCache, invalidateCache } from '@/lib/performance/cache'

type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type PaginationParams = {
  page?: number
  limit?: number
  sort?: string
  filter?: Record<string, any>
  search?: string
}

interface OptimizedFetchOptions<T = any> {
  url?: string
  queryParams?: PaginationParams
  enabled?: boolean
  retryCount?: number
  retryDelay?: number
  staleWhileRevalidating?: boolean
  revalidateOnFocus?: boolean
  refetchOnWindowFocus?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface OptimizedFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  isRefetching: boolean
  refetch: () => void
  invalidate: () => void
  clearError: () => void
}

/**
 * Generic optimized fetch hook with advanced features
 */
export function useOptimizedFetch<T>(
  url: string,
  options: OptimizedFetchOptions<T> = {}
): OptimizedFetchResult<T> {
  const {
    queryParams = {},
    enabled = true,
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    staleWhileRevalidating = false,
    revalidateOnFocus = false,
    refetchOnWindowFocus = false,
    onSuccess,
    onError,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const retryCountRef = useRef(retryCount)
  const retryDelayRef = useRef(retryDelay)

  // Fetch function with retry logic
  const fetchData = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const controller: AbortController = (signal as any) || abortController || new AbortController()
      setAbortController(controller)

      const queryParamsStr = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParamsStr.append(key, String(value))
        }
      })

      const queryString = queryParamsStr.toString()
      const urlWithParams = queryString
        ? `${url}${queryString ? `?${queryString}` : ''}`
        : url

      const res = await fetch(urlWithParams, {
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const contentType = res.headers.get('content-type')

      if (!contentType?.includes('application/json')) {
        throw new Error(`Expected JSON response, got ${contentType}`)
      }

      const json = await res.json()

      if (json.success === false) {
        throw new Error(json.error || 'Request failed')
      }

      setData(json.data || json)
      onSuccess?.(json.data || json)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [url, queryParams, onSuccess, onError, staleWhileRevalidating])

  // Refetch function with retry logic
  const refetch = useCallback(() => {
    if (isRefetching) return

    setIsRefetching(true)
    setRetryCount(prev => prev + 1)

    const fetchDataWithRetry = async () => {
      try {
        await fetchData()
      } catch (err) {
        if (retryCountRef.current < retryCountRef.current) {
          setTimeout(() => {
            fetchDataWithRetry()
          }, retryDelayRef.current)
          retryCountRef.current++
        } else {
          // Max retries exceeded
          setError(new Error('Max retries exceeded'))
        }
      }
    }

    fetchDataWithRetry()
  }, [fetchData, maxRetries, retryDelay])

  // Invalidate cache and refetch
  const invalidate = useCallback(() => {
    // Invalidate cache
    if (url.startsWith('/')) {
      invalidateCache(url.substring(1))
    } else {
      invalidateCache(url)
    }

    // Refetch fresh data
    setRetryCount(0)
    fetchData()
  }, [url, fetchData, maxRetries, retryDelay])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-refetch on window focus (for background updates)
  useEffect(() => {
    if (!revalidateOnFocus || !refetchOnWindowFocus) return

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        invalidate()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, refetchOnWindowFocus, invalidate])

  // Auto-refetch on page visibility (for SPA route changes)
  useEffect(() => {
    if (!staleWhileRevalidating) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Slight delay to prevent thundering herd effects
        setTimeout(() => {
          invalidate()
        }, 1000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [staleWhileRevalidating, invalidate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  return {
    data,
    loading,
    error,
    isRefetching,
    refetch,
    invalidate,
    clearError,
  }
}

/**
 * Optimized fetch hook for paginated data
 */
export function useOptimizedPaginatedFetch<T>(
  url: string,
  options: Omit<OptimizedFetchOptions<T>, 'url'>
) {
  const { queryParams = {} } = options

  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (pageNumber?: number): Promise<void> => {
    if (!pageNumber) return

    setLoading(true)
    setError(null)

    try {
      const params: any = { ...queryParams, page: pageNumber }
      const urlWithParams = `${url}?${new URLSearchParams(params).toString()}`
      
      const res = await fetch(urlWithParams, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data')
      }

      setData(data.data || null)
      setPage(data.pagination?.page || 1)
      setTotalItems(data.pagination?.total || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [url, queryParams])

  const totalPages = totalItems > 0 ? Math.ceil(totalItems / (queryParams.limit || 20)) : 1

  const refetch = useCallback(() => {
    setPage(1)
    fetchData()
  }, [fetchData, url, queryParams])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1)
    }
  }, [page, totalPages])

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    nextPage,
    prevPage: page > 1 ? page - 1 : null,
    refetch,
  }
}
