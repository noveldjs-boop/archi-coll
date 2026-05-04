import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch messages for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const messages = await db.clientMessage.findMany({
      where: {
        orderId: orderId
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        member: {
          include: {
            user: true
          }
        }
      }
    })

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderType: msg.senderType,
      senderName: msg.senderType === 'client'
        ? msg.client?.user?.name || 'Unknown'
        : msg.member?.user?.name || 'Unknown',
      message: msg.message,
      attachmentUrl: msg.attachmentUrl,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { message, senderId, senderType, senderName, attachmentUrl } = await request.json()

    if (!message || !senderId || !senderType || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify order exists
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create message
    const newMessage = await db.clientMessage.create({
      data: {
        orderId,
        senderId,
        senderType,
        message,
        attachmentUrl: attachmentUrl || null,
        clientId: senderType === 'client' ? senderId : null,
        memberId: senderType === 'architect' ? senderId : null
      }
    })

    return NextResponse.json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
