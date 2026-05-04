import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { orderId } = await params

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify ownership
    const client = await db.client.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!client || order.clientId !== client.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get chat messages
    const messages = await db.clientMessage.findMany({
      where: { orderId },
      include: {
        member: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'asc' },
    })

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      orderId: msg.orderId,
      senderId: msg.senderId,
      senderName: msg.senderType === 'client'
        ? client.user?.name || 'Client'
        : msg.member?.user?.name || 'Architect',
      senderAvatar: msg.member?.profileImage || null,
      content: msg.message,
      fileAttachment: msg.attachmentUrl ? {
        name: msg.attachmentUrl.split('/').pop() || 'attachment',
        url: msg.attachmentUrl,
        type: 'file',
        size: 0,
      } : undefined,
      timestamp: msg.createdAt.toISOString(),
      read: msg.isRead,
      isFromClient: msg.senderType === 'client',
    }))

    return NextResponse.json({ data: formattedMessages })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { orderId } = await params

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify ownership
    const client = await db.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client || order.clientId !== client.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Handle multipart form data
    const formData = await request.formData()
    const content = formData.get('content') as string
    const file = formData.get('file') as File | null

    if (!content && !file) {
      return NextResponse.json({ error: 'Message content or file is required' }, { status: 400 })
    }

    let attachmentUrl: string | null = null

    // Handle file upload if provided
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${file.name}`
      const filepath = `/uploads/${filename}`

      // In production, upload to a proper storage service
      // For now, we'll just store the filename
      attachmentUrl = filepath
    }

    // Create message
    const message = await db.clientMessage.create({
      data: {
        orderId,
        senderId: client.id,
        senderType: 'client',
        clientId: client.id,
        message: content || '',
        attachmentUrl,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        orderId: message.orderId,
        senderId: message.senderId,
        senderName: client.user?.name || 'Client',
        senderAvatar: null,
        content: message.message,
        fileAttachment: attachmentUrl ? {
          name: attachmentUrl.split('/').pop() || 'attachment',
          url: attachmentUrl,
          type: 'file',
          size: 0,
        } : undefined,
        timestamp: message.createdAt.toISOString(),
        read: message.isRead,
        isFromClient: true,
      },
    })
  } catch (error) {
    console.error('Error sending chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
