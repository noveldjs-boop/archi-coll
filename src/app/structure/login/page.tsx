'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Wrench, ArrowLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function StructureLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        // Check user status for better error message
        try {
          const response = await fetch('/api/members/me', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(email + ':' + password)}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            if (userData.member?.status === 'pending') {
              setError('Akun Anda masih menunggu persetujuan admin. Silakan hubungi admin.')
            } else if (userData.member?.status === 'rejected') {
              setError('Pendaftaran Anda ditolak oleh admin. Silakan hubungi admin.')
            } else if (userData.member?.status === 'suspended') {
              setError('Akun Anda ditangguhkan. Silakan hubungi admin.')
            } else {
              setError('Email atau password salah')
            }
          } else {
            setError('Email atau password salah')
          }
        } catch {
          setError('Email atau password salah')
        }
      } else {
        // Check if user is a structure engineer
        const response = await fetch('/api/members/me')
        if (response.ok) {
          const userData = await response.json()
          if (userData.member?.profession === 'structure') {
            router.push('/structure/dashboard')
          } else {
            setError(`Anda login sebagai ${userData.member?.profession || 'member'}, bukan Structure Engineer`)
          }
        } else {
          setError('Anda tidak memiliki akses member')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Home
        </Link>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-[#E67E22] to-[#F39C12] p-4 rounded-full">
                <Wrench className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Structure Engineer Login</CardTitle>
            <CardDescription className="text-gray-400">
              Masuk ke dashboard Structure Engineer ARCHI-COLL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
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
                className="w-full bg-gradient-to-r from-[#E67E22] to-[#F39C12] hover:from-[#D35400] hover:to-[#E67E22] text-white"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Akun Demo: structure@demo.com / structure123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
