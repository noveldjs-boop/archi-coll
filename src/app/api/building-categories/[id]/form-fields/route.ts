import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all form fields for a category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const category = await db.buildingCategory.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Building category not found' },
        { status: 404 }
      )
    }

    const formFields = await db.buildingCategoryFormField.findMany({
      where: { categoryId: id, active: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: formFields })
  } catch (error) {
    console.error('Error fetching form fields:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form fields' },
      { status: 500 }
    )
  }
}

// POST create new form field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      fieldId,
      labelIndo,
      labelEng,
      fieldType,
      required = true,
      options,
      placeholderIndo,
      placeholderEng,
      order = 0,
      active = true
    } = body

    // Check if category exists
    const category = await db.buildingCategory.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Building category not found' },
        { status: 404 }
      )
    }

    // Check if fieldId already exists for this category
    const existing = await db.buildingCategoryFormField.findUnique({
      where: { fieldId }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Field ID already exists' },
        { status: 400 }
      )
    }

    const formField = await db.buildingCategoryFormField.create({
      data: {
        categoryId: id,
        fieldId,
        labelIndo,
        labelEng,
        fieldType,
        required,
        options,
        placeholderIndo,
        placeholderEng,
        order,
        active
      }
    })

    return NextResponse.json({ success: true, data: formField }, { status: 201 })
  } catch (error) {
    console.error('Error creating form field:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create form field' },
      { status: 500 }
    )
  }
}
