import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get team members for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params;

    // Verify this architect owns the project
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        profession: 'architect',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.assignedMemberId !== member.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
    }

    // Get project team
    const projectTeam = await db.orderTeam.findMany({
      where: {
        orderId: orderId
      },
      include: {
        member: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      team: projectTeam.map(team => ({
        id: team.id,
        profession: team.profession,
        role: team.role,
        status: team.status,
        member: team.member ? {
          id: team.member.id,
          name: team.member.user?.name,
          email: team.member.user?.email,
          phone: team.member.phone
        } : null,
        acceptedAt: team.acceptedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching project team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project team' },
      { status: 500 }
    )
  }
}