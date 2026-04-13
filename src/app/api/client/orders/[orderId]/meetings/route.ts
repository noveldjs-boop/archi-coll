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
    })

    if (!client || order.clientId !== client.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get video sessions for this order
    const videoSessions = await db.videoSession.findMany({
      where: { orderId },
      orderBy: { scheduledAt: 'desc' },
    })

    // Format the response
    const meetings = videoSessions.map(session => ({
      id: session.id,
      orderId: session.orderId,
      title: session.title,
      description: session.description,
      scheduledDate: session.scheduledAt.toISOString(),
      duration: session.duration,
      meetingLink: session.meetingUrl,
      platform: session.meetingUrl?.includes('zoom') ? 'zoom' :
                 session.meetingUrl?.includes('meet.google') ? 'google_meet' : 'other',
      participants: [
        { id: client.id, name: client.user?.name || 'Client', role: 'client', avatar: null }
      ],
      status: session.status,
      createdBy: client.id,
      createdAt: session.createdAt.toISOString(),
    }))

    return NextResponse.json({ data: meetings })
  } catch (error) {
    console.error('Error fetching meetings:', error)
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
    const body = await request.json()

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

    const { title, scheduledDate, duration, description } = body

    if (!title || !scheduledDate || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create video session
    const videoSession = await db.videoSession.create({
      data: {
        orderId,
        title,
        description,
        scheduledAt: new Date(scheduledDate),
        duration: parseInt(duration),
        status: 'scheduled',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: videoSession.id,
        orderId: videoSession.orderId,
        title: videoSession.title,
        description: videoSession.description,
        scheduledDate: videoSession.scheduledAt.toISOString(),
        duration: videoSession.duration,
        meetingLink: videoSession.meetingUrl,
        platform: 'other',
        participants: [{ id: client.id, name: client.user?.name || 'Client', role: 'client', avatar: null }],
        status: videoSession.status,
        createdBy: client.id,
        createdAt: videoSession.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
