'use client'

import { Building2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
      <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/api/images/logo archi-coll 2.png"
              alt="ARCHI-COLL Logo"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const nextEl = e.currentTarget.nextElementSibling as HTMLElement
                if (nextEl) {
                  nextEl.style.display = 'flex'
                }
              }}
            />
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">
              ARCHI-COLL
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © {year} ARCHI-COLL. {t('footer.allRights')}.
          </p>
        </div>
      </div>
    </footer>
  )
}
