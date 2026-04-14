'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function DashboardBackButton() {
  const router = useRouter()
  const [userType, setUserType] = useState<'client' | 'architect' | null>(null)

  useEffect(() => {
    // Check if user is client or architect
    const clientUser = localStorage.getItem('clientUser')
    if (clientUser) {
      try {
        const parsed = JSON.parse(clientUser)
        if (parsed.role === 'client') {
          setUserType('client')
          return
        }
      } catch (err) {
        console.error('Error parsing client user:', err)
      }
    }

    // Check session for architect/member
    fetch('/api/members/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.member) {
          setUserType('architect')
        }
      })
      .catch(err => {
        console.error('Error checking user type:', err)
        // Default to architect if we can't determine
        setUserType('architect')
      })
  }, [])

  const handleClick = () => {
    if (userType === 'client') {
      router.push('/client/dashboard')
    } else {
      router.push('/architect/dashboard')
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-white hover:bg-gray-800"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Kembali ke Dashboard
    </Button>
  )
}
