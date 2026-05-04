"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Building2, ArrowLeft } from "lucide-react"
import { signIn } from "next-auth/react"

export default function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role } = React.use(params)
  const safeRole = role || "editor"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Role configuration
  const roleConfig: Record<string, { name: string; color: string; email: string; password: string }> = {
    editor: {
      name: "Editor",
      color: "from-blue-500 to-blue-600",
      email: "editor@archi-coll.com",
      password: "editor123",
    },
    finance: {
      name: "Finance",
      color: "from-green-500 to-green-600",
      email: "finance@archi-coll.com",
      password: "finance123",
    },
    marketing: {
      name: "Marketing",
      color: "from-orange-500 to-orange-600",
      email: "marketing@archi-coll.com",
      password: "marketing123",
    },
    hrd: {
      name: "HRD",
      color: "from-pink-500 to-pink-600",
      email: "hrd@archi-coll.com",
      password: "hrd123",
    },
  }

  const config = roleConfig[safeRole] || roleConfig.editor

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        // Login successful, redirect to respective dashboard
        router.push(`/${safeRole}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Back to Admin Portal */}
        <Link
          href="/admin/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Portal Admin
        </Link>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className={`bg-gradient-to-br ${config.color} p-4 rounded-full`}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">
              Login {config.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              ARCHI-COLL - Masuk ke dashboard {config.name.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={config.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${config.color} text-white`}
                disabled={loading}
              >
                {loading ? "Memproses..." : `Masuk sebagai ${config.name}`}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo: {config.email} / {config.password}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
