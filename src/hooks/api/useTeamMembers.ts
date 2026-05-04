'use client'

import { useState, useEffect } from 'react'
import type { TeamMember } from '@/types'

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/team-members')
      const data = await res.json()

      if (data.success) {
        // Filter only active team members
        setTeamMembers((data.data || []).filter((member: TeamMember) => member.active))
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch team members')
      }
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError('An error occurred while fetching team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  return { teamMembers, loading, error, refetch: fetchTeamMembers }
}
