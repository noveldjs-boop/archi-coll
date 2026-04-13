/**
 * usePrefetch - Prefetch data in background when component mounts
 */
import { useEffect, useRef } from 'react'

interface PrefetchOptions {
  enabled?: boolean
  onlyIfIdle?: boolean
}

export function usePrefetch(urls: string[], options: PrefetchOptions = {}) {
  const { enabled = true, onlyIfIdle = false } = options

  useEffect(() => {
    if (!enabled) return

    // Use requestIdleCallback for prefetching when browser is idle
    const prefetchData = () => {
      urls.forEach(url => {
        // Use link prefetch for page navigation
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      })
    }

    if (onlyIfIdle && 'requestIdleCallback' in window) {
      // Prefetch only when browser is idle
      requestIdleCallback(
        () => prefetchData(),
        { timeout: 5000 } // 5 seconds timeout
      )
    } else {
      // Prefetch immediately
      prefetchData()
    }
  }, [urls, enabled, onlyIfIdle])
}

/**
 * Prefetch single URL
 */
export function usePrefetch(url: string, options?: PrefetchOptions) {
  return usePrefetch([url], options)
}

/**
 * Prefetch data for pages - use in layout for critical routes
 */
export function usePagePrefetch() {
  // Prefetch critical pages
  usePrefetch(
    [
      '/api/services',
      '/api/portfolio',
      '/api/team-members',
      '/api/contact-info',
      '/api/operating-hours',
      '/api/home-stats',
    ],
    { enabled: true, onlyIfIdle: true }
  )
}