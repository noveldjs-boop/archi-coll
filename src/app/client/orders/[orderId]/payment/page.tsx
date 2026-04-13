'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { StorageSelector } from '@/components/StorageSelector'
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  FileText,
  Check,
  Clock,
  AlertCircle,
  Upload,
  Home,
  Building,
  MapPin,
  Ruler,
  Layers,
  DollarSign,
  Phone,
  MessageSquare,
  Printer,
  User,
  CreditCard,
} from 'lucide-react'

// Types
interface Order {
  id: string
  orderNumber: string
  clientName: string
  buildingCategory: string
  buildingType?: string
  qualityLevel?: string
  landArea: string
  buildingArea: string
  buildingFloors: string
  location?: string
  description?: string
  designFee: number
  simulatedDP10: number
  dpPaidAmount: number
  remainingAfterDP: number
  dpPaid: boolean
  paymentStage: string
  payment80PercentPaid: boolean
  payment20PercentPaid: boolean
  fullyPaid: boolean
  status: string
  createdAt: string
  payments?: Payment[]
}

interface Payment {
  id: string
  orderId: string
  type: string
  amount: number
  paidAt: string | null
  paymentMethod: string | null
  proofUrl: string | null
  verified: boolean
  verifiedAt: string | null
  notes: string | null
  createdAt: string
}

