'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import {
  Star,
  StarHalf,
  ArrowLeft,
  Home,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  Calendar,
  Check,
  FileText,
  Eye,
} from 'lucide-react'

// Types
interface Order {
  id: string
  orderNumber: string
  clientName: string
  buildingCategory: string
  buildingType?: string
  qualityLevel?: string
  location?: string
  status: string
  completedAt?: string
  createdAt: string
}

interface Rating {
  id: string
  orderId: string
  clientId: string
  designQuality: number
  communication: number
  timeliness: number
  professionalism: number
  overallSatisfaction: number
  whatLiked?: string
  whatToImprove?: string
  additionalComments?: string
  createdAt: string
  updatedAt: string
}

// Translations
const translations = {
  en: {
    backToDashboard: 'Back to Dashboard',
    projectRating: 'Project Rating',
    ratingSubmitted: 'Rating Submitted',
    orderNumber: 'Order Number',
    buildingCategory: 'Building Category',
    buildingType: 'Building Type',
    location: 'Location',
    completionDate: 'Completion Date',
    notCompleted: 'Project not completed',
    ratingNotAllowed: 'You can only rate completed projects',
    submitRating: 'Submit Rating',
    skipForNow: 'Skip for Now',
    viewProjectDetails: 'View Project Details',
    ratingCategories: 'Rating Categories',
    designQuality: 'Design Quality',
    communication: 'Communication',
    timeliness: 'Timeliness',
    professionalism: 'Professionalism',
    overallSatisfaction: 'Overall Satisfaction',
    required: 'Required',
    whatLiked: 'What did you like about this project?',
    whatToImprove: 'What could we improve?',
    additionalComments: 'Additional Comments',
    thankYouMessage: 'Thank you for your feedback!',
    overallRating: 'Overall Rating',
    categoryBreakdown: 'Category Breakdown',
    yourFeedback: 'Your Feedback',
    ratedOn: 'Rated on',
    submitConfirmation: 'Are you sure you want to submit this rating?',
    ratingSuccess: 'Rating submitted successfully!',
    ratingError: 'Failed to submit rating',
    validationError: 'Please provide an overall satisfaction rating',
    loading: 'Loading...',
    error: 'An error occurred',
    veryPoor: 'Very Poor',
    poor: 'Poor',
    average: 'Average',
    good: 'Good',
    excellent: 'Excellent',
    useQuickRating: 'Click to use this rating for all categories',
  },
  id: {
    backToDashboard: 'Kembali ke Dashboard',
    projectRating: 'Rating Proyek',
    ratingSubmitted: 'Rating Telah Diberikan',
    orderNumber: 'Nomor Pesanan',
    buildingCategory: 'Kategori Bangunan',
    buildingType: 'Tipe Bangunan',
    location: 'Lokasi',
    completionDate: 'Tanggal Selesai',
    notCompleted: 'Proyek belum selesai',
    ratingNotAllowed: 'Anda hanya bisa memberi rating pada proyek yang sudah selesai',
    submitRating: 'Kirim Rating',
    skipForNow: 'Lewati untuk Sekarang',
    viewProjectDetails: 'Lihat Detail Proyek',
    ratingCategories: 'Kategori Rating',
    designQuality: 'Kualitas Desain',
    communication: 'Komunikasi',
    timeliness: 'Ketepatan Waktu',
    professionalism: 'Profesionalisme',
    overallSatisfaction: 'Kepuasan Keseluruhan',
    required: 'Wajib',
    whatLiked: 'Apa yang Anda suka dari proyek ini?',
    whatToImprove: 'Apa yang bisa kami tingkatkan?',
    additionalComments: 'Komentar Tambahan',
    thankYouMessage: 'Terima kasih atas penilaian Anda!',
    overallRating: 'Rating Keseluruhan',
    categoryBreakdown: 'Rincian Kategori',
    yourFeedback: 'Feedback Anda',
    ratedOn: 'Diberi pada',
    submitConfirmation: 'Apakah Anda yakin ingin mengirim rating ini?',
    ratingSuccess: 'Rating berhasil dikirim!',
    ratingError: 'Gagal mengirim rating',
    validationError: 'Mohon berikan rating kepuasan keseluruhan',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    veryPoor: 'Sangat Buruk',
    poor: 'Buruk',
    average: 'Cukup',
    good: 'Baik',
    excellent: 'Sangat Baik',
    useQuickRating: 'Klik untuk menggunakan rating ini untuk semua kategori',
  },
}

