'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function BackToDashboardButton() {
  const [dashboardPath, setDashboardPath] = useState<string>('/architect/dashboard')

  useEffect(() => {
    const clientUser = localStorage.getItem('clientUser')
    if (clientUser) {
      setDashboardPath('/client/dashboard')
    }
  }, [])

  return (
    <Link href={dashboardPath}>
      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Dashboard
      </Button>
    </Link>
  )
}
