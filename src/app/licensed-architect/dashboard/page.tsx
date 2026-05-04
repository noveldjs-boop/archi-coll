"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  LayoutDashboard,
  Building2,
  MapPin,
  User,
  LogOut,
  CheckCircle,
  Clock,
  MessageSquare,
  Video,
  RefreshCw,
  AlertCircle,
  Home,
  Utensils,
  Briefcase,
  Hospital,
  Inbox,
  Send,
  Settings,
  Users,
  Image as ImageIcon,
  Shield,
  Layers,
  Award
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdColumn } from "@/components/ads/AdColumn"

interface ActiveProject {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string | null
  projectName: string | null
  description: string | null
  landArea: string
  buildingArea: string
  buildingModel: string
  buildingFloors: string
  buildingCategory: string
  qualityLevel: string | null
  rab: number
  designFee: number
  status: string
  progressPercentage: number
  createdAt: string
  assignedAt: string | null
  assignedProfessions: string[]
}

interface AvailableProject {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string | null
  projectName: string | null
  description: string | null
  landArea: string
  buildingArea: string
  buildingModel: string
  buildingFloors: string
  buildingCategory: string
  qualityLevel: string | null
  rab: number
  designFee: number
  requiredProfessions: string[]
  createdAt: string
}

interface Member {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
  profession: string
  status: string
  experience: number | null
  phone: string
  address: string | null
  bio: string | null
  location: string | null
  profileImage: string | null
  expertise: string | null
  portfolioImages: string | null
}

type NavItem = 'dashboard' | 'inbox' | 'outbox' | 'chat' | 'video' | 'profile' | 'portfolio' | 'home'

