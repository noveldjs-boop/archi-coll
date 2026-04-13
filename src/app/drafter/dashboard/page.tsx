"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
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
  PencilRuler,
  Layers,
  FileText,
  Square,
  Eye,
  Scroll
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  assignedItems: string[]
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
  availableItems: string[]
  assignedItems: string[]
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

// Available drawing items for drafters
const DRAWING_ITEMS = [
  { id: 'denah', name: 'Denah', icon: <Layers className="w-4 h-4" /> },
  { id: 'tampak', name: 'Tampak', icon: <Eye className="w-4 h-4" /> },
  { id: 'potongan', name: 'Potongan', icon: <FileText className="w-4 h-4" /> },
  { id: 'plafon', name: 'Rencana Plafon', icon: <Scroll className="w-4 h-4" /> },
  { id: 'detail', name: 'Detail', icon: <PencilRuler className="w-4 h-4" /> },
  { id: '3d', name: '3D View', icon: <Square className="w-4 h-4" /> },
  { id: 'perspektif', name: 'Perspektif', icon: <ImageIcon className="w-4 h-4" /> },
]

export default function DrafterDashboard() {
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

  // Selected items for assignment
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [inboxMessages, setInboxMessages] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/drafter/login")
    } else if (status === "authenticated") {
      // Validate user profession
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.member) {
            const userProfession = data.member.profession
            if (userProfession !== 'drafter') {
              // Redirect to correct dashboard based on profession
              const professionRoutes: Record<string, string> = {
                'architect': '/member/dashboard',
                'structure': '/structure/dashboard',
                'mep': '/mep/dashboard',
                'qs': '/qs/dashboard',
                'licensed-architect': '/licensed-architect/dashboard'
              }
              const correctRoute = professionRoutes[userProfession] || '/member/dashboard'
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

      // Get active projects for drafter
      const activeRes = await fetch('/api/drafter/active-projects')
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveProjects(activeData.activeProjects || [])
      }

      // Get available projects (with items to select)
      const availableRes = await fetch('/api/drafter/available-projects')
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

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAcceptProject = async () => {
    if (!selectedAvailableProject || selectedItems.length === 0) {
      toast({ title: 'Pilih setidaknya satu item gambar', variant: 'destructive' })
      return
    }

    setIsAccepting(true)
    try {
      const response = await fetch('/api/drafter/accept-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedAvailableProject.id,
          items: selectedItems
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: data.message || 'Project berhasil diterima!' })

        setProjectDetailDialogOpen(false)
        setSelectedAvailableProject(null)
        setSelectedItems([])

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
    await signOut({ callbackUrl: "/" })
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

  const getItemName = (itemId: string) => {
    const item = DRAWING_ITEMS.find(i => i.id === itemId)
    return item?.name || itemId
  }

  const getItemIcon = (itemId: string) => {
    const item = DRAWING_ITEMS.find(i => i.id === itemId)
    return item?.icon || <FileText className="w-4 h-4" />
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#16A085] via-[#1ABC9C] to-[#2ECC71] rounded-xl flex items-center justify-center">
              <PencilRuler className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#16A085] via-[#1ABC9C] to-[#2ECC71] bg-clip-text text-transparent">
                ARCHI-COLL
              </h1>
              <p className="text-xs text-gray-500">Drafter Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Brief */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member?.profileImage || ""} />
              <AvatarFallback className="bg-gradient-to-br from-[#16A085] to-[#1ABC9C] text-white font-medium">
                {member?.user?.name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{member?.user?.name || 'Drafter'}</p>
              <p className="text-xs text-gray-500 capitalize">{member?.profession || 'drafter'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Button
            onClick={() => setActiveNav('dashboard')}
            variant={activeNav === 'dashboard' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'dashboard' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          <Button
            onClick={() => setActiveNav('inbox')}
            variant={activeNav === 'inbox' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'inbox' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
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
              activeNav === 'outbox' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Outbox
          </Button>

          <Button
            onClick={() => setActiveNav('chat')}
            variant={activeNav === 'chat' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'chat' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>

          <Button
            onClick={() => setActiveNav('video')}
            variant={activeNav === 'video' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'video' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>

          <Button
            onClick={() => setActiveNav('portfolio')}
            variant={activeNav === 'portfolio' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'portfolio' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Portfolio
          </Button>

          <Button
            onClick={() => setActiveNav('profile')}
            variant={activeNav === 'profile' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              activeNav === 'profile' ? 'bg-[#16A085]/20 text-[#1ABC9C]' : 'text-gray-300 hover:bg-gray-800'
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
      <main className="flex-1 ml-64 p-6">
        {/* Dashboard View */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Selamat Datang, {member?.user?.name || "Drafter"}!
              </h2>
              <p className="text-gray-400">
                {activeProjects.length > 0
                  ? `Anda sedang mengerjakan ${activeProjects.length} project aktif. ${availableProjects.length > 0 ? `${availableProjects.length} project lain tersedia dengan item gambar yang bisa dipilih.` : ''}`
                  : availableProjects.length > 0
                  ? `${availableProjects.length} project tersedia dengan item gambar yang bisa dipilih`
                  : "Tidak ada project yang tersedia saat ini"}
              </p>
            </div>

            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <PencilRuler className="w-5 h-5" />
                      Project Aktif ({activeProjects.length})
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Project gambar yang sedang Anda kerjakan
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="bg-gradient-to-br from-[#16A085]/20 to-[#1ABC9C]/20 border-[#16A085]/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white flex items-center gap-2">
                              <PencilRuler className="w-5 h-5" />
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
                          </div>

                          {/* Assigned Items */}
                          {project.assignedItems && project.assignedItems.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Item Gambar yang Ditugaskan</p>
                              <div className="flex flex-wrap gap-2">
                                {project.assignedItems.map((itemId) => (
                                  <Badge key={itemId} variant="outline" className="text-xs flex items-center gap-1">
                                    {getItemIcon(itemId)}
                                    {getItemName(itemId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

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
                              className="bg-gradient-to-r from-[#16A085] to-[#1ABC9C] hover:from-[#16A085]/80 hover:to-[#1ABC9C]/80"
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

            {/* Available Projects (With Items to Select) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Project Tersedia
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Pilih item gambar yang ingin Anda kerjakan
                  </p>
                </div>
                {availableProjects.length > 0 && (
                  <Badge variant="outline" className="bg-[#16A085]/20 text-[#1ABC9C] border-[#16A085]/30">
                    {availableProjects.length} project tersedia
                  </Badge>
                )}
              </div>

              {availableProjects.length === 0 ? (
                <Card className="bg-[#2a2a2a]/50 border-gray-800">
                  <CardContent className="py-12 text-center">
                    <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Tidak Ada Project Tersedia
                    </h3>
                    <p className="text-gray-400">
                      Saat ini tidak ada project baru. Project baru akan muncul setelah arsitek menugaskan item gambar.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableProjects.map((project) => (
                    <Card key={project.id} className="bg-[#2a2a2a]/50 border-gray-800 hover:border-[#16A085]/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#16A085]/20 to-[#1ABC9C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Tersedia
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
                              <User className="w-4 h-4 text-[#16A085]" />
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
                              <Building2 className="w-4 h-4 text-[#1ABC9C]" />
                              <div>
                                <p className="text-xs text-gray-500">Luas Bangunan</p>
                                <p className="text-sm text-white">{project.buildingArea} m²</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#16A085]" />
                              <div>
                                <p className="text-xs text-gray-500">Lantai</p>
                                <p className="text-sm text-white">{project.buildingFloors} lantai</p>
                              </div>
                            </div>
                          </div>

                          {/* Available/Assigned Items */}
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Item Gambar</p>
                            <div className="flex flex-wrap gap-1">
                              {project.assignedItems && project.assignedItems.length > 0 ? (
                                project.assignedItems.map((itemId) => (
                                  <Badge key={itemId} variant="outline" className="text-xs bg-gray-700/50 text-gray-400">
                                    {getItemIcon(itemId)}
                                    {getItemName(itemId)} (Diambil)
                                  </Badge>
                                ))
                              ) : null}
                              {project.availableItems && project.availableItems.length > 0 ? (
                                project.availableItems.map((itemId) => (
                                  <Badge key={itemId} variant="outline" className="text-xs">
                                    {getItemIcon(itemId)}
                                    {getItemName(itemId)}
                                  </Badge>
                                ))
                              ) : null}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-700">
                            <Button
                              onClick={() => {
                                setSelectedAvailableProject(project)
                                setSelectedItems([])
                                setProjectDetailDialogOpen(true)
                              }}
                              className="w-full bg-gradient-to-r from-[#16A085] to-[#1ABC9C] hover:from-[#16A085]/80 hover:to-[#1ABC9C]/80"
                            >
                              <PencilRuler className="w-4 h-4 mr-2" />
                              Pilih Item Gambar
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
                          msg.isRead ? 'bg-gray-800/30 border-gray-700' : 'bg-[#16A085]/10 border-[#16A085]/30'
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
                            <Badge className="bg-[#16A085] text-white">Baru</Badge>
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
                    <AvatarFallback className="bg-gradient-to-br from-[#16A085] to-[#1ABC9C] text-white text-2xl font-bold">
                      {member.user?.name?.charAt(0) || 'D'}
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
      </main>

      {/* Project Detail & Item Selection Dialog */}
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
                <p className="text-sm text-gray-400 mb-3 font-medium">Pilih Item Gambar yang Ingin Dikerjakan:</p>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-800/30 rounded-lg">
                  {DRAWING_ITEMS.filter(item =>
                    selectedAvailableProject.availableItems?.includes(item.id)
                  ).map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedItems.includes(item.id)
                          ? 'bg-[#16A085]/20 border-[#16A085] text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                      onClick={() => handleToggleItem(item.id)}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        className="border-gray-600"
                      />
                      {item.icon}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAcceptProject}
                  disabled={isAccepting || selectedItems.length === 0}
                  className="flex-1 bg-gradient-to-r from-[#16A085] to-[#1ABC9C] hover:from-[#16A085]/80 hover:to-[#1ABC9C]/80"
                >
                  {isAccepting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terima Project ({selectedItems.length} item)
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
    </div>
  )
}
