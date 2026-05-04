'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Handshake, Users, DollarSign, TrendingUp, Eye, MousePointer2, Calendar, CheckCircle, XCircle, Clock, Plus, FileText, Globe, ArrowRight, Loader2 } from 'lucide-react'

// Types
interface PartnershipRequest {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  partnershipType: string
  description: string
  status: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  partnerId: string | null
  createdAt: string
  updatedAt: string
}

interface Partner {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  address: string | null
  type: string
  status: string
  contractStart: string | null
  contractEnd: string | null
  commissionRate: number | null
  totalRevenue: number
  logoUrl: string | null
  websiteUrl: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  ads: Ad[]
  catalogs: ProductCatalog[]
}

interface Ad {
  id: string
  partnerId: string
  title: string
  titleIndo: string | null
  titleEng: string | null
  description: string | null
  descriptionIndo: string | null
  descriptionEng: string | null
  type: string
  imageUrl: string | null
  imageUrls: string | null
  linkUrl: string | null
  placement: string | null
  status: string
  startDate: string
  endDate: string | null
  priority: number
  views: number
  clicks: number
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

interface ProductCatalog {
  id: string
  partnerId: string
  name: string
  nameIndo: string | null
  nameEng: string | null
  category: string
  subCategory: string | null
  description: string | null
  descriptionIndo: string | null
  descriptionEng: string | null
  unit: string
  price: number | null
  specifications: string | null
  images: string | null
  datasheetUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

type ViewMode = 'overview' | 'requests' | 'partners' | 'ads'

export default function PartnershipPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>('overview')

