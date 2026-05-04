import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Assign architect to order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, architectId } = body

    if (!orderId || !architectId) {
      return NextResponse.json(
        { error: 'Order ID and Architect ID are required' },
        { status: 400 }
      )
    }

    // Verify the order exists and has DP paid
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.dpPaid) {
      return NextResponse.json(
        { error: 'Cannot assign architect. Client has not paid DP yet.' },
        { status: 400 }
      )
    }

    if (order.assignedMemberId) {
      return NextResponse.json(
        { error: 'Order already has an assigned architect.' },
        { status: 400 }
      )
    }

    // Verify the architect exists and is active (support 'architect', 'licensed_architect', and 'licensed-architect')
    const architect = await db.member.findFirst({
      where: {
        id: architectId,
        profession: {
          in: ['architect', 'licensed_architect', 'licensed-architect']
        },
        status: 'active'
      },
      include: {
        user: true
      }
    })

    if (!architect) {
      return NextResponse.json(
        { error: 'Architect not found or not active.' },
        { status: 404 }
      )
    }

    // Check if architect already has an active project
    const existingActiveProject = await db.order.findFirst({
      where: {
        assignedMemberId: architectId,
        status: {
          in: ['in_pre_design', 'in_schematic', 'in_ded', 'in_review']
        }
      }
    })

    if (existingActiveProject) {
      return NextResponse.json(
        { error: 'This architect already has an active project. Please choose a different architect.' },
        { status: 400 }
      )
    }

    // Assign the architect to the order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        assignedMemberId: architectId,
        assignedAt: new Date(),
        status: 'in_pre_design'
      },
      include: {
        assignedMember: {
          include: {
            user: true
          }
        },
        client: {
          include: {
            user: true
          }
        }
      }
    })

    // Create initial progress update
    await db.projectProgress.create({
      data: {
        orderId,
        stage: 'inquiry',
        title: 'Arsitek Ditugaskan',
        description: `Arsitek ${architect.user?.name || 'Architect'} telah ditugaskan oleh Finance untuk project ini.`,
        percentage: 5,
        status: 'completed'
      }
    })

    // Create notification for architect
    await db.inbox.create({
      data: {
        memberId: architectId,
        type: 'project',
        title: 'Project Baru Ditugaskan',
        content: `Anda telah ditugaskan untuk project ${order.orderNumber} (${order.clientName}).`,
        link: `/architect/dashboard`
      }
    })

    // Create notification for client
    await db.inbox.create({
      data: {
        memberId: order.client.userId,
        type: 'project',
        title: 'Arsitek Telah Ditugaskan',
        content: `Arsitek ${architect.user?.name || 'Architect'} telah ditugaskan untuk project Anda ${order.orderNumber}.`,
        link: `/client/orders/${order.id}`
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Architect ${architect.user?.name} successfully assigned to order ${order.orderNumber}`
    })
  } catch (error) {
    console.error('Error assigning architect:', error)
    return NextResponse.json(
      { error: 'Failed to assign architect' },
      { status: 500 }
    )
  }
}
