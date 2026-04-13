import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all active team members (public)
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}
