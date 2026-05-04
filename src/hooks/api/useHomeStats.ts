'use client'

import { useState, useEffect } from 'react'
import type { HomeStats } from '@/types'

export function useHomeStats() {
  const [stats, setStats] = useState<HomeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/home-stats')
      const data = await res.json()

      if (data.success) {
        setStats(data.data || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch home stats')
      }
    } catch (err) {
      console.error('Error fetching home stats:', err)
      setError('An error occurred while fetching home stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
