import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch client inbox messages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Fetch client orders
    const orders = await db.order.findMany({
      where: { clientId },
      select: { id: true, orderNumber: true, buildingCategory: true, status: true }
    })

    const orderIds = orders.map(o => o.id)

    // Fetch all messages related to client's orders
    const messages = await db.clientMessage.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true
          }
        }
      }
    })

    // Group messages by type (inbox/outbox)
    const clientInbox = messages.filter(m => m.senderType === 'architect')
    const clientOutbox = messages.filter(m => m.senderType === 'client')

    return NextResponse.json({
      success: true,
      inbox: clientInbox,
      outbox: clientOutbox,
      unreadCount: clientInbox.filter(m => !m.isRead).length
    })
  } catch (error) {
    console.error('Error fetching inbox:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const { messageIds } = await request.json()

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs array is required' },
        { status: 400 }
      )
    }

    // Update messages as read
    await db.clientMessage.updateMany({
      where: { id: { in: messageIds } },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
