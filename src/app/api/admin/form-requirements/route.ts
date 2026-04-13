import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all form requirements
export async function GET() {
  try {
    const requirements = await db.formRequirement.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error fetching form requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form requirements' },
      { status: 500 }
    )
  }
}

// POST create new form requirement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fieldId, profession, labelIndo, labelEng, fieldType, required, options, placeholderIndo, placeholderEng, order, active } = body

    const requirement = await db.formRequirement.create({
      data: {
        fieldId,
        profession: profession || null,
        labelIndo,
        labelEng,
        fieldType,
        required: required ?? true,
        options,
        placeholderIndo,
        placeholderEng,
        order: order ?? 0,
        active: active ?? true
      }
    })

    return NextResponse.json(requirement)
  } catch (error) {
    console.error('Error creating form requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create form requirement' },
      { status: 500 }
    )
  }
}
