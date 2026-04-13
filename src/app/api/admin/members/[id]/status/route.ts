import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// PUT update member status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const updated = await db.member.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating member status:', error)
    return NextResponse.json(
      { error: 'Failed to update member status' },
      { status: 500 }
    )
  }
}
