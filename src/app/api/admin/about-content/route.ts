import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all about content
export async function GET() {
  try {
    const content = await db.aboutContent.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

// POST create or update about content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, contentIndo, contentEng, order } = body

    // Check if content exists
    const existing = await db.aboutContent.findUnique({
      where: { section }
    })

    if (existing) {
      // Update existing
      const updated = await db.aboutContent.update({
        where: { section },
        data: {
          contentIndo,
          contentEng,
          order: order ?? 0
        }
      })
      return NextResponse.json(updated)
    } else {
      // Create new
      const created = await db.aboutContent.create({
        data: {
          section,
          contentIndo,
          contentEng,
          order: order ?? 0
        }
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Error saving about content:', error)
    return NextResponse.json(
      { error: 'Failed to save about content' },
      { status: 500 }
    )
  }
}
