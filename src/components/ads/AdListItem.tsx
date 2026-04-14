'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface AdListItemProps {
  id: string
  title: string
  description: string
  companyName?: string | null
  companyLogo?: string | null
  imageUrl?: string | null
  category: string
}

export function AdListItem({
  id,
  title,
  description,
  companyName,
  companyLogo,
  imageUrl,
  category
}: AdListItemProps) {
  return (
    <Link href={`/ads/detail/${id}`}>
      <Card className="bg-[#1A1A1A] border-gray-800 hover:border-[#6366F1]/50 transition-all duration-300 group overflow-hidden cursor-pointer">
        {/* Banner Image */}
        {imageUrl ? (
          <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30 backdrop-blur-sm">
                {category}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-[#6366F1]/50" />
          </div>
        )}

        <CardContent className="p-5">
          {/* Company Info */}
          <div className="flex items-center gap-3 mb-4">
            {companyLogo ? (
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700 flex-shrink-0">
                <Image
                  src={companyLogo}
                  alt={companyName || 'Company Logo'}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-[#6366F1]/20 rounded-lg flex items-center justify-center border border-[#6366F1]/30 flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#6366F1]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
                {title}
              </h3>
              {companyName && (
                <p className="text-gray-500 text-sm truncate">{companyName}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {description}
          </p>

          {/* View Catalog Button */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Lihat katalog produk</span>
            <div className="w-8 h-8 bg-[#6366F1]/20 rounded-lg flex items-center justify-center group-hover:bg-[#6366F1] transition-colors">
              <ArrowRight className="w-4 h-4 text-[#8B5CF6] group-hover:text-white transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
