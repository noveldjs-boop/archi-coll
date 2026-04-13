'use client'

import { useState, useEffect } from 'react'
import type { ContactInfo } from '@/types'

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/contact-info')
      const data = await res.json()

      if (data.success) {
        // Filter only active contact info
        setContactInfo((data.data || []).filter((item: ContactInfo) => item.active))
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch contact info')
      }
    } catch (err) {
      console.error('Error fetching contact info:', err)
      setError('An error occurred while fetching contact info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactInfo()
  }, [])

  return { contactInfo, loading, error, refetch: fetchContactInfo }
}
