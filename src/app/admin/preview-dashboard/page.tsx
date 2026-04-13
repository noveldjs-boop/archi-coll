'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  LayoutDashboard,
  Inbox,
  FileText,
  MessageSquare,
  Upload,
  Download,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Monitor,
  Send
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PreviewData {
  profession: string
  professionLabel: string
  member: {
    id: string
    name: string
    email: string
    profession: string
    experience: number
    status: string
  }
  assignments?: any[]
  inbox?: any[]
  revisions?: any[]
  chat?: any[]
}

const professions = [
  { id: 'architect', label: 'Desain Arsitek', labelIndo: 'Desain Arsitek', labelEng: 'Architectural Designer' },
  { id: 'licensed_architect', label: 'Arsitek Berlisensi', labelIndo: 'Arsitek Berlisensi', labelEng: 'Licensed Architect' },
  { id: 'structure', label: 'Desain Struktur', labelIndo: 'Desain Struktur', labelEng: 'Structural Designer' },
  { id: 'mep', label: 'Desain MEP', labelIndo: 'Desain MEP', labelEng: 'MEP Designer' },
  { id: 'drafter', label: 'Drafter', labelIndo: 'Drafter', labelEng: 'Drafter' },
  { id: 'qs', label: 'QS', labelIndo: 'QS (Quantity Surveyor)', labelEng: 'QS (Quantity Surveyor)' }
]

// Status configuration (icons will be rendered inside component)
const statusConfig: Record<string, { color: string; iconName: string }> = {
  'pending': { color: 'bg-yellow-500/20 text-yellow-400', iconName: 'Clock' },
  'accepted': { color: 'bg-blue-500/20 text-blue-400', iconName: 'CheckCircle2' },
  'in_progress': { color: 'bg-purple-500/20 text-purple-400', iconName: 'MessageSquare' },
  'completed': { color: 'bg-green-500/20 text-green-400', iconName: 'CheckCircle2' },
  'rejected': { color: 'bg-red-500/20 text-red-400', iconName: 'XCircle' },
  'expired': { color: 'bg-gray-500/20 text-gray-400', iconName: 'XCircle' },
  'open': { color: 'bg-orange-500/20 text-orange-400', iconName: 'Clock' }
}

// Icon map for status badges
const statusIcons: Record<string, any> = { Clock, CheckCircle2, MessageSquare, XCircle }

// Helper component to render status icon
const StatusIcon = ({ iconName, className }: { iconName: string; className: string }) => {
  const Icon = statusIcons[iconName] || Clock
  return <Icon className={className} />
}

