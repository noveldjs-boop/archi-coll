'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Globe, Building2, ChevronRight } from "lucide-react"
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-500/50 bg-black border-gray-800">
      {/* Company Banner/Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-yellow-900/30 p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
                <Image
                  src={companyLogo}
                  alt={companyName || 'Company Logo'}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center border border-purple-500/30">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-lg line-clamp-1">
                {title}
              </h3>
              {companyName && (
                <p className="text-sm text-purple-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {companyName}
                </p>
              )}
            </div>
          </div>
          {websiteUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
            >
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                Website
              </a>
            </Button>
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
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 bg-black/80 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
            {category}
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
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
            <span className="text-sm text-gray-400">Harga Katalog</span>
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              {price}
            </span>
          </div>
        )}

        {contact && (
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
            <span className="text-sm text-gray-400">Kontak</span>
            <span className="text-sm text-purple-300">{contact}</span>
          </div>
        )}

        {/* View Catalog Button */}
        <Link href={`/ads/catalog/${id}`}>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
            <ChevronRight className="w-4 h-4 mr-2" />
            Lihat Katalog Produk
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
