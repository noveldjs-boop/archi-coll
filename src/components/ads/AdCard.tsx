'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Phone, DollarSign } from "lucide-react"
import Image from "next/image"

interface AdCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string | null
  catalogUrl?: string | null
  price?: string | null
  contact?: string | null
}

export function AdCard({ id, title, description, imageUrl, catalogUrl, price, contact }: AdCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      {imageUrl && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        <CardDescription className="line-clamp-3 min-h-[60px]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {price && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium">{price}</span>
          </div>
        )}
        {contact && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>{contact}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {catalogUrl ? (
          <Button asChild className="w-full">
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Lihat Katalog
            </a>
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            Tidak ada katalog
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
