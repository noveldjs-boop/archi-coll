import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

// POST - Claim/assign a project to architect
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, professions = ['architect'] } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Validate professions array
    if (!Array.isArray(professions) || !professions.includes('architect')) {
      return NextResponse.json(
        { error: 'Professions must include "architect"' },
        { status: 400 }
      )
    }

    // Valid professions
    const validProfessions = ['architect', 'structure', 'mep', 'drafter', 'qs', 'licensed_architect']
    const invalidProfessions = professions.filter(p => !validProfessions.includes(p))
    if (invalidProfessions.length > 0) {
      return NextResponse.json(
        { error: `Invalid professions: ${invalidProfessions.join(', ')}` },
        { status: 400 }
      )
    }

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        profession: 'architect',
        status: 'active'
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    // Check if the order is available for claiming
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
        { error: 'Project ini belum membayar DP. Tidak dapat diambil.' },
        { status: 400 }
      )
    }

    if (order.assignedMemberId) {
      return NextResponse.json(
        { error: 'Project ini sudah diambil oleh arsitek lain.' },
        { status: 400 }
      )
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Project ini sudah selesai atau dibatalkan.' },
        { status: 400 }
      )
    }

    // Assign the project to the architect
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        assignedMemberId: member.id,
        assignedAt: new Date(),
        status: 'in_pre_design'
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    })

    // Create OrderTeam records for each selected profession
    for (const profession of professions) {
      await db.orderTeam.create({
        data: {
          orderId: orderId,
          profession: profession,
          memberId: profession === 'architect' ? member.id : null,
          role: profession === 'architect' ? 'lead' : 'team_member',
          status: profession === 'architect' ? 'accepted' : 'invited',
          assignedBy: member.id,
          acceptedAt: profession === 'architect' ? new Date() : null
        }
      })
    }

    // Create initial progress update
    await db.projectProgress.create({
      data: {
        orderId,
        stage: 'inquiry',
        title: 'Project Diambil',
        description: `Project diambil oleh arsitek ${member.user?.name || 'Architect'} dengan profesi: ${professions.join(', ')}`,
        percentage: 5,
        status: 'completed'
      }
    })

    // Create notification for client
    await db.inbox.create({
      data: {
        memberId: order.client.userId,
        type: 'project',
        title: 'Arsitek Telah Ditugaskan',
        content: `Arsitek ${member.user?.name || 'Architect'} telah ditugaskan untuk project Anda ${order.orderNumber}.`,
        link: `/client/orders/${order.id}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Project berhasil diambil!',
      redirectUrl: `/report-monitoring/${orderId}`
    })
  } catch (error) {
    console.error('Error claiming project:', error)
    return NextResponse.json(
      { error: 'Failed to claim project' },
      { status: 500 }
    )
  }
}
