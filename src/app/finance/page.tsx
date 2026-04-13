"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Users,
  LogOut,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  RefreshCw,
  User,
  UserPlus,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FinanceStats {
  totalRevenue: number
  currentMonthRevenue: number
  lastMonthRevenue: number
  revenueGrowth: number
  totalPendingAmount: number
  pendingPaymentsCount: number
  totalOrders: number
  currentMonthOrders: number
  lastMonthOrders: number
  orderGrowth: number
  activePartners: number
  newPartnersThisMonth: number
  pendingPayments: any[]
}

interface Payment {
  id: string
  type: string
  amount: number
  paidAt: string | null
  paymentMethod: string | null
  orderNumber: string
  clientName: string
  clientEmail: string | null
  order: {
    orderNumber: string
    clientName: string
    client?: {
      user: {
        email: string
      }
    }
  }
}

export default function FinanceDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentNotes, setPaymentNotes] = useState("")
  const [verifying, setVerifying] = useState(false)

  // Architect assignment states
  const [assignArchitectDialogOpen, setAssignArchitectDialogOpen] = useState(false)
  const [availableArchitects, setAvailableArchitects] = useState<any[]>([])
  const [selectedArchitectId, setSelectedArchitectId] = useState("")
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<any>(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/finance")
    } else if (status === "authenticated") {
      // Check if user has finance role
      if (session?.user?.role !== "finance") {
        router.push("/admin/login")
        return
      }
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [statsRes, paymentsRes, ordersRes] = await Promise.all([
        fetch('/api/finance/stats'),
        fetch('/api/finance/payments?status=all'),
        fetch('/api/finance/orders?limit=20')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (action: 'verify' | 'reject') => {
    if (!selectedPayment) return

    setVerifying(true)
    try {
      const response = await fetch('/api/finance/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action,
          notes: paymentNotes
        })
      })

      if (response.ok) {
        toast({
          title: action === 'verify' ? 'Pembayaran diverifikasi' : 'Pembayaran ditolak',
          description: action === 'verify' ? 'Pembayaran berhasil diverifikasi' : 'Pembayaran ditolak dengan catatan'
        })
        setPaymentDialogOpen(false)
        setSelectedPayment(null)
        setPaymentNotes('')
        fetchData()
      } else {
        toast({ title: 'Gagal memproses pembayaran', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setVerifying(false)
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setPaymentNotes(payment.order?.notes || '')
    setPaymentDialogOpen(true)
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

  // Architect assignment functions
  const handleOpenAssignArchitectDialog = async (order: any) => {
    setSelectedOrderForAssign(order)
    setSelectedArchitectId("")

    try {
      const response = await fetch('/api/finance/architects')
      if (response.ok) {
        const data = await response.json()
        setAvailableArchitects(data.availableArchitects || [])
        setAssignArchitectDialogOpen(true)
      } else {
        toast({ title: 'Gagal mengambil daftar arsitek', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error fetching architects:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleAssignArchitect = async () => {
    if (!selectedOrderForAssign || !selectedArchitectId) {
      toast({ title: 'Pilih arsitek terlebih dahulu', variant: 'destructive' })
      return
    }

    setAssigning(true)
    try {
      const response = await fetch('/api/finance/assign-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderForAssign.id,
          architectId: selectedArchitectId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: data.message || 'Arsitek berhasil ditugaskan!' })
        setAssignArchitectDialogOpen(false)
        setSelectedArchitectId("")
        setSelectedOrderForAssign(null)
        fetchData()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Gagal menugaskan arsitek', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error assigning architect:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setAssigning(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading || status === "loading") {
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
            <LayoutDashboard className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
              <p className="text-sm text-gray-400">ARCHI-COLL Financial Management</p>
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
            Selamat Datang, Finance Team
          </h2>
          <p className="text-gray-400">
            Kelola keuangan dan pembayaran untuk ARCHI-COLL
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className={`text-xs mt-1 flex items-center ${stats?.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats?.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stats?.revenueGrowth?.toFixed(1)}% dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Payments
              </CardTitle>
              <CreditCard className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats?.totalPendingAmount || 0)}
              </div>
              <p className="text-xs text-yellow-500 mt-1">
                {stats?.pendingPaymentsCount || 0} pembayaran tertunda
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Orders
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalOrders || 0}
              </div>
              <p className={`text-xs mt-1 flex items-center ${stats?.orderGrowth >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {stats?.orderGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stats?.orderGrowth?.toFixed(1)}% dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Partners
              </CardTitle>
              <Users className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.activePartners || 0}
              </div>
              <p className="text-xs text-green-500 mt-1">
                +{stats?.newPartnersThisMonth || 0} partner baru bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Management */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Pembayaran
            </CardTitle>
            <CardDescription className="text-gray-400">
              Kelola dan verifikasi pembayaran dari klien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="pending" className="data-[state=active]:bg-gray-600">
                  Pending ({payments.filter(p => !p.order?.verified && p.paidAt).length})
                </TabsTrigger>
                <TabsTrigger value="verified" className="data-[state=active]:bg-gray-600">
                  Verified ({payments.filter(p => p.order?.verified && p.paidAt).length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Order #</TableHead>
                        <TableHead className="text-gray-300">Klien</TableHead>
                        <TableHead className="text-gray-300">Tipe</TableHead>
                        <TableHead className="text-gray-300">Jumlah</TableHead>
                        <TableHead className="text-gray-300">Metode</TableHead>
                        <TableHead className="text-gray-300">Tanggal</TableHead>
                        <TableHead className="text-gray-300">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.filter(p => !p.order?.verified && p.paidAt).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Tidak ada pembayaran pending
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.filter(p => !p.order?.verified && p.paidAt).map((payment) => (
                          <TableRow key={payment.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{payment.orderNumber}</TableCell>
                            <TableCell className="text-white">{payment.clientName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                {payment.type === 'dp' ? 'DP (10%)' : payment.type === 'payment_80_percent' ? '80%' : '20%'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="text-gray-300">{payment.paymentMethod || '-'}</TableCell>
                            <TableCell className="text-gray-300">
                              {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('id-ID') : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-white hover:bg-gray-700"
                                onClick={() => handleViewPayment(payment)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="verified" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Order #</TableHead>
                        <TableHead className="text-gray-300">Klien</TableHead>
                        <TableHead className="text-gray-300">Tipe</TableHead>
                        <TableHead className="text-gray-300">Jumlah</TableHead>
                        <TableHead className="text-gray-300">Tanggal</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.filter(p => p.order?.verified && p.paidAt).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            Tidak ada pembayaran verified
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.filter(p => p.order?.verified && p.paidAt).map((payment) => (
                          <TableRow key={payment.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">{payment.orderNumber}</TableCell>
                            <TableCell className="text-white">{payment.clientName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                {payment.type === 'dp' ? 'DP (10%)' : payment.type === 'payment_80_percent' ? '80%' : '20%'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('id-ID') : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            </TableCell>
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

        {/* Recent Orders */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Order Terbaru
            </CardTitle>
            <CardDescription className="text-gray-400">
              Daftar order terbaru yang masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Order #</TableHead>
                    <TableHead className="text-gray-300">Klien</TableHead>
                    <TableHead className="text-gray-300">Design Fee</TableHead>
                    <TableHead className="text-gray-300">Payment Stage</TableHead>
                    <TableHead className="text-gray-300">Arsitek</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Tanggal</TableHead>
                    <TableHead className="text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        Tidak ada order
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="text-white">{order.clientName}</TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatCurrency(order.designFee)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              order.paymentStage === 'completed'
                                ? 'border-green-500 text-green-500'
                                : order.paymentStage === 'dp_paid'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-yellow-500 text-yellow-500'
                            }
                          >
                            {order.paymentStage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.assignedMember ? (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <User className="w-3 h-3 mr-1" />
                              {order.assignedMember.user?.name || 'Assigned'}
                            </Badge>
                          ) : order.dpPaid ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <UserPlus className="w-3 h-3 mr-1" />
                              Belum Ditugaskan
                            </Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              order.status === 'completed'
                                ? 'bg-green-600'
                                : order.status === 'cancelled'
                                ? 'bg-red-600'
                                : 'bg-blue-600'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          {order.dpPaid && !order.assignedMember ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenAssignArchitectDialog(order)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Assign
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {order.assignedMember ? 'Assigned' : 'Pending DP'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Payment Review Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Review Pembayaran</DialogTitle>
            <DialogDescription className="text-gray-400">
              Verifikasi atau tolak pembayaran ini
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Order Number</Label>
                  <p className="text-white font-medium">{selectedPayment.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Nama Klien</Label>
                  <p className="text-white">{selectedPayment.clientName}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Tipe Pembayaran</Label>
                  <p className="text-white">
                    {selectedPayment.type === 'dp' ? 'DP (10%)' : selectedPayment.type === 'payment_80_percent' ? '80%' : '20%'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Jumlah</Label>
                  <p className="text-white font-semibold text-lg">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Metode Pembayaran</Label>
                  <p className="text-white">{selectedPayment.paymentMethod || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Tanggal Pembayaran</Label>
                  <p className="text-white">
                    {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Catatan</Label>
                <Textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pembayaran ini..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleVerifyPayment('reject')}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-500 hover:bg-red-950"
                  disabled={verifying}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button
                  onClick={() => handleVerifyPayment('verify')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={verifying}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verifikasi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Architect Dialog */}
      <Dialog open={assignArchitectDialogOpen} onOpenChange={setAssignArchitectDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Assign Arsitek ke Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih arsitek yang tersedia untuk menangani project ini
            </DialogDescription>
          </DialogHeader>
          {selectedOrderForAssign && (
            <div className="space-y-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Order Number</Label>
                    <p className="text-white font-medium">{selectedOrderForAssign.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Nama Klien</Label>
                    <p className="text-white">{selectedOrderForAssign.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Design Fee</Label>
                    <p className="text-white font-semibold">{formatCurrency(selectedOrderForAssign.designFee)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Payment Status</Label>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      DP Paid
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label>Pilih Arsitek (Tersedia)</Label>
                {availableArchitects.length === 0 ? (
                  <div className="flex items-center gap-2 mt-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">Tidak ada arsitek yang tersedia saat ini</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {availableArchitects.map((architect) => (
                      <div
                        key={architect.id}
                        onClick={() => setSelectedArchitectId(architect.id)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                          ${selectedArchitectId === architect.id
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-gray-700/50 hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {architect.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{architect.name}</p>
                            <p className="text-xs text-gray-400">{architect.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">{architect.experience || 0} tahun</p>
                          <p className="text-xs text-gray-500">pengalaman</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAssignArchitect}
                disabled={!selectedArchitectId || assigning}
                className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] hover:from-[#6B5B95]/80 hover:to-[#9B59B6]/80"
              >
                {assigning ? 'Menugaskan...' : 'Tugaskan Arsitek'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
