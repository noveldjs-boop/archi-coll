'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Calendar, ArrowRight, ZoomIn } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

const portfolio = [
  {
    id: 1,
    title: 'Modern Tropical Villa',
    location: 'Bali, Indonesia',
    year: '2023',
    category: 'Villa',
    image: '/portfolio-modern-tropical-villa.png',
    description: 'Villa 4 bedroom dengan konsep tropical modern'
  },
  {
    id: 2,
    title: 'Urban Minimalist House',
    location: 'Jakarta, Indonesia',
    year: '2022',
    category: 'Residential',
    image: '/portfolio-urban-minimalist-house.png',
    description: 'Rumah 3 lantai dengan optimalisasi ruang 120m²'
  },
  {
    id: 3,
    title: 'Beachfront Resort',
    location: 'Lombok, Indonesia',
    year: '2023',
    category: 'Hospitality',
    image: '/portfolio-beachfront-resort.png',
    description: 'Resort 50 kamar dengan ocean view'
  },
  {
    id: 4,
    title: 'Co-working Space',
    location: 'Surabaya, Indonesia',
    year: '2021',
    category: 'Commercial',
    image: '/portfolio-coworking-space.png',
    description: 'Co-working space 500m² di pusat kota'
  }
]

export default function PortfolioPage() {
  const { language, setLanguage, t } = useLanguage()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<typeof portfolio[0] | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({})
  const [footerLogoLoaded, setFooterLogoLoaded] = useState(false)

  const openLightbox = (item: typeof portfolio[0]) => {
    setSelectedImage(item)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      {/* Content Layer */}
      <div className="relative z-10 h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 flex-shrink-0">
        <div style={{ maxWidth: '98%', margin: '0 auto', padding: '0 16px' }}>
          <Badge style={{ marginBottom: '16px', background: 'linear-gradient(to right, #E74C3C, #F39C12, #F1C40F)', color: 'white', border: 'none' }}>
            Portfolio
          </Badge>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 'bold', marginBottom: '16px' }}>
            <span style={{ background: 'linear-gradient(to right, #E74C3C, #F39C12, #F1C40F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('portfolio.title')}
            </span>
          </h1>
          <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '672px', marginBottom: '48px' }}>
            {t('portfolio.description')}
          </p>
        </div>
      </section>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-24">
        <div style={{ maxWidth: '98%', margin: '0 auto', padding: '0 16px' }}>

          {/* Portfolio Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            {portfolio.map((project, index) => {
              const colors = ['#6B5B95', '#9B59B6', '#E74C3C', '#F39C12']
              const color = colors[index % colors.length]
              
              return (
                <Card key={project.id} style={{ 
                  background: 'rgba(42, 42, 42, 0.8)', 
                  backdropFilter: 'blur(8px)', 
                  border: `1px solid ${color}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }} 
                className="group"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div
                    style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: '#1E1E1E', cursor: 'pointer' }}
                    onClick={() => openLightbox(project)}
                  >
                    {!imagesLoaded[project.id] && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: color, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${imagesLoaded[project.id] ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transition: 'opacity 0.3s ease' }}
                      onLoad={() => setImagesLoaded(prev => ({ ...prev, [project.id]: true }))}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)', 
                      opacity: 0, 
                      transition: 'opacity 0.3s'
                    }} 
                    className="group-hover:opacity-100"
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <Badge style={{ background: `${color}CC`, color: 'white', border: 'none' }}>
                        {project.category}
                      </Badge>
                    </div>
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      opacity: 0, 
                      transition: 'opacity 0.3s'
                    }} 
                    className="group-hover:opacity-100"
                    >
                      <div style={{ background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(8px)' }}>
                        <ZoomIn style={{ width: '24px', height: '24px', color: 'white' }} />
                      </div>
                    </div>
                  </div>
                  <CardHeader style={{ paddingTop: '16px' }}>
                    <CardTitle style={{ fontSize: '18px', background: index % 2 === 0 ? 'linear-gradient(to right, #6B5B95, #9B59B6)' : 'linear-gradient(to right, #E74C3C, #F39C12)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {project.title}
                    </CardTitle>
                    <CardDescription style={{ fontSize: '14px', color: '#d1d5db' }}>
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ paddingTop: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '12px', height: '12px', color }} />
                        <span>{project.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px', color }} />
                        <span>{project.year}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA Section */}
          <div style={{ padding: '64px 16px', background: 'linear-gradient(to right, rgba(107, 91, 149, 0.2), rgba(231, 76, 60, 0.2))', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              {t('portfolio.ctaTitle')}
            </h2>
            <p style={{ fontSize: '20px', color: '#d1d5db', marginBottom: '32px', maxWidth: '672px', margin: '0 auto 32px' }}>
              {t('portfolio.ctaDescription')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <Link href="/contact">
                <Button style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', color: 'white', padding: '24px 32px', fontSize: '16px', width: '100%', maxWidth: '300px' }}>
                  {t('portfolio.startConsultation')}
                </Button>
              </Link>
              <Link href="/services">
                <Button style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', color: 'white', padding: '24px 32px', fontSize: '16px', width: '100%', maxWidth: '300px' }}>
                  {t('portfolio.viewServices')}
                  <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 100, 
          background: 'rgba(0,0,0,0.95)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px'
        }}>
          <Button
            onClick={closeLightbox}
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              zIndex: 10, 
              background: 'transparent', 
              color: 'white',
              border: 'none',
              padding: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>

          <div style={{ 
            width: '100%', 
            maxWidth: '1024px', 
            maxHeight: '80vh',
            position: 'relative'
          }}>
            <Image
              src={selectedImage.image}
              alt={selectedImage.title}
              width={1200}
              height={800}
              className="object-contain rounded-lg"
              style={{ width: '100%', height: '100%' }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            />
          </div>

          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
            padding: '24px' 
          }}>
            <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
              <h3 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                {selectedImage.title}
              </h3>
              <p style={{ fontSize: '18px', color: '#d1d5db' }}>
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

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
