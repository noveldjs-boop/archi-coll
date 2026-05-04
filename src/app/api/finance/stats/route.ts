import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current date for monthly comparisons
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total revenue from verified payments
    const allPayments = await db.payment.findMany({
      where: {
        verified: true
      },
      include: {
        order: true
      }
    })

    const currentMonthPayments = allPayments.filter(p =>
      p.paidAt && new Date(p.paidAt) >= startOfMonth
    )

    const lastMonthPayments = allPayments.filter(p =>
      p.paidAt && new Date(p.paidAt) >= startOfLastMonth && new Date(p.paidAt) < endOfLastMonth
    )

    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Calculate revenue growth
    let revenueGrowth = 0
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    }

    // Get pending payments
    const pendingPayments = await db.payment.findMany({
      where: {
        verified: false
      },
      include: {
        order: {
          include: {
            client: true
          }
        }
      }
    })

    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Get total orders
    const totalOrders = await db.order.count()

    // Get orders this month and last month
    const currentMonthOrders = await db.order.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const lastMonthOrders = await db.order.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    })

    // Calculate order growth
    let orderGrowth = 0
    if (lastMonthOrders > 0) {
      orderGrowth = ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
    }

    // Get active partners
    const activePartners = await db.partner.count({
      where: {
        status: 'active'
      }
    })

    // Get partners this month
    const newPartnersThisMonth = await db.partner.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    return NextResponse.json({
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
      totalPendingAmount,
      pendingPaymentsCount: pendingPayments.length,
      totalOrders,
      currentMonthOrders,
      lastMonthOrders,
      orderGrowth,
      activePartners,
      newPartnersThisMonth,
      pendingPayments: pendingPayments.map(p => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        paidAt: p.paidAt,
        paymentMethod: p.paymentMethod,
        orderNumber: p.order.orderNumber,
        clientName: p.order.clientName,
        clientEmail: p.order.client?.user?.email
      }))
    })
  } catch (error) {
    console.error('Error fetching finance stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finance statistics' },
      { status: 500 }
    )
  }
}
