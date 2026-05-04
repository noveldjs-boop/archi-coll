import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch active order service fields for public use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false' // default to true

    const fields = await db.orderServiceField.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: fields
    })
  } catch (error) {
    console.error('Error fetching order service fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order service fields' },
      { status: 500 }
    )
  }
}
