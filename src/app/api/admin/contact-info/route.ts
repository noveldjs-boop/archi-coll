import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all contact info
export async function GET() {
  try {
    const info = await db.contactInfo.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(info)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

// POST create new contact info
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, labelIndo, labelEng, valueIndo, valueEng, icon, order, active } = body

    const info = await db.contactInfo.create({
      data: {
        type,
        labelIndo,
        labelEng,
        valueIndo,
        valueEng,
        icon,
        order: order ?? 0,
        active: active ?? true
      }
    })

    return NextResponse.json(info)
  } catch (error) {
    console.error('Error creating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to create contact info' },
      { status: 500 }
    )
  }
}
