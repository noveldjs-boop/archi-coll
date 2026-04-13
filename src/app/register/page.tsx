'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Building2, 
  User, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  Home
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

export default function RegisterChoicePage() {
  const router = useRouter()
  const { language } = useLanguage()

  const clientBenefits = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: language === 'id' ? 'Akses Tenaga Ahli' : 'Access to Expert Professionals',
      description: language === 'id' 
        ? 'Dapatkan desain dari arsitek dan tenaga ahli berpengalaman'
        : 'Get designs from experienced architects and expert professionals'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: language === 'id' ? 'Proteksi & Keamanan' : 'Protection & Security',
      description: language === 'id'
        ? 'Dokumen dan desain Anda aman dan terlindungi'
        : 'Your documents and designs are safe and protected'
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: language === 'id' ? 'Proyek Berkualitas' : 'Quality Projects',
      description: language === 'id'
        ? 'Hasil desain yang profesional dan sesuai standar'
        : 'Professional design results that meet standards'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
      <Navigation />

      {/* Header */}
      <div className="pt-24 pb-12 px-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {language === 'id' ? 'Daftar sebagai Klien' : 'Register as Client'}
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {language === 'id'
                ? 'Bergabunglah dengan ARCHI-COLL dan mulai wujudkan proyek arsitektur impian Anda bersama tenaga ahli profesional'
                : 'Join ARCHI-COLL and start realizing your dream architecture projects with professional expert teams'
              }
            </p>
          </div>

          {/* Client Registration Card */}
          <Card className="relative overflow-hidden border-2 border-[#9B59B6]/30 bg-gradient-to-br from-[#6B5B95]/10 to-transparent">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6B5B95]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9B59B6]/10 rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white text-center mb-2">
                {language === 'id' ? 'Portal Klien' : 'Client Portal'}
              </CardTitle>
              <CardDescription className="text-gray-400 text-center max-w-lg mx-auto">
                {language === 'id'
                  ? 'Untuk perorangan atau perusahaan yang ingin menggunakan jasa tenaga ahli arsitek dan profesional lain untuk proyek pembangunan.'
                  : 'For individuals or companies looking to use the services of architects and other professional experts for construction projects.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4 mb-8">
                {clientBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#6B5B95]/20 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-[#9B59B6]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{benefit.title}</h4>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] hover:from-[#5a4a84] hover:to-[#8a4aa6] text-white font-semibold shadow-lg hover:shadow-xl transition-all py-6 text-lg"
                  onClick={() => router.push('/auth/login?tab=register')}
                >
                  {language === 'id' ? 'Daftar Akun Klien Baru' : 'Register New Client Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    {language === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="text-[#9B59B6] hover:text-[#6B5B95] font-semibold transition-colors"
                    >
                      {language === 'id' ? 'Masuk di sini' : 'Sign in here'}
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700 mt-auto">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">
                ARCHI-COLL
              </span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {language === 'id' ? 'Hak Cipta Dilindungi' : 'All Rights Reserved'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
