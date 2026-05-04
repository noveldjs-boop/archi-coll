'use client'

import { useState, useEffect } from 'react'
import type { Service } from '@/types'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/services')
      const data = await res.json()

      if (data.success) {
        setServices(data.data || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch services')
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('An error occurred while fetching services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return { services, loading, error, refetch: fetchServices }
}
