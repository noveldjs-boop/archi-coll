'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AdCategoryBox } from "./AdCategoryBox"
import { AD_CATEGORIES } from "@/lib/ad-categories"

interface AdColumnProps {
  className?: string
}

export function AdColumn({ className = "" }: AdColumnProps) {
  return (
    <aside className={`w-80 lg:w-80 xl:w-96 flex-shrink-0 hidden lg:block ${className}`}>
      <Card className="bg-black border-gray-800 sticky top-4">
        <CardHeader className="pb-3">
          <h2 className="text-sm font-bold text-center uppercase tracking-wide bg-gradient-to-r from-purple-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent">
            IKLAN PRODUK KONSTRUKSI
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AD_CATEGORIES.map((category) => (
              <AdCategoryBox key={category.id} category={category} />
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
