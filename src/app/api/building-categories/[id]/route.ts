import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single building category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await db.buildingCategory.findUnique({
      where: { id },
      include: {
        formFields: {
          where: { active: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Building category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error fetching building category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch building category' },
      { status: 500 }
    )
  }
}

// PUT update building category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      order,
      active
    } = body

    // Check if category exists
    const existing = await db.buildingCategory.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Building category not found' },
        { status: 404 }
      )
    }

    // If changing categoryId, check if new ID already exists
    if (categoryId && categoryId !== existing.categoryId) {
      const duplicateCheck = await db.buildingCategory.findUnique({
        where: { categoryId }
      })

      if (duplicateCheck) {
        return NextResponse.json(
          { success: false, error: 'Category ID already exists' },
          { status: 400 }
        )
      }
    }

    const category = await db.buildingCategory.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(labelIndo !== undefined && { labelIndo }),
        ...(labelEng !== undefined && { labelEng }),
        ...(descriptionIndo !== undefined && { descriptionIndo }),
        ...(descriptionEng !== undefined && { descriptionEng }),
        ...(featuresIndo !== undefined && { featuresIndo }),
        ...(featuresEng !== undefined && { featuresEng }),
        ...(icon !== undefined && { icon }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active })
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating building category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update building category' },
      { status: 500 }
    )
  }
}

// DELETE building category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const existing = await db.buildingCategory.findUnique({
      where: { id },
      include: {
        formFields: true
      }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Building category not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting active to false
    await db.buildingCategory.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Building category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting building category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete building category' },
      { status: 500 }
    )
  }
}
