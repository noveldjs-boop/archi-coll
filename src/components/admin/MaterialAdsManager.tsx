'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Upload, Package, Check, X, Loader2, Image as ImageIcon } from "lucide-react"
import { CATEGORY_VALUES } from "@/lib/ad-categories"

interface MaterialAd {
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
  isActive: boolean
  _count?: {
    productItems: number
  }
}

export function MaterialAdsManager() {
  const [ads, setAds] = useState<MaterialAd[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<MaterialAd | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedAdForUpload, setSelectedAdForUpload] = useState<MaterialAd | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    catalogUrl: '',
    price: '',
    contact: '',
    companyName: '',
    companyLogo: '',
    websiteUrl: '',
    isActive: true
  })

  // Upload file state
  const [file, setFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // Fetch ads
  const fetchAds = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/material-ads')
      const data = await res.json()
      if (data.success) {
        const adsWithCounts = await Promise.all(
          data.ads.map(async (ad: MaterialAd) => {
            try {
              const productRes = await fetch(`/api/material-ads/${ad.id}/products`)
              const productData = await productRes.json()
              return {
                ...ad,
                _count: { productItems: productData.success ? productData.products.length : 0 }
              }
            } catch {
              return { ...ad, _count: { productItems: 0 } }
            }
          })
        )
        setAds(adsWithCounts)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      catalogUrl: '',
      price: '',
      contact: '',
      companyName: '',
      companyLogo: '',
      websiteUrl: '',
      isActive: true
    })
    setLogoFile(null)
    setBannerFile(null)
    setEditingAd(null)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // First, upload logo if selected
    if (logoFile && editingAd) {
      await handleLogoUpload(editingAd.id, logoFile)
    }

    // Upload banner image if selected
    if (bannerFile && editingAd) {
      await handleBannerUpload(editingAd.id, bannerFile)
    }

    try {
      const url = editingAd ? `/api/material-ads/${editingAd.id}` : '/api/material-ads'
      const method = editingAd ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        setDialogOpen(false)
        resetForm()
        fetchAds()
      } else {
        alert(data.error || 'Failed to save ad')
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      alert('Failed to save ad')
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (adId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingLogo(true)
      const res = await fetch(`/api/material-ads/${adId}/upload-logo`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, companyLogo: data.companyLogo }))
        alert('Logo berhasil diupload')
      } else {
        alert(data.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle banner upload
  const handleBannerUpload = async (adId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingBanner(true)
      const res = await fetch(`/api/material-ads/${adId}/upload-logo`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.companyLogo }))
        alert('Banner berhasil diupload')
      } else {
        alert(data.error || 'Failed to upload banner')
      }
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Failed to upload banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  // Handle edit
  const handleEdit = (ad: MaterialAd) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description,
      category: ad.category,
      imageUrl: ad.imageUrl || '',
      catalogUrl: ad.catalogUrl || '',
      price: ad.price || '',
      contact: ad.contact || '',
      companyName: ad.companyName || '',
      companyLogo: ad.companyLogo || '',
      websiteUrl: ad.websiteUrl || '',
      isActive: ad.isActive
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return

    try {
      const res = await fetch(`/api/material-ads/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchAds()
      } else {
        alert(data.error || 'Failed to delete ad')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Failed to delete ad')
    }
  }

  // Handle toggle active
  const handleToggleActive = async (ad: MaterialAd) => {
    try {
      const res = await fetch(`/api/material-ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ad.isActive })
      })
      const data = await res.json()
      if (data.success) {
        fetchAds()
      }
    } catch (error) {
      console.error('Error toggling ad status:', error)
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedAdForUpload) return

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/material-ads/${selectedAdForUpload.id}/upload-excel`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      setUploadResult({
        success: data.success,
        message: data.message || (data.success ? 'Upload successful' : 'Upload failed')
      })

      if (data.success) {
        fetchAds()
        setFile(null)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadResult({
        success: false,
        message: 'Failed to upload file'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Iklan Material</h2>
          <p className="text-gray-400">Kelola iklan dan upload katalog produk via Excel</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { resetForm() }}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Iklan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingAd ? 'Edit informasi iklan material' : 'Tambah iklan material konstruksi baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Judul Iklan *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {CATEGORY_VALUES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat.replace(/-/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-300">Nama Perusahaan</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-gray-300">Website Perusahaan</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-gray-300">Logo Perusahaan</Label>
                <div className="flex items-center gap-4">
                  {formData.companyLogo && (
                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={formData.companyLogo}
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  {editingAd && logoFile && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleLogoUpload(editingAd.id, logoFile)}
                      disabled={uploadingLogo}
                      className="bg-[#6366F1] hover:bg-[#5558E8]"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upload
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">Harga Katalog</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-300">Kontak</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-gray-300">URL Gambar Utama (Opsional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="atau upload file di bawah"
                      className="bg-gray-800 border-gray-700 text-white flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner" className="text-gray-300">Upload Banner Utama (Opsional)</Label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl && (
                    <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={formData.imageUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="banner"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  {editingAd && bannerFile && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleBannerUpload(editingAd.id, bannerFile)}
                      disabled={uploadingBanner}
                      className="bg-[#6366F1] hover:bg-[#5558E8]"
                    >
                      {uploadingBanner ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upload
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Banner
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="catalogUrl" className="text-gray-300">URL Katalog Eksternal (Opsional)</Label>
                <Input
                  id="catalogUrl"
                  type="url"
                  value={formData.catalogUrl}
                  onChange={(e) => setFormData({ ...formData, catalogUrl: e.target.value })}
                  placeholder="Link ke katalog PDF/website eksternal"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-gray-300">Aktif</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setDialogOpen(false); resetForm() }}
                  className="border-gray-700 text-gray-300"
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-[#6366F1] hover:bg-[#5558E8]">
                  {editingAd ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ads Table */}
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Daftar Iklan</CardTitle>
          <CardDescription className="text-gray-400">
            Kelola semua iklan material yang tampil di dashboard member
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Belum ada iklan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Judul</TableHead>
                  <TableHead className="text-gray-300">Perusahaan</TableHead>
                  <TableHead className="text-gray-300">Kategori</TableHead>
                  <TableHead className="text-gray-300">Produk</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white font-medium">{ad.title}</TableCell>
                    <TableCell className="text-gray-400">{ad.companyName || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30">
                        {ad.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {ad._count?.productItems || 0} item
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className="flex items-center gap-2"
                      >
                        {ad.isActive ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={ad.isActive ? 'text-green-400' : 'text-red-400'}>
                          {ad.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAdForUpload(ad)
                            setUploadDialogOpen(true)
                            setUploadResult(null)
                            setFile(null)
                          }}
                          className="border-[#6366F1]/30 text-[#8B5CF6] hover:bg-[#6366F1]/10"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Excel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ad)}
                          className="border-blue-500/50 text-blue-300 hover:bg-blue-900/30"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ad.id)}
                          className="border-red-500/50 text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Excel Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Katalog Produk</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload file Excel (.xlsx atau .xls) untuk {selectedAdForUpload?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file" className="text-gray-300">File Excel *</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
              <div className="bg-gray-800/50 p-3 rounded-lg space-y-1">
                <p className="text-xs text-gray-400 font-semibold">Kolom yang didukung:</p>
                <p className="text-xs text-gray-500">
                  • <span className="text-white">Wajib:</span> Nama/Name/Produk
                </p>
                <p className="text-xs text-gray-500">
                  • <span className="text-white">Opsional:</span> Kode, Deskripsi, Spesifikasi, Satuan, Harga, Stok, Foto/Gambar
                </p>
              </div>
            </div>

            {uploadResult && (
              <div className={`p-3 rounded-lg ${
                uploadResult.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
              }`}>
                {uploadResult.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="border-gray-700 text-gray-300"
                disabled={uploading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={uploading || !file} className="bg-[#6366F1] hover:bg-[#5558E8]">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
