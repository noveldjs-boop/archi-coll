'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
  User,
  LogOut,
  FileText,
  Home,
  Building,
  Store,
  Briefcase,
  Check,
  Clock,
  AlertCircle,
  Menu,
  CreditCard,
  Video,
  MessageSquare,
  Star,
  Upload,
  X as CloseIcon,
  Inbox,
  SendHorizontal,
  BarChart3,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Order {
  id: string
  orderNumber: string
  projectName: string | null
  buildingCategory: string
  landArea: string
  buildingArea: string
  buildingModel: string
  buildingFloors: string
  structureType: string
  description: string | null
  location: string | null
  coordinates: string | null
  status: 'pending' | 'in_pre_design' | 'in_schematic' | 'in_ded' | 'in_review' | 'completed' | 'cancelled'
  rab: number
  designFee: number
  simulatedDP10: number
  dpPaid: boolean
  paymentStage: string
  clientRating: number | null
  ratingFeedback: string | null
  createdAt: string
  updatedAt: string
}

interface InboxMessage {
  id: string
  orderId: string
  order: {
    id: string
    orderNumber: string
  }
  senderType: 'client' | 'architect'
  senderId: string
  message: string
  attachmentUrl: string | null
  isRead: boolean
  createdAt: string
}

interface ClientUser {
  id: string
  email: string
  name: string
  role: string
  googleEmail: string | null
  client?: {
    id: string
    phone: string
    address: string | null
    companyName: string | null
  }
}

