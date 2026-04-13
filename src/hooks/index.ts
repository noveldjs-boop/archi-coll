// Central Hooks Exports

// Performance Hooks
export * from './performance/useOptimizedFetch'
export * from './performance/useOptimizedServices'
export * from './performance/useOptimizedPortfolio'

// Common Hooks
export { useToast } from './use-toast'
export { useIsMobile } from './use-mobile'
export { usePerformance } from './usePerformance'
export { useOptimizedFetch } from './useGenericOptimizedFetch'
export { prefetch, prefetchURL, usePrefetchOnHover, usePrefetchOnVisibility, useDebouncedPrefetch } from './useGenericPrefetch'
export { usePrefetch } from './usePrefetch'
