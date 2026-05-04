import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single form field
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId } = await params

    const formField = await db.buildingCategoryFormField.findUnique({
      where: { id: fieldId }
    })

    if (!formField || formField.categoryId !== id) {
      return NextResponse.json(
        { success: false, error: 'Form field not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: formField })
  } catch (error) {
    console.error('Error fetching form field:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form field' },
      { status: 500 }
    )
  }
}

// PUT update form field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId: paramFieldId } = await params
    const body = await request.json()
    const {
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
    } = body

    // Check if form field exists
    const existing = await db.buildingCategoryFormField.findUnique({
      where: { id: paramFieldId }
    })

    if (!existing || existing.categoryId !== id) {
      return NextResponse.json(
        { success: false, error: 'Form field not found' },
        { status: 404 }
      )
    }

    // If changing fieldId, check if new ID already exists
    if (fieldId && fieldId !== existing.fieldId) {
      const duplicateCheck = await db.buildingCategoryFormField.findUnique({
        where: { fieldId }
      })

      if (duplicateCheck) {
        return NextResponse.json(
          { success: false, error: 'Field ID already exists' },
          { status: 400 }
        )
      }
    }

    const formField = await db.buildingCategoryFormField.update({
      where: { id: paramFieldId },
      data: {
        ...(fieldId && { fieldId }),
        ...(labelIndo !== undefined && { labelIndo }),
        ...(labelEng !== undefined && { labelEng }),
        ...(fieldType !== undefined && { fieldType }),
        ...(required !== undefined && { required }),
        ...(options !== undefined && { options }),
        ...(placeholderIndo !== undefined && { placeholderIndo }),
        ...(placeholderEng !== undefined && { placeholderEng }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active })
      }
    })

    return NextResponse.json({ success: true, data: formField })
  } catch (error) {
    console.error('Error updating form field:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update form field' },
      { status: 500 }
    )
  }
}

// DELETE form field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId: paramFieldId } = await params

    // Check if form field exists
    const existing = await db.buildingCategoryFormField.findUnique({
      where: { id: paramFieldId }
    })

    if (!existing || existing.categoryId !== id) {
      return NextResponse.json(
        { success: false, error: 'Form field not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting active to false
    await db.buildingCategoryFormField.update({
      where: { id: paramFieldId },
      data: { active: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Form field deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting form field:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete form field' },
      { status: 500 }
    )
  }
}
