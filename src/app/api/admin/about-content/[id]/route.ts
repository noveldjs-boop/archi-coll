import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// API endpoint for handling about content by ID

// GET single about content by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const content = await db.aboutContent.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'About content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

// PUT update about content by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { contentIndo, contentEng, order } = body

    const updated = await db.aboutContent.update({
      where: { id },
      data: {
        contentIndo,
        contentEng,
        order: order ?? 0
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating about content:', error)
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    )
  }
}

// DELETE about content by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.aboutContent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting about content:', error)
    return NextResponse.json(
      { error: 'Failed to delete about content' },
      { status: 500 }
    )
  }
}
