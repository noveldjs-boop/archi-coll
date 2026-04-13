'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Briefcase, Award, Languages } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

const experience = [
  {
    year: '2020 - Sekarang',
    position: 'Senior Architect',
    company: 'PT. Arsitek Nusantara',
    description: 'Memimpin tim arsitek dalam proyek berskala besar, mengembangkan konsep desain inovatif untuk klien korporat, dan mengelola hubungan dengan klien dan konsultan.',
    highlights: ['15+ proyek selesai', 'Tim 8 orang', 'Klien korporat', 'Mentoring junior'],
    projects: 'Hotel, Resort, Commercial'
  },
  {
    year: '2017 - 2020',
    position: 'Architect',
    company: 'Studio Desain Modern',
    description: 'Merancang desain arsitektur untuk hunian dan komersial, membuat detail teknis dan dokumen konstruksi, serta presentasi desain ke klien.',
    highlights: ['25+ proyek selesai', 'Full service design', 'Client presentations', 'Technical drawings'],
    projects: 'Residential, Apartment, Office'
  },
  {
    year: '2016 - 2017',
    position: 'Junior Architect',
    company: 'CV. Bangun Kreatif',
    description: 'Membantu senior architect dalam pengembangan desain, membuat rendering 3D dan visualisasi, serta site supervision dan koordinasi.',
    highlights: ['10+ proyek selesai', '3D visualization', 'Site supervision', 'Documentation'],
    projects: 'Small residential, Renovation'
  }
]

export default function ExperiencePage() {
  const { language, setLanguage, t } = useLanguage()
  const [footerLogoLoaded, setFooterLogoLoaded] = useState(false)

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="relative z-10 h-screen flex flex-col">
        <Navigation />

        {/* Header */}
        <section className="pt-16 pb-12 flex-shrink-0">
          <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
            <Badge className="mb-4 bg-[#6B5B95] text-white border-[#9B59B6]">{t('nav.experience')}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#9B59B6] mb-4">
              {t('experience.title')}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              {t('experience.description')}
            </p>
          </div>
        </section>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Experience Content */}
          <section className="py-12 pb-24">
            <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
              <div className="max-w-3xl mx-auto">
                {/* Work Experience */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-[#E74C3C]" />
                    {t('experience.workHistory')}
                  </h2>
                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <Card key={idx} className="border-l-4 border-l-[#E74C3C] hover:shadow-lg transition-shadow bg-[#2a2a2a]/80 backdrop-blur-sm border-t border-r border-b border-gray-700">
                        <CardHeader>
                          <div className="flex flex-col gap-2">
                            <Badge className="w-fit bg-[#6B5B95] text-white">{exp.year}</Badge>
                            <CardTitle className="text-2xl text-white">{exp.position}</CardTitle>
                            <CardDescription className="text-lg font-medium text-[#E74C3C]">
                              {exp.company}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-300 leading-relaxed">{exp.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {exp.highlights.map((highlight, hIdx) => (
                              <Badge key={hIdx} variant="outline" className="bg-[#6B5B95]/10 text-[#9B59B6] border-[#6B5B95]/30">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-[#6B5B95]/20 to-[#E74C3C]/20">
            <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('experience.ctaTitle')}
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {t('experience.ctaDescription')}
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5A4A84] hover:via-[#8A48A5] hover:to-[#D63B2B] px-8 py-6">
                  {t('nav.contact')}
                </Button>
              </Link>
            </div>
          </section>
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
    </div>
  )
}
