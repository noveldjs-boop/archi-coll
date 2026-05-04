import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if member exists
    const member = await db.member.findUnique({
      where: { id },
      include: {
        user: true,
        assignments: true,
        workUploads: true,
        ratingsGiven: true,
        ratingsReceived: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Count active projects
    const activeProjects = member.assignments.filter(
      a => a.status === 'in_progress' || a.status === 'accepted'
    ).length

    // Prevent deletion if member has active projects
    if (activeProjects > 0) {
      return NextResponse.json(
        { error: 'Cannot delete member with active projects' },
        { status: 400 }
      )
    }

    // Delete member (cascade will handle related records)
    await db.member.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
