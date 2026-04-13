import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all about content (public)
export async function GET() {
  try {
    const content = await db.aboutContent.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 })
  }
}