// Translations
const translations = {
  en: {
    backToOrders: 'Back to Orders',
    orderPayment: 'Order Payment',
    orderDetails: 'Order Details',
    paymentSummary: 'Payment Summary',
    bankInfo: 'Bank Transfer Information',
    uploadProof: 'Upload Payment Proof',
    orderNumber: 'Order Number',
    buildingCategory: 'Building Category',
    buildingType: 'Building Type',
    qualityLevel: 'Quality Level',
    projectLocation: 'Project Location',
    landArea: 'Land Area',
    buildingArea: 'Building Area',
    numberOfFloors: 'Number of Floors',
    additionalNotes: 'Additional Notes',
    orderStatus: 'Order Status',
    dpInitial: 'Initial Down Payment (10%)',
    amountToPay: 'Amount to Pay',
    dueDate: 'Due Date',
    currentPaymentStatus: 'Current Payment Status',
    paymentHistory: 'Payment History',
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
    accountHolder: 'Account Holder',
    copyToClipboard: 'Copy to Clipboard',
    qrCode: 'QR Code',
    uploadTransferProof: 'Upload Transfer Proof',
    maxFileSize: 'Max file size: 5MB',
    supportedFormats: 'Supported formats: JPEG, PNG, PDF',
    additionalNote: 'Additional Note (Optional)',
    uploadButton: 'Upload Payment Proof',
    downloadInvoice: 'Download Invoice',
    print: 'Print',
    contactSupport: 'Contact Support',
    steps: {
      formOrder: '1. Order Form',
      confirmation: '2. Confirmation',
      payment: '3. Payment',
      monitoring: '4. Monitoring',
    },
    pending: 'Pending',
    processing: 'Processing',
    verified: 'Verified',
    rejected: 'Rejected',
    uploaded: 'Uploaded',
    noPayment: 'No payment yet',
    uploadSuccess: 'Payment proof uploaded successfully',
    uploadError: 'Failed to upload payment proof',
    loading: 'Loading...',
    error: 'An error occurred',
    selectFile: 'Select File',
    noFileSelected: 'No file selected',
    fileTooLarge: 'File is too large (max 5MB)',
    invalidFileType: 'Invalid file type',
    copySuccess: 'Copied to clipboard!',
    copyError: 'Failed to copy',
    daysLeft: 'days left',
    dayLeft: 'day left',
    expired: 'Expired',
    unpaid: 'Unpaid',
    paid: 'Paid',
    verifying: 'Verifying...',
    waitingVerification: 'Waiting for verification',
  },
  id: {
    backToOrders: 'Kembali ke Pesanan',
    orderPayment: 'Pembayaran Pesanan',
    orderDetails: 'Detail Pesanan',
    paymentSummary: 'Ringkasan Pembayaran',
    bankInfo: 'Informasi Transfer Bank',
    uploadProof: 'Upload Bukti Pembayaran',
    orderNumber: 'Nomor Pesanan',
    buildingCategory: 'Kategori Bangunan',
    buildingType: 'Tipe Bangunan',
    qualityLevel: 'Tingkat Kualitas',
    projectLocation: 'Lokasi Proyek',
    landArea: 'Luas Tanah',
    buildingArea: 'Luas Bangunan',
    numberOfFloors: 'Jumlah Lantai',
    additionalNotes: 'Catatan Tambahan',
    orderStatus: 'Status Pesanan',
    dpInitial: 'DP Awal (10%)',
    amountToPay: 'Jumlah yang Harus Dibayar',
    dueDate: 'Jatuh Tempo',
    currentPaymentStatus: 'Status Pembayaran Saat Ini',
    paymentHistory: 'Riwayat Pembayaran',
    bankName: 'Nama Bank',
    accountNumber: 'Nomor Rekening',
    accountHolder: 'Atas Nama',
    copyToClipboard: 'Salin ke Clipboard',
    qrCode: 'QR Code',
    uploadTransferProof: 'Upload Bukti Transfer',
    maxFileSize: 'Ukuran maksimal: 5MB',
    supportedFormats: 'Format yang didukung: JPEG, PNG, PDF',
    additionalNote: 'Catatan Tambahan (Opsional)',
    uploadButton: 'Upload Bukti Pembayaran',
    downloadInvoice: 'Download Invoice',
    print: 'Cetak',
    contactSupport: 'Hubungi Support',
    steps: {
      formOrder: '1. Formulir Pesanan',
      confirmation: '2. Konfirmasi',
      payment: '3. Pembayaran',
      monitoring: '4. Monitoring',
    },
    pending: 'Menunggu',
    processing: 'Diproses',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    uploaded: 'Diupload',
    noPayment: 'Belum ada pembayaran',
    uploadSuccess: 'Bukti pembayaran berhasil diupload',
    uploadError: 'Gagal upload bukti pembayaran',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    selectFile: 'Pilih File',
    noFileSelected: 'Tidak ada file yang dipilih',
    fileTooLarge: 'File terlalu besar (maksimal 5MB)',
    invalidFileType: 'Tipe file tidak valid',
    copySuccess: 'Berhasil disalin!',
    copyError: 'Gagal menyalin',
    daysLeft: 'hari tersisa',
    dayLeft: 'hari tersisa',
    expired: 'Kadaluarsa',
    unpaid: 'Belum Dibayar',
    paid: 'Dibayar',
    verifying: 'Memverifikasi...',
    waitingVerification: 'Menunggu verifikasi',
  },
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const hasMounted = useRef(false)
  const isRedirecting = useRef(false)
  const { orderId } = React.use(params)

  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null)
  const [storageType, setStorageType] = useState<'local' | 'drive'>('local')

  const t = translations[language]

  // Redirect to login if not authenticated
  useEffect(() => {
    hasMounted.current = true

    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login...')
      if (!isRedirecting.current) {
        isRedirecting.current = true
        router.push('/auth/login')
      }
    } else if (status === 'authenticated' && session?.user) {
      console.log('User authenticated:', session.user.email, session.user.role)

      if (session.user.role !== 'client') {
        console.error('User is not a client:', session.user.role)
        setError('Anda tidak memiliki akses ke halaman ini.')
        setTimeout(() => {
          router.push('/')
        }, 3000)
        setLoading(false)
      }
    }
  }, [status, session, router])

  // Fetch order details
  useEffect(() => {
    if (status !== 'authenticated' || !hasMounted.current || !orderId) return

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/client/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.data)
          
          // Set due date (7 days from order creation)
          if (data.data.createdAt) {
            const due = new Date(data.data.createdAt)
            due.setDate(due.getDate() + 7)
            setDueDate(due)
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Gagal memuat detail pesanan')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Terjadi kesalahan saat memuat detail pesanan')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [status, orderId])

  // Countdown timer
  useEffect(() => {
    if (!dueDate) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = dueDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        return null
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [dueDate])

  // Auto-refresh order status
  useEffect(() => {
    if (!order || order.paymentStage === 'dp_paid') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/client/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.data)
        }
      } catch (err) {
        console.error('Error refreshing order status:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [order, orderId])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: t.invalidFileType,
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: t.fileTooLarge,
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)

    // Preview image if it's an image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: t.noFileSelected,
        variant: 'destructive',
      })
      return
    }

    if (!order) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('paymentId', order.id) // Using order ID as payment ID for DP
      formData.append('notes', notes)

      // Choose API endpoint based on storage type
      const uploadEndpoint = storageType === 'local'
        ? '/api/client/payments/proof-local'
        : '/api/client/payments/proof'

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: t.uploadSuccess,
        })

        // Refresh order data
        const orderResponse = await fetch(`/api/client/orders/${orderId}`)
        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          setOrder(orderData.data)
        }

        // Redirect to order details after successful upload
        setTimeout(() => {
          router.push(`/client/orders/${orderId}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || t.uploadError,
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error uploading proof:', err)
      toast({
        title: 'Error',
        description: t.uploadError,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Success',
        description: t.copySuccess,
      })
    }).catch(() => {
      toast({
        title: 'Error',
        description: t.copyError,
        variant: 'destructive',
      })
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: t.pending, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      processing: { label: t.processing, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
      verified: { label: t.verified, className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check },
      rejected: { label: t.rejected, className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Show loading state
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{t.loading}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <Card className="bg-[#2a2a2a] border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/client/dashboard')}
              className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
            >
              {t.backToOrders}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order || !session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#1E1E1E]/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/client/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{t.orderPayment}</h1>
                <p className="text-sm text-gray-400">{order.orderNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="text-gray-400 hover:text-white"
            >
              {language === 'id' ? 'EN' : 'ID'}
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="mt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client/dashboard" className="text-gray-400 hover:text-white">
                    {t.backToOrders}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-600" />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/client/orders/${orderId}`} className="text-gray-400 hover:text-white">
                    {order.orderNumber}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#9B59B6]">{t.uploadProof}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                  1
                </div>
                <span className="hidden md:block text-sm text-gray-400">{t.steps.formOrder}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                  2
                </div>
                <span className="hidden md:block text-sm text-gray-400">{t.steps.confirmation}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] flex items-center justify-center text-sm text-white">
                  3
                </div>
                <span className="hidden md:block text-sm text-white font-medium">{t.steps.payment}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                  4
                </div>
                <span className="hidden md:block text-sm text-gray-400">{t.steps.monitoring}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#9B59B6]" />
                  {t.orderDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm">{t.orderNumber}</Label>
                    <p className="text-white font-medium mt-1">{order.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">{t.orderStatus}</Label>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">{t.buildingCategory}</Label>
                  <p className="text-white font-medium mt-1 capitalize">
                    {order.buildingCategory?.replace(/_/g, ' ') || '-'}
                  </p>
                </div>

                {order.buildingType && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.buildingType}</Label>
                    <p className="text-white font-medium mt-1 capitalize">
                      {order.buildingType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}

                {order.qualityLevel && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.qualityLevel}</Label>
                    <p className="text-white font-medium mt-1 capitalize">{order.qualityLevel}</p>
                  </div>
                )}

                {order.location && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.projectLocation}</Label>
                    <p className="text-white font-medium mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {order.location}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm">{t.landArea}</Label>
                    <p className="text-white font-medium mt-1 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      {order.landArea} m²
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">{t.buildingArea}</Label>
                    <p className="text-white font-medium mt-1 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      {order.buildingArea} m²
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">{t.numberOfFloors}</Label>
                  <p className="text-white font-medium mt-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    {order.buildingFloors} lantai
                  </p>
                </div>

                {order.description && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.additionalNotes}</Label>
                    <p className="text-white mt-1 text-sm">{order.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#9B59B6]" />
                  {t.paymentHistory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.payments && order.payments.length > 0 ? (
                  <div className="space-y-3">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium capitalize">
                            {payment.type.replace(/_/g, ' ')}
                          </span>
                          {getStatusBadge(payment.verified ? 'verified' : payment.paidAt ? 'processing' : 'pending')}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{formatCurrency(payment.amount)}</span>
                          <span className="text-gray-500">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString('id-ID')
                              : '-'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">{t.noPayment}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Form */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/5 border-[#6B5B95]/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#9B59B6]" />
                  {t.paymentSummary}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#6B5B95]/10 rounded-lg border border-[#6B5B95]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">{t.dpInitial}</span>
                    <Badge className="bg-[#E74C3C] text-white">Required</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mt-2">
                    {formatCurrency(order.simulatedDP10)}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {timeLeft ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">
                          {timeLeft.days} {timeLeft.days === 1 ? t.dayLeft : t.daysLeft}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {t.expired}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t.amountToPay}</span>
                    <span className="text-white font-medium">
                      {order.dpPaid ? formatCurrency(order.dpPaidAmount) : formatCurrency(order.simulatedDP10 - order.dpPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t.currentPaymentStatus}</span>
                    <span className={order.dpPaid ? 'text-green-400' : 'text-yellow-400'}>
                      {order.dpPaid ? t.paid : t.unpaid}
                    </span>
                  </div>
                  {dueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t.dueDate}</span>
                      <span className="text-white">{dueDate.toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#9B59B6]" />
                  {t.bankInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400 text-sm">{t.bankName}</Label>
                    <p className="text-white font-medium mt-1">BCA</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">{t.accountNumber}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-white font-mono text-lg">1234567890</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard('1234567890')}
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">{t.accountHolder}</Label>
                    <p className="text-white font-medium mt-1">PT. ARCHI-COLL</p>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                      <div className="grid grid-cols-5 gap-1 p-2">
                        {[...Array(25)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-sm ${
                              Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{t.qrCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Selector */}
            <StorageSelector
              storageType={storageType}
              onStorageChange={setStorageType}
              language={language}
              disabled={order.dpPaid}
            />

            {/* Upload Payment Proof */}
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#9B59B6]" />
                  {t.uploadTransferProof}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-[#6B5B95] transition-colors">
                  <input
                    type="file"
                    id="payment-proof"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    disabled={order.dpPaid}
                  />
                  <label
                    htmlFor="payment-proof"
                    className={`flex flex-col items-center justify-center cursor-pointer ${order.dpPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded-lg mb-2"
                        />
                        {!order.dpPaid && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm">{t.selectFile}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-white font-medium mb-1">
                          {selectedFile ? selectedFile.name : t.selectFile}
                        </p>
                        <p className="text-sm text-gray-400 text-center">
                          {t.maxFileSize}<br />
                          {t.supportedFormats}
                        </p>
                      </>
                    )}
                  </label>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-400 text-sm">
                    {t.additionalNote}
                  </Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'id' ? 'Masukkan catatan...' : 'Enter notes...'}
                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                    disabled={order.dpPaid}
                  />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading || order.dpPaid}
                  className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] hover:from-[#9B59B6] hover:to-[#6B5B95]"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t.processing}
                    </>
                  ) : order.dpPaid ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t.paid}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {t.uploadButton}
                    </>
                  )}
                </Button>

                {order.dpPaid && (
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <Check className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      {t.verified}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => router.push('/client/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToOrders}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {t.downloadInvoice}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                {t.print}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t.contactSupport}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