export default function ClientDashboard() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const hasMounted = useRef(false)
  const isRedirecting = useRef(false)

  const [activeSection, setActiveSection] = useState('dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<ClientUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)

  // Rating dialog states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')

  // Inbox/Outbox states
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([])
  const [outboxMessages, setOutboxMessages] = useState<InboxMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [messageTab, setMessageTab] = useState<'inbox' | 'outbox'>('inbox')

  // Redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      hasMounted.current = true

      const userData = localStorage.getItem('clientUser')
      if (!userData) {
        console.log('User not authenticated, redirecting to login...')
        if (!isRedirecting.current) {
          isRedirecting.current = true
          router.push('/client/auth')
        }
        return
      }

      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'client') {
          console.error('User is not a client:', parsedUser.role)
          setError('Anda tidak memiliki akses ke halaman ini.')
          setTimeout(() => {
            router.push('/')
          }, 3000)
          setLoading(false)
          return
        }

        setUser(parsedUser)

        // Check for pending order and create it
        const pendingOrder = sessionStorage.getItem('pendingOrder')
        if (pendingOrder && parsedUser.client?.id) {
          try {
            const orderData = JSON.parse(pendingOrder)
            const res = await fetch('/api/client/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientId: parsedUser.client.id,
                ...orderData
              })
            })

            if (res.ok) {
              // Clear pending order after successful creation
              sessionStorage.removeItem('pendingOrder')
              console.log('Pending order created successfully')
            }
          } catch (err) {
            console.error('Error creating pending order:', err)
          }
        }
      } catch (err) {
        console.error('Error parsing user data:', err)
        localStorage.removeItem('clientUser')
        router.push('/client/auth')
      }
    }
    
    checkAuth()
  }, [router])

  // Fetch orders
  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      try {
        console.log('Fetching orders for client:', user.id)
        const response = await fetch(`/api/client/orders?clientId=${user.client?.id}`)

        if (response.ok) {
          const data = await response.json()
          console.log('Received orders:', data)
          setOrders(data.orders || [])
          setError(null)
        } else {
          const errorData = await response.text()
          console.error('API returned non-200 status:', response.status, errorData)
          setError('Gagal memuat data pesanan. Silakan coba lagi.')
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Terjadi kesalahan saat memuat data. Silakan refresh halaman.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  // Fetch inbox/outbox
  useEffect(() => {
    if (!user || !user.client?.id) return

    const fetchInbox = async () => {
      try {
        const response = await fetch(`/api/client/inbox?clientId=${user.client?.id}`)
        if (response.ok) {
          const data = await response.json()
          setInboxMessages(data.inbox || [])
          setOutboxMessages(data.outbox || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Error fetching inbox:', err)
      }
    }

    fetchInbox()
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('clientUser')
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Menunggu Pembayaran', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      in_pre_design: { label: 'Pra-Desain', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileText },
      in_schematic: { label: 'Schematic', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: FileText },
      in_ded: { label: 'DED', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: FileText },
      in_review: { label: 'Review', className: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: FileText },
      completed: { label: 'Selesai', className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (order: Order) => {
    // If payment is uploaded but not verified (dpPaid is true but status is still pending)
    if (order.dpPaid && order.status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Menunggu Verifikasi
        </Badge>
      )
    }

    // If payment is verified
    if (order.dpPaid && order.status !== 'pending') {
      return (
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
            <Check className="w-3 h-3 mr-1" />
            Terverifikasi
          </Badge>
          <span className="text-xs text-green-400">
            ✓ Pesanan telah masuk ke sistem
          </span>
        </div>
      )
    }

    // No payment or payment stage is pending
    return (
      <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Belum Bayar
      </Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return <Home className="w-4 h-4" />
      case 'villa': return <Building className="w-4 h-4" />
      case 'cafe_restaurant': return <Store className="w-4 h-4" />
      case 'apartment': return <Building className="w-4 h-4" />
      case 'commercial': return <Briefcase className="w-4 h-4" />
      case 'hotel': return <Building className="w-4 h-4" />
      default: return <Building className="w-4 h-4" />
    }
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: language === 'id' ? 'Dashboard' : 'Dashboard', count: null },
    { id: 'orders', icon: FileText, label: language === 'id' ? 'Pesanan Saya' : 'My Orders', count: orders.filter(o => o.status === 'pending').length },
    { id: 'payments', icon: CreditCard, label: language === 'id' ? 'Pembayaran' : 'Payments', count: orders.filter(o => !o.dpPaid).length },
    { id: 'monitoring', icon: BarChart3, label: language === 'id' ? 'Monitoring' : 'Monitoring', count: orders.filter(o => o.dpPaid && o.status !== 'pending').length },
    { id: 'inbox', icon: Inbox, label: language === 'id' ? 'Pesan' : 'Messages', count: unreadCount },
    { id: 'profile', icon: User, label: language === 'id' ? 'Profil' : 'Profile', count: null },
  ]

  const handlePaymentSubmit = async () => {
    if (!selectedOrder || !paymentMethod || !paymentProof) {
      setError('Silakan lengkapi data pembayaran')
      return
    }

    setUploadingPayment(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('orderId', selectedOrder.id)
      formData.append('paymentMethod', paymentMethod)
      formData.append('proof', paymentProof)
      formData.append('type', 'dp')

      const res = await fetch('/api/client/payments', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment submission failed')
      }

      alert(language === 'id' ? 'Bukti pembayaran berhasil diupload!' : 'Payment proof uploaded successfully!')
      setPaymentDialogOpen(false)
      setPaymentMethod('')
      setPaymentProof(null)

      // Refresh orders
      const ordersRes = await fetch(`/api/client/orders?clientId=${user?.client?.id}`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders || [])
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment')
    } finally {
      setUploadingPayment(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (!selectedOrder || rating === 0) {
      setError('Silakan berikan rating')
      return
    }

    try {
      const res = await fetch('/api/client/orders/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          rating,
          feedback: ratingComment
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Rating submission failed')
      }

      alert(language === 'id' ? 'Terima kasih atas penilaian Anda!' : 'Thank you for your rating!')
      setRatingDialogOpen(false)
      setRating(0)
      setRatingComment('')

      // Refresh orders
      const ordersRes = await fetch(`/api/client/orders?clientId=${user?.client?.id}`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders || [])

      // Refresh selected order
      const updatedOrder = ordersData.orders.find((o: Order) => o.id === selectedOrder.id)
      if (updatedOrder) setSelectedOrder(updatedOrder)
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating')
    }
  }

  // Show loading state
  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{language === 'id' ? 'Memuat dashboard...' : 'Loading dashboard...'}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
        <Card className="bg-[#2a2a2a] border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
            >
              {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-[#1E1E1E] overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#2a2a2a] rounded-lg border border-gray-700"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${mobileSidebarOpen ? 'fixed' : 'hidden'} lg:static lg:block
          inset-y-0 left-0 z-40
          w-72 bg-[#121212] border-r border-gray-800 flex flex-col flex-shrink-0
          transform transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 w-full hover:bg-gray-800/50 p-2 -m-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
                  ARCHI-COLL
                </h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.name || 'Klien'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                {user.googleEmail && (
                  <p className="text-xs text-[#9B59B6] truncate">
                    {user.googleEmail}
                  </p>
                )}
                <Badge variant="outline" className="mt-1 text-xs bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                  Klien
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setMobileSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all
                    ${activeSection === item.id
                      ? 'bg-gradient-to-r from-[#6B5B95]/20 to-[#9B59B6]/20 text-white border border-[#6B5B95]/30'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <Badge variant="secondary" className="bg-[#E74C3C] text-white text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {language === 'id' ? 'Keluar' : 'Logout'}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-[#1E1E1E]/80 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {navItems.find(item => item.id === activeSection)?.label}
                </h2>
              </div>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#6B5B95]/5 border-[#6B5B95]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{language === 'id' ? 'Total Pesanan' : 'Total Orders'}</p>
                          <p className="text-3xl font-bold text-white mt-1">{orders.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#6B5B95]/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#9B59B6]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#9B59B6]/20 to-[#9B59B6]/5 border-[#9B59B6]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{language === 'id' ? 'Pesanan Aktif' : 'Active Orders'}</p>
                          <p className="text-3xl font-bold text-white mt-1">
                            {orders.filter(o => ['in_pre_design', 'in_schematic', 'in_ded', 'in_review'].includes(o.status)).length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-[#9B59B6]/20 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-[#9B59B6]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#E74C3C]/20 to-[#E74C3C]/5 border-[#E74C3C]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{language === 'id' ? 'Selesai' : 'Completed'}</p>
                          <p className="text-3xl font-bold text-white mt-1">
                            {orders.filter(o => o.status === 'completed').length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-[#E74C3C]/20 rounded-xl flex items-center justify-center">
                          <Check className="w-6 h-6 text-[#E74C3C]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">{language === 'id' ? 'Pesanan Terbaru' : 'Recent Orders'}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {language === 'id' ? 'Menampilkan 5 pesanan terbaru Anda' : 'Showing your 5 most recent orders'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">{language === 'id' ? 'Belum ada pesanan' : 'No orders yet'}</p>
                        <Button
                          onClick={() => router.push('/services')}
                          className="mt-4 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                        >
                          {language === 'id' ? 'Buat Pesanan Baru' : 'Create New Order'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#6B5B95]/20 rounded-lg flex items-center justify-center text-[#9B59B6]">
                                {getCategoryIcon(order.buildingCategory)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-400 capitalize">{order.buildingCategory.replace('_', ' ')}</p>
                              </div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">{language === 'id' ? 'Semua Pesanan' : 'All Orders'}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {language === 'id' ? 'Daftar semua pesanan Anda' : 'List of all your orders'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">{language === 'id' ? 'Belum ada pesanan' : 'No orders yet'}</p>
                        <Button
                          onClick={() => router.push('/services')}
                          className="mt-4 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                        >
                          {language === 'id' ? 'Buat Pesanan Baru' : 'Create New Order'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#6B5B95]/20 rounded-lg flex items-center justify-center text-[#9B59B6]">
                                {getCategoryIcon(order.buildingCategory)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-400">
                                  {order.buildingArea} • {order.buildingModel} • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payments Section */}
            {activeSection === 'payments' && (
              <div className="space-y-6">
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{language === 'id' ? 'Status Pembayaran' : 'Payment Status'}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {language === 'id' ? 'Kelola pembayaran pesanan Anda' : 'Manage your order payments'}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          // Refresh orders data
                          if (user?.client?.id) {
                            fetch(`/api/client/orders?clientId=${user.client.id}`)
                              .then(res => res.json())
                              .then(data => {
                                setOrders(data.orders || [])
                              })
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {language === 'id' ? 'Refresh' : 'Refresh'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">{language === 'id' ? 'Belum ada pesanan' : 'No orders yet'}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-white font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-400">
                                  {order.buildingArea} • {order.buildingModel}
                                </p>
                              </div>
                              {getPaymentStatusBadge(order)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400">
                                  {language === 'id' ? 'Pembayaran Awal (10%)' : 'Initial Payment (10%)'}: Rp {order.simulatedDP10.toLocaleString('id-ID')}
                                </p>
                              </div>
                              {!order.dpPaid && (
                                <Button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setPaymentDialogOpen(true)
                                  }}
                                  className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {language === 'id' ? 'Upload Bukti' : 'Upload Proof'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Monitoring Section */}
            {activeSection === 'monitoring' && (
              <div className="space-y-6">
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">{language === 'id' ? 'Monitoring Proyek' : 'Project Monitoring'}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {language === 'id' ? 'Pantau progress proyek Anda yang sedang berjalan' : 'Monitor your ongoing projects'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.filter(o => o.dpPaid && o.status !== 'pending').length === 0 ? (
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">
                          {language === 'id'
                            ? 'Belum ada proyek yang berjalan. Selesaikan pembayaran untuk memulai proyek.'
                            : 'No ongoing projects yet. Complete payment to start a project.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders
                          .filter(o => o.dpPaid && o.status !== 'pending')
                          .map((order) => (
                            <div
                              key={order.id}
                              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <p className="text-white font-medium text-lg">{order.orderNumber}</p>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <p className="text-gray-400 text-sm mb-1">
                                    {order.projectName || order.buildingModel}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {order.buildingArea} • {order.buildingFloors} {language === 'id' ? 'Lantai' : 'Floors'}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => router.push(`/client/orders/${order.id}/monitoring`)}
                                  className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  {language === 'id' ? 'Lihat Detail' : 'View Details'}
                                </Button>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-400">{language === 'id' ? 'Progress' : 'Progress'}</span>
                                  <span className="text-white font-medium">
                                    {order.status === 'in_pre_design' ? '20%' :
                                     order.status === 'in_schematic' ? '40%' :
                                     order.status === 'in_ded' ? '70%' :
                                     order.status === 'in_review' ? '90%' :
                                     order.status === 'completed' ? '100%' : '0%'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#6B5B95] to-[#E74C3C] h-2 rounded-full transition-all"
                                    style={{
                                      width: order.status === 'in_pre_design' ? '20%' :
                                             order.status === 'in_schematic' ? '40%' :
                                             order.status === 'in_ded' ? '70%' :
                                             order.status === 'in_review' ? '90%' :
                                             order.status === 'completed' ? '100%' : '0%'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Project Info */}
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-500">{language === 'id' ? 'Design Fee' : 'Design Fee'}</p>
                                  <p className="text-white font-medium">Rp {order.designFee.toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">{language === 'id' ? 'Tanggal Mulai' : 'Start Date'}</p>
                                  <p className="text-white">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Inbox/Outbox Section */}
            {activeSection === 'inbox' && (
              <div className="space-y-6">
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">{language === 'id' ? 'Pesan' : 'Messages'}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {language === 'id' ? 'Inbox dan Outbox pesanan Anda' : 'Your order inbox and outbox'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Message Tabs */}
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() => setMessageTab('inbox')}
                        className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                          messageTab === 'inbox'
                            ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Inbox className="w-4 h-4 inline mr-2" />
                        {language === 'id' ? 'Inbox' : 'Inbox'}
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-[#E74C3C] text-white">{unreadCount}</Badge>
                        )}
                      </button>
                      <button
                        onClick={() => setMessageTab('outbox')}
                        className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                          messageTab === 'outbox'
                            ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <SendHorizontal className="w-4 h-4 inline mr-2" />
                        {language === 'id' ? 'Terkirim' : 'Sent'}
                      </button>
                    </div>

                    {/* Messages List */}
                    {messageTab === 'inbox' ? (
                      inboxMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">{language === 'id' ? 'Tidak ada pesan masuk' : 'No inbox messages'}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {inboxMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-4 rounded-lg transition-all ${
                                !msg.isRead ? 'bg-[#6B5B95]/20 border border-[#6B5B95]/30' : 'bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-gradient-to-br from-[#E74C3C] to-[#F39C12] text-white">
                                    A
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium">
                                      {language === 'id' ? 'Arsitek' : 'Architect'}
                                    </span>
                                    {!msg.isRead && (
                                      <Badge className="bg-[#9B59B6] text-white text-xs">
                                        {language === 'id' ? 'Baru' : 'New'}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-500 ml-auto">
                                      {new Date(msg.createdAt).toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-sm mb-2">
                                    {language === 'id' ? 'Pesanan' : 'Order'}: {msg.order.orderNumber}
                                  </p>
                                  <p className="text-white text-sm">{msg.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      outboxMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <SendHorizontal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">{language === 'id' ? 'Tidak ada pesan terkirim' : 'No sent messages'}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {outboxMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className="p-4 bg-gray-800/50 rounded-lg"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium">{user?.name || 'Klien'}</span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                      {new Date(msg.createdAt).toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-sm mb-2">
                                    {language === 'id' ? 'Pesanan' : 'Order'}: {msg.order.orderNumber}
                                  </p>
                                  <p className="text-white text-sm">{msg.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">{language === 'id' ? 'Profil Klien' : 'Client Profile'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-2xl">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{user.name || 'Klien'}</h3>
                        <p className="text-gray-400">{user.email}</p>
                        {user.googleEmail && (
                          <p className="text-sm text-[#9B59B6] mt-1">
                            Google: {user.googleEmail}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2 bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                          Klien
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.client?.phone && (
                        <div>
                          <Label className="text-gray-400">{language === 'id' ? 'Telepon' : 'Phone'}</Label>
                          <p className="text-white mt-1">{user.client.phone}</p>
                        </div>
                      )}
                      {user.client?.address && (
                        <div>
                          <Label className="text-gray-400">{language === 'id' ? 'Alamat' : 'Address'}</Label>
                          <p className="text-white mt-1">{user.client.address}</p>
                        </div>
                      )}
                      {user.client?.companyName && (
                        <div>
                          <Label className="text-gray-400">{language === 'id' ? 'Perusahaan' : 'Company'}</Label>
                          <p className="text-white mt-1">{user.client.companyName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#2a2a2a] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
              {language === 'id' ? 'Detail Pesanan' : 'Order Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">{language === 'id' ? 'Status' : 'Status'}</span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-[#9B59B6] mb-3">{language === 'id' ? 'Informasi Pembayaran' : 'Payment Information'}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400">{language === 'id' ? 'Estimasi RAB' : 'Estimated RAB'}</span>
                    <span className="text-white font-medium">Rp {selectedOrder.rab.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400">{language === 'id' ? 'Biaya Jasa Arsitek' : 'Architect Fee'}</span>
                    <span className="text-white font-medium">Rp {selectedOrder.designFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400">{language === 'id' ? 'Pembayaran Awal (10%)' : 'Initial Payment (10%)'}</span>
                    <span className={`font-medium ${selectedOrder.dpPaid ? 'text-green-400' : 'text-red-400'}`}>
                      Rp {selectedOrder.simulatedDP10.toLocaleString('id-ID')}
                      {selectedOrder.dpPaid && ` ✓`}
                    </span>
                  </div>
                  {!selectedOrder.dpPaid && (
                    <Button
                      onClick={() => {
                        setPaymentDialogOpen(true)
                      }}
                      className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'id' ? 'Upload Bukti Pembayaran' : 'Upload Payment Proof'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Building Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#9B59B6] mb-3">{language === 'id' ? 'Informasi Proyek' : 'Project Information'}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {selectedOrder.projectName && (
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400">{language === 'id' ? 'Nama Proyek' : 'Project Name'}</p>
                      <p className="text-white font-medium">{selectedOrder.projectName}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">{language === 'id' ? 'Luas Lahan' : 'Land Area'}</p>
                      <p className="text-white">{selectedOrder.landArea}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{language === 'id' ? 'Luas Bangunan' : 'Building Area'}</p>
                      <p className="text-white">{selectedOrder.buildingArea}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{language === 'id' ? 'Model Bangunan' : 'Building Model'}</p>
                      <p className="text-white">{selectedOrder.buildingModel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{language === 'id' ? 'Jumlah Lantai' : 'Number of Floors'}</p>
                      <p className="text-white">{selectedOrder.buildingFloors}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div>
                  <h3 className="text-lg font-semibold text-[#9B59B6] mb-3">{language === 'id' ? 'Deskripsi Tambahan' : 'Additional Description'}</h3>
                  <p className="text-white bg-gray-800/50 p-4 rounded-lg">{selectedOrder.description}</p>
                </div>
              )}

              {/* Rating Section (for completed orders) */}
              {selectedOrder.status === 'completed' && (
                <div>
                  <h3 className="text-lg font-semibold text-[#9B59B6] mb-3">{language === 'id' ? 'Penilaian Anda' : 'Your Rating'}</h3>
                  {selectedOrder.clientRating ? (
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= (selectedOrder.clientRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      {selectedOrder.ratingFeedback && (
                        <p className="text-gray-300 text-sm mt-2">{selectedOrder.ratingFeedback}</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => setRatingDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-[#F39C12] to-[#E74C3C]"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {language === 'id' ? 'Beri Penilaian' : 'Give Rating'}
                    </Button>
                  )}
                </div>
              )}

              {/* Monitoring Button (for active orders) */}
              {['in_pre_design', 'in_schematic', 'in_ded', 'in_review'].includes(selectedOrder.status) && (
                <Button
                  onClick={() => router.push(`/client/monitoring/${selectedOrder.id}`)}
                  className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {language === 'id' ? 'Monitoring Proyek' : 'Project Monitoring'}
                </Button>
              )}

              {/* Timestamp */}
              <div className="flex justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
                <p>{language === 'id' ? 'Dibuat' : 'Created'}: {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</p>
                <p>{language === 'id' ? 'Update Terakhir' : 'Last Updated'}: {new Date(selectedOrder.updatedAt).toLocaleString('id-ID')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md bg-[#2a2a2a] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Upload Bukti Pembayaran' : 'Upload Payment Proof'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 p-2 bg-[#1E1E1E] border border-gray-700 rounded text-white"
              >
                <option value="">{language === 'id' ? 'Pilih metode...' : 'Select method...'}</option>
                <option value="bank_transfer">{language === 'id' ? 'Transfer Bank' : 'Bank Transfer'}</option>
                <option value="cash">{language === 'id' ? 'Tunai' : 'Cash'}</option>
                <option value="ewallet">{language === 'id' ? 'E-Wallet' : 'E-Wallet'}</option>
              </select>
            </div>
            <div>
              <Label>{language === 'id' ? 'Bukti Pembayaran' : 'Payment Proof'}</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="mt-1 bg-[#1E1E1E] border-gray-700"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={() => setPaymentDialogOpen(false)}
                variant="outline"
                className="flex-1 border-gray-700 text-white"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={uploadingPayment}
                className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
              >
                {uploadingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {language === 'id' ? 'Mengupload...' : 'Uploading...'}
                  </>
                ) : (
                  language === 'id' ? 'Kirim' : 'Submit'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="max-w-md bg-[#2a2a2a] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Beri Penilaian' : 'Give Rating'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-center block mb-2">{language === 'id' ? 'Berikan rating 1-5 bintang' : 'Rate 1-5 stars'}</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{language === 'id' ? 'Komentar (Opsional)' : 'Comment (Optional)'}</Label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                className="w-full mt-1 p-2 bg-[#1E1E1E] border border-gray-700 rounded text-white resize-none"
                placeholder={language === 'id' ? 'Tulis komentar Anda...' : 'Write your comment...'}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={() => setRatingDialogOpen(false)}
                variant="outline"
                className="flex-1 border-gray-700 text-white"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleRatingSubmit}
                className="flex-1 bg-gradient-to-r from-[#F39C12] to-[#E74C3C]"
              >
                {language === 'id' ? 'Kirim' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
