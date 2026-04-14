import { notFound } from "next/navigation"
import { AdListItem } from "@/components/ads/AdListItem"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getCategoryBySlug, AD_CATEGORIES } from "@/lib/ad-categories"
import * as Icons from 'lucide-react'

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categorySlug = params.category
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  // Get the icon component dynamically
  const IconComponent = (Icons as any)[category.icon]

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A1A1A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/member/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div className="w-12 h-12 bg-[#6366F1]/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-[#6366F1]" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">{category.name}</h1>
                  <p className="text-sm text-gray-400">{category.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-400 mb-2">
            Kategori: <span className="text-white font-medium">{category.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Menampilkan supplier dan produk untuk kategori ini
          </p>
        </div>

        {/* Ads Grid - Server Component that fetches data */}
        <AdsGrid categorySlug={categorySlug} />

        {/* Other Categories */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">Kategori Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AD_CATEGORIES
              .filter((cat) => cat.id !== category.id)
              .map((cat) => {
                const CatIcon = (Icons as any)[cat.icon]
                return (
                  <Link key={cat.id} href={`/ads/${cat.slug}`}>
                    <Card className="bg-[#1A1A1A] border-gray-800 hover:border-[#6366F1]/50 transition-colors cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          {CatIcon && (
                            <div className="w-10 h-10 bg-[#6366F1]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CatIcon className="w-5 h-5 text-[#6366F1]" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-white font-medium text-base">{cat.name}</h3>
                            <p className="text-gray-500 text-xs">{cat.subtitle}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
          </div>
        </div>
      </main>
    </div>
  )
}

async function AdsGrid({ categorySlug }: { categorySlug: string }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/material-ads?category=${categorySlug}`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch ads')
    }

    const data = await res.json()

    if (!data.success || !data.ads || data.ads.length === 0) {
      return (
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Iklan</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Saat ini belum ada iklan untuk kategori ini. Silakan cek lagi nanti.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.ads.map((ad: any) => (
          <AdListItem
            key={ad.id}
            id={ad.id}
            title={ad.title}
            description={ad.description}
            companyName={ad.companyName}
            companyLogo={ad.companyLogo}
            imageUrl={ad.imageUrl}
            category={ad.category}
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching ads:', error)
    return (
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Gagal Memuat Iklan</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Terjadi kesalahan saat memuat iklan. Silakan refresh halaman atau coba lagi nanti.
          </p>
        </CardContent>
      </Card>
    )
  }
}
