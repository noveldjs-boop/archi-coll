"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}
