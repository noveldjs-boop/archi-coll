"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Video,
  FileText,
  Calendar,
  Users,
  Phone,
  Plus,
  Upload,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  File,
  Image as ImageIcon,
  Paperclip,
  Send,
  Video as VideoIcon,
  MoreVertical,
  X,
  RefreshCw,
  CalendarDays,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Menu,
  ChevronRight,
  ChevronDown,
  Play,
  ChevronLeft,
  ShoppingBag,
  Package,
  Copy
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Types
interface TeamMember {
  id: string
  name: string
  profession: string
  avatar?: string
  status: 'online' | 'offline'
  email?: string
  phone?: string
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  message: string
  timestamp: Date
  isRead: boolean
  attachments?: ChatAttachment[]
}

interface ChatAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

interface Task {
  id: string
  title: string
  description: string
  profession: string
  status: 'pending' | 'in_progress' | 'completed' | 'review' | 'approved'
  assigneeId: string
  assigneeName: string
  dueDate?: Date
  deliverables?: Deliverable[]
  createdAt: Date
}

interface Deliverable {
  id: string
  name: string
  url: string
  version: number
  uploadedAt: Date
  uploadedBy: string
  status: 'pending_review' | 'approved' | 'rejected'
  feedback?: string
}

interface Meeting {
  id: string
  title: string
  date: Date
  duration: number
  participants: string[]
  agenda: string
  meetingLink?: string
  recordingUrl?: string
  status: 'upcoming' | 'ongoing' | 'completed'
}

interface Document {
  id: string
  name: string
  folder: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
  version: number
}

interface ProjectData {
  id: string
  orderNumber: string
  projectName: string
  clientName: string
  status: string
  progress: number
  startDate: Date
  estimatedCompletion?: Date
}

interface Activity {
  id: string
  type: 'task' | 'message' | 'meeting' | 'document' | 'status'
  title: string
  description: string
  user: string
  timestamp: Date
}

interface ApprovalMaterial {
  id: string
  productItem: {
    id: string
    itemName: string
    itemCode?: string
    description?: string
    imageUrl?: string
    unit?: string
    price?: number
    specifications?: string
  }
  quantity: number
  notes?: string | null
  status: string
  createdAt: Date
}

