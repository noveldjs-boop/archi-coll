import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Accept or decline project invitation
export async function PUT(
  request: Request,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId } = params
    const body = await request.json()
    const { action } = body // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      )
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

    // Get invitation
    const invitation = await db.orderTeam.findUnique({
      where: { id: invitationId },
      include: {
        order: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.profession !== member.profession) {
      return NextResponse.json(
        { error: 'Invitation does not match your profession' },
        { status: 403 }
      )
    }

    if (invitation.status !== 'invited') {
      return NextResponse.json(
        { error: 'Invitation already processed' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Accept invitation
      await db.orderTeam.update({
        where: { id: invitationId },
        data: {
          memberId: member.id,
          status: 'accepted',
          acceptedAt: new Date()
        }
      })

      // Create notification for architect
      if (invitation.order.assignedMemberId) {
        await db.inbox.create({
          data: {
            memberId: invitation.order.assignedMemberId,
            type: 'project',
            title: `${member.profession} Bergabung`,
            content: `${member.user?.name || member.profession} telah bergabung ke project ${invitation.order.orderNumber}.`,
            link: `/report-monitoring/${invitation.order.id}`
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Project invitation accepted!',
        redirectUrl: `/report-monitoring/${invitation.order.id}`
      })
    } else {
      // Decline invitation
      await db.orderTeam.update({
        where: { id: invitationId },
        data: {
          status: 'declined'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Project invitation declined'
      })
    }
  } catch (error) {
    console.error('Error processing invitation:', error)
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}
