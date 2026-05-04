import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single team member
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const member = await db.teamMember.findUnique({
      where: { id }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    )
  }
}

// PUT update team member
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    // Only update fields that are provided
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.titleIndo !== undefined) updateData.titleIndo = body.titleIndo
    if (body.titleEng !== undefined) updateData.titleEng = body.titleEng
    if (body.descriptionIndo !== undefined) updateData.descriptionIndo = body.descriptionIndo
    if (body.descriptionEng !== undefined) updateData.descriptionEng = body.descriptionEng
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl
    if (body.email !== undefined) updateData.email = body.email
    if (body.role !== undefined) updateData.role = body.role
    if (body.order !== undefined) updateData.order = body.order
    if (body.active !== undefined) updateData.active = body.active

    const updated = await db.teamMember.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE team member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.teamMember.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
