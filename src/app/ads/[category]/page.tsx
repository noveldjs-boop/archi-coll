import { notFound } from "next/navigation"
import { AdCard } from "@/components/ads/AdCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{category.name}</h1>
                  <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">
            Kategori: {category.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Menampilkan produk untuk kategori {category.description}
          </p>
        </div>

        {/* Ads Grid - Server Component that fetches data */}
        <AdsGrid categorySlug={categorySlug} />

        {/* Other Categories */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Kategori Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AD_CATEGORIES
              .filter((cat) => cat.id !== category.id)
              .map((cat) => {
                const CatIcon = (Icons as any)[cat.icon]
                return (
                  <Link key={cat.id} href={`/ads/${cat.slug}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {CatIcon && (
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CatIcon className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-base">{cat.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {cat.subtitle}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
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
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Belum Ada Iklan</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Saat ini belum ada iklan untuk kategori ini. Silakan cek lagi nanti.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.ads.map((ad: any) => (
          <AdCard
            key={ad.id}
            id={ad.id}
            title={ad.title}
            description={ad.description}
            imageUrl={ad.imageUrl}
            catalogUrl={ad.catalogUrl}
            price={ad.price}
            contact={ad.contact}
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching ads:', error)
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-900">Gagal Memuat Iklan</h3>
          <p className="text-red-700 max-w-md mx-auto">
            Terjadi kesalahan saat memuat iklan. Silakan refresh halaman atau coba lagi nanti.
          </p>
        </CardContent>
      </Card>
    )
  }
}
