"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { adminAuthOptions } from "@/lib/auth-admin"

export default function AdminLayout({
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