export default function LicensedArchitectDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([])
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([])
  const [selectedActiveProject, setSelectedActiveProject] = useState<ActiveProject | null>(null)

  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')

  const [projectDetailDialogOpen, setProjectDetailDialogOpen] = useState(false)
  const [selectedAvailableProject, setSelectedAvailableProject] = useState<AvailableProject | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [inboxMessages, setInboxMessages] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/licensed-architect/login")
    } else if (status === "authenticated") {
      // Validate user profession
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.member) {
            const userProfession = data.member.profession
            // Support both 'licensed-architect' (hyphen) and 'licensed_architect' (underscore) variations
            if (userProfession !== 'licensed-architect' && userProfession !== 'licensed_architect') {
              // Redirect to correct dashboard based on profession
              const professionRoutes: Record<string, string> = {
                'architect': '/architect/dashboard',
                'structure': '/structure/dashboard',
                'mep': '/mep/dashboard',
                'drafter': '/drafter/dashboard',
                'qs': '/qs/dashboard'
              }
              const correctRoute = professionRoutes[userProfession] || '/architect/dashboard'
              console.log(`User has profession "${userProfession}", redirecting to ${correctRoute}`)
              router.push(correctRoute)
            } else {
              fetchData()
            }
          } else {
            fetchData()
          }
        })
        .catch(err => {
          console.error('Error validating profession:', err)
          fetchData()
        })
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Get active projects for licensed architect
      const activeRes = await fetch('/api/licensed-architect/active-projects')
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveProjects(activeData.activeProjects || [])
      }

      // Get available projects (invitations from architect)
      const availableRes = await fetch('/api/licensed-architect/available-projects')
      if (availableRes.ok) {
        const availableData = await availableRes.json()
        setAvailableProjects(availableData.availableProjects || [])
      }

      // Get member info
      const memberRes = await fetch(`/api/admin/members?status=active&limit=100`)
      if (memberRes.ok) {
        const memberData = await memberRes.json()
        const currentMember = memberData.members?.find(
          (m: Member) => m.user?.email === session?.user?.email
        )
        if (currentMember) {
          setMember(currentMember)
        }
      }

      // Get inbox messages
      const inboxRes = await fetch(`/api/member/inbox`)
      if (inboxRes.ok) {
        const inboxData = await inboxRes.json()
        setInboxMessages(inboxData.messages || [])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptProject = async () => {
    if (!selectedAvailableProject) return

    setIsAccepting(true)
    try {
      const response = await fetch('/api/licensed-architect/accept-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedAvailableProject.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: data.message || 'Project berhasil diterima!' })

        setProjectDetailDialogOpen(false)
        setSelectedAvailableProject(null)

        fetchData()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Gagal menerima project', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error accepting project:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await router.push('/join-member')
      // Clear session after redirect starts
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/join-member'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return <Home className="w-5 h-5" />
      case 'hospital': return <Hospital className="w-5 h-5" />
      case 'villa': return <Building2 className="w-5 h-5" />
      case 'cafe_restaurant': return <Utensils className="w-5 h-5" />
      case 'apartment': return <Building2 className="w-5 h-5" />
      case 'commercial': return <Briefcase className="w-5 h-5" />
      default: return <Building2 className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'in_pre_design': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'in_schematic': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'in_ded': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'in_review': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'in_pre_design': 'Pre-Design',
      'in_schematic': 'Schematic Design',
      'in_ded': 'Detailed Engineering Design',
      'in_review': 'Review',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return labels[status] || status
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getUnreadCount = () => {
    return inboxMessages.filter(m => !m.isRead).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col fixed h-full">
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C0392B] via-[#E74C3C] to-[#F39C12] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#C0392B] via-[#E74C3C] to-[#F39C12] bg-clip-text text-transparent">
                ARCHI-COLL
              </h1>
              <p className="text-xs text-gray-500">Licensed Architect Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Brief */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member?.profileImage || ""} />
              <AvatarFallback className="bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white font-medium">
                {member?.user?.name?.charAt(0) || 'L'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{member?.user?.name || 'Licensed Architect'}</p>
              <p className="text-xs text-gray-500 capitalize">{member?.profession || 'licensed-architect'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Button
            onClick={() => setActiveNav('dashboard')}
            variant={activeNav === 'dashboard' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'dashboard' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          <Button
            onClick={() => setActiveNav('inbox')}
            variant={activeNav === 'inbox' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'inbox' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Inbox className="w-4 h-4 mr-2" />
            Inbox
            {getUnreadCount() > 0 && (
              <Badge className="ml-auto bg-red-500 text-white">{getUnreadCount()}</Badge>
            )}
          </Button>

          <Button
            onClick={() => setActiveNav('outbox')}
            variant={activeNav === 'outbox' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'outbox' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Outbox
          </Button>

          <Button
            onClick={() => setActiveNav('chat')}
            variant={activeNav === 'chat' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'chat' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>

          <Button
            onClick={() => setActiveNav('video')}
            variant={activeNav === 'video' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'video' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>

          <Button
            onClick={() => setActiveNav('portfolio')}
            variant={activeNav === 'portfolio' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'portfolio' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Portfolio
          </Button>

          <Button
            onClick={() => setActiveNav('profile')}
            variant={activeNav === 'profile' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'profile' ? 'bg-[#C0392B]/20 text-[#E74C3C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profil
          </Button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full border-red-700 text-red-400 hover:bg-red-950"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 ml-64">
        <main className="flex-1 p-6">
        {/* Dashboard View */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Selamat Datang, {member?.user?.name || "Licensed Architect"}!
              </h2>
              <p className="text-gray-400">
                {activeProjects.length > 0
                  ? `Anda sedang mereview ${activeProjects.length} project aktif. ${availableProjects.length > 0 ? `${availableProjects.length} undangan project lain tersedia.` : ''}`
                  : availableProjects.length > 0
                  ? `${availableProjects.length} undangan project tersedia`
                  : "Tidak ada project yang tersedia saat ini"}
              </p>
            </div>

            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Project Aktif ({activeProjects.length})
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Project yang sedang Anda review dan approve
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="bg-gradient-to-br from-[#C0392B]/20 to-[#E74C3C]/20 border-[#C0392B]/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Shield className="w-5 h-5" />
                              {project.projectName || `Project ${project.orderNumber}`}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {project.orderNumber}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-400">Nama Klien</p>
                              <p className="text-white">{project.clientName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Kategori</p>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(project.buildingCategory)}
                                <span className="text-white capitalize">{project.buildingCategory}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Luas Tanah</p>
                              <p className="text-white">{project.landArea} m²</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Luas Bangunan</p>
                              <p className="text-white">{project.buildingArea} m²</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Jumlah Lantai</p>
                              <p className="text-white">{project.buildingFloors} lantai</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Profesi Terlibat</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.assignedProfessions?.map((prof) => (
                                  <Badge key={prof} variant="outline" className="text-xs">
                                    {prof}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {project.description && (
                            <div>
                              <p className="text-sm text-gray-400">Deskripsi</p>
                              <p className="text-gray-300 mt-1">{project.description}</p>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-400">Progress Project</p>
                              <span className="text-white font-medium">{project.progressPercentage}%</span>
                            </div>
                            <Progress value={project.progressPercentage} className="h-3" />
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => router.push(`/report-monitoring/${project.id}`)}
                              className="bg-gradient-to-r from-[#C0392B] to-[#E74C3C] hover:from-[#C0392B]/80 hover:to-[#E74C3C]/80"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              Buka Report & Monitoring
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Projects (Invitations) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    Undangan Project
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Undangan dari Arsitek untuk mereview project
                  </p>
                </div>
                {availableProjects.length > 0 && (
                  <Badge variant="outline" className="bg-[#C0392B]/20 text-[#E74C3C] border-[#C0392B]/30">
                    {availableProjects.length} undangan tersedia
                  </Badge>
                )}
              </div>

              {availableProjects.length === 0 ? (
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardContent className="py-12 text-center">
                    <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Tidak Ada Undangan
                    </h3>
                    <p className="text-gray-400">
                      Saat ini tidak ada undangan project baru. Undangan akan muncul setelah arsitek mengundang Anda untuk mereview.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableProjects.map((project) => (
                    <Card key={project.id} className="bg-[#2a2a2a]/50 border-gray-800 hover:border-[#C0392B]/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#C0392B]/20 to-[#E74C3C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              {getCategoryIcon(project.buildingCategory)}
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">
                                {project.projectName || project.clientName}
                              </CardTitle>
                              <CardDescription className="text-gray-400 mt-1">
                                {project.orderNumber}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <Inbox className="w-3 h-3 mr-1" />
                            Undangan
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {project.description && (
                            <p className="text-gray-300 text-sm">{project.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#C0392B]" />
                              <div>
                                <p className="text-xs text-gray-500">Klien</p>
                                <p className="text-sm text-white">{project.clientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#E74C3C]" />
                              <div>
                                <p className="text-xs text-gray-500">Luas Tanah</p>
                                <p className="text-sm text-white">{project.landArea} m²</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#F39C12]" />
                              <div>
                                <p className="text-xs text-gray-500">Luas Bangunan</p>
                                <p className="text-sm text-white">{project.buildingArea} m²</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#C0392B]" />
                              <div>
                                <p className="text-xs text-gray-500">Lantai</p>
                                <p className="text-sm text-white">{project.buildingFloors} lantai</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-2">Profesi yang Dibutuhkan</p>
                            <div className="flex flex-wrap gap-1">
                              {project.requiredProfessions?.map((prof) => (
                                <Badge key={prof} variant="outline" className="text-xs">
                                  {prof}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-700">
                            <Button
                              onClick={() => {
                                setSelectedAvailableProject(project)
                                setProjectDetailDialogOpen(true)
                              }}
                              className="w-full bg-gradient-to-r from-[#C0392B] to-[#E74C3C] hover:from-[#C0392B]/80 hover:to-[#E74C3C]/80"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Terima Undangan
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inbox View */}
        {activeNav === 'inbox' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Inbox</h2>
            <Card className="bg-[#2a2a2a]/50 border-gray-800">
              <CardContent className="p-6">
                {inboxMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Tidak ada pesan masuk</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {inboxMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg border ${
                          msg.isRead ? 'bg-gray-800/30 border-gray-700' : 'bg-[#C0392B]/10 border-[#C0392B]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-medium">{msg.title}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {!msg.isRead && (
                            <Badge className="bg-[#C0392B] text-white">Baru</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile View */}
        {activeNav === 'profile' && member && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Profil</h2>
            <Card className="bg-[#2a2a2a]/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={member.profileImage || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white text-2xl font-bold">
                      {member.user?.name?.charAt(0) || 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Nama Lengkap</p>
                      <p className="text-white text-lg">{member.user?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{member.user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Profesi</p>
                      <p className="text-white capitalize">{member.profession || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={member.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {member.status}
                      </Badge>
                    </div>
                    {member.experience && (
                      <div>
                        <p className="text-sm text-gray-400">Pengalaman</p>
                        <p className="text-white">{member.experience} tahun</p>
                      </div>
                    )}
                    {member.phone && (
                      <div>
                        <p className="text-sm text-gray-400">No. Telepon</p>
                        <p className="text-white">{member.phone}</p>
                      </div>
                    )}
                    {member.bio && (
                      <div>
                        <p className="text-sm text-gray-400">Bio</p>
                        <p className="text-gray-300">{member.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for other views */}
        {(activeNav === 'outbox' || activeNav === 'chat' || activeNav === 'video' || activeNav === 'portfolio' || activeNav === 'home') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white capitalize">{activeNav.replace('_', ' ')}</h2>
            <Card className="bg-[#2a2a2a]/50 border-gray-800">
              <CardContent className="py-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fitur {activeNav.replace('_', ' ')}
                </h3>
                <p className="text-gray-400">
                  Fitur ini sedang dalam pengembangan
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      {/* Project Detail Dialog */}
      <Dialog open={projectDetailDialogOpen} onOpenChange={setProjectDetailDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedAvailableProject?.projectName || 'Detail Project'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAvailableProject?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedAvailableProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Klien</p>
                  <p className="text-white">{selectedAvailableProject.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Kategori</p>
                  <p className="text-white capitalize">{selectedAvailableProject.buildingCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Luas Tanah</p>
                  <p className="text-white">{selectedAvailableProject.landArea} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Luas Bangunan</p>
                  <p className="text-white">{selectedAvailableProject.buildingArea} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Jumlah Lantai</p>
                  <p className="text-white">{selectedAvailableProject.buildingFloors} lantai</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Design Fee</p>
                  <p className="text-white font-medium">{formatCurrency(selectedAvailableProject.designFee)}</p>
                </div>
              </div>

              {selectedAvailableProject.description && (
                <div>
                  <p className="text-sm text-gray-400">Deskripsi</p>
                  <p className="text-gray-300 mt-1">{selectedAvailableProject.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Profesi yang Dibutuhkan</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAvailableProject.requiredProfessions?.map((prof) => (
                    <Badge key={prof} variant="outline" className="text-sm">
                      {prof}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAcceptProject}
                  disabled={isAccepting}
                  className="flex-1 bg-gradient-to-r from-[#C0392B] to-[#E74C3C] hover:from-[#C0392B]/80 hover:to-[#E74C3C]/80"
                >
                  {isAccepting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terima Undangan
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setProjectDetailDialogOpen(false)}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </main>
        <AdColumn />
      </div>
    </div>
  )
}
