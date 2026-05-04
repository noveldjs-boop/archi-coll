'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchWithCache, invalidateCache } from '@/lib/performance'

type Service = {
  id: string
  code: string
  titleId: string
  titleIndo: string
  titleEng: string
  descId: string
  descIndo: string
  descEng: string
  icon: string | null
  imageUrl: string | null
  order: number
  active: boolean
  features: Array<{
    id: string
    serviceId: string
    featureId: string
    textIndo: string
    textEng: string
    order: number
    createdAt: string
    updatedAt: string
  }>
}

export function useOptimizedServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchServices = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchWithCache(
        '/api/services',
        async () => {
          const res = await fetch('/api/services')
          const result = await res.json()
          return result.data || []
        },
        5 * 60 * 1000 // 5 minutes cache
      )

      if (mountedRef.current) {
        setServices(data)
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      if (mountedRef.current) {
        setError('An error occurred while fetching services')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const refetch = useCallback(() => {
    invalidateCache('/api/services')
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    fetchServices()
    return () => {
      mountedRef.current = false
    }
  }, [fetchServices])

  return { services, loading, error, refetch }
}
