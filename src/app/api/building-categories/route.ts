import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all building categories
export async function GET() {
  try {
    const categories = await db.buildingCategory.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        formFields: {
          where: { active: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching building categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch building categories' },
      { status: 500 }
    )
  }
}

// POST create new building category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      categoryId,
      labelIndo,
      labelEng,
      descriptionIndo,
      descriptionEng,
      featuresIndo,
      featuresEng,
      icon,
      imageUrl,
      order = 0,
      active = true
    } = body

    // Check if categoryId already exists
    const existing = await db.buildingCategory.findUnique({
      where: { categoryId }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category ID already exists' },
        { status: 400 }
      )
    }

    const category = await db.buildingCategory.create({
      data: {
        categoryId,
        labelIndo,
        labelEng,
        descriptionIndo,
        descriptionEng,
        featuresIndo,
        featuresEng,
        icon,
        imageUrl,
        order,
        active
      }
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating building category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create building category' },
      { status: 500 }
    )
  }
}
