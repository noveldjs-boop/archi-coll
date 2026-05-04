import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single form requirement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requirement = await db.formRequirement.findUnique({
      where: { id }
    })

    if (!requirement) {
      return NextResponse.json(
        { error: 'Form requirement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(requirement)
  } catch (error) {
    console.error('Error fetching form requirement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form requirement' },
      { status: 500 }
    )
  }
}

// PUT update form requirement
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    // Only update fields that are provided
    const updateData: any = {}
    if (body.fieldId !== undefined) updateData.fieldId = body.fieldId
    if (body.profession !== undefined) updateData.profession = body.profession || null
    if (body.labelIndo !== undefined) updateData.labelIndo = body.labelIndo
    if (body.labelEng !== undefined) updateData.labelEng = body.labelEng
    if (body.fieldType !== undefined) updateData.fieldType = body.fieldType
    if (body.required !== undefined) updateData.required = body.required
    if (body.options !== undefined) updateData.options = body.options
    if (body.placeholderIndo !== undefined) updateData.placeholderIndo = body.placeholderIndo
    if (body.placeholderEng !== undefined) updateData.placeholderEng = body.placeholderEng
    if (body.order !== undefined) updateData.order = body.order
    if (body.active !== undefined) updateData.active = body.active

    const updated = await db.formRequirement.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating form requirement:', error)
    return NextResponse.json(
      { error: 'Failed to update form requirement' },
      { status: 500 }
    )
  }
}

// DELETE form requirement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.formRequirement.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting form requirement:', error)
    return NextResponse.json(
      { error: 'Failed to delete form requirement' },
      { status: 500 }
    )
  }
}
