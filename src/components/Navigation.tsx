'use client'

import { useState, memo, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, Languages } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavigationProps {
  transparent?: boolean
  className?: string
}

function NavigationComponent({ transparent = false, className = '' }: NavigationProps) {
  const { language, setLanguage, t } = useLanguage()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLanguageChange = useCallback(() => {
    setLanguage(language === 'id' ? 'en' : 'id')
  }, [language, setLanguage])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-[#1E1E1E]/95 backdrop-blur-md shadow-sm'
    } ${className}`}>
      <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Spacer for centering */}
          <div className="hidden md:flex flex-1"></div>

          {/* Desktop Navigation - Centered */}
          <div className="flex items-center gap-12">
            <Link href="/" className="hidden md:block text-lg font-bold uppercase text-[#9B59B6] hover:text-white transition-colors">{t('nav.home')}</Link>
            <Link href="/services" className="hidden md:block text-lg font-bold uppercase text-[#9B59B6] hover:text-white transition-colors">{t('nav.services')}</Link>
            <Link href="/portfolio" className="hidden md:block text-lg font-bold uppercase text-[#9B59B6] hover:text-white transition-colors">{t('nav.portfolio')}</Link>
            <Link href="/about" className="hidden md:block text-lg font-bold uppercase text-[#9B59B6] hover:text-white transition-colors">{t('nav.about')}</Link>
            <Link href="/join-member" className="hidden md:block text-lg font-bold uppercase text-[#9B59B6] hover:text-white transition-colors">{t('nav.joinMember')}</Link>
            <Link href="/contact" className="hidden md:block">
              <Button className="bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] font-bold uppercase">
                {t('nav.contact')}
              </Button>
            </Link>
          </div>

          {/* Spacer for centering */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageChange}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              <span className="font-medium">{language === 'id' ? 'ID' : 'EN'}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageChange}
              className="md:hidden text-gray-300 hover:text-white flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              <span className="font-medium">{language === 'id' ? 'ID' : 'EN'}</span>
            </Button>
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1E1E1E] border-t border-gray-700 shadow-lg">
          <div className="w-full mx-auto px-4 py-4 space-y-2">
            <Link href="/" className="block px-4 py-3 rounded-lg text-[#9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.home')}</Link>
            <Link href="/services" className="block px-4 py-3 rounded-lg text-[#9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.services')}</Link>
            <Link href="/portfolio" className="block px-4 py-3 rounded-lg text-[#9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.portfolio')}</Link>
            <Link href="/about" className="block px-4 py-3 rounded-lg text-[#9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.about')}</Link>
            <Link href="/join-member" className="block px-4 py-3 rounded-lg text-[#9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.joinMember')}</Link>
            <Link href="/contact" className="block px-4 py-3 rounded-lg text-[9B59B6] hover:bg-gray-800 text-lg font-bold uppercase">{t('nav.contact')}</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default memo(NavigationComponent)
