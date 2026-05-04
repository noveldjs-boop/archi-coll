import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single operating hours
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hours = await db.operatingHours.findUnique({
      where: { id }
    })

    if (!hours) {
      return NextResponse.json(
        { error: 'Operating hours not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error fetching operating hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operating hours' },
      { status: 500 }
    )
  }
}

// PUT update operating hours
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { day, labelIndo, labelEng, openTime, closeTime, closed, order } = body

    const updated = await db.operatingHours.update({
      where: { id },
      data: {
        day,
        labelIndo,
        labelEng,
        openTime,
        closeTime,
        closed,
        order
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating operating hours:', error)
    return NextResponse.json(
      { error: 'Failed to update operating hours' },
      { status: 500 }
    )
  }
}

// DELETE operating hours
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.operatingHours.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting operating hours:', error)
    return NextResponse.json(
      { error: 'Failed to delete operating hours' },
      { status: 500 }
    )
  }
}
