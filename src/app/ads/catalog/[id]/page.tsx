'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Building2, Globe, Package, Check, AlertCircle, Loader2, ShoppingCart } from "lucide-react"
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
  specifications?: string
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

interface ActiveProject {
  id: string
  orderNumber: string
  projectName: string | null
  clientName: string
  buildingArea: string
  status: string
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

  // Project selection for approval
  const [projects, setProjects] = useState<ActiveProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

        // Fetch active projects
        try {
          const projectsRes = await fetch('/api/architect/active-projects')
          if (projectsRes.ok) {
            const projectsData = await projectsRes.json()
            setProjects(projectsData.activeProjects || [])
          }
        } catch (err) {
          console.error('Error fetching projects:', err)
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

  // Handle add to approval
  const handleAddToApproval = () => {
    if (selectedItems.size === 0) {
      alert('Pilih minimal satu produk')
      return
    }

    if (projects.length === 0) {
      alert('Tidak ada project aktif. Silakan ambil project terlebih dahulu.')
      return
    }

    // If only one project, auto-select it
    if (projects.length === 1) {
      setSelectedProjectId(projects[0].id)
      submitApproval(projects[0].id)
    } else {
      // Show dialog to select project
      setShowProjectDialog(true)
    }
  }

  // Submit approval
  const submitApproval = async (projectId: string) => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/material-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productItemIds: Array.from(selectedItems),
          orderId: projectId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`${selectedItems.size} item berhasil ditambahkan ke Approval Material!`)
          setSelectedItems(new Set())
          setShowProjectDialog(false)
          // Redirect to project monitoring
          router.push(`/report-monitoring/${projectId}`)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Gagal menambahkan item ke Approval Material')
      }
    } catch (error) {
      console.error('Error adding to approval:', error)
      alert('Terjadi kesalahan saat menambahkan item ke Approval Material')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Memuat katalog...</p>
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
              <h3 className="text-xl font-semibold text-white mb-2">Gagal Memuat Katalog</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {error || 'Katalog tidak ditemukan'}
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
              <Link href={`/ads/detail/${adId}`}>
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
            {selectedItems.size > 0 && (
              <Button
                onClick={handleAddToApproval}
                disabled={submitting}
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white shadow-lg shadow-purple-500/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Tambah ke Approval ({selectedItems.size})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Ad Info */}
        <Card className="mb-8 bg-[#1A1A1A] border-gray-800">
          <CardContent className="p-6">
            <div className="flex gap-6 flex-col md:flex-row">
              {ad.imageUrl && (
                <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
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
                    <Badge className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30">
                      {ad.category}
                    </Badge>
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
                        Website
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-gray-400">{ad.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#6366F1]" />
              Katalog Produk
            </CardTitle>
            <CardDescription className="text-gray-400">
              {products.length} item tersedia • Centang produk untuk ditambahkan ke Approval Material
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Belum ada produk dalam katalog ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className={`bg-gray-800/50 border-gray-700 hover:border-[#6366F1]/50 transition-all cursor-pointer ${
                      selectedItems.has(product.id) ? 'border-[#6366F1] ring-1 ring-[#6366F1]' : ''
                    }`}
                    onClick={() => toggleItem(product.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedItems.has(product.id)}
                            onCheckedChange={() => toggleItem(product.id)}
                            className="border-gray-600 data-[state=checked]:bg-[#6366F1] data-[state=checked]:border-[#6366F1]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Product Image */}
                        {product.imageUrl ? (
                          <div className="w-20 h-20 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.itemName}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 flex-shrink-0">
                            <Package className="w-8 h-8 text-gray-600" />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                            {product.itemName}
                          </h4>
                          {product.itemCode && (
                            <p className="text-xs text-gray-500 mb-1">Kode: {product.itemCode}</p>
                          )}
                          {product.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                          {product.unit && (
                            <p className="text-xs text-gray-500 mb-1">Satuan: {product.unit}</p>
                          )}
                          {product.price && (
                            <p className="text-sm font-semibold text-[#8B5CF6]">
                              Rp {product.price.toLocaleString('id-ID')}
                            </p>
                          )}
                          {product.stock !== undefined && (
                            <p className={`text-xs mt-1 ${
                              product.stock > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              Stok: {product.stock}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Project Selection Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Pilih Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih project yang sedang Anda kerjakan untuk menambahkan item ke Approval Material
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedProjectId || ''}
              onValueChange={(value) => setSelectedProjectId(value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Pilih project..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id} className="text-white">
                    {project.orderNumber} - {project.projectName || project.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {selectedItems.size} item akan ditambahkan ke project yang dipilih
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProjectDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={() => selectedProjectId && submitApproval(selectedProjectId)}
              disabled={!selectedProjectId || submitting}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Tambah ke Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