export default function PreviewDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [selectedProfession, setSelectedProfession] = useState<string>('architect')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'id' | 'en'>('id')

  // Chat state
  const [chatMessage, setChatMessage] = useState('')
  const [chatAttachment, setChatAttachment] = useState('')

  // Revision state
  const [revisionTitle, setRevisionTitle] = useState('')
  const [revisionDescription, setRevisionDescription] = useState('')
  const [revisionDocument, setRevisionDocument] = useState('')

  // Project dialog state
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [revisions, setRevisions] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchPreviewData()
    }
  }, [status, router, selectedProfession])

  const fetchPreviewData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/preview-dashboard?profession=${selectedProfession}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewData(data)
      }
    } catch (error) {
      console.error('Error fetching preview data:', error)
      toast({
        title: 'Gagal memuat data preview',
        description: 'Silakan coba lagi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const [revisionsRes, chatRes] = await Promise.all([
        fetch(`/api/admin/preview-dashboard?profession=${selectedProfession}&projectId=${projectId}&data=revisions`),
        fetch(`/api/admin/preview-dashboard?profession=${selectedProfession}&projectId=${projectId}&data=chat`)
      ])

      if (revisionsRes.ok) setRevisions(await revisionsRes.json())
      if (chatRes.ok) setChatMessages(await chatRes.json())
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  }

  const isProjectExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isProjectAccessible = (assignment: any) => {
    if (isProjectExpired(assignment.expiryDate)) {
      return false
    }
    return assignment.status === 'accepted' || assignment.status === 'in_progress'
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig['pending']
    return (
      <Badge className={config.color}>
        <StatusIcon iconName={config.iconName} className="w-3 h-3" />
        <span className="ml-1">{status}</span>
      </Badge>
    )
  }

  const getProfessionLabel = (profession: string) => {
    const prof = professions.find(p => p.id === profession)
    return language === 'id' ? prof?.labelIndo : prof?.labelEng
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Memuat...</div>
      </div>
    )
  }

  const hasActiveProject = previewData?.assignments?.some((a: any) =>
    a.status === 'accepted' || a.status === 'in_progress'
  )

  const activeProject = previewData?.assignments?.find((a: any) =>
    a.status === 'accepted' || a.status === 'in_progress'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-2 rounded-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Preview Dashboard Profesi</h1>
              <p className="text-sm text-gray-400">Simulasi tampilan dashboard member</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger className="w-64 bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="Pilih Profesi" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {professions.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'id' ? prof.labelIndo : prof.labelEng}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
            >
              {language === 'id' ? 'ID' : 'EN'}
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-[#6B5B95]/20 to-[#8B7AB8]/20 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#6B5B95]/20 p-3 rounded-full">
              <User className="w-8 h-8 text-[#9B59B6]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{language === 'id' ? 'Simulasi sebagai' : 'Simulating as'}</p>
              <p className="text-lg font-bold text-white">{previewData?.member.name} ({getProfessionLabel(previewData?.profession || '')})</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {previewData?.member.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{language === 'id' ? 'Total Proyek' : 'Total Projects'}</p>
                  <p className="text-3xl font-bold text-white">{previewData?.assignments?.length || 0}</p>
                </div>
                <FileText className="w-10 h-10 text-[#6B5B95]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{language === 'id' ? 'Sedang Dikerjakan' : 'In Progress'}</p>
                  <p className="text-3xl font-bold text-white">
                    {previewData?.assignments?.filter((a: any) => a.status === 'in_progress').length || 0}
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{language === 'id' ? 'Pesan Belum Dibaca' : 'Unread Messages'}</p>
                  <p className="text-3xl font-bold text-white">
                    {previewData?.inbox?.filter((i: any) => !i.isRead).length || 0}
                  </p>
                </div>
                <Inbox className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{language === 'id' ? 'Pengalaman' : 'Experience'}</p>
                  <p className="text-3xl font-bold text-white">{previewData?.member.experience || 0} {language === 'id' ? 'Tahun' : 'Years'}</p>
                </div>
                <User className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="projects" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Proyek' : 'Projects'}
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {!hasActiveProject && previewData?.assignments?.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-bold text-white mb-2">{language === 'id' ? 'Belum Ada Proyek' : 'No Projects'}</h3>
                  <p className="text-gray-400 mb-4">{language === 'id' ? 'Ini adalah simulasi preview dashboard' : 'This is a preview dashboard simulation'}</p>
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Data yang ditampilkan adalah sample data' : 'Data shown is sample data'}</p>
                </CardContent>
              </Card>
            )}

            {hasActiveProject && activeProject && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{language === 'id' ? 'Proyek Aktif' : 'Active Project'}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {language === 'id' ? 'Proyek yang sedang dikerjakan (simulasi)' : 'Project being worked on (simulation)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{activeProject.project.titleIndo}</h3>
                      <p className="text-gray-400 text-sm mt-1">{activeProject.project.descriptionIndo}</p>
                    </div>
                    {getStatusBadge(activeProject.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">{language === 'id' ? 'Deadline' : 'Deadline'}</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(activeProject.project.deadline).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{language === 'id' ? 'Expiry' : 'Expiry'}</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(activeProject.expiryDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{language === 'id' ? 'Prioritas' : 'Priority'}</p>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {activeProject.project.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{language === 'id' ? 'Status' : 'Status'}</p>
                      {getStatusBadge(activeProject.status)}
                    </div>
                  </div>

                  {isProjectExpired(activeProject.expiryDate) && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {language === 'id' ? 'Waktu pengerjaan telah berakhir' : 'Work time has expired'}
                      </p>
                    </div>
                  )}

                  {isProjectAccessible(activeProject) && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedProject(activeProject.projectId)
                              fetchProjectDetails(activeProject.projectId)
                            }}
                            className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {language === 'id' ? 'Buka Detail Proyek' : 'Open Project Details'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{activeProject.project.titleIndo}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              {language === 'id' ? 'Detail proyek, revisi, dan kolaborasi tim (simulasi)' : 'Project details, revisions, and team collaboration (simulation)'}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revisions */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">{language === 'id' ? 'Revisi' : 'Revisions'}</h3>
                                <Button size="sm" variant="outline" className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700" disabled>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {language === 'id' ? 'Upload Revisi' : 'Upload Revision'}
                                </Button>
                              </div>

                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {revisions.length === 0 ? (
                                  <p className="text-gray-500 text-sm text-center py-4">{language === 'id' ? 'Belum ada revisi (simulasi)' : 'No revisions yet (simulation)'}</p>
                                ) : (
                                  revisions.map((revision) => (
                                    <div key={revision.id} className="p-3 bg-gray-700/30 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">Revisi #{revision.revisionNumber}: {revision.title}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(revision.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                      </div>
                                      {revision.description && (
                                        <p className="text-sm text-gray-400 mb-2">{revision.description}</p>
                                      )}
                                      <a
                                        href={revision.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-[#9B59B6] hover:text-white transition-colors"
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        {language === 'id' ? 'Download Dokumen' : 'Download Document'}
                                      </a>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Chat */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-bold">{language === 'id' ? 'Chat Tim' : 'Team Chat'}</h3>
                              <div className="space-y-2 max-h-80 overflow-y-auto p-4 bg-gray-700/30 rounded-lg">
                                {chatMessages.length === 0 ? (
                                  <p className="text-gray-500 text-sm text-center py-4">{language === 'id' ? 'Belum ada pesan (simulasi)' : 'No messages yet (simulation)'}</p>
                                ) : (
                                  chatMessages.map((chat) => (
                                    <div key={chat.id} className="p-2 bg-gray-700/50 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm text-white">{chat.memberName}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(chat.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-300">{chat.message}</p>
                                      {chat.attachmentUrl && (
                                        <a
                                          href={chat.attachmentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center mt-2 text-xs text-[#9B59B6] hover:text-white transition-colors"
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          {language === 'id' ? 'Lampiran' : 'Attachment'}
                                        </a>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  placeholder={language === 'id' ? 'Ketik pesan...' : 'Type message...'}
                                  className="flex-1 bg-gray-700/50 border-gray-600"
                                  disabled
                                />
                                <Button className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8]" disabled>
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* All Assignments Table */}
            {previewData?.assignments && previewData.assignments.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{language === 'id' ? 'Semua Penugasan (Simulasi)' : 'All Assignments (Simulation)'}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {language === 'id' ? 'Data sample untuk preview dashboard' : 'Sample data for dashboard preview'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/30">
                        <TableHead className="text-gray-300">{language === 'id' ? 'Proyek' : 'Project'}</TableHead>
                        <TableHead className="text-gray-300">{language === 'id' ? 'Deadline' : 'Deadline'}</TableHead>
                        <TableHead className="text-gray-300">{language === 'id' ? 'Expiry' : 'Expiry'}</TableHead>
                        <TableHead className="text-gray-300">{language === 'id' ? 'Status' : 'Status'}</TableHead>
                        <TableHead className="text-gray-300">{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.assignments.map((assignment: any) => (
                        <TableRow key={assignment.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <div className="text-white font-medium">{assignment.project.titleIndo}</div>
                            <div className="text-gray-400 text-sm">{assignment.project.descriptionIndo}</div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(assignment.project.deadline).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className={isProjectExpired(assignment.expiryDate) ? 'text-red-400' : ''}>
                              {new Date(assignment.expiryDate).toLocaleDateString('id-ID')}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                          <TableCell>
                            {isProjectAccessible(assignment) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(assignment.projectId)
                                  fetchProjectDetails(assignment.projectId)
                                }}
                                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
                            {isProjectExpired(assignment.expiryDate) && (
                              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Inbox {language === 'id' ? '(Simulasi)' : '(Simulation)'}</CardTitle>
                <CardDescription className="text-gray-400">
                  {language === 'id' ? 'Pesan dan notifikasi (data sample)' : 'Messages and notifications (sample data)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!previewData?.inbox || previewData.inbox.length === 0) ? (
                  <div className="text-center py-12">
                    <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">{language === 'id' ? 'Tidak ada pesan (simulasi)' : 'No messages (simulation)'}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {previewData.inbox.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg ${
                          item.isRead ? 'bg-gray-700/30' : 'bg-gray-700/60 border-l-4 border-[#6B5B95]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{item.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleString('id-ID')}
                          </span>
                          {item.link && (
                            <Button size="sm" variant="link" className="text-[#9B59B6] hover:text-white">
                              {language === 'id' ? 'Lihat Detail' : 'View Details'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
