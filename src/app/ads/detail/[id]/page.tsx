'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Globe, Package, ExternalLink, AlertCircle, Loader2, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MaterialAd {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  companyName?: string
  companyLogo?: string
  websiteUrl?: string
  catalogUrl?: string
  price?: string
  contact?: string
  _count?: {
    productItems: number
  }
}

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const adId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ad, setAd] = useState<MaterialAd | null>(null)
  const [productCount, setProductCount] = useState(0)

  // Fetch ad details
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch ad details
        const adRes = await fetch(`/api/material-ads/${adId}`)
        if (!adRes.ok) throw new Error('Failed to fetch ad')
        const adData = await adRes.json()
        if (adData.success) {
          setAd(adData.ad)
        }

        // Fetch product count
        const productsRes = await fetch(`/api/material-ads/${adId}/products`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          if (productsData.success) {
            setProductCount(productsData.products.length)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (adId) {
      fetchData()
    }
  }, [adId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Memuat detail...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-[#1A1A1A] border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gagal Memuat Detail</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {error || 'Detail iklan tidak ditemukan'}
              </p>
              <Link href="/architect/dashboard">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A1A1A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/ads/${ad.category}`}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {ad.companyLogo ? (
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
                    <Image
                      src={ad.companyLogo}
                      alt={ad.companyName || 'Company Logo'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[#6366F1]/20 rounded-lg flex items-center justify-center border border-[#6366F1]/30">
                    <Building2 className="w-5 h-5 text-[#6366F1]" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white line-clamp-1">{ad.title}</h1>
                  {ad.companyName && (
                    <p className="text-sm text-gray-400">{ad.companyName}</p>
                  )}
                </div>
              </div>
            </div>
            {ad.websiteUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#6366F1]/30 text-[#8B5CF6] hover:bg-[#6366F1]/10"
              >
                <a
                  href={ad.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Website Perusahaan
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            {ad.imageUrl && (
              <Card className="bg-[#1A1A1A] border-gray-800 overflow-hidden">
                <div className="relative h-80 w-full bg-gray-900">
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30 backdrop-blur-sm">
                      {ad.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Tentang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{ad.description}</p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {(ad.contact || ad.price) && (
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ad.contact && (
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Kontak</span>
                      <span className="text-white font-medium">{ad.contact}</span>
                    </div>
                  )}
                  {ad.price && (
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">Harga Katalog</span>
                      <span className="text-white font-semibold">{ad.price}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Perusahaan</CardTitle>
                <CardDescription className="text-gray-400">
                  Informasi supplier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {ad.companyLogo ? (
                    <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
                      <Image
                        src={ad.companyLogo}
                        alt={ad.companyName || 'Company Logo'}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-[#6366F1]/20 rounded-lg flex items-center justify-center border border-[#6366F1]/30">
                      <Building2 className="w-8 h-8 text-[#6366F1]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{ad.companyName || 'Supplier'}</h3>
                    <p className="text-sm text-gray-500">Material Supplier</p>
                  </div>
                </div>

                {ad.websiteUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#6366F1]/30 text-[#8B5CF6] hover:bg-[#6366F1]/10"
                  >
                    <a
                      href={ad.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Kunjungi Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Catalog Action Card */}
            <Card className="bg-gradient-to-br from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 border-[#6366F1]/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#6366F1]/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Katalog Produk</CardTitle>
                    <CardDescription className="text-gray-400">
                      {productCount} item tersedia
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-300">
                  Lihat seluruh katalog produk beserta harga dan spesifikasi. Pilih item untuk dimasukkan ke Approval Material.
                </p>
                <Link href={`/ads/catalog/${adId}`}>
                  <Button className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white shadow-lg shadow-purple-500/25">
                    <Package className="w-4 h-4 mr-2" />
                    Lihat Katalog Lengkap
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* External Catalog Link */}
            {ad.catalogUrl && (
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base">Katalog Eksternal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <a
                      href={ad.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka Katalog PDF/Website
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
