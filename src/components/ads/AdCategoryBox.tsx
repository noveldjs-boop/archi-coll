'use client'

import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { AdCategory } from '@/lib/ad-categories'
import { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

interface AdCategoryBoxProps {
  category: AdCategory
}

export function AdCategoryBox({ category }: AdCategoryBoxProps) {
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[category.icon] as LucideIcon

  return (
    <Link href={`/ads/${category.slug}`}>
      <Card className="p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:bg-accent/50 border border-border hover:border-primary/30 bg-card">
        <div className="flex items-start gap-2">
          {IconComponent && (
            <div className="w-4 h-4 mt-0.5 flex-shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-primary leading-tight">
              {category.name}
            </h3>
            <p className="text-xs italic text-muted-foreground mt-0.5">
              {category.subtitle}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {category.description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
