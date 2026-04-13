'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Building2, ArrowLeft, UserPlus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

export default function JoinMemberPage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [footerLogoLoaded, setFooterLogoLoaded] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Attempting login with email:', email)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError('Email atau password salah')
        setLoading(false)
        return
      }

      if (result?.ok) {
        console.log('Login successful, redirecting to dashboard...')
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check user's profession and redirect to correct dashboard
        try {
          const response = await fetch('/api/members/me')
          if (response.ok) {
            const userData = await response.json()
            const profession = userData.member?.profession

            console.log('User profession:', profession)

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
                router.push('/member/dashboard')
                break
            }
          } else {
            // If we can't get profession, redirect to default member dashboard
            router.push('/member/dashboard')
          }
        } catch (error) {
          console.error('Error checking profession:', error)
          router.push('/member/dashboard')
        }
      } else {
        console.error('Login failed: Unknown error')
        setError('Terjadi kesalahan. Silakan coba lagi.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  if (showRegister) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
        <Navigation />

        <div className="flex-1 flex items-center justify-center pt-20 pb-24 px-4">
          <Card className="w-full max-w-md bg-[#2a2a2a]/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-4 rounded-full">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Daftar Member Baru</CardTitle>
              <CardDescription className="text-gray-400">
                Bergabung sebagai profesional di ARCHI-COLL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-gray-300 mb-4">
                  Silakan lengkapi form pendaftaran untuk mendaftar sebagai member baru.
                </p>
                <Button
                  onClick={() => router.push('/member/register')}
                  className="w-full bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] text-white"
                >
                  Mulai Pendaftaran
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Sudah punya akun?{' '}
                    <button
                      onClick={() => setShowRegister(false)}
                      className="text-[#9B59B6] hover:text-white font-medium"
                    >
                      Login di sini
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Fixed at bottom */}
        <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
          <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {!footerLogoLoaded && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <Image
                  src="/logo-archi-coll.png"
                  alt="ARCHI-COLL Logo"
                  width={32}
                  height={32}
                  className={`object-contain transition-opacity duration-300 ${footerLogoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                  onLoad={() => setFooterLogoLoaded(true)}
                  priority
                  sizes="32px"
                />
                <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">ARCHI-COLL</span>
              </div>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
      <Navigation />

      <div className="flex-1 flex items-center justify-center pt-20 pb-24 px-4">
        <Card className="w-full max-w-md bg-[#2a2a2a]/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-4 rounded-full">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Login Member</CardTitle>
            <CardDescription className="text-gray-400">
              Masuk ke dashboard member ARCHI-COLL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="•••••••••"
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
                className="w-full bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] text-white"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-4">
              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-400 mb-3">Belum punya akun member?</p>
                <Button
                  onClick={() => setShowRegister(true)}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar sebagai Member Baru
                </Button>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-400 mb-2">Akun Demo:</p>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-400">
                  <p>Architect: architect@demo.com / archi123</p>
                  <p>Structure: structure@demo.com / structure123</p>
                  <p>MEP: mep@demo.com / mep123</p>
                  <p>Drafter: drafter@demo.com / drafter123</p>
                  <p>QS: qs@demo.com / qs123</p>
                  <p>Licensed Architect: licensed@demo.com / licensed123</p>
                </div>
              </div>
              <div>
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {!footerLogoLoaded && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <Image
                src="/logo-archi-coll.png"
                alt="ARCHI-COLL Logo"
                width={32}
                height={32}
                className={`object-contain transition-opacity duration-300 ${footerLogoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setFooterLogoLoaded(true)}
                priority
                sizes="32px"
              />
              <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">ARCHI-COLL</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
