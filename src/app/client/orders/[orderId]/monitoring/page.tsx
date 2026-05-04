'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StorageSelector } from '@/components/StorageSelector'
import {
  ArrowLeft,
  ArrowRight,
  Video,
  FileText,
  Download,
  Upload,
  Send,
  Phone,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Home,
  Building,
  MapPin,
  MoreVertical,
  Paperclip,
  Search,
  Filter,
  Share2,
  Plus,
  Eye,
  MessageSquare,
  User,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Cloud,
  HardDrive,
  Drive,
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
  status: string
  createdAt: string
  architect?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

interface Stage {
  id: string
  name: string
  nameId: string
  status: 'pending' | 'in_progress' | 'completed'
  startDate?: string
  endDate?: string
  progress: number
  description: string
  descriptionId: string
}

interface ChatMessage {
  id: string
  orderId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  fileAttachment?: {
    name: string
    url: string
    type: string
    size: number
  }
  timestamp: string
  read: boolean
  isFromClient: boolean
}

interface Meeting {
  id: string
  orderId: string
  title: string
  description?: string
  scheduledDate: string
  duration: number
  meetingLink?: string
  platform: 'zoom' | 'google_meet' | 'other'
  participants: Array<{
    id: string
    name: string
    avatar?: string
    role: 'architect' | 'client' | 'expert'
  }>
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdBy: string
  createdAt: string
}

interface Document {
  id: string
  orderId: string
  stage: string
  name: string
  description?: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedByName?: string
  uploadedAt: string
  version?: number
  storageType?: 'local' | 'drive'
  filePath?: string
  driveFileId?: string
}

// Translations
const translations = {
  en: {
    backToOrders: 'Back to Orders',
    monitoring: 'Project Monitoring',
    orderDetails: 'Order Details',
    progressTimeline: 'Progress Timeline',
    videoCall: 'Video Call',
    documents: 'Documents',
    chat: 'Chat',
    schedule: 'Schedule',
    joinMeeting: 'Join Meeting',
    newMeeting: 'Schedule New Meeting',
    viewHistory: 'View History',
    upcomingMeetings: 'Upcoming Meetings',
    pastMeetings: 'Past Meetings',
    uploadDocument: 'Upload Document',
    download: 'Download',
    preview: 'Preview',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    attachFile: 'Attach File',
    searchMessages: 'Search messages...',
    filterMessages: 'Filter Messages',
    exportChat: 'Export Chat',
    shareLink: 'Share Link',
    addParticipants: 'Add Participants',
    commentOnDocument: 'Comment',
    versionHistory: 'Version History',
    loading: 'Loading...',
    error: 'An error occurred',
    noMeetings: 'No meetings scheduled',
    noDocuments: 'No documents uploaded',
    noMessages: 'No messages yet',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    scheduled: 'Scheduled',
    ongoing: 'Ongoing',
    participants: 'Participants',
    duration: 'Duration',
    platform: 'Platform',
    stages: {
      preDesign: 'Pre-Design',
      schematicDesign: 'Schematic Design',
      ded: 'Design Development (DED)',
      constructionDocs: 'Construction Documents',
      construction: 'Construction',
      completion: 'Completion',
    },
    stageDescriptions: {
      preDesign: 'Initial consultation and requirements gathering',
      schematicDesign: 'Conceptual design and preliminary drawings',
      ded: 'Detailed design development',
      constructionDocs: 'Final construction documents',
      construction: 'Construction phase',
      completion: 'Project completion and handover',
    },
    stagesId: {
      preDesign: 'Pra-Desain',
      schematicDesign: 'Desain Skematik',
      ded: 'Pengembangan Desain (DED)',
      constructionDocs: 'Dokumen Konstruksi',
      construction: 'Konstruksi',
      completion: 'Penyelesaian',
    },
    stageDescriptionsId: {
      preDesign: 'Konsultasi awal dan pengumpulan kebutuhan',
      schematicDesign: 'Desain konseptual dan gambar awal',
      ded: 'Pengembangan desain detail',
      constructionDocs: 'Dokumen konstruksi akhir',
      construction: 'Fase konstruksi',
      completion: 'Penyelesaian proyek dan serah terima',
    },
    online: 'Online',
    offline: 'Offline',
    typing: 'typing...',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    copySuccess: 'Copied to clipboard!',
    copyError: 'Failed to copy',
    uploadSuccess: 'File uploaded successfully',
    uploadError: 'Failed to upload file',
    messageSent: 'Message sent',
    meetingScheduled: 'Meeting scheduled successfully',
    invalidFile: 'Invalid file type',
    fileTooLarge: 'File is too large (max 10MB)',
    selectFile: 'Select File',
    noFileSelected: 'No file selected',
    meetingTitle: 'Meeting Title',
    meetingDate: 'Meeting Date',
    meetingTime: 'Meeting Time',
    meetingDuration: 'Duration (minutes)',
    meetingDescription: 'Description (Optional)',
    uploadButton: 'Upload',
    uploading: 'Uploading...',
    scheduleButton: 'Schedule Meeting',
    cancel: 'Cancel',
    save: 'Save',
    all: 'All',
    architect: 'Architect',
    expert: 'Expert',
    you: 'You',
  },
  id: {
    backToOrders: 'Kembali ke Pesanan',
    monitoring: 'Monitoring Proyek',
    orderDetails: 'Detail Pesanan',
    progressTimeline: 'Timeline Progres',
    videoCall: 'Video Call',
    documents: 'Dokumen',
    chat: 'Chat',
    schedule: 'Jadwal',
    joinMeeting: 'Gabung Meeting',
    newMeeting: 'Jadwalkan Meeting Baru',
    viewHistory: 'Lihat Riwayat',
    upcomingMeetings: 'Meeting Mendatang',
    pastMeetings: 'Meeting Selesai',
    uploadDocument: 'Upload Dokumen',
    download: 'Download',
    preview: 'Preview',
    sendMessage: 'Kirim Pesan',
    typeMessage: 'Ketik pesan...',
    attachFile: 'Lampirkan File',
    searchMessages: 'Cari pesan...',
    filterMessages: 'Filter Pesan',
    exportChat: 'Ekspor Chat',
    shareLink: 'Bagikan Link',
    addParticipants: 'Tambah Peserta',
    commentOnDocument: 'Komentar',
    versionHistory: 'Riwayat Versi',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    noMeetings: 'Tidak ada meeting yang dijadwalkan',
    noDocuments: 'Tidak ada dokumen yang diupload',
    noMessages: 'Belum ada pesan',
    pending: 'Menunggu',
    inProgress: 'Sedang Berjalan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    scheduled: 'Terjadwal',
    ongoing: 'Berlangsung',
    participants: 'Peserta',
    duration: 'Durasi',
    platform: 'Platform',
    stages: {
      preDesign: 'Pra-Desain',
      schematicDesign: 'Desain Skematik',
      ded: 'Pengembangan Desain (DED)',
      constructionDocs: 'Dokumen Konstruksi',
      construction: 'Konstruksi',
      completion: 'Penyelesaian',
    },
    stageDescriptions: {
      preDesign: 'Konsultasi awal dan pengumpulan kebutuhan',
      schematicDesign: 'Desain konseptual dan gambar awal',
      ded: 'Pengembangan desain detail',
      constructionDocs: 'Dokumen konstruksi akhir',
      construction: 'Fase konstruksi',
      completion: 'Penyelesaian proyek dan serah terima',
    },
    stagesId: {
      preDesign: 'Pra-Desain',
      schematicDesign: 'Desain Skematik',
      ded: 'Pengembangan Desain (DED)',
      constructionDocs: 'Dokumen Konstruksi',
      construction: 'Konstruksi',
      completion: 'Penyelesaian',
    },
    stageDescriptionsId: {
      preDesign: 'Konsultasi awal dan pengumpulan kebutuhan',
      schematicDesign: 'Desain konseptual dan gambar awal',
      ded: 'Pengembangan desain detail',
      constructionDocs: 'Dokumen konstruksi akhir',
      construction: 'Fase konstruksi',
      completion: 'Penyelesaian proyek dan serah terima',
    },
    online: 'Online',
    offline: 'Offline',
    typing: 'sedang mengetik...',
    minutes: 'menit',
    hours: 'jam',
    days: 'hari',
    copySuccess: 'Berhasil disalin!',
    copyError: 'Gagal menyalin',
    uploadSuccess: 'File berhasil diupload',
    uploadError: 'Gagal upload file',
    messageSent: 'Pesan terkirim',
    meetingScheduled: 'Meeting berhasil dijadwalkan',
    invalidFile: 'Tipe file tidak valid',
    fileTooLarge: 'File terlalu besar (maksimal 10MB)',
    selectFile: 'Pilih File',
    noFileSelected: 'Tidak ada file yang dipilih',
    meetingTitle: 'Judul Meeting',
    meetingDate: 'Tanggal Meeting',
    meetingTime: 'Waktu Meeting',
    meetingDuration: 'Durasi (menit)',
    meetingDescription: 'Deskripsi (Opsional)',
    uploadButton: 'Upload',
    uploading: 'Mengupload...',
    scheduleButton: 'Jadwalkan Meeting',
    cancel: 'Batal',
    save: 'Simpan',
    all: 'Semua',
    architect: 'Arsitek',
    expert: 'Tenaga Ahli',
    you: 'Anda',
  },
}

export default function MonitoringPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const hasMounted = useRef(false)
  const isRedirecting = useRef(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { orderId } = React.use(params)

  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Timeline states
  const [stages, setStages] = useState<Stage[]>([])
  
  // Video meeting states
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    description: '',
  })
  
  // Documents states
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docStorageType, setDocStorageType] = useState<'local' | 'drive'>('local')
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [filter, setFilter] = useState<'all' | 'architect' | 'expert' | 'client'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)

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

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Gagal memuat detail pesanan')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Terjadi kesalahan saat memuat detail pesanan')
    }
  }, [orderId])

  // Fetch stages/timeline
  const fetchStages = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}/timeline`)
      if (response.ok) {
        const data = await response.json()
        setStages(data.data || generateDefaultStages(order?.status))
      } else {
        setStages(generateDefaultStages(order?.status))
      }
    } catch (err) {
      console.error('Error fetching stages:', err)
      setStages(generateDefaultStages(order?.status))
    }
  }, [orderId, order?.status])

  // Fetch meetings
  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}/meetings`)
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching meetings:', err)
    }
  }, [orderId])

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }, [orderId])

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}/chats`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }, [orderId])

  // Initial data fetch
  useEffect(() => {
    if (status !== 'authenticated' || !hasMounted.current || !orderId) return

    const fetchData = async () => {
      await fetchOrder()
      setLoading(false)
    }

    fetchData()
  }, [status, orderId, fetchOrder])

  // Fetch related data after order is loaded
  useEffect(() => {
    if (order) {
      fetchStages()
      fetchMeetings()
      fetchDocuments()
      fetchMessages()
    }
  }, [order, fetchStages, fetchMeetings, fetchDocuments, fetchMessages])

  // Auto-refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchMessages()
      await fetchMeetings()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchMessages, fetchMeetings])

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Generate default stages based on order status
  const generateDefaultStages = (orderStatus?: string): Stage[] => {
    const stageKeys = ['preDesign', 'schematicDesign', 'ded', 'constructionDocs', 'construction', 'completion']
    const statusMap: Record<string, number> = {
      pending: 0,
      in_pre_design: 1,
      in_schematic: 2,
      in_ded: 3,
      in_review: 4,
      completed: 6,
    }

    const currentStageIndex = statusMap[orderStatus || 'pending'] || 0

    return stageKeys.map((key, index) => ({
      id: key,
      name: t.stages[key as keyof typeof t.stages],
      nameId: t.stagesId[key as keyof typeof t.stagesId],
      status: index < currentStageIndex ? 'completed' : 
              index === currentStageIndex ? 'in_progress' : 'pending',
      progress: index < currentStageIndex ? 100 : 
                index === currentStageIndex ? 50 : 0,
      description: t.stageDescriptions[key as keyof typeof t.stageDescriptions],
      descriptionId: t.stageDescriptionsId[key as keyof typeof t.stageDescriptionsId],
    }))
  }

  // Get status badge style
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: t.pending, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      in_progress: { label: t.inProgress, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      completed: { label: t.completed, className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      scheduled: { label: t.scheduled, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      ongoing: { label: t.ongoing, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      cancelled: { label: t.cancelled, className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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

  // Handle file selection for chat
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: t.invalidFile,
        variant: 'destructive',
      })
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: t.fileTooLarge,
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
  }

  // Send message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sendingMessage) return

    setSendingMessage(true)

    try {
      const formData = new FormData()
      formData.append('content', newMessage)
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch(`/api/client/orders/${orderId}/chats`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchMessages()
        setNewMessage('')
        setSelectedFile(null)
        toast({
          title: 'Success',
          description: t.messageSent,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Gagal mengirim pesan',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error sending message:', err)
      toast({
        title: 'Error',
        description: 'Gagal mengirim pesan',
        variant: 'destructive',
      })
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/vnd.dwg', 'application/dwg']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: t.invalidFile,
        variant: 'destructive',
      })
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: t.fileTooLarge,
        variant: 'destructive',
      })
      return
    }

    // Check if Google Drive is selected but not connected
    if (docStorageType === 'drive') {
      try {
        const statusResponse = await fetch('/api/google-drive/status')
        const statusData = await statusResponse.json()
        if (!statusData.connected) {
          toast({
            title: language === 'id' ? 'Koneksi Google Drive Diperlukan' : 'Google Drive Connection Required',
            description: language === 'id' 
              ? 'Anda harus menghubungkan Google Drive terlebih dahulu' 
              : 'You must connect Google Drive first',
            variant: 'destructive',
          })
          return
        }
      } catch (err) {
        console.error('Error checking Drive status:', err)
        toast({
          title: 'Error',
          description: language === 'id' ? 'Gagal memeriksa status Google Drive' : 'Failed to check Google Drive status',
          variant: 'destructive',
        })
        return
      }
    }

    setUploadingDoc(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)

      // Route to different endpoint based on storage type
      const endpoint = docStorageType === 'local'
        ? `/api/client/orders/${orderId}/documents-local`
        : `/api/client/orders/${orderId}/documents`

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchDocuments()
        toast({
          title: 'Success',
          description: t.uploadSuccess,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || t.uploadError,
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error uploading document:', err)
      toast({
        title: 'Error',
        description: t.uploadError,
        variant: 'destructive',
      })
    } finally {
      setUploadingDoc(false)
    }
  }

  // Schedule meeting
  const handleScheduleMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/client/orders/${orderId}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingForm.title,
          scheduledDate: `${meetingForm.date}T${meetingForm.time}`,
          duration: meetingForm.duration,
          description: meetingForm.description,
        }),
      })

      if (response.ok) {
        await fetchMeetings()
        setShowScheduleModal(false)
        setMeetingForm({ title: '', date: '', time: '', duration: 60, description: '' })
        toast({
          title: 'Success',
          description: t.meetingScheduled,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Gagal menjadwalkan meeting',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err)
      toast({
        title: 'Error',
        description: 'Gagal menjadwalkan meeting',
        variant: 'destructive',
      })
    }
  }

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'architect' && !msg.isFromClient) ||
      (filter === 'client' && msg.isFromClient)
    return matchesSearch && matchesFilter
  })

  // Separate upcoming and past meetings
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledDate) > new Date() && m.status !== 'cancelled')
  const pastMeetings = meetings.filter(m => new Date(m.scheduledDate) <= new Date() || m.status === 'cancelled')

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
                <h1 className="text-2xl font-bold text-white">{t.monitoring}</h1>
                <p className="text-sm text-gray-400">{order.orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchMessages()
                  fetchMeetings()
                }}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="text-gray-400 hover:text-white"
              >
                {language === 'id' ? 'EN' : 'ID'}
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Home className="w-4 h-4" />
              <span>/</span>
              <button onClick={() => router.push('/client/dashboard')} className="hover:text-white">
                {t.backToOrders}
              </button>
              <span>/</span>
              <span className="text-white">{order.orderNumber}</span>
              <span>/</span>
              <span className="text-[#9B59B6]">{t.monitoring}</span>
            </div>
          </div>

          {/* Project Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#2a2a2a]/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">{language === 'id' ? 'Kategori' : 'Category'}</p>
              <p className="text-white text-sm font-medium capitalize">
                {order.buildingCategory?.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="bg-[#2a2a2a]/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">{language === 'id' ? 'Lokasi' : 'Location'}</p>
              <p className="text-white text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {order.location || '-'}
              </p>
            </div>
            <div className="bg-[#2a2a2a]/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">{language === 'id' ? 'Luas Bangunan' : 'Building Area'}</p>
              <p className="text-white text-sm font-medium">{order.buildingArea} m²</p>
            </div>
            <div className="bg-[#2a2a2a]/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">{language === 'id' ? 'Arsitek' : 'Architect'}</p>
              <p className="text-white text-sm font-medium">
                {order.architect?.name || language === 'id' ? 'Menunggu' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Progress Timeline (25%) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#9B59B6]" />
                  {t.progressTimeline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                  <div className="space-y-4">
                    {stages.map((stage, index) => {
                      const isActive = stage.status === 'in_progress'
                      const isCompleted = stage.status === 'completed'
                      
                      return (
                        <div
                          key={stage.id}
                          className={`relative pl-8 pb-6 border-l-2 transition-all ${
                            isActive
                              ? 'border-[#9B59B6] bg-gradient-to-r from-[#6B5B95]/10 to-transparent -ml-4 pl-8 pr-4 py-3 rounded-r-lg'
                              : isCompleted
                              ? 'border-green-500'
                              : 'border-gray-700'
                          }`}
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 ${
                              isActive
                                ? 'bg-[#9B59B6] border-[#9B59B6] shadow-lg shadow-[#9B59B6]/50'
                                : isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'bg-[#1E1E1E] border-gray-600'
                            }`}
                          />
                          
                          {/* Stage content */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-medium ${
                                isActive ? 'text-[#9B59B6]' : isCompleted ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {language === 'id' ? stage.nameId : stage.name}
                              </h3>
                              {getStatusBadge(stage.status)}
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              {language === 'id' ? stage.descriptionId : stage.description}
                            </p>
                            
                            {isActive && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">{t.inProgress}</span>
                                  <span className="text-[#9B59B6]">{stage.progress}%</span>
                                </div>
                                <Progress value={stage.progress} className="h-1.5 bg-gray-700" />
                              </div>
                            )}
                            
                            {isCompleted && stage.endDate && (
                              <p className="text-xs text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {formatDate(stage.endDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Video Call / Documents (50%) */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="bg-[#2a2a2a] border border-gray-800 w-full">
                <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-[#6B5B95]">
                  <Video className="w-4 h-4 mr-2" />
                  {t.videoCall}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1 data-[state=active]:bg-[#6B5B95]">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.documents}
                </TabsTrigger>
              </TabsList>

              {/* Video Call Tab */}
              <TabsContent value="video" className="mt-4">
                <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">{t.videoCall}</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowScheduleModal(true)}
                      className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t.newMeeting}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Video Call Placeholder */}
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                      <div className="text-center">
                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">{language === 'id' ? 'Video Call Placeholder' : 'Video Call Placeholder'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {language === 'id' ? 'Integrasi dengan Zoom/Google Meet' : 'Integration with Zoom/Google Meet'}
                        </p>
                      </div>
                    </div>

                    {/* Upcoming Meetings */}
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#9B59B6]" />
                        {t.upcomingMeetings}
                      </h3>
                      {upcomingMeetings.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-white font-medium">{meeting.title}</h4>
                                  <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(meeting.scheduledDate)}
                                  </p>
                                </div>
                                {getStatusBadge(meeting.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meeting.duration} {t.minutes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {meeting.participants.length} {t.participants}
                                </span>
                              </div>
                              {meeting.description && (
                                <p className="text-sm text-gray-500 mb-3">{meeting.description}</p>
                              )}
                              <div className="flex gap-2">
                                {meeting.meetingLink && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-[#6B5B95] text-[#9B59B6] hover:bg-[#6B5B95]/10"
                                    onClick={() => window.open(meeting.meetingLink, '_blank')}
                                  >
                                    <Video className="w-4 h-4 mr-2" />
                                    {t.joinMeeting}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(meeting.meetingLink || '')}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Alert className="bg-gray-800/50 border-gray-700">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <AlertDescription className="text-gray-400">
                            {t.noMeetings}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Past Meetings */}
                    {pastMeetings.length > 0 && (
                      <div>
                        <details className="group">
                          <summary className="text-white font-medium mb-3 cursor-pointer flex items-center gap-2 list-none">
                            <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                            {t.pastMeetings} ({pastMeetings.length})
                          </summary>
                          <div className="space-y-3 pl-6">
                            {pastMeetings.map((meeting) => (
                              <div key={meeting.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="text-gray-300 text-sm font-medium">{meeting.title}</h4>
                                  {getStatusBadge(meeting.status)}
                                </div>
                                <p className="text-xs text-gray-500">{formatDate(meeting.scheduledDate)}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-4">
                {/* Storage Selector */}
                <StorageSelector
                  storageType={docStorageType}
                  onStorageChange={setDocStorageType}
                  language={language}
                  disabled={uploadingDoc}
                />

                <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm mt-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">{t.documents}</CardTitle>
                    <div className="relative">
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.dwg"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDoc}
                      />
                      <label htmlFor="document-upload">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] cursor-pointer"
                          disabled={uploadingDoc}
                        >
                          {uploadingDoc ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              {t.uploading}
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {t.uploadDocument}
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((doc) => {
                          const isLocal = !doc.storageType || doc.storageType === 'local'
                          const StorageIcon = isLocal ? Server : Cloud
                          const storageColor = isLocal ? 'text-[#9B59B6]' : 'text-[#E74C3C]'
                          const storageLabel = isLocal 
                            ? (language === 'id' ? 'Lokal' : 'Local') 
                            : (language === 'id' ? 'Google Drive' : 'Google Drive')

                          return (
                            <div
                              key={doc.id}
                              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-[#6B5B95]/50 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-10 h-10 bg-[#6B5B95]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-[#9B59B6]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-white font-medium truncate">{doc.name}</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${storageColor} border-current flex items-center gap-1 group-hover:opacity-100 opacity-80 transition-opacity`}
                                        title={isLocal 
                                          ? (language === 'id' ? 'Disimpan di server lokal' : 'Stored on local server') 
                                          : (language === 'id' ? 'Disimpan di Google Drive' : 'Stored on Google Drive')}
                                      >
                                        <StorageIcon className="w-3 h-3" />
                                        {storageLabel}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDate(doc.uploadedAt)} • {formatFileSize(doc.fileSize)}
                                    </p>
                                    {doc.description && (
                                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                        {doc.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs border-gray-600">
                                        {doc.fileType.toUpperCase()}
                                      </Badge>
                                      {doc.version && (
                                        <Badge variant="outline" className="text-xs border-gray-600">
                                          v{doc.version}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-gray-400 hover:text-white"
                                    onClick={() => {
                                      setSelectedDocument(doc)
                                      setShowPreviewModal(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-gray-400 hover:text-white"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <Alert className="bg-gray-800/50 border-gray-700">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <AlertDescription className="text-gray-400">
                          {t.noDocuments}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Chat (25%) */}
          <div className="lg:col-span-1">
            <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#9B59B6]" />
                    {t.chat}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                      onClick={() => {
                        const chatText = messages.map(m => `[${formatDate(m.timestamp)}] ${m.senderName}: ${m.content}`).join('\n')
                        const blob = new Blob([chatText], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `chat-${order.orderNumber}.txt`
                        a.click()
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Search and Filter */}
                <div className="flex gap-2 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder={t.searchMessages}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-gray-800 border-gray-700 text-white text-sm h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                {/* Messages List */}
                <ScrollArea className="flex-1 px-4" ref={chatScrollRef}>
                  <div className="space-y-4 py-4">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.isFromClient ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            {msg.senderAvatar ? (
                              <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                            ) : null}
                            <AvatarFallback className="bg-[#6B5B95] text-white text-xs">
                              {msg.senderName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-[80%] ${msg.isFromClient ? 'text-right' : ''}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-400">
                                {msg.isFromClient ? t.you : msg.senderName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div
                              className={`rounded-lg p-3 ${
                                msg.isFromClient
                                  ? 'bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white'
                                  : 'bg-gray-800 text-gray-200'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              {msg.fileAttachment && (
                                <div className="mt-2 pt-2 border-t border-white/20">
                                  <a
                                    href={msg.fileAttachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs hover:underline"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    {msg.fileAttachment.name}
                                    <Download className="w-3 h-3 ml-auto" />
                                  </a>
                                </div>
                              )}
                            </div>
                            {!msg.read && !msg.isFromClient && (
                              <span className="text-xs text-[#9B59B6] mt-1 inline-block">
                                {language === 'id' ? 'Baru' : 'New'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">{t.noMessages}</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-800 p-4 bg-gray-900/50">
                  {selectedFile && (
                    <div className="mb-2 flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                      <Paperclip className="w-4 h-4 text-[#9B59B6]" />
                      <span className="text-sm text-gray-300 flex-1 truncate">{selectedFile.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder={t.typeMessage}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                        disabled={sendingMessage}
                      />
                      <input
                        type="file"
                        id="chat-file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="chat-file" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                        <Paperclip className="w-4 h-4 text-gray-500 hover:text-[#9B59B6]" />
                      </label>
                    </div>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || (!newMessage.trim() && !selectedFile)}
                      className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                    >
                      {sendingMessage ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-[#2a2a2a] border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">{t.newMeeting}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meeting-title" className="text-gray-300">
                  {t.meetingTitle} *
                </Label>
                <Input
                  id="meeting-title"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  placeholder={language === 'id' ? 'Diskusi Progress' : 'Progress Discussion'}
                />
              </div>
              <div>
                <Label htmlFor="meeting-date" className="text-gray-300">
                  {t.meetingDate} *
                </Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="meeting-time" className="text-gray-300">
                  {t.meetingTime} *
                </Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="meeting-duration" className="text-gray-300">
                  {t.meetingDuration}
                </Label>
                <Input
                  id="meeting-duration"
                  type="number"
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm({ ...meetingForm, duration: parseInt(e.target.value) })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  min="15"
                  step="15"
                />
              </div>
              <div>
                <Label htmlFor="meeting-description" className="text-gray-300">
                  {t.meetingDescription}
                </Label>
                <Input
                  id="meeting-description"
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  placeholder={language === 'id' ? 'Agenda meeting...' : 'Meeting agenda...'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300"
                  onClick={() => setShowScheduleModal(false)}
                >
                  {t.cancel}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                  onClick={handleScheduleMeeting}
                >
                  {t.scheduleButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-medium truncate">{selectedDocument.name}</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowPreviewModal(false)
                  setSelectedDocument(null)
                }}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 bg-black/50 min-h-[500px] flex items-center justify-center">
              {selectedDocument.fileType.includes('image') ? (
                <img
                  src={selectedDocument.fileUrl}
                  alt={selectedDocument.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : selectedDocument.fileType === 'pdf' ? (
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-[70vh]"
                  title={selectedDocument.name}
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {language === 'id' ? 'Preview tidak tersedia' : 'Preview not available'}
                  </p>
                  <Button
                    onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                    className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t.download}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
