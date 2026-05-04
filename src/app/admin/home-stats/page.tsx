'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Database,
  Zap
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface HomeStats {
  id: string
  key: string
  labelIndo: string
  labelEng: string
  value: string
  dataSource: string
  icon: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function HomeStatsAdminPage() {
  const [stats, setStats] = useState<HomeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStat, setEditingStat] = useState<HomeStats | null>(null)

  const [formData, setFormData] = useState({
    key: '',
    labelIndo: '',
    labelEng: '',
    value: '',
    dataSource: 'static' as 'static' | 'dynamic',
    icon: '',
    order: 0,
    active: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/home-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Gagal memuat statistik',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStat
        ? `/api/admin/home-stats/${editingStat.id}`
        : '/api/admin/home-stats'
      
      const method = editingStat ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingStat ? 'Statistik diperbarui' : 'Statistik dibuat',
          description: editingStat 
            ? 'Statistik berhasil diperbarui' 
            : 'Statistik baru berhasil dibuat'
        })
        setDialogOpen(false)
        setEditingStat(null)
        resetForm()
        fetchStats()
      } else {
        const error = await response.json()
        toast({
          title: 'Gagal',
          description: error.error || 'Terjadi kesalahan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving stat:', error)
      toast({
        title: 'Gagal menyimpan statistik',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (stat: HomeStats) => {
    setEditingStat(stat)
    setFormData({
      key: stat.key,
      labelIndo: stat.labelIndo,
      labelEng: stat.labelEng,
      value: stat.value,
      dataSource: (stat.dataSource as 'static' | 'dynamic') || 'static',
      icon: stat.icon,
      order: stat.order,
      active: stat.active
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus statistik ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/home-stats/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Statistik dihapus',
          description: 'Statistik berhasil dihapus'
        })
        fetchStats()
      } else {
        toast({
          title: 'Gagal menghapus',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting stat:', error)
      toast({
        title: 'Gagal menghapus statistik',
        variant: 'destructive'
      })
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/home-stats/${id}/toggle`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: data.active ? 'Statistik diaktifkan' : 'Statistik dinonaktifkan'
        })
        fetchStats()
      } else {
        toast({
          title: 'Gagal mengubah status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error toggling stat:', error)
      toast({
        title: 'Gagal mengubah status',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      key: '',
      labelIndo: '',
      labelEng: '',
      value: '',
      dataSource: 'static',
      icon: '',
      order: 0,
      active: true
    })
  }

  const openAddDialog = () => {
    setEditingStat(null)
    resetForm()
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Statistik Home</h1>
              <p className="text-gray-600 mt-1">
                Atur statistik yang tampil di halaman utama
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Statistik
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingStat ? 'Edit Statistik' : 'Tambah Statistik Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStat 
                      ? 'Edit statistik yang ada di halaman home'
                      : 'Tambahkan statistik baru untuk ditampilkan di halaman home'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="key">Key (Unik)</Label>
                      <Input
                        id="key"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="Contoh: projects, members, experience"
                        required
                        disabled={!!editingStat}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="labelIndo">Label Indonesia</Label>
                      <Input
                        id="labelIndo"
                        value={formData.labelIndo}
                        onChange={(e) => setFormData({ ...formData, labelIndo: e.target.value })}
                        placeholder="Contoh: Proyek Selesai"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="labelEng">Label English</Label>
                      <Input
                        id="labelEng"
                        value={formData.labelEng}
                        onChange={(e) => setFormData({ ...formData, labelEng: e.target.value })}
                        placeholder="Example: Projects Completed"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dataSource">Sumber Data</Label>
                      <select
                        id="dataSource"
                        value={formData.dataSource}
                        onChange={(e) => setFormData({ ...formData, dataSource: e.target.value as 'static' | 'dynamic' })}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B5B95] focus:ring-offset-2"
                        disabled={!!editingStat && (editingStat.key === 'projects' || editingStat.key === 'members' || editingStat.key === 'clients')}
                      >
                        <option value="static">Statis (Tetap)</option>
                        <option value="dynamic">Dinamis (Otomatis dari Database)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {formData.dataSource === 'dynamic' 
                          ? 'Nilai akan dihitung otomatis dari database' 
                          : 'Nilai ditetapkan manual'}
                      </p>
                    </div>
                    {formData.dataSource === 'static' && (
                      <div className="grid gap-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          placeholder="Contoh: 150+"
                          required
                        />
                      </div>
                    )}
                    {formData.dataSource === 'dynamic' && (
                      <div className="grid gap-2">
                        <Label htmlFor="value">Value (Read-only)</Label>
                        <Input
                          id="value"
                          value={formData.value || 'Otomatis dari database'}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">
                          Nilai ini akan dihitung otomatis berdasarkan data aktual. Nilai field ini hanya untuk fallback.
                        </p>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon (Lucide)</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="Contoh: Building2, Users, Award"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="order">Urutan</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active">Aktif</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingStat ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Statistik</CardTitle>
            <CardDescription>
              Total {stats.length} statistik tersimpan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada statistik. Klik "Tambah Statistik" untuk memulai.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Urutan</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Label (ID)</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.order}</TableCell>
                      <TableCell className="font-medium">{stat.key}</TableCell>
                      <TableCell>{stat.labelIndo}</TableCell>
                      <TableCell className="text-lg font-bold">{stat.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {stat.dataSource === 'dynamic' ? (
                            <Zap className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <Database className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-xs text-gray-600">
                            {stat.dataSource === 'dynamic' ? 'Otomatis' : 'Statis'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {stat.icon}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(stat.id)}
                          className="h-8 w-8 p-0"
                        >
                          {stat.active ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(stat)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(stat.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
      </div>
    </div>
  )
}
