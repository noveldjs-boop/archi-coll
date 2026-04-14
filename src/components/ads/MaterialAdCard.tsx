'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Phone, DollarSign, Building2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MaterialAdCardProps {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string | null
  catalogUrl?: string | null
  price?: string | null
  contact?: string | null
  companyName?: string | null
  companyLogo?: string | null
  websiteUrl?: string | null
}

export function MaterialAdCard({
  id,
  title,
  description,
  category,
  imageUrl,
  catalogUrl,
  price,
  contact,
  companyName,
  companyLogo,
  websiteUrl
}: MaterialAdCardProps) {
  return (
    <Link href={`/ads/detail/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#6366F1]/50 bg-[#1A1A1A] border-gray-800 cursor-pointer group">
        {/* Company Banner/Header */}
        <div className="bg-gradient-to-r from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
                  <Image
                    src={companyLogo}
                    alt={companyName || 'Company Logo'}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#6366F1]/20 rounded-lg flex items-center justify-center border border-[#6366F1]/30">
                  <Building2 className="w-6 h-6 text-[#6366F1]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
                  {title}
                </h3>
                {companyName && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {companyName}
                  </p>
                )}
              </div>
            </div>
            {websiteUrl && (
              <div className="w-8 h-8 bg-[#6366F1]/20 rounded-lg flex items-center justify-center group-hover:bg-[#6366F1] transition-colors">
                <ArrowRight className="w-4 h-4 text-[#8B5CF6] group-hover:text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Product Image */}
        {imageUrl && (
          <div className="relative h-48 w-full bg-gray-900">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30 backdrop-blur-sm">
                {category}
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        <CardHeader className="pb-3">
          <CardDescription className="text-gray-400 line-clamp-3 min-h-[60px]">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {price && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-sm text-gray-400">Harga Katalog</span>
              <span className="font-semibold text-white">{price}</span>
            </div>
          )}

          {contact && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-sm text-gray-400">Kontak</span>
              <span className="text-sm text-white">{contact}</span>
            </div>
          )}

          {/* View Catalog Button */}
          <Button className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white shadow-lg shadow-purple-500/25">
            Lihat Detail Iklan
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
