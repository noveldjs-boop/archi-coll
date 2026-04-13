import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single contact form field
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const field = await db.contactFormField.findUnique({
      where: { id }
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Contact form field not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(field)
  } catch (error) {
    console.error('Error fetching contact form field:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact form field' },
      { status: 500 }
    )
  }
}

// PUT update contact form field
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
    if (body.labelIndo !== undefined) updateData.labelIndo = body.labelIndo
    if (body.labelEng !== undefined) updateData.labelEng = body.labelEng
    if (body.fieldType !== undefined) updateData.fieldType = body.fieldType
    if (body.required !== undefined) updateData.required = body.required
    if (body.placeholderIndo !== undefined) updateData.placeholderIndo = body.placeholderIndo
    if (body.placeholderEng !== undefined) updateData.placeholderEng = body.placeholderEng
    if (body.order !== undefined) updateData.order = body.order
    if (body.active !== undefined) updateData.active = body.active

    const updated = await db.contactFormField.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating contact form field:', error)
    return NextResponse.json(
      { error: 'Failed to update contact form field' },
      { status: 500 }
    )
  }
}

// DELETE contact form field
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.contactFormField.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact form field:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact form field' },
      { status: 500 }
    )
  }
}
