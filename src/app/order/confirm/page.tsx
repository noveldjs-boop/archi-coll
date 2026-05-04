'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Loader2,
  Building,
  MapPin,
  Home,
  Layers,
  Calculator,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Copy,
  Banknote,
  CreditCard,
  Info,
  Edit,
  X
} from 'lucide-react'

interface OrderData {
  categoryId: string
  subCategoryId?: string
  location: string
  landArea: number
  buildingArea: number
  floors: number
  technicalClass: string
  notes?: string
  massDensity?: string
  priceCalculation?: {
    rab: number
    designFee: number
    dp: number
    pricePerM2: number
    iaiFeeRate: number
  }
  categoryName?: string
  subCategoryName?: string
  technicalClassName?: string
}

interface Category {
  id: string
  nameIndo: string
  nameEng: string
  subCategories: Array<{
    id: string
    nameIndo: string
    nameEng: string
  }>
}

interface BuildingClass {
  id: string
  nameIndo: string
  nameEng: string
  code: string
}

export default function OrderConfirmPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [buildingClasses, setBuildingClasses] = useState<BuildingClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

  const translations = {
    id: {
      title: 'Konfirmasi Order',
      subtitle: 'Periksa detail order Anda sebelum melanjutkan ke pembayaran',
      steps: {
        form: 'Form Order',
        confirm: 'Konfirmasi',
        payment: 'Pembayaran'
      },
      orderSummary: 'Ringkasan Order',
      priceSummary: 'Ringkasan Harga',
      buildingCategory: 'Kategori Bangunan',
      subCategory: 'Sub-Kategori',
      location: 'Lokasi Proyek',
      landArea: 'Luas Lahan',
      buildingArea: 'Luas Bangunan',
      floors: 'Jumlah Lantai',
      technicalClass: 'Kelas Teknis',
      massDensity: 'Kepadatan Massa',
      notes: 'Catatan Tambahan',
      estimatedRAB: 'Estimasi RAB',
      designFee: 'Biaya Desain Arsitek',
      initialDP: 'DP Awal (10%)',
      totalToPay: 'Total yang harus dibayar sekarang',
      paymentMethods: 'Metode Pembayaran',
      bankTransfer: 'Bank Transfer',
      bankName: 'Nama Bank',
      accountNumber: 'No. Rekening',
      accountHolder: 'Atas Nama',
      copySuccess: 'Nomor rekening disalin!',
      actionButtons: {
        edit: 'Edit Order',
        cancel: 'Batal',
        confirm: 'Konfirmasi & Lanjut ke Pembayaran'
      },
      alerts: {
        confirmTitle: 'Konfirmasi Order',
        confirmMessage: 'Apakah Anda yakin dengan data order ini? Setelah dikonfirmasi, Anda akan diarahkan ke halaman pembayaran.',
        cancel: 'Batal',
        confirm: 'Ya, Konfirmasi',
        infoTitle: 'Informasi Penting',
        infoMessage: 'Pastikan semua data sudah benar. Order yang sudah dikonfirmasi tidak dapat diubah setelah pembayaran diproses.',
        noOrderData: 'Data order tidak ditemukan. Silakan isi form order terlebih dahulu.',
        errorRequired: 'Mohon lengkapi semua data yang diperwajibkan.',
        errorCreateOrder: 'Gagal membuat order. Silakan coba lagi.',
        orderCreated: 'Order berhasil dibuat!',
        paymentRequired: 'Anda harus login untuk melanjutkan ke pembayaran.'
      },
      loading: 'Memuat...',
      submitting: 'Memproses...',
      noData: '-'
    },
    en: {
      title: 'Order Confirmation',
      subtitle: 'Review your order details before proceeding to payment',
      steps: {
        form: 'Order Form',
        confirm: 'Confirmation',
        payment: 'Payment'
      },
      orderSummary: 'Order Summary',
      priceSummary: 'Price Summary',
      buildingCategory: 'Building Category',
      subCategory: 'Sub-Category',
      location: 'Project Location',
      landArea: 'Land Area',
      buildingArea: 'Building Area',
      floors: 'Number of Floors',
      technicalClass: 'Technical Class',
      massDensity: 'Mass Density',
      notes: 'Additional Notes',
      estimatedRAB: 'Estimated RAB',
      designFee: 'Architect Design Fee',
      initialDP: 'Initial DP (10%)',
      totalToPay: 'Total to Pay Now',
      paymentMethods: 'Payment Methods',
      bankTransfer: 'Bank Transfer',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      accountHolder: 'Account Holder',
      copySuccess: 'Account number copied!',
      actionButtons: {
        edit: 'Edit Order',
        cancel: 'Cancel',
        confirm: 'Confirm & Proceed to Payment'
      },
      alerts: {
        confirmTitle: 'Confirm Order',
        confirmMessage: 'Are you sure with this order data? Once confirmed, you will be redirected to the payment page.',
        cancel: 'Cancel',
        confirm: 'Yes, Confirm',
        infoTitle: 'Important Information',
        infoMessage: 'Please ensure all data is correct. Confirmed orders cannot be changed after payment is processed.',
        noOrderData: 'Order data not found. Please fill in the order form first.',
        errorRequired: 'Please complete all required data.',
        errorCreateOrder: 'Failed to create order. Please try again.',
        orderCreated: 'Order created successfully!',
        paymentRequired: 'You must login to proceed to payment.'
      },
      loading: 'Loading...',
      submitting: 'Processing...',
      noData: '-'
    }
  }

  const text = translations[language]

  // Bank information
  const bankInfo = {
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountHolder: 'PT Archi Collaboration Indonesia'
  }

  // Fetch categories and building classes
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/services-classification')
        const data = await response.json()

        if (data.success) {
          setCategories(data.data.categories || [])
          setBuildingClasses(data.data.buildingClasses || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Load order data from sessionStorage
  useEffect(() => {
    const storedOrderData = sessionStorage.getItem('orderData')

    if (storedOrderData) {
      try {
        const parsedData = JSON.parse(storedOrderData)
        setOrderData(parsedData)
      } catch (error) {
        console.error('Error parsing order data:', error)
        toast({
          variant: 'destructive',
          title: language === 'id' ? 'Error' : 'Error',
          description: text.alerts.noOrderData
        })
        router.push('/order')
      }
    } else {
      toast({
        variant: 'destructive',
        title: language === 'id' ? 'Data Tidak Ditemukan' : 'Data Not Found',
        description: text.alerts.noOrderData
      })
      router.push('/order')
    }

    setIsLoading(false)
  }, [router, toast, text.alerts.noOrderData, language])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Copy to clipboard
  const copyToClipboard = (accountNumber: string, type: string) => {
    navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(type)
    toast({
      title: language === 'id' ? 'Berhasil' : 'Success',
      description: language === 'id' ? 'Nomor rekening disalin!' : 'Account number copied!'
    })
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  // Get category name
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      return language === 'id' ? category.nameIndo : category.nameEng
    }
    return orderData?.categoryName || categoryId
  }

  // Get sub-category name
  const getSubCategoryName = (subCategoryId?: string): string => {
    if (!subCategoryId) return text.noData
    const category = categories.find(cat => cat.id === orderData?.categoryId)
    if (category) {
      const sub = category.subCategories.find(sc => sc.id === subCategoryId)
      if (sub) {
        return language === 'id' ? sub.nameIndo : sub.nameEng
      }
    }
    return orderData?.subCategoryName || subCategoryId
  }

  // Get technical class name
  const getTechnicalClassName = (technicalClassId: string): string => {
    const buildingClass = buildingClasses.find(bc => bc.id === technicalClassId)
    if (buildingClass) {
      return `${language === 'id' ? buildingClass.nameIndo : buildingClass.nameEng} (${buildingClass.code})`
    }
    return orderData?.technicalClassName || technicalClassId
  }

  // Validate order data
  const validateOrderData = (): boolean => {
    if (!orderData) return false

    const requiredFields = [
      'categoryId',
      'location',
      'landArea',
      'buildingArea',
      'floors',
      'technicalClass'
    ]

    return requiredFields.every(field => {
      const value = orderData[field as keyof OrderData]
      return value !== undefined && value !== null && value !== ''
    })
  }

  // Handle edit order
  const handleEditOrder = () => {
    if (orderData) {
      // Store order data to pre-fill the form
      sessionStorage.setItem('orderData', JSON.stringify(orderData))
      router.push('/order')
    }
  }

  // Handle cancel
  const handleCancel = () => {
    sessionStorage.removeItem('orderData')
    router.push('/services')
  }

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (!validateOrderData()) {
      toast({
        variant: 'destructive',
        title: language === 'id' ? 'Validasi Error' : 'Validation Error',
        description: text.alerts.errorRequired
      })
      return
    }

    setShowConfirmDialog(false)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/client/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Save orderId to localStorage
        localStorage.setItem('currentOrderId', result.data.id)
        localStorage.setItem('currentOrderNumber', result.data.orderNumber)

        // Clear sessionStorage
        sessionStorage.removeItem('orderData')

        toast({
          title: language === 'id' ? 'Berhasil' : 'Success',
          description: text.alerts.orderCreated
        })

        // Redirect to payment page
        router.push(`/client/orders/${result.data.id}/payment`)
      } else {
        toast({
          variant: 'destructive',
          title: language === 'id' ? 'Error' : 'Error',
          description: result.error || text.alerts.errorCreateOrder
        })
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        variant: 'destructive',
        title: language === 'id' ? 'Error' : 'Error',
        description: text.alerts.errorCreateOrder
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast({
        variant: 'destructive',
        title: language === 'id' ? 'Perlu Login' : 'Login Required',
        description: text.alerts.paymentRequired
      })
      router.push('/auth/login?redirect=/order/confirm')
    }
  }, [status, router, toast, language, text.alerts.paymentRequired])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1E1E1E' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#9B59B6' }} />
          <p className="text-gray-400">{text.loading}</p>
        </div>
      </div>
    )
  }

  if (!orderData || !orderData.priceCalculation) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1E1E1E' }}>
      {/* Header with gradient */}
      <div className="py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #6B5B95 0%, #9B59B6 50%, #E74C3C 100%)'
      }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{text.title}</h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">{text.subtitle}</p>

        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              1
            </div>
            <span className="ml-2 text-white/80 text-sm hidden sm:inline">{text.steps.form}</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold">
              2
            </div>
            <span className="ml-2 text-white text-sm font-semibold hidden sm:inline">{text.steps.confirm}</span>
          </div>
          <div className="w-8 h-0.5 bg-white/30"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white/60 font-bold">
              3
            </div>
            <span className="ml-2 text-white/60 text-sm hidden sm:inline">{text.steps.payment}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Info Alert */}
        <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>{text.alerts.infoTitle}:</strong> {text.alerts.infoMessage}
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Order Summary */}
          <div>
            <Card className="border-0" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5" style={{ color: '#9B59B6' }} />
                  {text.orderSummary}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {language === 'id'
                    ? 'Detail lengkap order Anda'
                    : 'Complete details of your order'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Building Category */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                  <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {text.buildingCategory}
                  </p>
                  <p className="text-lg font-semibold text-white">{getCategoryName(orderData.categoryId)}</p>
                  {orderData.subCategoryId && (
                    <p className="text-sm text-gray-400 mt-1 ml-6">
                      {text.subCategory}: {getSubCategoryName(orderData.subCategoryId)}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                  <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {text.location}
                  </p>
                  <p className="text-lg font-semibold text-white">{orderData.location}</p>
                </div>

                {/* Areas and Floors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {text.landArea}
                    </p>
                    <p className="text-xl font-bold" style={{ color: '#E74C3C' }}>
                      {orderData.landArea.toLocaleString()} m²
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {text.buildingArea}
                    </p>
                    <p className="text-xl font-bold" style={{ color: '#E74C3C' }}>
                      {orderData.buildingArea.toLocaleString()} m²
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {text.floors}
                    </p>
                    <p className="text-xl font-bold" style={{ color: '#9B59B6' }}>
                      {orderData.floors}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      {text.technicalClass}
                    </p>
                    <p className="text-base font-semibold" style={{ color: '#9B59B6' }}>
                      {getTechnicalClassName(orderData.technicalClass)}
                    </p>
                  </div>
                </div>

                {/* Mass Density */}
                {orderData.massDensity && (
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: '#9B59B6',
                        color: '#9B59B6',
                        backgroundColor: 'rgba(155, 89, 182, 0.1)'
                      }}
                      className="text-sm py-1 px-3"
                    >
                      {text.massDensity}: {orderData.massDensity}
                    </Badge>
                  </div>
                )}

                {/* Notes */}
                {orderData.notes && (
                  <div className="p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">{text.notes}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{orderData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary and Actions */}
          <div>
            <div className="space-y-6">
              {/* Price Summary */}
              <Card className="border-0" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5" style={{ color: '#9B59B6' }} />
                    {text.priceSummary}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {language === 'id'
                      ? 'Rincian biaya dan pembayaran'
                      : 'Cost details and payment'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Building Area */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{text.buildingArea}</span>
                    <span className="text-white font-semibold">
                      {orderData.buildingArea.toLocaleString()} m²
                    </span>
                  </div>

                  {/* Estimated RAB */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1">{text.estimatedRAB}</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(orderData.priceCalculation.rab)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      @ {formatCurrency(orderData.priceCalculation.pricePerM2)}/m²
                    </p>
                  </div>

                  {/* Design Fee */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                    <p className="text-sm text-gray-400 mb-1">{text.designFee}</p>
                    <p className="text-2xl font-bold" style={{ color: '#9B59B6' }}>
                      {formatCurrency(orderData.priceCalculation.designFee)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(orderData.priceCalculation.iaiFeeRate * 100).toFixed(1)}% dari RAB
                    </p>
                  </div>

                  {/* Initial DP - Highlighted */}
                  <div className="p-4 rounded-lg border-2 relative" style={{
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderColor: '#E74C3C'
                  }}>
                    <Badge
                      className="absolute -top-2 left-4 text-xs"
                      style={{
                        background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
                        color: 'white'
                      }}
                    >
                      {language === 'id' ? 'Pembayaran Pertama' : 'First Payment'}
                    </Badge>
                    <p className="text-sm text-gray-400 mb-1 mt-2">{text.initialDP}</p>
                    <p className="text-3xl font-bold" style={{ color: '#E74C3C' }}>
                      {formatCurrency(orderData.priceCalculation.dp)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'id' ? '10% dari biaya desain' : '10% of design fee'}
                    </p>
                  </div>

                  {/* Total to Pay */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">{text.totalToPay}</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-white mt-2">
                      {formatCurrency(orderData.priceCalculation.dp)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card className="border-0" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" style={{ color: '#9B59B6' }} />
                    {text.paymentMethods}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                    <Banknote className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">{text.bankTransfer}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{text.bankName}</span>
                      <span className="text-white font-semibold">{bankInfo.bankName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{text.accountNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold font-mono">
                          {bankInfo.accountNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                          onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{text.accountHolder}</span>
                      <span className="text-white font-semibold text-sm">
                        {bankInfo.accountHolder}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #6B5B95 0%, #9B59B6 50%, #E74C3C 100%)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {text.submitting}
                    </>
                  ) : (
                    <>
                      {text.actionButtons.confirm}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleEditOrder}
                    className="h-10"
                    style={{
                      borderColor: 'rgba(155, 89, 182, 0.5)',
                      color: '#9B59B6',
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {text.actionButtons.edit}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-10 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {text.actionButtons.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {text.alerts.confirmTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              {text.alerts.confirmMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{text.totalToPay}</span>
                <span className="text-xl font-bold" style={{ color: '#E74C3C' }}>
                  {formatCurrency(orderData.priceCalculation.dp)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{text.buildingCategory}</span>
                <span className="text-white font-semibold">{getCategoryName(orderData.categoryId)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{text.location}</span>
                <span className="text-white font-semibold text-right text-xs max-w-[200px]">
                  {orderData.location}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {text.alerts.cancel}
            </Button>
            <Button
              onClick={handleConfirmOrder}
              style={{
                background: 'linear-gradient(135deg, #6B5B95 0%, #9B59B6 50%, #E74C3C 100%)',
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {text.alerts.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
