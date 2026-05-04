import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all active contact form fields (public)
export async function GET() {
  try {
    const fields = await db.contactFormField.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(fields)
  } catch (error) {
    console.error('Error fetching contact form fields:', error)
    return NextResponse.json({ error: 'Failed to fetch contact form fields' }, { status: 500 })
  }
}
