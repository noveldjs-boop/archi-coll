'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, User, Mail, Lock, Building, Phone, MapPin } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ClientAuthPage() {
  const { language, t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    companyName: '',
    googleEmail: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setSuccess(language === 'id' ? 'Login berhasil! Mengalihkan...' : 'Login successful! Redirecting...')

      // Store user data
      localStorage.setItem('clientUser', JSON.stringify(data.user))

      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/client/dashboard'
      }, 1500)
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Login gagal' : 'Login failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError(language === 'id' ? 'Password tidak cocok' : 'Passwords do not match')
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError(language === 'id' ? 'Password minimal 6 karakter' : 'Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/client/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(language === 'id' ? 'Registrasi berhasil! Mengalihkan...' : 'Registration successful! Redirecting...')

      // Store user data
      localStorage.setItem('clientUser', JSON.stringify(data.user))

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        window.location.href = '/client/dashboard'
      }, 1500)
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Registrasi gagal' : 'Registration failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
      <Navigation />

      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <Card className="w-full max-w-md" style={{ background: 'rgba(42, 42, 42, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid #4b5563' }}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl" style={{ color: 'white' }}>
              {language === 'id' ? 'Portal Klien' : 'Client Portal'}
            </CardTitle>
            <CardDescription style={{ color: '#9ca3af' }}>
              {language === 'id'
                ? 'Masuk atau daftar untuk melanjutkan pemesanan'
                : 'Sign in or register to continue with your order'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6" style={{ background: '#1E1E1E' }}>
                <TabsTrigger value="login" style={{ color: activeTab === 'login' ? 'white' : '#9ca3af' }}>
                  {language === 'id' ? 'Masuk' : 'Sign In'}
                </TabsTrigger>
                <TabsTrigger value="register" style={{ color: activeTab === 'register' ? 'white' : '#9ca3af' }}>
                  {language === 'id' ? 'Daftar' : 'Register'}
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" style={{ color: 'white' }}>
                      <Mail className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Email' : 'Email'}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password" style={{ color: 'white' }}>
                      <Lock className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Password' : 'Password'}
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', color: 'white' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        {language === 'id' ? 'Memproses...' : 'Processing...'}
                      </>
                    ) : (
                      language === 'id' ? 'Masuk' : 'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" style={{ color: 'white' }}>
                      <User className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder={language === 'id' ? 'John Doe' : 'John Doe'}
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-email" style={{ color: 'white' }}>
                      <Mail className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Email' : 'Email'}
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-phone" style={{ color: 'white' }}>
                      <Phone className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Nomor Telepon' : 'Phone Number'}
                    </Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-address" style={{ color: 'white' }}>
                      <MapPin className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Alamat' : 'Address'}
                    </Label>
                    <Input
                      id="register-address"
                      type="text"
                      placeholder={language === 'id' ? 'Jalan Contoh No. 123' : '123 Example Street'}
                      value={registerData.address}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-company" style={{ color: 'white' }}>
                      <Building className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Nama Perusahaan (Opsional)' : 'Company Name (Optional)'}
                    </Label>
                    <Input
                      id="register-company"
                      type="text"
                      placeholder={language === 'id' ? 'PT Contoh' : 'Example Inc.'}
                      value={registerData.companyName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, companyName: e.target.value }))}
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-google-email" style={{ color: 'white' }}>
                      <Mail className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Email Google (untuk Google Drive)' : 'Google Email (for Google Drive)'}
                    </Label>
                    <Input
                      id="register-google-email"
                      type="email"
                      placeholder="contoh@gmail.com"
                      value={registerData.googleEmail}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, googleEmail: e.target.value }))}
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'id'
                        ? 'Diperlukan untuk integrasi Google Drive sharing'
                        : 'Required for Google Drive integration'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="register-password" style={{ color: 'white' }}>
                      <Lock className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Password' : 'Password'}
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-confirm-password" style={{ color: 'white' }}>
                      <Lock className="w-4 h-4 inline mr-2" />
                      {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', color: 'white' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        {language === 'id' ? 'Memproses...' : 'Processing...'}
                      </>
                    ) : (
                      language === 'id' ? 'Daftar' : 'Register'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
