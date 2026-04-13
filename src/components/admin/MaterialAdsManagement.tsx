'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Phone,
  DollarSign,
  RefreshCw,
  Package2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AD_CATEGORIES } from "@/lib/ad-categories"

interface MaterialAd {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string | null
  catalogUrl: string | null
  price: string | null
  contact: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function MaterialAdsManagement() {
  const [ads, setAds] = useState<MaterialAd[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<MaterialAd | null>(null)
  const [adToDelete, setAdToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    catalogUrl: '',
    price: '',
    contact: '',
    isActive: true
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/material-ads')
      if (res.ok) {
        const data = await res.json()
        setAds(data.ads || [])
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
      toast({ title: 'Gagal memuat iklan', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast({ title: 'Mohon lengkapi field yang wajib diisi', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const method = editingAd ? 'PUT' : 'POST'
      const url = editingAd ? `/api/material-ads/${editingAd.id}` : '/api/material-ads'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast({ title: editingAd ? 'Iklan berhasil diperbarui' : 'Iklan berhasil ditambahkan' })
        setDialogOpen(false)
        resetForm()
        fetchAds()
      } else {
        const error = await res.json()
        toast({ title: error.error || 'Gagal menyimpan iklan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

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
      isActive: ad.isActive
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!adToDelete) return

    try {
      const res = await fetch(`/api/material-ads/${adToDelete}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Iklan berhasil dihapus' })
        setDeleteDialogOpen(false)
        setAdToDelete(null)
        fetchAds()
      } else {
        toast({ title: 'Gagal menghapus iklan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setEditingAd(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      catalogUrl: '',
      price: '',
      contact: '',
      isActive: true
    })
  }

  const getCategoryName = (categoryId: string) => {
    const cat = AD_CATEGORIES.find(c => c.id === categoryId)
    return cat?.name || categoryId
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Package2 className="w-5 h-5" />
              Iklan Material Konstruksi
            </CardTitle>
            <CardDescription className="text-gray-400">
              Kelola iklan produk material konstruksi yang muncul di dashboard member
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchAds}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Iklan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingAd ? 'Perbarui informasi iklan material' : 'Tambahkan iklan material baru ke kolom iklan'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Kategori *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {AD_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Judul Iklan *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Beton Ready Mix K-300"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>Deskripsi *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi lengkap produk..."
                      rows={4}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>URL Gambar</Label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>URL Katalog</Label>
                    <Input
                      value={formData.catalogUrl}
                      onChange={(e) => setFormData({ ...formData, catalogUrl: e.target.value })}
                      placeholder="https://example.com/catalog"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Harga</Label>
                      <Input
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Rp 500.000 / m³"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Kontak</Label>
                      <Input
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="08123456789"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aktif</Label>
                      <p className="text-xs text-gray-400">Iklan aktif akan tampil di dashboard member</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isSaving ? 'Menyimpan...' : editingAd ? 'Update Iklan' : 'Tambah Iklan'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Memuat iklan...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Iklan</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Belum ada iklan material konstruksi yang ditambahkan.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Iklan Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300 w-[300px]">Iklan</TableHead>
                  <TableHead className="text-gray-300">Kategori</TableHead>
                  <TableHead className="text-gray-300">Harga</TableHead>
                  <TableHead className="text-gray-300">Kontak</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Dibuat</TableHead>
                  <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{ad.title}</p>
                        <p className="text-gray-400 text-sm line-clamp-1">{ad.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-500 text-gray-300">
                        {getCategoryName(ad.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ad.price ? (
                        <div className="flex items-center gap-1 text-sm text-white">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          {ad.price}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ad.contact ? (
                        <div className="flex items-center gap-1 text-sm text-white">
                          <Phone className="w-3 h-3 text-blue-500" />
                          {ad.contact}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={ad.isActive ? 'bg-green-600' : 'bg-gray-600'}
                      >
                        {ad.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      {new Date(ad.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {ad.catalogUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-700"
                            onClick={() => window.open(ad.catalogUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-700"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-500 hover:bg-red-950"
                          onClick={() => {
                            setAdToDelete(ad.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Iklan</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Apakah Anda yakin ingin menghapus iklan ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-700">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
