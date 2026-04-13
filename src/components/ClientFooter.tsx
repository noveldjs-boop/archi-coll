'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Building2 } from 'lucide-react'
import { memo } from 'react'

function FooterComponent() {
  const { t } = useLanguage()
  const year = new Date().getFullYear().toString()

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <img
          src="/api/images/logo archi-coll 2.png"
          alt="ARCHI-COLL Logo"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">ARCHI-COLL</span>
      </div>
      <p className="text-xs text-gray-400">
        © {year} ARCHI-COLL. {t('footer.allRights')}.
      </p>
    </div>
  )
}

export default memo(FooterComponent)