export default function ReportMonitoringPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Data states
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [approvalMaterials, setApprovalMaterials] = useState<ApprovalMaterial[]>([])

  // UI states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Chat states
  const [newMessage, setNewMessage] = useState('')
  const [chatFiles, setChatFiles] = useState<File[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Task states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Meeting states
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)

  // Document states
  const [uploadDocDialogOpen, setUploadDocDialogOpen] = useState(false)

  // Quick action dialogs
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [orderId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [projectRes, teamRes, chatRes, tasksRes, meetingsRes, docsRes, activitiesRes, approvalRes] = await Promise.all([
        fetch(`/api/projects/${orderId}`),
        fetch(`/api/projects/${orderId}/team`),
        fetch(`/api/projects/${orderId}/chat`),
        fetch(`/api/projects/${orderId}/tasks`),
        fetch(`/api/projects/${orderId}/meetings`),
        fetch(`/api/projects/${orderId}/documents`),
        fetch(`/api/projects/${orderId}/activities`),
        fetch(`/api/material-approvals?orderId=${orderId}`)
      ])

      if (projectRes.ok) setProjectData(await projectRes.json())
      if (teamRes.ok) setTeamMembers(await teamRes.json())
      if (chatRes.ok) setChatMessages(await chatRes.json())
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (meetingsRes.ok) setMeetings(await meetingsRes.json())
      if (docsRes.ok) setDocuments(await docsRes.json())
      if (activitiesRes.ok) setActivities(await activitiesRes.json())
      if (approvalRes.ok) {
        const approvalData = await approvalRes.json()
        setApprovalMaterials(approvalData.approvalItems || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
    toast({ title: 'Data berhasil diperbarui' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && chatFiles.length === 0) return

    try {
      const response = await fetch(`/api/projects/${orderId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          attachments: chatFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
        })
      })

      if (response.ok) {
        setNewMessage('')
        setChatFiles([])
        await fetchAllData()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({ title: 'Gagal mengirim pesan', variant: 'destructive' })
    }
  }

  const handleCreateTask = async () => {
    // Placeholder for task creation
    toast({ title: 'Fitur akan segera tersedia' })
  }

  const handleScheduleMeeting = async () => {
    // Placeholder for meeting scheduling
    toast({ title: 'Fitur akan segera tersedia' })
  }

  const handleUploadDocument = async () => {
    // Placeholder for document upload
    toast({ title: 'Fitur akan segera tersedia' })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'in_progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'review': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'approved': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'rejected': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'review': 'In Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    }
    return labels[status] || status
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#9B59B6] animate-spin mx-auto mb-4" />
          <p className="text-white">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#121212] border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Team Members */}
        <aside className={`
          ${leftSidebarOpen ? 'w-72' : 'w-0'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          bg-[#121212] border-r border-gray-800 flex flex-col fixed lg:relative h-full z-30 transition-all duration-300 overflow-hidden
        `}>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-[#9B59B6]" />
              Tim Project
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full p-3 rounded-lg bg-[#2a2a2a]/50 hover:bg-[#6B5B95]/20 border border-gray-800 hover:border-[#6B5B95]/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.profession}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      member.status === 'online' 
                        ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                        : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                    }`}>
                      {member.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page Header */}
          <header className="bg-gradient-to-r from-[#6B5B95]/20 via-[#9B59B6]/20 to-[#6B5B95]/20 border-b border-[#6B5B95]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hidden lg:flex text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    {projectData?.projectName || `Project ${projectData?.orderNumber}`}
                  </h1>
                  <Badge className={`${getStatusColor(projectData?.status || '')} text-sm`}>
                    {getStatusLabel(projectData?.status || '')}
                  </Badge>
                </div>
                <p className="text-gray-400 mb-4">
                  {projectData?.orderNumber} • Klien: {projectData?.clientName}
                </p>
                
                {/* Overall Progress */}
                <div className="max-w-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-400">Progress Project</Label>
                    <span className="text-white font-semibold">{projectData?.progress || 0}%</span>
                  </div>
                  <Progress value={projectData?.progress || 0} className="h-3" />
                </div>
              </div>
            </div>
          </header>

          {/* Tabs Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b border-gray-800 px-6">
                <TabsList className="bg-transparent h-auto p-0 gap-1 overflow-x-auto">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Tugas
                  </TabsTrigger>
                  <TabsTrigger
                    value="meetings"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Meeting
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Dokumen
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Jadwal
                  </TabsTrigger>
                  <TabsTrigger
                    value="materials"
                    className="data-[state=active]:bg-[#6B5B95]/20 data-[state=active]:text-[#9B59B6]"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Approval Material
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="space-y-6 mt-0">
                    {/* Project Progress Timeline */}
                    <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/20 border-[#6B5B95]/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <LayoutDashboard className="w-5 h-5" />
                          Progress Project
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Timeline tahapan pembangunan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { stage: 'Pre-Design', status: 'completed' },
                            { stage: 'Schematic Design', status: 'completed' },
                            { stage: 'DED', status: 'in_progress' },
                            { stage: 'Review', status: 'pending' },
                            { stage: 'Complete', status: 'pending' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-700/50 text-gray-500'
                              }`}>
                                {item.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                                 item.status === 'in_progress' ? <Clock className="w-5 h-5" /> :
                                 <div className="w-3 h-3 rounded-full bg-current" />}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  item.status === 'pending' ? 'text-gray-500' : 'text-white'
                                }`}>{item.stage}</p>
                              </div>
                              {item.status === 'in_progress' && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  Sedang Berjalan
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progress Per Profession */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { profession: 'Arsitek', progress: 85, status: 'in_progress' },
                        { profession: 'Structure', progress: 70, status: 'in_progress' },
                        { profession: 'MEP', progress: 55, status: 'in_progress' },
                        { profession: 'Drafter', progress: 90, status: 'in_progress' },
                        { profession: 'QS', progress: 40, status: 'pending' }
                      ].map((item, idx) => (
                        <Card key={idx} className="bg-[#2a2a2a]/50 border-gray-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-medium">{item.profession}</p>
                              <span className="text-sm text-gray-400">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Upcoming Meetings */}
                    <Card className="bg-[#2a2a2a]/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Video className="w-5 h-5" />
                          Meeting Mendatang
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {meetings.filter(m => m.status === 'upcoming').slice(0, 3).map((meeting) => (
                            <div key={meeting.id} className="p-4 rounded-lg bg-[#1E1E1E] border border-gray-800">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-white font-medium">{meeting.title}</h4>
                                  <p className="text-sm text-gray-400">
                                    {formatDate(meeting.date)} • {meeting.duration} menit
                                  </p>
                                </div>
                                <Button size="sm" className="bg-[#6B5B95] hover:bg-[#6B5B95]/80">
                                  <VideoIcon className="w-4 h-4 mr-1" />
                                  Join
                                </Button>
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-2">{meeting.agenda}</p>
                            </div>
                          ))}
                          {meetings.filter(m => m.status === 'upcoming').length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <CalendarDays className="w-12 h-12 mx-auto mb-3" />
                              <p>Tidak ada meeting yang dijadwalkan</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="bg-[#2a2a2a]/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Aktivitas Terbaru
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {activities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1E1E1E] transition-colors">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {activity.user.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm">
                                  <span className="font-medium">{activity.user}</span> {activity.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                          {activities.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                              <p>Belum ada aktivitas</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-400 text-sm">Tasks Selesai</p>
                              <p className="text-3xl font-bold text-white mt-1">
                                {tasks.filter(t => t.status === 'completed').length}
                              </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-400/50" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-400 text-sm">Revisi Pending</p>
                              <p className="text-3xl font-bold text-white mt-1">
                                {tasks.filter(t => t.status === 'review').length}
                              </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-orange-400/50" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-400 text-sm">Hari Tersisa</p>
                              <p className="text-3xl font-bold text-white mt-1">
                                {projectData?.estimatedCompletion 
                                  ? Math.ceil((new Date(projectData.estimatedCompletion).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                  : '-'}
                              </p>
                            </div>
                            <Calendar className="w-12 h-12 text-blue-400/50" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="mt-0 h-[calc(100vh-280px)] flex flex-col">
                    <Card className="bg-[#2a2a2a]/50 border-gray-800 flex-1 flex flex-col">
                      <CardContent className="flex-1 flex flex-col p-0">
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex items-start gap-3 ${
                                  msg.senderId === 'current-user' ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={msg.senderAvatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-xs">
                                    {msg.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`max-w-[70%] ${
                                  msg.senderId === 'current-user' ? 'items-end' : 'items-start'
                                } flex flex-col`}>
                                  <div className={`p-3 rounded-lg ${
                                    msg.senderId === 'current-user'
                                      ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                                      : 'bg-[#1E1E1E] text-gray-200 border border-gray-800'
                                  }`}>
                                    <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                                    <p className="text-sm">{msg.message}</p>
                                    {msg.attachments && msg.attachments.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {msg.attachments.map((att) => (
                                          <div
                                            key={att.id}
                                            className="flex items-center gap-2 text-xs bg-black/20 rounded px-2 py-1"
                                          >
                                            <Paperclip className="w-3 h-3" />
                                            <span className="truncate">{att.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {formatDate(msg.timestamp)}
                                    </span>
                                    {msg.senderId !== 'current-user' && (
                                      <span className="text-xs text-gray-500">
                                        {msg.isRead ? '✓ Dibaca' : '✓✓ Terkirim'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isTyping && (
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                                </div>
                                <span>Someone is typing...</span>
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                        {/* Chat Input */}
                        <div className="border-t border-gray-800 p-4 space-y-3">
                          {chatFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {chatFiles.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-[#1E1E1E] border border-gray-800 rounded px-2 py-1 text-sm"
                                >
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-300 max-w-[200px] truncate">{file.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setChatFiles(chatFiles.filter((_, i) => i !== idx))}
                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700"
                              onClick={() => document.getElementById('chat-file-input')?.click()}
                            >
                              <Paperclip className="w-4 h-4" />
                            </Button>
                            <input
                              id="chat-file-input"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  setChatFiles([...chatFiles, ...Array.from(e.target.files)])
                                }
                              }}
                            />
                            <Textarea
                              placeholder="Ketik pesan..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendMessage()
                                }
                              }}
                              className="flex-1 bg-[#1E1E1E] border-gray-800 text-white min-h-[60px] resize-none"
                              rows={1}
                            />
                            <Button
                              onClick={handleSendMessage}
                              className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Tugas & Deliverable</h3>
                        <p className="text-gray-400 text-sm">Kelola tugas dan upload deliverable</p>
                      </div>
                      <Button className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Tugas
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <Card key={task.id} className="bg-[#2a2a2a]/50 border-gray-800">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-white">{task.title}</CardTitle>
                                  <Badge className={`${getStatusColor(task.status)}`}>
                                    {getStatusLabel(task.status)}
                                  </Badge>
                                </div>
                                <CardDescription className="text-gray-400">
                                  {task.profession} • Assignee: {task.assigneeName}
                                </CardDescription>
                              </div>
                              {task.dueDate && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Deadline</p>
                                  <p className="text-sm text-white">{formatDate(task.dueDate)}</p>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm mb-4">{task.description}</p>

                            {task.deliverables && task.deliverables.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-gray-400">Deliverables</Label>
                                {task.deliverables.map((del) => (
                                  <div
                                    key={del.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[#1E1E1E] border border-gray-800"
                                  >
                                    <div className="flex items-center gap-3">
                                      <File className="w-5 h-5 text-[#9B59B6]" />
                                      <div>
                                        <p className="text-white text-sm">{del.name}</p>
                                        <p className="text-xs text-gray-500">
                                          v{del.version} • {formatDate(del.uploadedAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={`${getStatusColor(del.status)}`}>
                                        {del.status === 'pending_review' ? 'Menunggu Review' :
                                         del.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                      </Badge>
                                      <Button size="sm" variant="outline" className="border-gray-700">
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                              <Button size="sm" variant="outline" className="border-gray-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Deliverable
                              </Button>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-green-700 text-green-400 hover:bg-green-950">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-700 text-red-400 hover:bg-red-950">
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {tasks.length === 0 && (
                      <Card className="bg-[#2a2a2a]/50 border-gray-800">
                        <CardContent className="py-12 text-center">
                          <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Tugas</h3>
                          <p className="text-gray-400">Tugas akan muncul di sini setelah ditambahkan</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Meetings Tab */}
                  <TabsContent value="meetings" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Video Meeting</h3>
                        <p className="text-gray-400 text-sm">Jadwal dan riwayat meeting</p>
                      </div>
                      <Button className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]" onClick={() => setScheduleDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Jadwalkan Meeting
                      </Button>
                    </div>

                    {/* Upcoming Meetings */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Meeting Mendatang
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {meetings.filter(m => m.status === 'upcoming').map((meeting) => (
                          <Card key={meeting.id} className="bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/20 border-[#6B5B95]/30">
                            <CardHeader>
                              <CardTitle className="text-white">{meeting.title}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {formatDate(meeting.date)} • {meeting.duration} menit
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{meeting.agenda}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  {meeting.participants.slice(0, 3).map((p, idx) => (
                                    <div
                                      key={idx}
                                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] border-2 border-[#1E1E1E] flex items-center justify-center text-white text-xs font-medium"
                                    >
                                      {p.charAt(0)}
                                    </div>
                                  ))}
                                  {meeting.participants.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#1E1E1E] flex items-center justify-center text-white text-xs">
                                      +{meeting.participants.length - 3}
                                    </div>
                                  )}
                                </div>
                                <Button size="sm" className="bg-[#6B5B95] hover:bg-[#6B5B95]/80">
                                  <VideoIcon className="w-4 h-4 mr-1" />
                                  Join
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {meetings.filter(m => m.status === 'upcoming').length === 0 && (
                        <Card className="bg-[#2a2a2a]/50 border-gray-800">
                          <CardContent className="py-8 text-center text-gray-500">
                            <CalendarDays className="w-12 h-12 mx-auto mb-3" />
                            <p>Tidak ada meeting yang dijadwalkan</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Past Meetings */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Riwayat Meeting
                      </h4>
                      <div className="space-y-3">
                        {meetings.filter(m => m.status === 'completed').map((meeting) => (
                          <Card key={meeting.id} className="bg-[#2a2a2a]/50 border-gray-800">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-white font-medium">{meeting.title}</h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {formatDate(meeting.date)} • {meeting.duration} menit
                                  </p>
                                </div>
                                {meeting.recordingUrl && (
                                  <Button size="sm" variant="outline" className="border-gray-700">
                                    <Play className="w-4 h-4 mr-2" />
                                    Tonton Rekaman
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {meetings.filter(m => m.status === 'completed').length === 0 && (
                        <Card className="bg-[#2a2a2a]/50 border-gray-800">
                          <CardContent className="py-8 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3" />
                            <p>Belum ada riwayat meeting</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Dokumen Project</h3>
                        <p className="text-gray-400 text-sm">Kelola semua dokumen project</p>
                      </div>
                      <Button className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Dokumen
                      </Button>
                    </div>

                    {/* Folder Structure */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {['Arsitek', 'Structure', 'MEP', 'Drafter', 'QS'].map((folder) => (
                        <Card
                          key={folder}
                          className="bg-[#2a2a2a]/50 border-gray-800 hover:border-[#6B5B95]/50 cursor-pointer transition-all hover:scale-105"
                        >
                          <CardContent className="p-4 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-6 h-6 text-[#9B59B6]" />
                            </div>
                            <p className="text-white font-medium">{folder}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {documents.filter(d => d.folder === folder).length} file
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Recent Documents */}
                    <Card className="bg-[#2a2a2a]/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white">Dokumen Terbaru</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {documents.slice(0, 10).map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1E1E1E] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1E1E1E] rounded-lg flex items-center justify-center">
                                  {doc.type.includes('image') ? (
                                    <ImageIcon className="w-5 h-5 text-[#9B59B6]" />
                                  ) : (
                                    <File className="w-5 h-5 text-[#9B59B6]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {doc.folder} • v{doc.version} • {formatFileSize(doc.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</span>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {documents.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3" />
                            <p>Belum ada dokumen</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Jadwal & Timeline Project</h3>
                      <p className="text-gray-400 text-sm">Timeline Gantt chart dan milestone project</p>
                    </div>

                    {/* Gantt Chart Placeholder */}
                    <Card className="bg-[#2a2a2a]/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Gantt Chart
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { task: 'Pre-Design', start: '2024-01-01', end: '2024-01-15', progress: 100, color: 'bg-green-500' },
                            { task: 'Schematic Design', start: '2024-01-16', end: '2024-02-15', progress: 100, color: 'bg-green-500' },
                            { task: 'DED', start: '2024-02-16', end: '2024-04-15', progress: 60, color: 'bg-blue-500' },
                            { task: 'Review', start: '2024-04-16', end: '2024-04-30', progress: 0, color: 'bg-gray-500' },
                            { task: 'Complete', start: '2024-05-01', end: '2024-05-15', progress: 0, color: 'bg-gray-500' }
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white">{item.task}</span>
                                <span className="text-gray-400">{item.start} - {item.end}</span>
                              </div>
                              <div className="relative h-8 bg-[#1E1E1E] rounded overflow-hidden">
                                <div
                                  className={`absolute top-0 left-0 h-full ${item.color} opacity-80`}
                                  style={{ width: `${item.progress}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                                  {item.progress}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card className="bg-[#2a2a2a]/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Milestone Penting
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { milestone: 'Design Approval', date: '2024-01-15', status: 'completed' },
                            { milestone: 'Structure Approval', date: '2024-02-15', status: 'completed' },
                            { milestone: 'MEP Approval', date: '2024-03-15', status: 'in_progress' },
                            { milestone: 'Final Review', date: '2024-04-30', status: 'pending' },
                            { milestone: 'Project Handover', date: '2024-05-15', status: 'pending' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-700/50 text-gray-500'
                              }`}>
                                {item.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                                 item.status === 'in_progress' ? <Clock className="w-5 h-5" /> :
                                 <div className="w-3 h-3 rounded-full bg-current" />}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  item.status === 'pending' ? 'text-gray-500' : 'text-white'
                                }`}>{item.milestone}</p>
                                <p className="text-sm text-gray-500">{item.date}</p>
                              </div>
                              {item.status === 'in_progress' && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  Sedang Berjalan
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Approval Material Tab */}
                  <TabsContent value="materials" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Approval Material</h3>
                        <p className="text-gray-400 text-sm">Material yang dipilih dari katalog iklan untuk project ini</p>
                      </div>
                      <Badge className="bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                        {approvalMaterials.length} item
                      </Badge>
                    </div>

                    {/* Materials Grid */}
                    {approvalMaterials.length === 0 ? (
                      <Card className="bg-[#2a2a2a]/50 border-gray-800">
                        <CardContent className="py-16 text-center">
                          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-10 h-10 text-gray-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">Belum Ada Material</h4>
                          <p className="text-gray-400 max-w-md mx-auto mb-6">
                            Pilih material dari katalog iklan di dashboard dan tambahkan ke approval material project ini.
                          </p>
                          <Button
                            onClick={() => router.push('/architect/dashboard')}
                            variant="outline"
                            className="border-[#6B5B95]/30 text-[#9B59B6] hover:bg-[#6B5B95]/10"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Lihat Katalog Iklan
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {approvalMaterials.map((material) => (
                          <Card key={material.id} className="bg-[#2a2a2a]/50 border-gray-800 hover:border-[#6B5B95]/50 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Product Image */}
                                {material.productItem.imageUrl ? (
                                  <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
                                    <img
                                      src={material.productItem.imageUrl}
                                      alt={material.productItem.itemName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-[#6B5B95]/20 rounded-lg flex items-center justify-center border border-[#6B5B95]/30 flex-shrink-0">
                                    <Package className="w-8 h-8 text-[#9B59B6]" />
                                  </div>
                                )}

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                                    {material.productItem.itemName}
                                  </h4>
                                  {material.productItem.itemCode && (
                                    <p className="text-xs text-gray-500 mb-1">Kode: {material.productItem.itemCode}</p>
                                  )}
                                  {material.productItem.price && (
                                    <p className="text-sm font-semibold text-[#9B59B6]">
                                      Rp {material.productItem.price.toLocaleString('id-ID')}
                                      {material.productItem.unit && `/${material.productItem.unit}`}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={`text-xs ${
                                      material.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                      material.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                      material.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}>
                                      {material.status === 'pending' ? 'Pending' :
                                       material.status === 'approved' ? 'Disetujui' :
                                       material.status === 'rejected' ? 'Ditolak' :
                                       material.status}
                                    </Badge>
                                    {material.quantity > 1 && (
                                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                        Qty: {material.quantity}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Specifications */}
                              {(material.productItem.description || material.productItem.specifications) && (
                                <div className="mt-3 pt-3 border-t border-gray-800">
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {material.productItem.description || material.productItem.specifications}
                                  </p>
                                </div>
                              )}

                              {/* Notes */}
                              {material.notes && (
                                <div className="mt-2 bg-[#1E1E1E] rounded p-2">
                                  <p className="text-xs text-gray-400">
                                    <span className="text-gray-500">Catatan:</span> {material.notes}
                                  </p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {new Date(material.createdAt).toLocaleDateString('id-ID')}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[#9B59B6] hover:bg-[#6B5B95]/10"
                                    onClick={() => {
                                      navigator.clipboard.writeText(material.productItem.itemName)
                                      toast({ title: 'Nama produk disalin' })
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Summary Card */}
                    {approvalMaterials.length > 0 && (
                      <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/20 border-[#6B5B95]/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Ringkasan Material
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#1E1E1E]/50 rounded-lg p-4">
                              <p className="text-sm text-gray-400 mb-1">Total Item</p>
                              <p className="text-2xl font-bold text-white">
                                {approvalMaterials.length}
                              </p>
                            </div>
                            <div className="bg-[#1E1E1E]/50 rounded-lg p-4">
                              <p className="text-sm text-gray-400 mb-1">Total Harga</p>
                              <p className="text-2xl font-bold text-[#9B59B6]">
                                Rp {approvalMaterials.reduce((sum, m) => {
                                  const price = m.productItem.price || 0
                                  return sum + (price * m.quantity)
                                }, 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="bg-[#1E1E1E]/50 rounded-lg p-4">
                              <p className="text-sm text-gray-400 mb-1">Status</p>
                              <p className="text-2xl font-bold text-yellow-400">
                                {approvalMaterials.filter(m => m.status === 'pending').length} Pending
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar - Quick Actions */}
        <aside className={`
          ${rightSidebarOpen ? 'w-72' : 'w-0'}
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
          bg-[#121212] border-l border-gray-800 flex flex-col fixed lg:relative right-0 h-full z-30 transition-all duration-300 overflow-hidden
        `}>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Quick Actions</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] hover:from-[#6B5B95]/80 hover:to-[#9B59B6]/80 justify-start"
                onClick={() => toast({ title: 'Fitur video call akan segera tersedia' })}
              >
                <Video className="w-4 h-4 mr-2" />
                Mulai Video Call
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 justify-start"
                onClick={() => setScheduleDialogOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Jadwalkan Meeting
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 justify-start"
                onClick={() => toast({ title: 'Fitur upload file akan segera tersedia' })}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 justify-start"
                onClick={() => setInviteDialogOpen(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Undang Tim
              </Button>

              <div className="border-t border-gray-800 my-4" />

              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 justify-start"
                onClick={() => setSettingsDialogOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan Project
              </Button>
            </div>

            {/* Project Info Summary */}
            <Card className="bg-[#2a2a2a]/50 border-gray-800 mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Info Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Order Number</p>
                  <p className="text-white">{projectData?.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Klien</p>
                  <p className="text-white">{projectData?.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Mulai</p>
                  <p className="text-white">{projectData?.startDate ? formatDate(projectData.startDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estimasi Selesai</p>
                  <p className="text-white">{projectData?.estimatedCompletion ? formatDate(projectData.estimatedCompletion) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Tim</p>
                  <p className="text-white">{teamMembers.length} anggota</p>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </aside>
      </div>

      {/* Dialogs */}
      <Dialog open={selectedMember !== null} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="bg-[#1E1E1E] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Anggota Tim</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-xl">
                    {selectedMember.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <p className="text-gray-400 capitalize">{selectedMember.profession}</p>
                  <Badge className={`mt-2 ${
                    selectedMember.status === 'online' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {selectedMember.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
              {selectedMember.email && (
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="text-white">{selectedMember.email}</p>
                </div>
              )}
              {selectedMember.phone && (
                <div>
                  <Label className="text-gray-500">Telepon</Label>
                  <p className="text-white">{selectedMember.phone}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Kirim Pesan
                </Button>
                <Button variant="outline" className="flex-1 border-gray-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Jadwalkan Meeting</DialogTitle>
            <DialogDescription className="text-gray-400">
              Buat jadwal meeting baru dengan tim
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul Meeting</Label>
              <Input placeholder="Masukkan judul meeting" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal</Label>
                <Input type="date" className="bg-[#2a2a2a] border-gray-800" />
              </div>
              <div>
                <Label>Waktu</Label>
                <Input type="time" className="bg-[#2a2a2a] border-gray-800" />
              </div>
            </div>
            <div>
              <Label>Durasi (menit)</Label>
              <Input type="number" placeholder="60" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div>
              <Label>Agenda</Label>
              <Textarea placeholder="Deskripsi agenda meeting" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} className="flex-1 border-gray-700">
                Batal
              </Button>
              <Button onClick={handleScheduleMeeting} className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                Jadwalkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Undang Anggota Tim</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tambahkan anggota baru ke project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="Masukkan email anggota" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div>
              <Label>Profesi</Label>
              <Input placeholder="Pilih profesi" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="flex-1 border-gray-700">
                Batal
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                Undang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Pengaturan Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Project</Label>
              <Input defaultValue={projectData?.projectName || ''} className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi project" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div>
              <Label>Estimasi Penyelesaian</Label>
              <Input type="date" className="bg-[#2a2a2a] border-gray-800" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)} className="flex-1 border-gray-700">
                Batal
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]">
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
