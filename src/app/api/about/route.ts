import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET about page data
export async function GET() {
  try {
    const content = await db.aboutContent.findMany({
      orderBy: { order: 'asc' }
    })

    const teamMembers = await db.teamMember.findMany({
      where: { active: true },
      orderBy: [
        { role: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      content,
      teamMembers
    })
  } catch (error) {
    console.error('Error fetching about data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    )
  }
}
