'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Building2, Users, FileText, Settings, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    teamMembers: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch stats individually with error handling
      const [servicesRes, projectsRes, teamMembersRes] = await Promise.all([
        fetch('/api/admin/services').catch(e => ({ ok: false })),
        fetch('/api/admin/projects').catch(e => ({ ok: false })),
        fetch('/api/admin/team-members').catch(e => ({ ok: false }))
      ])

      if (servicesRes.ok && 'json' in servicesRes) {
        const data = await servicesRes.json()
        setStats(prev => ({ ...prev, services: Array.isArray(data) ? data.length : 0 }))
      }
      if (projectsRes.ok && 'json' in projectsRes) {
        const data = await projectsRes.json()
        setStats(prev => ({ ...prev, projects: Array.isArray(data) ? data.length : 0 }))
      }
      if (teamMembersRes.ok && 'json' in teamMembersRes) {
        const data = await teamMembersRes.json()
        setStats(prev => ({ ...prev, teamMembers: Array.isArray(data) ? data.length : 0 }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-400">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-[#9B59B6]" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {session?.user?.name || 'Admin'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6B5B95]" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.services}</div>
              <CardDescription className="text-gray-400">
                Total layanan aktif
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9B59B6]" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.teamMembers}</div>
              <CardDescription className="text-gray-400">
                Total anggota tim
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#9B59B6]" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.projects}</div>
              <CardDescription className="text-gray-400">
                Total proyek
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700 hover:border-[#6B5B95] transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white">Kelola Layanan</CardTitle>
              <CardDescription className="text-gray-400">
                Tambah, edit, atau hapus layanan arsitektur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Manajemen katalog layanan yang tersedia di website.
              </p>
              <Button className="w-full bg-[#6B5B95] hover:bg-[#5a4a7e] text-white">
                Buka Layanan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-[#6B5B95] transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white">Kelola Portfolio</CardTitle>
              <CardDescription className="text-gray-400">
                Kelola showcase proyek arsitektur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Tambah, edit, atau hapus portfolio yang ditampilkan.
              </p>
              <Button className="w-full bg-[#6B5B95] hover:bg-[#5a4a7e] text-white">
                Buka Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#9B5B6]" />
              Pengaturan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Akses pengaturan website termasuk:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Kelola konten (About, Services, Team, Contact)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Manajemen member yang mendaftar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Setup aturan pricing dan fee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Manajemen operasional hours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
