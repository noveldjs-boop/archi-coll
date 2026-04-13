"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Award,
  Calendar,
  Briefcase,
  MessageSquare,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Shield,
  FileText,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Clock
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface HRDStats {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  memberGrowth: number
  pendingRegistrations: number
  activeProjects: number
  pendingApplications: number
  professionDistribution: Array<{
    profession: string
    count: number
  }>
}

interface Member {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  profession: string
  phone: string
  address: string | null
  experience: number | null
  expertise: string | null
  status: string
  approvedAt: string | null
  createdAt: string
  certificates: Array<{
    id: string
    certificateType: string
    verified: boolean
  }>
  ledProjects: Array<{
    id: string
    titleIndo: string
    status: string
  }>
  assignments: Array<{
    project: {
      id: string
      titleIndo: string
      status: string
    }
  }>
}

export default function HRDDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<HRDStats | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [registrations, setRegistrations] = useState<Member[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [professionFilter, setProfessionFilter] = useState('all')

  // Dialog states
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (status === "authenticated") {
      // Check if user has HRD role
      if (session?.user?.role !== "hrd") {
        // Redirect to appropriate dashboard based on role
        if (session?.user?.role === "finance") {
          router.push("/finance")
        } else if (session?.user?.role === "marketing") {
          router.push("/marketing")
        } else if (session?.user?.role === "editor") {
          router.push("/editor")
        } else {
          // Default to admin portal for other roles
          router.push("/admin/login")
        }
        return
      }
      fetchData()
    }
  }, [status, session, router])

  useEffect(() => {
    fetchMembers()
  }, [statusFilter, professionFilter])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [statsRes, registrationsRes] = await Promise.all([
        fetch('/api/hrd/stats'),
        fetch('/api/hrd/registrations')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (registrationsRes.ok) {
        const registrationsData = await registrationsRes.json()
        setRegistrations(registrationsData.registrations || [])
      }

      fetchMembers()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (professionFilter !== 'all') params.append('profession', professionFilter)

      const response = await fetch(`/api/hrd/members?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleMemberAction = async (action: 'approve' | 'reject' | 'suspend' | 'activate') => {
    if (!selectedMember) return

    setProcessing(true)
    try {
      const response = await fetch('/api/hrd/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          action,
          notes: actionNotes
        })
      })

      if (response.ok) {
        toast({
          title: action === 'approve' ? 'Member disetujui' :
                action === 'reject' ? 'Member ditolak' :
                action === 'suspend' ? 'Member disuspend' : 'Member diaktifkan'
        })
        setMemberDetailDialogOpen(false)
        setSelectedMember(null)
        setActionNotes('')
        fetchData()
      } else {
        toast({ title: 'Gagal memproses member', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error processing member:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setMemberDetailDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await router.push('/admin/login')
      // Clear session after redirect starts
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/admin/login'
    }
  }

  const professions = [
    { id: 'architect', label: 'Desain Arsitek' },
    { id: 'licensed_architect', label: 'Arsitek Berlisensi' },
    { id: 'structure', label: 'Desain Struktur' },
    { id: 'mep', label: 'Desain MEP' },
    { id: 'drafter', label: 'Drafter' },
    { id: 'qs', label: 'QS (Quantity Surveyor)' }
  ]

  const getProfessionLabel = (profession: string) => {
    return professions.find(p => p.id === profession)?.label || profession
  }

  const getProfessionColor = (profession: string) => {
    const colors: Record<string, string> = {
      architect: 'bg-blue-600',
      licensed_architect: 'bg-purple-600',
      structure: 'bg-green-600',
      mep: 'bg-orange-600',
      drafter: 'bg-pink-600',
      qs: 'bg-cyan-600'
    }
    return colors[profession] || 'bg-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">HRD Dashboard</h1>
              <p className="text-sm text-gray-400">ARCHI-COLL Human Resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, {session?.user?.name || "HRD Team"}
          </h2>
          <p className="text-gray-400">
            Kelola anggota tim dan sumber daya manusia ARCHI-COLL
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Members
              </CardTitle>
              <Users className="w-4 h-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalMembers || 0}
              </div>
              <p className={`text-xs mt-1 flex items-center ${stats?.memberGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats?.memberGrowth >= 0 ? '+' : ''}{stats?.memberGrowth?.toFixed(1)}% bulan ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Projects
              </CardTitle>
              <Briefcase className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.activeProjects || 0}
              </div>
              <p className="text-xs text-blue-500 mt-1">
                Proyek aktif
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Requests
              </CardTitle>
              <UserPlus className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.pendingRegistrations || 0}
              </div>
              <p className="text-xs text-yellow-500 mt-1">
                Permintaan pendaftaran
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Project Applications
              </CardTitle>
              <Award className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.pendingApplications || 0}
              </div>
              <p className="text-xs text-purple-500 mt-1">
                Aplikasi pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profession Distribution */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Distribusi Profesi
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sebaran member berdasarkan profesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats?.professionDistribution.map((item) => (
                <div key={item.profession} className="text-center">
                  <div className={`w-16 h-16 rounded-full ${getProfessionColor(item.profession)} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">
                    {getProfessionLabel(item.profession)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Members Management */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members
            </CardTitle>
            <CardDescription className="text-gray-400">
              Kelola semua member tim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-48">
                  <SelectValue placeholder="Filter Profesi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Semua Profesi</SelectItem>
                  {professions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Member</TableHead>
                    <TableHead className="text-gray-300">Profesi</TableHead>
                    <TableHead className="text-gray-300">Pengalaman</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Sertifikat</TableHead>
                    <TableHead className="text-gray-300">Proyek</TableHead>
                    <TableHead className="text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Tidak ada member
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id} className="border-gray-700">
                        <TableCell>
                          <div className="text-white font-medium">{member.user.name || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">{member.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getProfessionColor(member.profession)}>
                            {getProfessionLabel(member.profession)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {member.experience ? `${member.experience} tahun` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              member.status === 'active'
                                ? 'bg-green-600'
                                : member.status === 'pending'
                                ? 'bg-yellow-600'
                                : member.status === 'suspended'
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-white">
                              {member.certificates.filter(c => c.verified).length}/{member.certificates.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-white">
                              {member.ledProjects.length + member.assignments.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-700"
                            onClick={() => handleViewMember(member)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Registrations */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Pendaftaran Pending
            </CardTitle>
            <CardDescription className="text-gray-400">
              Review dan approval pendaftaran member baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="pending" className="data-[state=active]:bg-gray-600">
                  Pending ({registrations.filter(r => r.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-gray-600">
                  Recent ({registrations.filter(r => r.status !== 'pending').length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Nama</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Profesi</TableHead>
                        <TableHead className="text-gray-300">Telepon</TableHead>
                        <TableHead className="text-gray-300">Sertifikat</TableHead>
                        <TableHead className="text-gray-300">Tanggal</TableHead>
                        <TableHead className="text-gray-300">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.filter(r => r.status === 'pending').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Tidak ada pendaftaran pending
                          </TableCell>
                        </TableRow>
                      ) : (
                        registrations.filter(r => r.status === 'pending').map((registration) => (
                          <TableRow key={registration.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">
                              {registration.user.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-white">{registration.user.email}</TableCell>
                            <TableCell>
                              <Badge className={getProfessionColor(registration.profession)}>
                                {getProfessionLabel(registration.profession)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{registration.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gray-500">
                                {registration.certificates.length} sertifikat
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(registration.createdAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-600 text-green-500 hover:bg-green-950"
                                  onClick={() => {
                                    setSelectedMember(registration)
                                    setMemberDetailDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Nama</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Profesi</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Tanggal Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.filter(r => r.status !== 'pending').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            Tidak ada riwayat pendaftaran
                          </TableCell>
                        </TableRow>
                      ) : (
                        registrations.filter(r => r.status !== 'pending').map((registration) => (
                          <TableRow key={registration.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">
                              {registration.user.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-white">{registration.user.email}</TableCell>
                            <TableCell>
                              <Badge className={getProfessionColor(registration.profession)}>
                                {getProfessionLabel(registration.profession)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  registration.status === 'active'
                                    ? 'bg-green-600'
                                    : 'bg-red-600'
                                }
                              >
                                {registration.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {registration.approvedAt
                                ? new Date(registration.approvedAt).toLocaleDateString('id-ID')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Member Detail Dialog */}
      <Dialog open={memberDetailDialogOpen} onOpenChange={setMemberDetailDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review informasi member dan ambil tindakan
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Nama</Label>
                  <p className="text-white font-medium">{selectedMember.user.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedMember.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Telepon</Label>
                  <p className="text-white flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedMember.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Profesi</Label>
                  <Badge className={getProfessionColor(selectedMember.profession)}>
                    {getProfessionLabel(selectedMember.profession)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Pengalaman</Label>
                  <p className="text-white">{selectedMember.experience ? `${selectedMember.experience} tahun` : '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <Badge
                    className={
                      selectedMember.status === 'active'
                        ? 'bg-green-600'
                        : selectedMember.status === 'pending'
                        ? 'bg-yellow-600'
                        : selectedMember.status === 'suspended'
                        ? 'bg-orange-600'
                        : 'bg-red-600'
                    }
                  >
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Tanggal Daftar</Label>
                  <p className="text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedMember.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Tanggal Approval</Label>
                  <p className="text-white">
                    {selectedMember.approvedAt
                      ? new Date(selectedMember.approvedAt).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Address */}
              {selectedMember.address && (
                <div>
                  <Label className="text-gray-400">Alamat</Label>
                  <p className="text-white flex items-start gap-1">
                    <MapPin className="w-4 h-4 mt-1" />
                    {selectedMember.address}
                  </p>
                </div>
              )}

              {/* Certificates */}
              <div>
                <Label className="text-gray-400">Sertifikat</Label>
                <div className="mt-2 space-y-2">
                  {selectedMember.certificates.length === 0 ? (
                    <p className="text-gray-500">Tidak ada sertifikat</p>
                  ) : (
                    selectedMember.certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{cert.certificateType}</span>
                        </div>
                        <Badge
                          className={cert.verified ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {cert.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Projects */}
              {(selectedMember.ledProjects.length > 0 || selectedMember.assignments.length > 0) && (
                <div>
                  <Label className="text-gray-400">Proyek Aktif</Label>
                  <div className="mt-2 space-y-2">
                    {selectedMember.ledProjects.map((project) => (
                      <div key={project.id} className="flex items-center gap-2 bg-gray-700/50 p-3 rounded">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{project.titleIndo}</span>
                        <Badge className="bg-blue-600">{project.status}</Badge>
                      </div>
                    ))}
                    {selectedMember.assignments.map((assignment) => (
                      <div key={assignment.project.id} className="flex items-center gap-2 bg-gray-700/50 p-3 rounded">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{assignment.project.titleIndo}</span>
                        <Badge className="bg-purple-600">{assignment.project.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label className="text-gray-400">Catatan</Label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk member ini..."
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  rows={3}
                />
              </div>

              {/* Actions */}
              {selectedMember.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMemberAction('reject')}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-500 hover:bg-red-950"
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleMemberAction('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                </div>
              )}

              {selectedMember.status === 'active' && (
                <Button
                  onClick={() => handleMemberAction('suspend')}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-500 hover:bg-orange-950"
                  disabled={processing}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend Member
                </Button>
              )}

              {selectedMember.status === 'suspended' && (
                <Button
                  onClick={() => handleMemberAction('activate')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={processing}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Aktifkan Kembali
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
