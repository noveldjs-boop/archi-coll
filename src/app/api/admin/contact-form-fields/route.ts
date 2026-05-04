import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all contact form fields
export async function GET() {
  try {
    const fields = await db.contactFormField.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(fields)
  } catch (error) {
    console.error('Error fetching contact form fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact form fields' },
      { status: 500 }
    )
  }
}

// POST create new contact form field
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fieldId, labelIndo, labelEng, fieldType, required, placeholderIndo, placeholderEng, order, active } = body

    const field = await db.contactFormField.create({
      data: {
        fieldId,
        labelIndo,
        labelEng,
        fieldType,
        required: required ?? true,
        placeholderIndo,
        placeholderEng,
        order: order ?? 0,
        active: active ?? true
      }
    })

    return NextResponse.json(field)
  } catch (error) {
    console.error('Error creating contact form field:', error)
    return NextResponse.json(
      { error: 'Failed to create contact form field' },
      { status: 500 }
    )
  }
}
