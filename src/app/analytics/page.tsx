'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Eye, MousePointer2, Calendar, Download, FileText, Globe, Building2, Clock, ArrowUpRight, ArrowDownRight, Loader2, Handshake } from 'lucide-react'

// Types
interface AnalyticsData {
  id: string
  date: string
  metricName: string
  metricValue: number
  breakdown: string | null
  createdAt: string
}

interface UserSession {
  id: string
  userId: string | null
  sessionId: string
  ipAddress: string | null
  userAgent: string | null
  entryPage: string | null
  exitPage: string | null
  pageViews: number
  duration: number | null
  bounced: boolean
  deviceType: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  startedAt: string
  endedAt: string | null
}

type TimeRange = '7d' | '30d' | '90d' | 'all'

export default function AnalyticsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [loading, setLoading] = useState(true)

  // Mock data for charts (in production, fetch from API)
  const [pageViewsData, setPageViewsData] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any[]>([])

  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 100,
        visitors: Math.floor(Math.random() * 300) + 50,
        unique: Math.floor(Math.random() * 200) + 30
      })
    }

    setPageViewsData(data)

    // Device distribution
    setUserStats([
      { name: 'Desktop', value: 45, color: '#6B5B95' },
      { name: 'Mobile', value: 40, color: '#E74C3C' },
      { name: 'Tablet', value: 15, color: '#F39C12' }
    ])

    setLoading(false)
  }

  useEffect(() => {
    // Generate mock data based on time range
    generateMockData()
  }, [timeRange])

  // Calculate totals
  const totalPageViews = pageViewsData.reduce((sum, d) => sum + d.views, 0)
  const totalVisitors = pageViewsData.reduce((sum, d) => sum + d.visitors, 0)
  const uniqueVisitors = pageViewsData.reduce((sum, d) => sum + d.unique, 0)
  const avgSessionDuration = Math.floor(Math.random() * 300) + 60 // seconds

  // Calculate trends
  const trend = Math.random() > 0.5 ? 'up' : 'down'
  const trendValue = Math.floor(Math.random() * 20) + 5

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  // Redirect if not authorized
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#9B59B6] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.push('/admin')
    return null
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#2a2a2a] border-r border-gray-700 flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-xl flex items-center justify-center">
                <BarChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Analytics</h1>
                <p className="text-xs text-gray-400">Monitoring & Reports</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => router.push('/partnership')}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Partnership
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => router.push('/admin')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
                <p className="text-gray-400">Monitor website performance and user behavior</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="flex bg-[#2a2a2a] rounded-lg p-1">
                  {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? 'default' : 'ghost'}
                      onClick={() => setTimeRange(range)}
                      className={
                        timeRange === range
                          ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                          : 'text-gray-400 hover:text-white'
                      }
                    >
                      {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="border-[#6B5B95]/30 text-[#6B5B95] hover:bg-[#6B5B95]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button
                  onClick={() => router.push('/admin')}
                  className="bg-gray-700 text-white hover:bg-gray-600"
                >
                  Back to Admin
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#6B5B95]/10 border border-[#6B5B95]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                    Total Page Views
                    <Eye className="w-4 h-4 text-[#6B5B95]" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{formatNumber(totalPageViews)}</div>
                    <Badge
                      variant="outline"
                      className={
                        trend === 'up'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }
                    >
                      {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {trendValue}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">vs previous period</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#9B59B6]/20 to-[#9B59B6]/10 border border-[#9B59B6]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                    Unique Visitors
                    <Users className="w-4 h-4 text-[#9B59B6]" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{formatNumber(uniqueVisitors)}</div>
                    <Badge
                      variant="outline"
                      className={
                        trend === 'up'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }
                    >
                      {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {trendValue - 2}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">vs previous period</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#E74C3C]/20 to-[#E74C3C]/10 border border-[#E74C3C]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                    Avg. Session Duration
                    <Clock className="w-4 h-4 text-[#E74C3C]" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">
                      {Math.floor(avgSessionDuration / 60)}:{(avgSessionDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        trend === 'up'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }
                    >
                      {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {trendValue + 5}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">minutes per session</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/10 border border-[#F39C12]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                    Total Sessions
                    <Globe className="w-4 h-4 text-[#F39C12]" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">{formatNumber(totalVisitors)}</div>
                    <Badge
                      variant="outline"
                      className={
                        trend === 'up'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }
                    >
                      {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {trendValue - 3}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">vs previous period</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Page Views Chart */}
              <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Page Views Over Time</CardTitle>
                  <CardDescription className="text-gray-400">Daily page views and unique visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pageViewsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickFormatter={formatDate}
                      />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #444',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#6B5B95"
                        strokeWidth={2}
                        name="Page Views"
                        dot={{ fill: '#6B5B95' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#E74C3C"
                        strokeWidth={2}
                        name="Visitors"
                        dot={{ fill: '#E74C3C' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Distribution */}
              <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Device Distribution</CardTitle>
                  <CardDescription className="text-gray-400">User sessions by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #444',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    {userStats.map((stat) => (
                      <div key={stat.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span className="text-sm text-gray-300">{stat.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Pages</CardTitle>
                <CardDescription className="text-gray-400">Most visited pages on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: '/', views: Math.floor(Math.random() * 1000) + 500, change: 12 },
                    { page: '/services', views: Math.floor(Math.random() * 500) + 200, change: 8 },
                    { page: '/portfolio', views: Math.floor(Math.random() * 400) + 150, change: -5 },
                    { page: '/about', views: Math.floor(Math.random() * 300) + 100, change: 3 },
                    { page: '/contact', views: Math.floor(Math.random() * 250) + 80, change: 15 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.page}</p>
                          <p className="text-xs text-gray-400">{formatNumber(item.views)} page views</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.change > 0
                            ? 'bg-green-500/10 text-green-500 border-green-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }
                      >
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