  // Data states
  const [requests, setRequests] = useState<PartnershipRequest[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [requestsRes, partnersRes] = await Promise.all([
          fetch('/api/partnership/requests'),
          fetch('/api/partnership/partners')
        ])

        const requestsData = await requestsRes.json()
        const partnersData = await partnersRes.json()

        if (requestsData.success) setRequests(requestsData.data)
        else setError('Failed to load partnership requests')

        if (partnersData.success) setPartners(partnersData.data)
        else setError('Failed to load partners')
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Stats calculations
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const activePartners = partners.filter(p => p.status === 'active').length
  const totalAds = partners.reduce((sum, p) => sum + p.ads.length, 0)
  const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0)

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />{status}</Badge>
      case 'under_review':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30"><FileText className="w-3 h-3 mr-1" />{status}</Badge>
      case 'approved':
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>
      case 'rejected':
      case 'expired':
      case 'suspended':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Format partnership type label
  const getPartnershipTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'product-advertisement': 'Product Advertisement',
      'contractor-services': 'Contractor Services',
      'material-supplier': 'Material Supplier',
      'product-supplier': 'Product Supplier',
      'contractor': 'Contractor',
      'other': 'Other'
    }
    return labels[type] || type
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Handle request approval/rejection
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const res = await fetch(`/api/partnership/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNotes: notes })
      })

      if (res.ok) {
        // Refresh data
        const [requestsRes, partnersRes] = await Promise.all([
          fetch('/api/partnership/requests'),
          fetch('/api/partnership/partners')
        ])

        const requestsData = await requestsRes.json()
        const partnersData = await partnersRes.json()

        if (requestsData.success) setRequests(requestsData.data)
        if (partnersData.success) setPartners(partnersData.data)
      }
    } catch (error) {
      console.error('Error handling request:', error)
    }
  }

  // Redirect to admin if not authorized
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#9B59B6] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Error</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white"
          >
            Retry
          </Button>
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
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Partnership</h1>
                <p className="text-xs text-gray-400">Management</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button
                onClick={() => setViewMode('overview')}
                variant={viewMode === 'overview' ? 'default' : 'ghost'}
                className={`w-full justify-start ${viewMode === 'overview' ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                onClick={() => setViewMode('requests')}
                variant={viewMode === 'requests' ? 'default' : 'ghost'}
                className={`w-full justify-start ${viewMode === 'requests' ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Requests
                {pendingRequests > 0 && (
                  <Badge className="ml-auto bg-[#E74C3C] text-white">{pendingRequests}</Badge>
                )}
              </Button>
              <Button
                onClick={() => setViewMode('partners')}
                variant={viewMode === 'partners' ? 'default' : 'ghost'}
                className={`w-full justify-start ${viewMode === 'partners' ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <Users className="w-4 h-4 mr-2" />
                Partners
              </Button>
              <Button
                onClick={() => setViewMode('ads')}
                variant={viewMode === 'ads' ? 'default' : 'ghost'}
                className={`w-full justify-start ${viewMode === 'ads' ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Ads & Catalogs
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
                <h2 className="text-3xl font-bold text-white mb-2">
                  Partnership Management
                </h2>
                <p className="text-gray-400">
                  Manage partnership requests, partners, and advertisements
                </p>
              </div>
              <Button
                onClick={() => router.push('/admin')}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                Back to Admin
              </Button>
            </div>

            {/* Overview */}
            {viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#6B5B95]/10 border border-[#6B5B95]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        Pending Requests
                        <FileText className="w-4 h-4 text-[#6B5B95]" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{pendingRequests}</div>
                      <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#9B59B6]/20 to-[#9B59B6]/10 border border-[#9B59B6]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        Active Partners
                        <Users className="w-4 h-4 text-[#9B59B6]" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{activePartners}</div>
                      <p className="text-xs text-gray-400 mt-1">Currently active</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#E74C3C]/20 to-[#E74C3C]/10 border border-[#E74C3C]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        Total Ads
                        <Globe className="w-4 h-4 text-[#E74C3C]" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{totalAds}</div>
                      <p className="text-xs text-gray-400 mt-1">Across all partners</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/10 border border-[#F39C12]/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        Total Revenue
                        <DollarSign className="w-4 h-4 text-[#F39C12]" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                      <p className="text-xs text-gray-400 mt-1">From partnerships</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Partnership Requests</CardTitle>
                      <CardDescription className="text-gray-400">Latest requests awaiting action</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {requests.slice(0, 5).length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No requests yet</p>
                      ) : (
                        <div className="space-y-4">
                          {requests.slice(0, 5).map((request) => (
                            <div key={request.id} className="flex items-start justify-between p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-[#F39C12]" />
                                  <p className="text-sm font-medium text-white">{request.companyName}</p>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{request.contactPerson} • {request.email}</p>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(request.status)}
                                  <span className="text-xs text-gray-500">{formatDate(request.createdAt)}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewMode('requests')}
                                className="text-[#6B5B95] hover:text-[#9B59B6]"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Partners</CardTitle>
                      <CardDescription className="text-gray-400">Partners with highest revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {partners.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No partners yet</p>
                      ) : (
                        <div className="space-y-4">
                          {partners
                            .sort((a, b) => b.totalRevenue - a.totalRevenue)
                            .slice(0, 5)
                            .map((partner) => (
                              <div key={partner.id} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{partner.companyName}</p>
                                    <p className="text-xs text-gray-400">{partner.type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[#F39C12]">{formatCurrency(partner.totalRevenue)}</p>
                                  <p className="text-xs text-gray-400">{partner.ads.length} ads</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Requests View */}
            {viewMode === 'requests' && (
              <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Partnership Requests</CardTitle>
                  <CardDescription className="text-gray-400">Review and manage partnership requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No partnership requests yet</p>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <Card key={request.id} className="bg-[#1E1E1E] border border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-5 h-5 text-[#F39C12]" />
                                  <h3 className="text-lg font-semibold text-white">{request.companyName}</h3>
                                  {getStatusBadge(request.status)}
                                </div>
                                <p className="text-sm text-gray-400 mb-1">{request.contactPerson} • {request.email}</p>
                                {request.phone && <p className="text-sm text-gray-400">{request.phone}</p>}
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>

                            <div className="mb-4">
                              <Badge variant="outline" className="mb-2">
                                {getPartnershipTypeLabel(request.partnershipType)}
                              </Badge>
                              <p className="text-sm text-gray-300">{request.description}</p>
                            </div>

                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestAction(request.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {request.reviewedAt && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-xs text-gray-400">
                                  Reviewed on {formatDate(request.reviewedAt)}
                                  {request.reviewNotes && `: ${request.reviewNotes}`}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Partners View */}
            {viewMode === 'partners' && (
              <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Active Partners</CardTitle>
                    <CardDescription className="text-gray-400">Manage partner accounts and details</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partner
                  </Button>
                </CardHeader>
                <CardContent>
                  {partners.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No partners yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {partners.map((partner) => (
                        <Card key={partner.id} className="bg-[#1E1E1E] border border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-white truncate">{partner.companyName}</h3>
                                <p className="text-sm text-gray-400">{partner.contactPerson}</p>
                              </div>
                              {getStatusBadge(partner.status)}
                            </div>

                            <div className="space-y-2 mb-4">
                              <p className="text-sm text-gray-300">
                                <span className="text-gray-500">Type:</span> {getPartnershipTypeLabel(partner.type)}
                              </p>
                              <p className="text-sm text-gray-300">
                                <span className="text-gray-500">Email:</span> {partner.email}
                              </p>
                              {partner.contractStart && (
                                <p className="text-sm text-gray-300">
                                  <span className="text-gray-500">Contract:</span> {formatDate(partner.contractStart)} - {formatDate(partner.contractEnd)}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="p-2 bg-[#6B5B95]/10 rounded-lg">
                                <p className="text-xs text-gray-400">Ads</p>
                                <p className="text-lg font-bold text-[#6B5B95]">{partner.ads.length}</p>
                              </div>
                              <div className="p-2 bg-[#F39C12]/10 rounded-lg">
                                <p className="text-xs text-gray-400">Revenue</p>
                                <p className="text-sm font-bold text-[#F39C12]">{formatCurrency(partner.totalRevenue)}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 border-[#6B5B95]/30 text-[#6B5B95] hover:bg-[#6B5B95]/10">
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ads & Catalogs View */}
            {viewMode === 'ads' && (
              <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Ads & Product Catalogs</CardTitle>
                    <CardDescription className="text-gray-400">Manage advertisements and product catalogs</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ad
                  </Button>
                </CardHeader>
                <CardContent>
                  {totalAds === 0 ? (
                    <p className="text-gray-400 text-center py-8">No ads or catalogs yet</p>
                  ) : (
                    <div className="space-y-4">
                      {partners.map((partner) =>
                        partner.ads.map((ad) => (
                          <Card key={ad.id} className="bg-[#1E1E1E] border border-gray-700">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  {ad.imageUrl && (
                                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={ad.imageUrl}
                                        alt={ad.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{ad.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{partner.companyName}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {getStatusBadge(ad.status)}
                                      <Badge variant="outline">{ad.type}</Badge>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500">{formatDate(ad.createdAt)}</p>
                              </div>

                              {ad.description && (
                                <p className="text-sm text-gray-300 mb-4">{ad.description}</p>
                              )}

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-[#6B5B95]" />
                                  <div>
                                    <p className="text-xs text-gray-400">Views</p>
                                    <p className="text-sm font-semibold text-white">{ad.views}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MousePointer2 className="w-4 h-4 text-[#E74C3C]" />
                                  <div>
                                    <p className="text-xs text-gray-400">Clicks</p>
                                    <p className="text-sm font-semibold text-white">{ad.clicks}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#F39C12]" />
                                  <div>
                                    <p className="text-xs text-gray-400">Period</p>
                                    <p className="text-sm font-semibold text-white">
                                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-[#6B5B95]/30 text-[#6B5B95] hover:bg-[#6B5B95]/10">
                                  View Analytics
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
