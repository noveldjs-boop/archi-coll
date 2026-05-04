'use client'

import { useState, useEffect } from 'react'
import type { OperatingHours } from '@/types'

export function useOperatingHours() {
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOperatingHours = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/operating-hours')
      const data = await res.json()

      if (data.success) {
        setOperatingHours(data.data || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch operating hours')
      }
    } catch (err) {
      console.error('Error fetching operating hours:', err)
      setError('An error occurred while fetching operating hours')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperatingHours()
  }, [])

  return { operatingHours, loading, error, refetch: fetchOperatingHours }
}
