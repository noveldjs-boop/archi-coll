import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'active', 'suspended', 'all'
    const profession = searchParams.get('profession')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (profession) {
      where.profession = profession
    }

    const members = await db.member.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        certificates: true,
        ledProjects: {
          where: {
            status: {
              in: ['in_progress', 'leader_assigned', 'team_assigned']
            }
          },
          select: {
            id: true,
            titleIndo: true,
            status: true
          }
        },
        assignments: {
          where: {
            status: {
              in: ['in_progress', 'accepted']
            }
          },
          include: {
            project: {
              select: {
                id: true,
                titleIndo: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, action, status, notes } = body

    // Handle approval/rejection
    if (action === 'approve') {
      const member = await db.member.update({
        where: { id },
        data: {
          status: 'active',
          approvedAt: new Date(),
          approvedBy: body.approvedBy
        },
        include: {
          user: true
        }
      })
      return NextResponse.json({ member })
    } else if (action === 'reject') {
      const member = await db.member.update({
        where: { id },
        data: {
          status: 'rejected'
        }
      })
      return NextResponse.json({ member })
    } else if (action === 'suspend') {
      const member = await db.member.update({
        where: { id },
        data: {
          status: 'suspended'
        }
      })
      return NextResponse.json({ member })
    } else if (action === 'activate') {
      const member = await db.member.update({
        where: { id },
        data: {
          status: 'active'
        }
      })
      return NextResponse.json({ member })
    }

    // Regular status update
    const member = await db.member.update({
      where: { id },
      data: { status },
      include: {
        user: true
      }
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Delete member (will cascade to related records)
    await db.member.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