// Star Rating Component
interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: number
  readonly?: boolean
  label?: string
  required?: boolean
  onQuickRate?: (value: number) => void
}

function StarRating({
  value,
  onChange,
  size = 40,
  readonly = false,
  label,
  required = false,
  onQuickRate,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const ratingLabels = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating)
    }
  }

  const getStarColor = (starPosition: number) => {
    const effectiveValue = hoverValue || value
    if (starPosition <= effectiveValue) {
      return hoverValue ? '#F1C40F' : '#F39C12'
    }
    return '#4b5563'
  }

  const displayValue = hoverValue || value

  return (
    <div className="flex flex-col gap-2">
      {(label || required) && (
        <div className="flex items-center gap-2">
          {label && <Label className="text-gray-300">{label}</Label>}
          {required && (
            <Badge variant="destructive" className="text-xs h-5">
              Required
            </Badge>
          )}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`transition-all duration-200 ${
                !readonly && 'hover:scale-110'
              } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ width: size, height: size }}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(star)}
              onDoubleClick={() => onQuickRate && onQuickRate(star)}
              disabled={readonly}
            >
              <Star
                className={`w-full h-full ${
                  star <= displayValue ? 'fill-current' : ''
                }`}
                style={{
                  color: getStarColor(star),
                  transition: 'color 0.2s ease',
                }}
              />
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white">
            {displayValue}/5
          </span>
          {!readonly && onQuickRate && hoverValue > 0 && (
            <span className="text-xs text-gray-400">
              Double-click to apply to all
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RatingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const hasMounted = useRef(false)
  const isRedirecting = useRef(false)
  const { orderId } = React.use(params)

  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [existingRating, setExistingRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rating state
  const [ratings, setRatings] = useState({
    designQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    overallSatisfaction: 0,
  })

  // Feedback state
  const [feedback, setFeedback] = useState({
    whatLiked: '',
    whatToImprove: '',
    additionalComments: '',
  })

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

  // Fetch order and rating data
  useEffect(() => {
    if (status !== 'authenticated' || !hasMounted.current || !orderId) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch order details
        const orderResponse = await fetch(`/api/client/orders/${orderId}`)
        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          setOrder(orderData.data)
        } else {
          const errorData = await orderResponse.json()
          setError(errorData.error || 'Gagal memuat detail pesanan')
          setLoading(false)
          return
        }

        // Fetch existing rating
        const ratingResponse = await fetch(
          `/api/client/orders/${orderId}/rating`
        )
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json()
          if (ratingData.data) {
            setExistingRating(ratingData.data)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, orderId])

  // Handle rating change
  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  // Quick rating - apply same rating to all categories
  const handleQuickRating = (value: number) => {
    setRatings({
      designQuality: value,
      communication: value,
      timeliness: value,
      professionalism: value,
      overallSatisfaction: value,
    })
  }

  // Handle feedback change
  const handleFeedbackChange = (
    field: keyof typeof feedback,
    value: string
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (ratings.overallSatisfaction === 0) {
      toast({
        title: 'Error',
        description: t.validationError,
        variant: 'destructive',
      })
      return
    }

    // Confirm
    if (!confirm(t.submitConfirmation)) {
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/client/orders/${orderId}/rating`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...ratings,
            ...feedback,
          }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: t.ratingSuccess,
        })

        // Refresh rating data
        const ratingResponse = await fetch(
          `/api/client/orders/${orderId}/rating`
        )
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json()
          setExistingRating(ratingData.data)
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/client/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || t.ratingError,
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error submitting rating:', err)
      toast({
        title: 'Error',
        description: t.ratingError,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Get rating label
  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return t.veryPoor
      case 2:
        return t.poor
      case 3:
        return t.average
      case 4:
        return t.good
      case 5:
        return t.excellent
      default:
        return '-'
    }
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
              {t.backToDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order || !session?.user) {
    return null
  }

  // Check if order is completed
  if (order.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <Card className="bg-[#2a2a2a] border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t.notCompleted}</h3>
            <p className="text-gray-400 mb-4">{t.ratingNotAllowed}</p>
            <Button
              onClick={() => router.push('/client/dashboard')}
              className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
            >
              {t.backToDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show rating summary if already rated
  if (existingRating) {
    const avgRating =
      (existingRating.designQuality +
        existingRating.communication +
        existingRating.timeliness +
        existingRating.professionalism +
        existingRating.overallSatisfaction) /
      5

    const categoryConfig = [
      {
        key: 'designQuality' as const,
        label: t.designQuality,
        value: existingRating.designQuality,
      },
      {
        key: 'communication' as const,
        label: t.communication,
        value: existingRating.communication,
      },
      {
        key: 'timeliness' as const,
        label: t.timeliness,
        value: existingRating.timeliness,
      },
      {
        key: 'professionalism' as const,
        label: t.professionalism,
        value: existingRating.professionalism,
      },
      {
        key: 'overallSatisfaction' as const,
        label: t.overallSatisfaction,
        value: existingRating.overallSatisfaction,
      },
    ]

    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        {/* Header */}
        <div className="border-b border-gray-800 bg-[#1E1E1E]/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <h1 className="text-2xl font-bold text-white">{t.ratingSubmitted}</h1>
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
                      {t.backToDashboard}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#9B59B6]">{t.ratingSubmitted}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Thank You Message */}
          <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/5 border-[#6B5B95]/30 backdrop-blur-sm mb-6">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t.thankYouMessage}
              </h2>
              <p className="text-gray-400">{t.ratedOn}: {new Date(existingRating.createdAt).toLocaleDateString('id-ID')}</p>
            </CardContent>
          </Card>

          {/* Overall Rating */}
          <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-[#F39C12]" />
                {t.overallRating}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-[#F39C12] mb-2">
                    {avgRating.toFixed(1)}
                  </div>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${
                          star <= Math.round(avgRating)
                            ? 'fill-[#F39C12] text-[#F39C12]'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-400 mt-2">{getRatingLabel(Math.round(avgRating))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">{t.categoryBreakdown}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categoryConfig.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-300">{category.label}</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= category.value
                                ? 'fill-[#F39C12] text-[#F39C12]'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-bold">{category.value}/5</span>
                    </div>
                  </div>
                  <Progress
                    value={(category.value / 5) * 100}
                    className="h-2 bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {getRatingLabel(category.value)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback */}
          {(existingRating.whatLiked ||
            existingRating.whatToImprove ||
            existingRating.additionalComments) && (
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white">{t.yourFeedback}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingRating.whatLiked && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.whatLiked}</Label>
                    <p className="text-white mt-1">{existingRating.whatLiked}</p>
                  </div>
                )}
                {existingRating.whatToImprove && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.whatToImprove}</Label>
                    <p className="text-white mt-1">{existingRating.whatToImprove}</p>
                  </div>
                )}
                {existingRating.additionalComments && (
                  <div>
                    <Label className="text-gray-400 text-sm">{t.additionalComments}</Label>
                    <p className="text-white mt-1">{existingRating.additionalComments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/client/dashboard')}
              className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToDashboard}
            </Button>
            <Button
              onClick={() => router.push(`/client/orders/${orderId}`)}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t.viewProjectDetails}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show rating form
  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#1E1E1E]/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                <h1 className="text-2xl font-bold text-white">{t.projectRating}</h1>
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
                    {t.backToDashboard}
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
                  <BreadcrumbPage className="text-[#9B59B6]">{t.projectRating}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Summary */}
        <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#9B59B6]" />
              {t.orderNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Badge className="bg-[#9B59B6]">{order.orderNumber}</Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {order.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400 text-sm">{t.buildingCategory}</Label>
                <p className="text-white mt-1 capitalize">
                  {order.buildingCategory?.replace(/_/g, ' ')}
                </p>
              </div>
              {order.buildingType && (
                <div>
                  <Label className="text-gray-400 text-sm">{t.buildingType}</Label>
                  <p className="text-white mt-1 capitalize">
                    {order.buildingType.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
              {order.location && (
                <div className="md:col-span-2">
                  <Label className="text-gray-400 text-sm">{t.location}</Label>
                  <p className="text-white mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {order.location}
                  </p>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <Label className="text-gray-400 text-sm">{t.completionDate}</Label>
                  <p className="text-white mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(order.completedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Form */}
        <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">{t.ratingCategories}</CardTitle>
            <CardDescription className="text-gray-400">
              {language === 'id'
                ? 'Klik ganda pada bintang untuk menerapkan rating ke semua kategori'
                : 'Double-click on a star to apply rating to all categories'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Design Quality */}
            <div>
              <StarRating
                label={t.designQuality}
                value={ratings.designQuality}
                onChange={(value) => handleRatingChange('designQuality', value)}
                onQuickRate={handleQuickRating}
              />
            </div>

            {/* Communication */}
            <div>
              <StarRating
                label={t.communication}
                value={ratings.communication}
                onChange={(value) => handleRatingChange('communication', value)}
                onQuickRate={handleQuickRating}
              />
            </div>

            {/* Timeliness */}
            <div>
              <StarRating
                label={t.timeliness}
                value={ratings.timeliness}
                onChange={(value) => handleRatingChange('timeliness', value)}
                onQuickRate={handleQuickRating}
              />
            </div>

            {/* Professionalism */}
            <div>
              <StarRating
                label={t.professionalism}
                value={ratings.professionalism}
                onChange={(value) => handleRatingChange('professionalism', value)}
                onQuickRate={handleQuickRating}
              />
            </div>

            {/* Overall Satisfaction - Required */}
            <div className="pt-4 border-t border-gray-700">
              <StarRating
                label={t.overallSatisfaction}
                value={ratings.overallSatisfaction}
                onChange={(value) => handleRatingChange('overallSatisfaction', value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{t.required}</p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">{t.yourFeedback}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatLiked" className="text-gray-300">
                {t.whatLiked}
              </Label>
              <Textarea
                id="whatLiked"
                value={feedback.whatLiked}
                onChange={(e) => handleFeedbackChange('whatLiked', e.target.value)}
                placeholder={
                  language === 'id'
                    ? 'Ceritakan apa yang Anda suka...'
                    : 'Tell us what you liked...'
                }
                className="mt-1 bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="whatToImprove" className="text-gray-300">
                {t.whatToImprove}
              </Label>
              <Textarea
                id="whatToImprove"
                value={feedback.whatToImprove}
                onChange={(e) => handleFeedbackChange('whatToImprove', e.target.value)}
                placeholder={
                  language === 'id'
                    ? 'Bagaimana kami bisa meningkatkan layanan?'
                    : 'How can we improve our service?'
                }
                className="mt-1 bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="additionalComments" className="text-gray-300">
                {t.additionalComments}
              </Label>
              <Textarea
                id="additionalComments"
                value={feedback.additionalComments}
                onChange={(e) => handleFeedbackChange('additionalComments', e.target.value)}
                placeholder={
                  language === 'id'
                    ? 'Komentar tambahan...'
                    : 'Additional comments...'
                }
                className="mt-1 bg-gray-800 border-gray-700 text-white min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => router.push('/client/dashboard')}
          >
            {t.skipForNow}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || ratings.overallSatisfaction === 0}
            className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] hover:from-[#9B59B6] hover:to-[#6B5B95]"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {language === 'id' ? 'Mengirim...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                {t.submitRating}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
