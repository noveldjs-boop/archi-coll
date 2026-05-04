import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch all order service fields
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const fields = await db.orderServiceField.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: fields
    })
  } catch (error) {
    console.error('Error fetching order service fields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order service fields' },
      { status: 500 }
    )
  }
}

// POST - Create new order service field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fieldKey,
      labelIndo,
      labelEng,
      fieldType,
      required,
      placeholderIndo,
      placeholderEng,
      options,
      validation,
      order,
      active
    } = body

    // Validate required fields
    if (!fieldKey || !labelIndo || !labelEng || !fieldType) {
      return NextResponse.json(
        { error: 'Missing required fields: fieldKey, labelIndo, labelEng, fieldType' },
        { status: 400 }
      )
    }

    // Check if fieldKey already exists
    const existing = await db.orderServiceField.findUnique({
      where: { fieldKey }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Field with this key already exists' },
        { status: 400 }
      )
    }

    // Create order service field
    const field = await db.orderServiceField.create({
      data: {
        fieldKey,
        labelIndo,
        labelEng,
        fieldType,
        required: required !== undefined ? required : true,
        placeholderIndo: placeholderIndo || null,
        placeholderEng: placeholderEng || null,
        options: options || null,
        validation: validation || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json({
      success: true,
      data: field,
      message: 'Order service field created successfully'
    })
  } catch (error) {
    console.error('Error creating order service field:', error)
    return NextResponse.json(
      { error: 'Failed to create order service field' },
      { status: 500 }
    )
  }
}

// PUT - Update order service field
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      )
    }

    // Check if field exists
    const existing = await db.orderServiceField.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Order service field not found' },
        { status: 404 }
      )
    }

    // If updating fieldKey, check for conflicts
    if (updateData.fieldKey && updateData.fieldKey !== existing.fieldKey) {
      const conflict = await db.orderServiceField.findUnique({
        where: { fieldKey: updateData.fieldKey }
      })

      if (conflict) {
        return NextResponse.json(
          { error: 'Field with this key already exists' },
          { status: 400 }
        )
      }
    }

    // Update field
    const field = await db.orderServiceField.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: field,
      message: 'Order service field updated successfully'
    })
  } catch (error) {
    console.error('Error updating order service field:', error)
    return NextResponse.json(
      { error: 'Failed to update order service field' },
      { status: 500 }
    )
  }
}

// DELETE - Delete order service field
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      )
    }

    // Check if field exists
    const existing = await db.orderServiceField.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Order service field not found' },
        { status: 404 }
      )
    }

    // Delete field
    await db.orderServiceField.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Order service field deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting order service field:', error)
    return NextResponse.json(
      { error: 'Failed to delete order service field' },
      { status: 500 }
    )
  }
}
