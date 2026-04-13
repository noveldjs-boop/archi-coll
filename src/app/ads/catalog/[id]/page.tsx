'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Globe, Package, Check, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ProductItem {
  id: string
  itemName: string
  itemCode?: string
  description?: string
  unit?: string
  price?: number
  stock?: number
  imageUrl?: string
}

interface MaterialAd {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  companyName?: string
  companyLogo?: string
  websiteUrl?: string
}

export default function ProductCatalogPage() {
  const params = useParams()
  const router = useRouter()
  const adId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ad, setAd] = useState<MaterialAd | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Fetch ad and products
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

        // Fetch products
        const productsRes = await fetch(`/api/material-ads/${adId}/products`)
        if (!productsRes.ok) throw new Error('Failed to fetch products')
        const productsData = await productsRes.json()
        if (productsData.success) {
          setProducts(productsData.products)
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

  // Toggle item selection
  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  // Add selected items to approval
  const handleAddToApproval = async () => {
    if (selectedItems.size === 0) return

    try {
      // TODO: Get actual orderId from context or user selection
      const orderId = localStorage.getItem('currentOrderId')

      const response = await fetch('/api/material-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productItemIds: Array.from(selectedItems),
          orderId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`${selectedItems.size} item berhasil ditambahkan ke Approval Material`)
          setSelectedItems(new Set())
        }
      }
    } catch (error) {
      console.error('Error adding to approval:', error)
      alert('Gagal menambahkan item ke Approval Material')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Memuat katalog...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-black border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Gagal Memuat Katalog</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {error || 'Katalog tidak ditemukan'}
              </p>
              <Link href="/ads">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30">
                  Kembali ke Iklan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/ads/${ad.category}`}>
                <Button variant="ghost" size="sm" className="text-purple-300 hover:text-purple-200 hover:bg-purple-900/30">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {ad.companyLogo ? (
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
                    <Image
                      src={ad.companyLogo}
                      alt={ad.companyName || 'Company Logo'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white line-clamp-1">{ad.title}</h1>
                  {ad.companyName && (
                    <p className="text-sm text-purple-300">{ad.companyName}</p>
                  )}
                </div>
              </div>
            </div>
            {selectedItems.size > 0 && (
              <Button
                onClick={handleAddToApproval}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Tambah ke Approval ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Ad Info */}
        <Card className="mb-8 bg-black border-gray-800">
          <CardContent className="p-6">
            <div className="flex gap-6">
              {ad.imageUrl && (
                <div className="w-48 h-48 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{ad.title}</h2>
                    <Badge className="bg-purple-900/50 text-purple-300 border-purple-500/30">
                      {ad.category}
                    </Badge>
                  </div>
                  {ad.websiteUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
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
                <p className="text-gray-400">{ad.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Katalog Produk
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pilih produk untuk ditambahkan ke Approval Material
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Belum ada produk dalam katalog ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-gray-400 font-medium w-12">Pilih</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Nama Produk</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Kode</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Deskripsi</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Satuan</th>
                      <th className="text-right p-4 text-gray-400 font-medium">Harga</th>
                      <th className="text-right p-4 text-gray-400 font-medium">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${
                          selectedItems.has(product.id) ? 'bg-purple-900/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(product.id)}
                            onCheckedChange={() => toggleItem(product.id)}
                            className="border-purple-500/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <div className="w-12 h-12 bg-gray-900 rounded overflow-hidden border border-gray-700">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.itemName}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                            <span className="text-white font-medium">{product.itemName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{product.itemCode || '-'}</td>
                        <td className="p-4 text-gray-400 max-w-xs">{product.description || '-'}</td>
                        <td className="p-4 text-gray-400">{product.unit || '-'}</td>
                        <td className="p-4 text-right">
                          {product.price ? (
                            <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent font-semibold">
                              Rp {product.price.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {product.stock !== undefined ? (
                            <span className={`font-medium ${
                              product.stock > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {product.stock}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
