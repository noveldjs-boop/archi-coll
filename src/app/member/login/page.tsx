'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Building2, ArrowLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ArchitectLoginPage() {
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
        // Check user's profession and redirect to correct dashboard
        const response = await fetch('/api/members/me')
        if (response.ok) {
          const userData = await response.json()
          const profession = userData.member?.profession

          // Redirect to appropriate dashboard based on profession
          switch (profession) {
            case 'structure':
              router.push('/structure/dashboard')
              break
            case 'mep':
              router.push('/mep/dashboard')
              break
            case 'drafter':
              router.push('/drafter/dashboard')
              break
            case 'qs':
              router.push('/qs/dashboard')
              break
            case 'licensed-architect':
              router.push('/licensed-architect/dashboard')
              break
            case 'architect':
            default:
              router.push('/architect/dashboard')
              break
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Home
        </Link>

        <Card className="bg-[#1A1A1A] border-gray-800 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] p-4 rounded-2xl shadow-lg shadow-purple-500/25">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                Professional Login
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Masuk ke dashboard profesional Anda (Architect, Structure, MEP, Drafter, QS, Licensed Architect)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 bg-[#0F0F0F] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 bg-[#0F0F0F] border-gray-700 text-white placeholder:text-gray-600 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 text-center mb-2">Akun Demo:</p>
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
                <p>Architect: architect@demo.com / archi123</p>
                <p>Structure: structure@demo.com / structure123</p>
                <p>MEP: mep@demo.com / mep123</p>
                <p>Drafter: drafter@demo.com / drafter123</p>
                <p>QS: qs@demo.com / qs123</p>
                <p>Licensed Architect: licensed@demo.com / licensed123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
