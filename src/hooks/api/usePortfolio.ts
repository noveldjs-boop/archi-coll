'use client'

import { useState, useEffect } from 'react'
import type { PortfolioProject } from '@/types'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/portfolio')
      const data = await res.json()

      if (data.success) {
        setPortfolio(data.data || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch portfolio')
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setError('An error occurred while fetching portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  return { portfolio, loading, error, refetch: fetchPortfolio }
}
