import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all operating hours
export async function GET() {
  try {
    const hours = await db.operatingHours.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error fetching operating hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operating hours' },
      { status: 500 }
    )
  }
}

// POST create new operating hours
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { day, labelIndo, labelEng, openTime, closeTime, closed, order } = body

    const hours = await db.operatingHours.create({
      data: {
        day,
        labelIndo,
        labelEng,
        openTime,
        closeTime,
        closed: closed ?? false,
        order: order ?? 0
      }
    })

    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error creating operating hours:', error)
    return NextResponse.json(
      { error: 'Failed to create operating hours' },
      { status: 500 }
    )
  }
}
