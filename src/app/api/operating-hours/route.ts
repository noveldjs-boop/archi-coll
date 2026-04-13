import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all operating hours (public)
export async function GET() {
  try {
    const hours = await db.operatingHours.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error fetching operating hours:', error)
    return NextResponse.json({ error: 'Failed to fetch operating hours' }, { status: 500 })
  }
}
