import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { action } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
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

    // In a full implementation, this would:
    // 1. Create/join a WebRTC room
    // 2. Notify the architect about the call
    // 3. Track call state in database
    // For now, we'll just return success

    if (action === 'start') {
      // TODO: Implement WebRTC room creation
      console.log(`Starting video call for order ${orderId}`)
      return NextResponse.json({
        success: true,
        message: 'Video call started',
        // In full implementation, return:
        // - roomId for WebRTC
        // - signaling server URL
        // - peer connection config
      })
    } else if (action === 'end') {
      // TODO: Implement WebRTC room cleanup
      console.log(`Ending video call for order ${orderId}`)
      return NextResponse.json({
        success: true,
        message: 'Video call ended'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error handling video call:', error)
    return NextResponse.json(
      { error: 'Failed to handle video call' },
      { status: 500 }
    )
  }
}
