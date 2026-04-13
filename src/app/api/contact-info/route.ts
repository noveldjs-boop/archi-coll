import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all active contact info (public)
export async function GET() {
  try {
    const info = await db.contactInfo.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(info)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 })
  }
}
