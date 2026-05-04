import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current date for monthly comparisons
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total partners
    const totalPartners = await db.partner.count()
    const activePartners = await db.partner.count({
      where: { status: 'active' }
    })

    // Get new partners this month
    const newPartnersThisMonth = await db.partner.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Get ads statistics
    const totalAds = await db.ad.count()
    const activeAds = await db.ad.count({
      where: {
        status: 'active',
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    })

    // Get ad views and clicks
    const ads = await db.ad.findMany()
    const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0)
    const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)

    // Get catalog items
    const totalCatalogItems = await db.productCatalog.count()
    const activeCatalogItems = await db.productCatalog.count({
      where: { status: 'active' }
    })

    // Get partnership requests
    const pendingRequests = await db.partnershipRequest.count({
      where: { status: 'pending' }
    })

    // Get partner revenue
    const partners = await db.partner.findMany({
      where: { status: 'active' }
    })
    const totalPartnerRevenue = partners.reduce((sum, p) => sum + (p.totalRevenue || 0), 0)

    return NextResponse.json({
      totalPartners,
      activePartners,
      newPartnersThisMonth,
      totalAds,
      activeAds,
      totalViews,
      totalClicks,
      totalCatalogItems,
      activeCatalogItems,
      pendingRequests,
      totalPartnerRevenue
    })
  } catch (error) {
    console.error('Error fetching marketing stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing statistics' },
      { status: 500 }
    )
  }
}
