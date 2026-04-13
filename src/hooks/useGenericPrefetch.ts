/**
 * useGenericPrefetch - Generic prefetching utility with queue management
 */

interface PrefetchEntry {
  url: string
  priority: 'high' | 'medium' | 'low'
  timestamp: number
}

class PrefetchManager {
  private queue: PrefetchEntry[]
  private maxConcurrent: number = 2
  private currentConcurrent: number = 0
  private isPaused = false

  private resolveQueue: Array<() => void> = []

  addResolver(resolve: () => void) {
    this.resolveQueue.push(resolve)
    this.processQueue()
  }

  processQueue() {
    if (this.isPaused || this.currentConcurrent >= this.maxConcurrent) {
      return
    }

    const resolve = this.resolveQueue.shift()
    if (resolve) {
      resolve()
      this.currentConcurrent++
      setTimeout(() => {
        this.currentConcurrent--
        this.processQueue()
      }, 0)
    }
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
    this.processQueue()
  }
}

// Global prefetch manager instance
const prefetchManager = new PrefetchManager()

/**
 * Prefetch URL with priority
 */
export function prefetch(
  urls: string[],
  priority: 'high' | 'medium' | 'low' = 'medium'
) {
  if (typeof window === 'undefined') {
    // Server-side - skip prefetching
    return
  }

  const timestamp = Date.now()

  urls.forEach(url => {
    const entry: PrefetchEntry = {
      url,
      priority,
      timestamp,
    }

    prefetchManager.addResolver(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      link.as = 'fetch'
      link.crossOrigin = 'anonymous'
      link.onload = () => {
        // Remove prefetch link after loading
        setTimeout(() => {
          link.remove()
        }, 5000)
      }
      link.onerror = () => {
        // Remove failed prefetch link
        setTimeout(() => {
          link.remove()
        }, 5000)
      }
      document.head.appendChild(link)
    })
  })
}

/**
 * Prefetch single URL
 */
export function prefetchURL(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  prefetch([url], priority)
}

/**
 * Prefetch on hover (for navigation links)
 */
export function usePrefetchOnHover(urls: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  const timeoutMap = new Map<string, NodeJS.Timeout>()

  const handleMouseEnter = (url: string) => {
    if (timeoutMap.has(url)) {
      clearTimeout(timeoutMap.get(url)!)
    }

    timeoutMap.set(
      url,
      setTimeout(() => {
        prefetch([url], 'high')
        timeoutMap.delete(url)
      }, 500) // 500ms delay
    )
  }

  const handleMouseLeave = (url: string) => {
    const timeoutId = timeoutMap.get(url)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutMap.delete(url)
    }
  }

  return { handleMouseEnter, handleMouseLeave }
}

/**
 * Prefetch on visibility (Intersection Observer)
 */
export function usePrefetchOnVisibility(
  urls: string[],
  threshold = 0.1,
  rootMargin = '50px'
) {
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>()

  const prefetch = (url: string) => {
    if (timeoutRef.current.has(url)) {
      clearTimeout(timeoutRef.current.get(url)!)
    }

    timeoutRef.current.set(
      url,
      setTimeout(() => {
        prefetch([url], 'medium')
        timeoutRef.current.delete(url)
      }, 2000) // 2 seconds delay
    )
  }

  return prefetch
}

/**
 * Generic prefetch hook with debouncing
 */
export function useDebouncedPrefetch(
  urls: string[],
  debounceMs = 500
) {
  if (typeof window === 'undefined') {
    return
  }

  const debouncedPrefetch = debounce(
    () => prefetch(urls, 'medium'),
    debounceMs
  )

  return { debouncedPrefetch }
}
