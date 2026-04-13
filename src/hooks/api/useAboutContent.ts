'use client'

import { useState, useEffect } from 'react'
import type { AboutContent } from '@/types'

export function useAboutContent() {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAboutContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/about-content')
      const data = await res.json()

      if (data.success) {
        setAboutContent(data.data || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch about content')
      }
    } catch (err) {
      console.error('Error fetching about content:', err)
      setError('An error occurred while fetching about content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAboutContent()
  }, [])

  return { aboutContent, loading, error, refetch: fetchAboutContent }
}
