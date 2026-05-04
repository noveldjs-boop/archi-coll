"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import {
  LayoutDashboard,
  Megaphone,
  Users,
  TrendingUp,
  LogOut,
  Handshake,
  BarChart3,
  Target,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Package,
  Calendar
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { MaterialAdsManagement } from "@/components/admin/MaterialAdsManagement"

interface MarketingStats {
  totalPartners: number
  activePartners: number
  newPartnersThisMonth: number
  totalAds: number
  activeAds: number
  totalViews: number
  totalClicks: number
  totalCatalogItems: number
  activeCatalogItems: number
  pendingRequests: number
  totalPartnerRevenue: number
}

interface Partner {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  type: string
  status: string
  totalRevenue: number
  createdAt: string
  contractStart: string | null
  contractEnd: string | null
  commissionRate: number | null
}

interface Ad {
  id: string
  partnerId: string
  title: string
  type: string
  status: string
  startDate: string
  endDate: string | null
  views: number
  clicks: number
  priority: number
  partner: Partner
}

export default function MarketingDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MarketingStats | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [ads, setAds] = useState<Ad[]>([])

  // Dialog states
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [adDialogOpen, setAdDialogOpen] = useState(false)
  const [viewAdDialogOpen, setViewAdDialogOpen] = useState(false)

  // Form states
  const [partnerForm, setPartnerForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    type: 'product-supplier',
    commissionRate: 10
  })
  const [adForm, setAdForm] = useState({
    partnerId: '',
    title: '',
    type: 'product',
    imageUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    priority: 0
  })
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (status === "authenticated") {
      // Check if user has marketing role
      if (session?.user?.role !== "marketing") {
        // Redirect to appropriate dashboard based on role
        if (session?.user?.role === "finance") {
          router.push("/finance")
        } else if (session?.user?.role === "hrd") {
          router.push("/hrd")
        } else if (session?.user?.role === "editor") {
          router.push("/editor")
        } else {
          // Default to admin portal for other roles
          router.push("/admin/login")
        }
        return
      }
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [statsRes, partnersRes, adsRes] = await Promise.all([
        fetch('/api/marketing/stats'),
        fetch('/api/marketing/partners'),
        fetch('/api/marketing/ads')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json()
        setPartners(partnersData.partners || [])
      }

      if (adsRes.ok) {
        const adsData = await adsRes.json()
        setAds(adsData.ads || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePartner = async () => {
    try {
      const method = editingPartner ? 'PUT' : 'POST'
      const payload = editingPartner
        ? { ...partnerForm, id: editingPartner.id }
        : partnerForm

      const response = await fetch('/api/marketing/partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: editingPartner ? 'Partner berhasil diperbarui' : 'Partner berhasil ditambahkan'
        })
        setPartnerDialogOpen(false)
        setEditingPartner(null)
        resetPartnerForm()
        fetchData()
      } else {
        toast({ title: 'Gagal menyimpan partner', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving partner:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleSaveAd = async () => {
    try {
      const response = await fetch('/api/marketing/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm)
      })

      if (response.ok) {
        toast({ title: 'Iklan berhasil ditambahkan' })
        setAdDialogOpen(false)
        resetAdForm()
        fetchData()
      } else {
        toast({ title: 'Gagal menambahkan iklan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleApproveAd = async (adId: string) => {
    try {
      const response = await fetch('/api/marketing/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, action: 'approve' })
      })

      if (response.ok) {
        toast({ title: 'Iklan disetujui' })
        fetchData()
      } else {
        toast({ title: 'Gagal menyetujui iklan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error approving ad:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleRejectAd = async (adId: string, reason: string) => {
    try {
      const response = await fetch('/api/marketing/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, action: 'reject', rejectionReason: reason })
      })

      if (response.ok) {
        toast({ title: 'Iklan ditolak' })
        setViewAdDialogOpen(false)
        fetchData()
      } else {
        toast({ title: 'Gagal menolak iklan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error rejecting ad:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus partner ini?')) return

    try {
      const response = await fetch(`/api/marketing/partners?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Partner berhasil dihapus' })
        fetchData()
      } else {
        toast({ title: 'Gagal menghapus partner', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const resetPartnerForm = () => {
    setPartnerForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      type: 'product-supplier',
      commissionRate: 10
    })
  }

  const resetAdForm = () => {
    setAdForm({
      partnerId: '',
      title: '',
      type: 'product',
      imageUrl: '',
      linkUrl: '',
      startDate: '',
      endDate: '',
      priority: 0
    })
  }

  const handleLogout = async () => {
    try {
      await router.push('/admin/login')
      // Clear session after redirect starts
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/admin/login'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Marketing Dashboard</h1>
              <p className="text-sm text-gray-400">ARCHI-COLL Marketing & Partnership</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, {session?.user?.name || "Marketing Team"}
          </h2>
          <p className="text-gray-400">
            Kelola partnership, promosi, dan marketing untuk ARCHI-COLL
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Partners
              </CardTitle>
              <Users className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalPartners || 0}
              </div>
              <p className="text-xs text-green-500 mt-1">
                +{stats?.newPartnersThisMonth || 0} partner baru bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Ads
              </CardTitle>
              <Megaphone className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.activeAds || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.totalViews || 0} views • {stats?.totalClicks || 0} clicks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Catalog Items
              </CardTitle>
              <Target className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalCatalogItems || 0}
              </div>
              <p className="text-xs text-purple-500 mt-1">
                {stats?.activeCatalogItems || 0} aktif
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Partner Revenue
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats?.totalPartnerRevenue || 0)}
              </div>
              <p className="text-xs text-yellow-500 mt-1">
                {stats?.pendingRequests || 0} request pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Partners Management */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Partners
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Kelola partner dan partnership
                </CardDescription>
              </div>
              <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Partner
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingPartner ? 'Edit Partner' : 'Tambah Partner Baru'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nama Perusahaan</Label>
                      <Input
                        value={partnerForm.companyName}
                        onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Kontak Person</Label>
                      <Input
                        value={partnerForm.contactPerson}
                        onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Telepon</Label>
                      <Input
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Tipe Partner</Label>
                      <Select
                        value={partnerForm.type}
                        onValueChange={(value) => setPartnerForm({ ...partnerForm, type: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="product-supplier">Product Supplier</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="material-supplier">Material Supplier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Komisi (%)</Label>
                      <Input
                        type="number"
                        value={partnerForm.commissionRate}
                        onChange={(e) => setPartnerForm({ ...partnerForm, commissionRate: parseFloat(e.target.value) || 0 })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleSavePartner} className="w-full bg-orange-600 hover:bg-orange-700">
                      {editingPartner ? 'Update Partner' : 'Tambah Partner'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Perusahaan</TableHead>
                    <TableHead className="text-gray-300">Kontak</TableHead>
                    <TableHead className="text-gray-300">Tipe</TableHead>
                    <TableHead className="text-gray-300">Revenue</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Tidak ada partner
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner) => (
                      <TableRow key={partner.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{partner.companyName}</TableCell>
                        <TableCell>
                          <div className="text-white">{partner.contactPerson}</div>
                          <div className="text-gray-400 text-sm">{partner.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {partner.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{formatCurrency(partner.totalRevenue)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              partner.status === 'active'
                                ? 'bg-green-600'
                                : partner.status === 'suspended'
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }
                          >
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-gray-700"
                              onClick={() => {
                                setEditingPartner(partner)
                                setPartnerForm({
                                  companyName: partner.companyName,
                                  contactPerson: partner.contactPerson,
                                  email: partner.email,
                                  phone: partner.phone || '',
                                  type: partner.type,
                                  commissionRate: partner.commissionRate || 10
                                })
                                setPartnerDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-500 hover:bg-red-950"
                              onClick={() => handleDeletePartner(partner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ads Management */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Iklan
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Kelola iklan dari partner
                </CardDescription>
              </div>
              <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Iklan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Tambah Iklan Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Partner</Label>
                      <Select
                        value={adForm.partnerId}
                        onValueChange={(value) => setAdForm({ ...adForm, partnerId: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Pilih Partner" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {partners.filter(p => p.status === 'active').map((partner) => (
                            <SelectItem key={partner.id} value={partner.id}>
                              {partner.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Judul Iklan</Label>
                      <Input
                        value={adForm.title}
                        onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Tipe Iklan</Label>
                      <Select
                        value={adForm.type}
                        onValueChange={(value) => setAdForm({ ...adForm, type: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="catalog">Catalog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={adForm.imageUrl}
                        onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Link URL</Label>
                      <Input
                        value={adForm.linkUrl}
                        onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tanggal Mulai</Label>
                        <Input
                          type="date"
                          value={adForm.startDate}
                          onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label>Tanggal Selesai</Label>
                        <Input
                          type="date"
                          value={adForm.endDate}
                          onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        value={adForm.priority}
                        onChange={(e) => setAdForm({ ...adForm, priority: parseInt(e.target.value) || 0 })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleSaveAd} className="w-full bg-blue-600 hover:bg-blue-700">
                      Tambah Iklan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="pending" className="data-[state=active]:bg-gray-600">
                  Pending ({ads.filter(a => a.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-gray-600">
                  Active ({ads.filter(a => a.status === 'active').length})
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-gray-600">
                  Semua ({ads.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Iklan</TableHead>
                        <TableHead className="text-gray-300">Partner</TableHead>
                        <TableHead className="text-gray-300">Tipe</TableHead>
                        <TableHead className="text-gray-300">Periode</TableHead>
                        <TableHead className="text-gray-300">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.filter(a => a.status === 'pending').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            Tidak ada iklan pending
                          </TableCell>
                        </TableRow>
                      ) : (
                        ads.filter(a => a.status === 'pending').map((ad) => (
                          <TableRow key={ad.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{ad.title}</TableCell>
                            <TableCell className="text-white">{ad.partner.companyName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gray-500 text-gray-300">
                                {ad.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3" />
                                {new Date(ad.startDate).toLocaleDateString('id-ID')}
                                {ad.endDate && ` - ${new Date(ad.endDate).toLocaleDateString('id-ID')}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-600 text-green-500 hover:bg-green-950"
                                  onClick={() => handleApproveAd(ad.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="active" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Iklan</TableHead>
                        <TableHead className="text-gray-300">Partner</TableHead>
                        <TableHead className="text-gray-300">Tipe</TableHead>
                        <TableHead className="text-gray-300">Views</TableHead>
                        <TableHead className="text-gray-300">Clicks</TableHead>
                        <TableHead className="text-gray-300">Periode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.filter(a => a.status === 'active').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            Tidak ada iklan aktif
                          </TableCell>
                        </TableRow>
                      ) : (
                        ads.filter(a => a.status === 'active').map((ad) => (
                          <TableRow key={ad.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{ad.title}</TableCell>
                            <TableCell className="text-white">{ad.partner.companyName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                {ad.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{ad.views}</TableCell>
                            <TableCell className="text-white">{ad.clicks}</TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(ad.startDate).toLocaleDateString('id-ID')}
                              {ad.endDate && ` - ${new Date(ad.endDate).toLocaleDateString('id-ID')}`}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Iklan</TableHead>
                        <TableHead className="text-gray-300">Partner</TableHead>
                        <TableHead className="text-gray-300">Tipe</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Views</TableHead>
                        <TableHead className="text-gray-300">Clicks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            Tidak ada iklan
                          </TableCell>
                        </TableRow>
                      ) : (
                        ads.map((ad) => (
                          <TableRow key={ad.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{ad.title}</TableCell>
                            <TableCell className="text-white">{ad.partner.companyName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gray-500 text-gray-300">
                                {ad.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  ad.status === 'active'
                                    ? 'bg-green-600'
                                    : ad.status === 'pending'
                                    ? 'bg-yellow-600'
                                    : ad.status === 'rejected'
                                    ? 'bg-red-600'
                                    : 'bg-gray-600'
                                }
                              >
                                {ad.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{ad.views}</TableCell>
                            <TableCell className="text-white">{ad.clicks}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Material Ads Management */}
        <MaterialAdsManagement />
      </main>
    </div>
  )
}
