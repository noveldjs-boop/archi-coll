'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  User,
  Building,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Star,
  Shield,
  Zap,
  Globe,
  Crown,
  ChevronRight
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

type ClientType = 'individual' | 'company'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  address: string
  clientType: ClientType
  companyName: string
  googleEmail: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
  phone?: string
  address?: string
  companyName?: string
  general?: string
}

export default function ClientAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const { data: session, status } = useSession()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [redirectUrl, setRedirectUrl] = useState('/client/dashboard')

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    clientType: 'individual',
    companyName: '',
    googleEmail: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Check redirect URL and session
  useEffect(() => {
    const redirect = searchParams.get('redirect')
    const tab = searchParams.get('tab')
    
    if (redirect) {
      setRedirectUrl(redirect)
    }

    // Set active tab based on query parameter
    if (tab === 'register') {
      setActiveTab('register')
    } else if (tab === 'login') {
      setActiveTab('login')
    }

    // If already logged in as client, redirect
    if (status === 'authenticated' && session?.user?.role === 'client') {
      router.push(redirect || '/client/dashboard')
    }
  }, [searchParams, status, session, router])

  // Password strength calculator
  useEffect(() => {
    const password = formData.password
    let strength = 0

    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15

    setPasswordStrength(Math.min(strength, 100))
  }, [formData.password])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = language === 'id' ? 'Email wajib diisi' : 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'id' ? 'Format email tidak valid' : 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = language === 'id' ? 'Password wajib diisi' : 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName) {
      newErrors.fullName = language === 'id' ? 'Nama lengkap wajib diisi' : 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = language === 'id' ? 'Email wajib diisi' : 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'id' ? 'Format email tidak valid' : 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = language === 'id' ? 'Password wajib diisi' : 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = language === 'id' ? 'Password minimal 8 karakter' : 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = language === 'id' ? 'Konfirmasi password wajib diisi' : 'Confirm password is required'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'id' ? 'Password tidak cocok' : 'Passwords do not match'
    }

    if (!formData.phone) {
      newErrors.phone = language === 'id' ? 'No. telepon wajib diisi' : 'Phone number is required'
    }

    if (!formData.address) {
      newErrors.address = language === 'id' ? 'Alamat wajib diisi' : 'Address is required'
    }

    if (formData.clientType === 'company' && !formData.companyName) {
      newErrors.companyName = language === 'id' ? 'Nama perusahaan wajib diisi' : 'Company name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLoginForm()) return

    setLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        role: 'client'
      })

      if (result?.error) {
        setErrors({
          general: language === 'id' ? 'Email atau password salah' : 'Invalid email or password'
        })
      } else {
        // Verify it's a client account
        const response = await fetch('/api/members/me')
        if (response.ok) {
          const userData = await response.json()
          if (userData.member?.user?.role === 'client') {
            router.push(redirectUrl)
          } else {
            setErrors({
              general: language === 'id' ? 'Akun ini bukan akun klien' : 'This is not a client account'
            })
          }
        } else {
          setErrors({
            general: language === 'id' ? 'Gagal memverifikasi akun' : 'Failed to verify account'
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        general: language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegisterForm()) return

    setLoading(true)
    setErrors({})

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        clientType: formData.clientType,
        companyName: formData.clientType === 'company' ? formData.companyName : null,
        googleEmail: formData.googleEmail || null
      }

      const response = await fetch('/api/auth/client/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto login after successful registration
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        role: 'client'
      })

      if (loginResult?.ok) {
        router.push(redirectUrl)
      } else {
        // If auto-login fails, redirect to login page
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({
        general: error.message || (language === 'id' ? 'Pendaftaran gagal' : 'Registration failed')
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500'
    if (passwordStrength < 60) return 'bg-yellow-500'
    if (passwordStrength < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return language === 'id' ? 'Lemah' : 'Weak'
    if (passwordStrength < 60) return language === 'id' ? 'Sedang' : 'Medium'
    if (passwordStrength < 80) return language === 'id' ? 'Kuat' : 'Strong'
    return language === 'id' ? 'Sangat Kuat' : 'Very Strong'
  }

  const benefits = [
    {
      icon: <Building className="w-6 h-6" />,
      title: language === 'id' ? 'Proyek Profesional' : 'Professional Projects',
      description: language === 'id' ? 'Akses ke arsitek berpengalaman untuk proyek Anda' : 'Access to experienced architects for your projects'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: language === 'id' ? 'Proteksi Terjamin' : 'Guaranteed Protection',
      description: language === 'id' ? 'Desain dan dokumen Anda aman dan terlindungi' : 'Your designs and documents are safe and protected'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: language === 'id' ? 'Proses Cepat' : 'Fast Process',
      description: language === 'id' ? 'Konsultasi dan pengerjaan proyek yang efisien' : 'Efficient consultation and project execution'
    }
  ]

  const testimonial = {
    text: language === 'id'
      ? "ARCHI-COLL membantu mewujudkan rumah impian kami dengan desain yang luar biasa dan tim yang sangat profesional."
      : "ARCHI-COLL helped us realize our dream home with an amazing design and a very professional team.",
    author: "Budi Santoso",
    role: language === 'id' ? "Klien Sejak 2023" : "Client Since 2023"
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6B5B95]/20 via-[#9B59B6]/20 to-[#E74C3C]/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6B5B95]/10 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#6B5B95]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E74C3C]/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Panel - Info */}
          <div className="hidden lg:flex flex-col space-y-8 p-8">
            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Kembali ke Home' : 'Back to Home'}
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] rounded-2xl flex items-center justify-center shadow-2xl">
                <Building2 className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
                  ARCHI-COLL
                </h1>
                <p className="text-gray-400 text-sm">{language === 'id' ? 'Architecture Collaboration' : 'Architecture Collaboration'}</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                {language === 'id' ? 'Selamat Datang di' : 'Welcome to'} <br />
                <span className="bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
                  {language === 'id' ? 'Platform Arsitektur' : 'Architecture Platform'}
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                {language === 'id'
                  ? 'Kolaborasikan visi arsitektur Anda dengan profesional terbaik'
                  : 'Collaborate your architectural vision with the best professionals'
                }
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#9B59B6]" />
                {language === 'id' ? 'Keunggulan Kami' : 'Our Benefits'}
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/20 rounded-lg flex items-center justify-center text-[#9B59B6]">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 bg-gradient-to-br from-[#6B5B95]/10 to-[#9B59B6]/10 backdrop-blur-sm rounded-2xl border border-[#6B5B95]/20">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-[#9B59B6] text-[#9B59B6]" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full">
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Kembali ke Home' : 'Back to Home'}
              </Link>
            </div>

            <Card className="bg-[#2a2a2a]/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
              <CardHeader className="space-y-2 text-center pb-6">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white">
                  {language === 'id' ? 'Portal Klien' : 'Client Portal'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {activeTab === 'login'
                    ? (language === 'id' ? 'Masuk ke akun klien Anda' : 'Sign in to your client account')
                    : (language === 'id' ? 'Daftar sebagai klien baru' : 'Register as a new client')
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/50">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6B5B95] data-[state=active]:to-[#9B59B6] data-[state=active]:text-white"
                    >
                      {language === 'id' ? 'Masuk' : 'Login'}
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6B5B95] data-[state=active]:to-[#9B59B6] data-[state=active]:text-white"
                    >
                      {language === 'id' ? 'Daftar' : 'Register'}
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-300">
                          {language === 'id' ? 'Email' : 'Email'}
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder={language === 'id' ? 'email@contoh.com' : 'email@example.com'}
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-gray-300">
                          {language === 'id' ? 'Password' : 'Password'}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={formData.rememberMe}
                            onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                            disabled={loading}
                            className="border-gray-600 data-[state=checked]:bg-[#6B5B95] data-[state=checked]:border-[#6B5B95]"
                          />
                          <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                            {language === 'id' ? 'Ingat saya' : 'Remember me'}
                          </Label>
                        </div>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-[#9B59B6] hover:text-[#6B5B95] transition-colors"
                        >
                          {language === 'id' ? 'Lupa password?' : 'Forgot password?'}
                        </Link>
                      </div>

                      {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                          <X className="w-4 h-4 flex-shrink-0" />
                          {errors.general}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a84] hover:via-[#8a4aa6] hover:to-[#d63b2b] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'id' ? 'Memproses...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            {language === 'id' ? 'Masuk' : 'Sign In'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-400">
                          {language === 'id' ? 'Belum punya akun?' : "Don't have an account?"}{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="text-[#9B59B6] hover:text-[#6B5B95] font-semibold transition-colors"
                          >
                            {language === 'id' ? 'Daftar sekarang' : 'Register now'}
                          </button>
                        </p>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-gray-300">
                          {language === 'id' ? 'Nama Lengkap *' : 'Full Name *'}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder={language === 'id' ? 'Nama lengkap Anda' : 'Your full name'}
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-gray-300">
                            {language === 'id' ? 'Email *' : 'Email *'}
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder={language === 'id' ? 'email@contoh.com' : 'email@example.com'}
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                              disabled={loading}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-phone" className="text-gray-300">
                            {language === 'id' ? 'No. Telepon *' : 'Phone *'}
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-phone"
                              type="tel"
                              placeholder={language === 'id' ? '+62...' : '+62...'}
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                              disabled={loading}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-gray-300">
                          {language === 'id' ? 'Password *' : 'Password *'}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                              <span className="text-xs ml-2 text-gray-400">{getPasswordStrengthText()}</span>
                            </div>
                          </div>
                        )}
                        {errors.password && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className="text-gray-300">
                          {language === 'id' ? 'Konfirmasi Password *' : 'Confirm Password *'}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <p className="text-green-400 text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {language === 'id' ? 'Password cocok' : 'Passwords match'}
                          </p>
                        )}
                        {errors.confirmPassword && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-address" className="text-gray-300">
                          {language === 'id' ? 'Alamat *' : 'Address *'}
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-address"
                            type="text"
                            placeholder={language === 'id' ? 'Alamat lengkap Anda' : 'Your full address'}
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                        </div>
                        {errors.address && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.address}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">
                          {language === 'id' ? 'Tipe Klien *' : 'Client Type *'}
                        </Label>
                        <Select
                          value={formData.clientType}
                          onValueChange={(value: ClientType) => handleInputChange('clientType', value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-[#9B59B6]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="individual" className="text-white">
                              {language === 'id' ? 'Individual' : 'Individual'}
                            </SelectItem>
                            <SelectItem value="company" className="text-white">
                              {language === 'id' ? 'Perusahaan' : 'Company'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.clientType === 'company' && (
                        <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                          <Label htmlFor="register-company" className="text-gray-300">
                            {language === 'id' ? 'Nama Perusahaan *' : 'Company Name *'}
                          </Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-company"
                              type="text"
                              placeholder={language === 'id' ? 'PT. Contoh' : 'PT. Example'}
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                              disabled={loading}
                            />
                          </div>
                          {errors.companyName && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <X className="w-3 h-3" />
                              {errors.companyName}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="register-google-email" className="text-gray-300">
                          {language === 'id' ? 'Google Email (Opsional)' : 'Google Email (Optional)'}
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-google-email"
                            type="email"
                            placeholder={language === 'id' ? 'Untuk integrasi Google Drive' : 'For Google Drive integration'}
                            value={formData.googleEmail}
                            onChange={(e) => handleInputChange('googleEmail', e.target.value)}
                            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#9B59B6]"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                          <X className="w-4 h-4 flex-shrink-0" />
                          {errors.general}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a84] hover:via-[#8a4aa6] hover:to-[#d63b2b] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'id' ? 'Mendaftarkan...' : 'Registering...'}
                          </>
                        ) : (
                          <>
                            {language === 'id' ? 'Daftar Sekarang' : 'Register Now'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-400">
                          {language === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="text-[#9B59B6] hover:text-[#6B5B95] font-semibold transition-colors"
                          >
                            {language === 'id' ? 'Masuk sekarang' : 'Sign in now'}
                          </button>
                        </p>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
