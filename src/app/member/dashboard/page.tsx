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
  DollarSign,
  User,
  LogOut,
  CheckCircle,
  Clock,
  MessageSquare,
  Video,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Home,
  Utensils,
  Briefcase,
  Hospital,
  Inbox,
  Send,
  Settings,
  Users,
  Image as ImageIcon,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Layers,
  Shield,
  Wrench,
  Zap,
  PencilRuler,
  Calculator
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
  dpPaidAmount: number | null
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
  dpPaidAmount: number | null
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

type NavItem = 'dashboard' | 'inbox' | 'outbox' | 'chat' | 'video' | 'profile' | 'portfolio'

export default function ArchitectDashboard() {
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
  const [isClaiming, setIsClaiming] = useState(false)

  const [professionSelectionDialogOpen, setProfessionSelectionDialogOpen] = useState(false)
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>(['architect'])

  const [searchQuery, setSearchQuery] = useState("")
  const [inboxMessages, setInboxMessages] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/member/login")
    } else if (status === "authenticated") {
      // Validate user profession
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.member) {
            const userProfession = data.member.profession
            if (userProfession !== 'architect') {
              // Redirect to correct dashboard based on profession
              const professionRoutes: Record<string, string> = {
                'structure': '/structure/dashboard',
                'mep': '/mep/dashboard',
                'drafter': '/drafter/dashboard',
                'qs': '/qs/dashboard',
                'licensed-architect': '/licensed-architect/dashboard',
                'licensed_architect': '/licensed-architect/dashboard'
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

      const activeRes = await fetch('/api/architect/active-projects')
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveProjects(activeData.activeProjects || [])
      }

      const availableRes = await fetch('/api/architect/projects')
      if (availableRes.ok) {
        const availableData = await availableRes.json()
        setAvailableProjects(availableData.availableProjects || [])
      }

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

  const handleClaimProject = (orderId: string) => {
    setSelectedAvailableProject(availableProjects.find(p => p.id === orderId) || null)
    setProfessionSelectionDialogOpen(true)
  }

  const handleConfirmClaimProject = async () => {
    if (!selectedAvailableProject) return

    setIsClaiming(true)
    try {
      const response = await fetch('/api/architect/claim-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedAvailableProject.id,
          professions: selectedProfessions
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: data.message || 'Project berhasil diambil!' })
        setProfessionSelectionDialogOpen(false)
        setProjectDetailDialogOpen(false)
        setSelectedProfessions(['architect'])
        if (data.redirectUrl) {
          router.push(data.redirectUrl)
        }
        fetchData()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Gagal mengambil project', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error claiming project:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsClaiming(false)
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

  const PROFSSIONS = [
    { id: 'structure', name: 'Structure Engineer', icon: <Wrench className="w-4 h-4" /> },
    { id: 'mep', name: 'MEP Engineer', icon: <Zap className="w-4 h-4" /> },
    { id: 'drafter', name: 'Drafter', icon: <PencilRuler className="w-4 h-4" /> },
    { id: 'qs', name: 'Quantity Surveyor', icon: <Calculator className="w-4 h-4" /> },
    { id: 'licensed-architect', name: 'Licensed Architect', icon: <Shield className="w-4 h-4" /> }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1A1A1A] border-r border-gray-800 flex flex-col fixed h-full">
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="p-6 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                ARCHI-COLL
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Platform Kolaborasi Arsitektur</p>
            </div>
          </div>
        </div>

        {/* User Profile Brief */}
        <div className="p-4 border-b border-gray-800 mx-4 mt-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-purple-500/30">
              <AvatarImage src={member?.profileImage || ""} />
              <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold text-lg">
                {member?.user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-sm">{member?.user?.name || 'Architect'}</p>
              <p className="text-xs text-purple-400 capitalize">Lead Architect</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            onClick={() => setActiveNav('dashboard')}
            variant={activeNav === 'dashboard' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'dashboard' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>

          <Button
            onClick={() => setActiveNav('inbox')}
            variant={activeNav === 'inbox' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'inbox' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4 mr-3" />
            Inbox
            {getUnreadCount() > 0 && (
              <Badge className="ml-auto bg-red-500 text-white text-xs">{getUnreadCount()}</Badge>
            )}
          </Button>

          <Button
            onClick={() => setActiveNav('outbox')}
            variant={activeNav === 'outbox' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'outbox' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 mr-3" />
            Outbox
          </Button>

          <Button
            onClick={() => setActiveNav('chat')}
            variant={activeNav === 'chat' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'chat' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Chat
          </Button>

          <Button
            onClick={() => setActiveNav('video')}
            variant={activeNav === 'video' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'video' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 mr-3" />
            Video Call
          </Button>

          <Button
            onClick={() => setActiveNav('portfolio')}
            variant={activeNav === 'portfolio' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'portfolio' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-3" />
            Portfolio
          </Button>

          <Button
            onClick={() => setActiveNav('profile')}
            variant={activeNav === 'profile' ? 'secondary' : 'ghost'}
            className={`w-full justify-start transition-all duration-200 ${
              activeNav === 'profile' 
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 mr-3" />
            Profil
          </Button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        {/* Dashboard View */}
        {activeNav === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  Selamat Datang, <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">{member?.user?.name || "Architect"}</span>!
                </h2>
                <p className="text-gray-400 text-lg">
                  {activeProjects.length > 0
                    ? `Anda sedang memimpin ${activeProjects.length} project aktif. ${availableProjects.length > 0 ? `${availableProjects.length} project lain menunggu.` : ''}`
                    : availableProjects.length > 0
                    ? `${availableProjects.length} project menunggu untuk diambil`
                    : "Tidak ada project yang tersedia saat ini"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.open('https://archi-coll.com', '_blank')}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Website Utama
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 border-[#6366F1]/30 hover:border-[#6366F1]/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">Project Aktif</CardTitle>
                    <div className="w-10 h-10 bg-[#6366F1]/20 rounded-lg flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 text-[#6366F1]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Sedang dikerjakan</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#10B981]/20 to-[#34D399]/20 border-[#10B981]/30 hover:border-[#10B981]/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">Project Tersedia</CardTitle>
                    <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#10B981]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{availableProjects.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Siap diambil</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#F59E0B]/20 to-[#FBBF24]/20 border-[#F59E0B]/30 hover:border-[#F59E0B]/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">Pesan Baru</CardTitle>
                    <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                      <Inbox className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{getUnreadCount()}</p>
                  <p className="text-xs text-gray-500 mt-1">Belum dibaca</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#EC4899]/20 to-[#F472B6]/20 border-[#EC4899]/30 hover:border-[#EC4899]/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Pendapatan</CardTitle>
                    <div className="w-10 h-10 bg-[#EC4899]/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#EC4899]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(activeProjects.reduce((sum, p) => sum + p.designFee, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Dari project aktif</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      Project Aktif
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Project yang sedang Anda pimpin dan kerjakan
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-[#6366F1]/20 text-[#8B5CF6] border-[#6366F1]/30">
                    {activeProjects.length} project
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="bg-[#1A1A1A] border-gray-800 hover:border-[#6366F1]/50 transition-all duration-300 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 h-1"></div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-xl flex items-center gap-2">
                              {project.projectName || `Project ${project.orderNumber}`}
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-1">
                              {project.orderNumber} • {new Date(project.createdAt).toLocaleDateString('id-ID')}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} text-sm`}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Klien</p>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#6366F1]" />
                                <p className="text-white font-medium">{project.clientName}</p>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Kategori</p>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#6366F1]/20 rounded flex items-center justify-center">
                                  {getCategoryIcon(project.buildingCategory)}
                                </div>
                                <p className="text-white font-medium capitalize">{project.buildingCategory}</p>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Design Fee</p>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[#10B981]" />
                                <p className="text-white font-bold">{formatCurrency(project.designFee)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Luas Tanah</p>
                              <p className="text-white font-medium">{project.landArea} m²</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Luas Bangunan</p>
                              <p className="text-white font-medium">{project.buildingArea} m²</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Model</p>
                              <p className="text-white font-medium">{project.buildingModel}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Lantai</p>
                              <p className="text-white font-medium">{project.buildingFloors} lantai</p>
                            </div>
                          </div>

                          {project.assignedProfessions && project.assignedProfessions.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Tim Terlibat</p>
                              <div className="flex flex-wrap gap-2">
                                {project.assignedProfessions.map((prof) => {
                                  const profInfo = PROFSSIONS.find(p => p.id === prof)
                                  return (
                                    <Badge key={prof} variant="outline" className="text-xs bg-gray-800/50">
                                      {profInfo?.icon}
                                      <span className="ml-1">{profInfo?.name || prof}</span>
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {project.description && (
                            <div className="bg-gray-800/30 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-1">Deskripsi Project</p>
                              <p className="text-gray-300 text-sm">{project.description}</p>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-400">Progress Project</p>
                              <span className="text-white font-bold">{project.progressPercentage}%</span>
                            </div>
                            <Progress value={project.progressPercentage} className="h-2" />
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                              onClick={() => router.push(`/report-monitoring/${project.id}`)}
                              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white shadow-lg shadow-purple-500/25"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              Buka Report & Monitoring
                            </Button>

                            <Button
                              onClick={() => {
                                setSelectedActiveProject(project)
                                setProjectDetailDialogOpen(true)
                              }}
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Kelola Tim
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Projects */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    Project Tersedia
                  </h3>
                  <p className="text-gray-400 mt-1">
                    Project yang dapat Anda ambil untuk dikerjakan
                  </p>
                </div>
                {availableProjects.length > 0 && (
                  <Badge variant="outline" className="bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30">
                    {availableProjects.length} project tersedia
                  </Badge>
                )}
              </div>

              {availableProjects.length === 0 ? (
                <Card className="bg-[#1A1A1A] border-gray-800">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Tidak Ada Project Tersedia
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Saat ini tidak ada project baru yang tersedia. Project baru akan muncul setelah klien membayar DP.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableProjects.map((project) => (
                    <Card key={project.id} className="bg-[#1A1A1A] border-gray-800 hover:border-[#10B981]/50 transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#10B981]/20 to-[#34D399]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                          <Badge className="bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30">
                            DP Paid
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {project.description && (
                            <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#6366F1]" />
                                <div>
                                  <p className="text-xs text-gray-500">Klien</p>
                                  <p className="text-sm text-white font-medium">{project.clientName}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[#10B981]" />
                                <div>
                                  <p className="text-xs text-gray-500">Design Fee</p>
                                  <p className="text-sm text-white font-bold">{formatCurrency(project.designFee)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#F59E0B]" />
                                <div>
                                  <p className="text-xs text-gray-500">Luas Tanah</p>
                                  <p className="text-sm text-white font-medium">{project.landArea} m²</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                                <div>
                                  <p className="text-xs text-gray-500">Luas Bangunan</p>
                                  <p className="text-sm text-white font-medium">{project.buildingArea} m²</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-800">
                            <Button
                              onClick={() => handleClaimProject(project.id)}
                              className="w-full bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#059669] hover:to-[#10B981] text-white shadow-lg shadow-green-500/25"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ambil Project Ini
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
            <h2 className="text-3xl font-bold text-white">Inbox</h2>
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="p-6">
                {inboxMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg">Tidak ada pesan masuk</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {inboxMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          msg.isRead 
                            ? 'bg-gray-800/30 border-gray-700' 
                            : 'bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border-[#6366F1]/30'
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
                            <Badge className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white">Baru</Badge>
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
            <h2 className="text-3xl font-bold text-white">Profil</h2>
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24 ring-4 ring-purple-500/30">
                    <AvatarImage src={member.profileImage || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-3xl font-bold">
                      {member.user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Nama Lengkap</p>
                      <p className="text-white text-lg font-medium">{member.user?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{member.user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Profesi</p>
                      <p className="text-white capitalize">Lead Architect</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={member.status === 'active' ? 'bg-[#10B981]/20 text-[#34D399]' : 'bg-gray-500/20 text-gray-400'}>
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
        {(activeNav === 'outbox' || activeNav === 'chat' || activeNav === 'video' || activeNav === 'portfolio') && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white capitalize">{activeNav.replace('_', ' ')}</h2>
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-gray-600" />
                </div>
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

      {/* Profession Selection Dialog */}
      <Dialog open={professionSelectionDialogOpen} onOpenChange={setProfessionSelectionDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Pilih Profesi yang Dibutuhkan
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih profesi yang akan Anda ajak berkolaborasi untuk project ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PROFSSIONS.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => {
                    if (prof.id === 'architect') return
                    setSelectedProfessions(prev =>
                      prev.includes(prof.id)
                        ? prev.filter(id => id !== prof.id)
                        : [...prev, prof.id]
                    )
                  }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedProfessions.includes(prof.id) || prof.id === 'architect'
                      ? 'bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 border-[#6366F1]'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  } ${prof.id === 'architect' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedProfessions.includes(prof.id) || prof.id === 'architect'}
                      disabled={prof.id === 'architect'}
                      className="border-gray-600"
                    />
                    <div className="flex items-center gap-2">
                      {prof.icon}
                      <span className="font-medium">{prof.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button
                onClick={handleConfirmClaimProject}
                disabled={isClaiming}
                className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E8] hover:to-[#7C5BE8] text-white"
              >
                {isClaiming ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ambil Project dengan {selectedProfessions.length} Profesi
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setProfessionSelectionDialogOpen(false)
                  setSelectedProfessions(['architect'])
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
