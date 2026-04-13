import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const orders = await db.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        clientName: true,
        status: true,
        paymentStage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      orders: orders
    })
  } catch (error) {
    console.error('Error verifying cleanup:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
