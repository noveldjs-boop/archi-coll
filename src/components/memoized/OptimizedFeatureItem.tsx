'use client'

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimizedFeatureItemProps {
  icon: LucideIcon
  text: string
  className?: string
}

export const OptimizedFeatureItem = memo(({ icon: Icon, text, className }: OptimizedFeatureItemProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className="w-4 h-4 text-[#E74C3C] flex-shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  )
})

OptimizedFeatureItem.displayName = 'OptimizedFeatureItem'
