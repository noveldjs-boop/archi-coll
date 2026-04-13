'use client'

import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OptimizedFeatureItem } from './OptimizedFeatureItem'

interface Service {
  id: string
  titleIndo: string
  titleEng: string
  descriptionIndo: string
  descriptionEng: string
  icon?: string
  imageUrl?: string
  order: number
  active: boolean
  features: Array<{
    id: string
    textIndo: string
    textEng: string
  }>
}

interface OptimizedServiceCardProps {
  service: Service
  language: 'id' | 'en'
  onOrder: (service: Service) => void
  className?: string
}

const ServiceIcon = memo(({ iconName, className }: { iconName: string; className: string }) => {
  const icons: Record<string, any> = { Home: () => null, Building: () => null, Building2: () => null, Store: () => null }
  const IconComponent = icons[iconName] as React.ComponentType<any> || null
  
  if (!IconComponent) return null
  
  return <IconComponent className={className} />
})

ServiceIcon.displayName = 'ServiceIcon'

export const OptimizedServiceCard = memo(({ service, language, onOrder, className }: OptimizedServiceCardProps) => {
  const features = service.features?.slice(0, 5) || []
  const title = language === 'id' ? service.titleIndo : service.titleEng
  const description = language === 'id' ? service.descriptionIndo : service.descriptionEng

  return (
    <Card
      className={cn(
        'bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700 transition-all hover:scale-[1.02] cursor-pointer group',
        className
      )}
      onClick={() => onOrder(service)}
    >
      <CardHeader>
        {service.icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-[rgba(107,91,149,0.2),rgba(231,76,60,0.2)] rounded-2xl flex items-center justify-center mb-4">
            <ServiceIcon
              iconName={service.icon}
              className="w-8 h-8 text-[#9B59B6]"
            />
          </div>
        )}
        <CardTitle className="text-2xl bg-gradient-to-r from-[#6B5B95, #9B59B6] bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-[#d1d5db]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {features.length > 0 && (
          <div className="flex flex-col gap-2">
            {features.map((feature, idx) => (
              <OptimizedFeatureItem
                key={feature.id || idx}
                icon={CheckCircle}
                text={language === 'id' ? feature.textIndo : feature.textEng}
              />
            ))}
          </div>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onOrder(service)
          }}
          className="w-full bg-gradient-to-r from-[#6B5B95, #9B59B6, #E74C3C] text-white hover:opacity-90"
        >
          {language === 'id' ? 'Pesan Sekarang' : 'Order Now'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
})

OptimizedServiceCard.displayName = 'OptimizedServiceCard'
