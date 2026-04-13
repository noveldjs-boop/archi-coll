'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchWithCache, invalidateCache } from '@/lib/performance'

type PortfolioProject = {
  id: string
  titleIndo: string
  titleEng: string
  descriptionIndo?: string
  descriptionEng?: string
  imageUrl: string
  category: string
  order: number
  active: boolean
}

export function useOptimizedPortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchPortfolio = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchWithCache(
        '/api/portfolio',
        async () => {
          const res = await fetch('/api/portfolio')
          const result = await res.json()
          return result.data || []
        },
        5 * 60 * 1000 // 5 minutes cache
      )

      if (mountedRef.current) {
        setPortfolio(data)
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      if (mountedRef.current) {
        setError('An error occurred while fetching portfolio')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const refetch = useCallback(() => {
    invalidateCache('/api/portfolio')
    fetchPortfolio()
  }, [fetchPortfolio])

  useEffect(() => {
    fetchPortfolio()
    return () => {
      mountedRef.current = false
    }
  }, [fetchPortfolio])

  return { portfolio, loading, error, refetch }
}
