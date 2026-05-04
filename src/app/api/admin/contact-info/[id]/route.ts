import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single contact info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const info = await db.contactInfo.findUnique({
      where: { id }
    })

    if (!info) {
      return NextResponse.json(
        { error: 'Contact info not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(info)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

// PUT update contact info
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    // Only update fields that are provided
    const updateData: any = {}
    if (body.type !== undefined) updateData.type = body.type
    if (body.labelIndo !== undefined) updateData.labelIndo = body.labelIndo
    if (body.labelEng !== undefined) updateData.labelEng = body.labelEng
    if (body.valueIndo !== undefined) updateData.valueIndo = body.valueIndo
    if (body.valueEng !== undefined) updateData.valueEng = body.valueEng
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.order !== undefined) updateData.order = body.order
    if (body.active !== undefined) updateData.active = body.active

    const updated = await db.contactInfo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    )
  }
}

// DELETE contact info
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.contactInfo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact info:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact info' },
      { status: 500 }
    )
  }
}
