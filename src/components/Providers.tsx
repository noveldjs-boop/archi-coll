'use client'

import { SessionProvider } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { LanguageProvider } from "@/contexts/LanguageContext"

function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Only enable session polling for protected routes (admin, member dashboard, etc.)
  const isProtectedRoute = useMemo(() => {
    return pathname?.startsWith('/admin') || pathname?.startsWith('/member/dashboard')
  }, [pathname])

  return (
    <SessionProvider
      refetchInterval={isProtectedRoute ? 5 * 60 : 0} // Only refetch on protected routes every 5 minutes
      refetchOnWindowFocus={isProtectedRoute} // Only refetch on focus for protected routes
    >
      {children}
    </SessionProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProviderWrapper>{children}</SessionProviderWrapper>
    </LanguageProvider>
  )
}
