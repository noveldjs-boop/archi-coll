import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get project invitations for profession member
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get project invitations for this member's profession
    const invitations = await db.orderTeam.findMany({
      where: {
        profession: member.profession,
        status: 'invited',
        memberId: null // Not yet assigned to a specific member
      },
      include: {
        order: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      invitations: invitations.map(inv => ({
        id: inv.id,
        orderId: inv.order.id,
        orderNumber: inv.order.orderNumber,
        projectName: inv.order.projectName,
        clientName: inv.order.clientName,
        clientEmail: inv.order.client?.user?.email,
        profession: inv.profession,
        role: inv.role,
        assignedBy: inv.assignedBy,
        createdAt: inv.createdAt,
        order: {
          id: inv.order.id,
          orderNumber: inv.order.orderNumber,
          projectName: inv.order.projectName,
          clientName: inv.order.clientName,
          landArea: inv.order.landArea,
          buildingArea: inv.order.buildingArea,
          buildingCategory: inv.order.buildingCategory,
          description: inv.order.description
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching project invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project invitations' },
      { status: 500 }
    )
  }
}
