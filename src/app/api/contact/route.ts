import { NextResponse } from 'next/server'
import db from '@/lib/db'

// GET contact page data
export async function GET() {
  try {
    const contactInfo = await db.contactInfo.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    const operatingHours = await db.operatingHours.findMany({
      orderBy: { order: 'asc' }
    })

    const formFields = await db.contactFormField.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      contactInfo,
      operatingHours,
      formFields
    })
  } catch (error) {
    console.error('Error fetching contact data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact data' },
      { status: 500 }
    )
  }
}
