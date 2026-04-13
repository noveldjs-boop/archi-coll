import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET single pricing rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pricingRule = await db.pricingRule.findUnique({
      where: { id }
    })

    if (!pricingRule) {
      return NextResponse.json(
        { success: false, error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: pricingRule })
  } catch (error) {
    console.error('Error fetching pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing rule' },
      { status: 500 }
    )
  }
}

// PUT update pricing rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      buildingType,
      qualityLevel,
      pricePerM2,
      iaiFeeRate,
      minFloors,
      maxFloors,
      active,
      descriptionIndo,
      descriptionEng
    } = body

    // Check if pricing rule exists
    const existing = await db.pricingRule.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    const pricingRule = await db.pricingRule.update({
      where: { id },
      data: {
        ...(buildingType !== undefined && { buildingType }),
        ...(qualityLevel !== undefined && { qualityLevel }),
        ...(pricePerM2 !== undefined && { pricePerM2: parseFloat(pricePerM2) }),
        ...(iaiFeeRate !== undefined && { iaiFeeRate: parseFloat(iaiFeeRate) }),
        ...(minFloors !== undefined && { minFloors }),
        ...(maxFloors !== undefined && { maxFloors }),
        ...(active !== undefined && { active }),
        ...(descriptionIndo !== undefined && { descriptionIndo }),
        ...(descriptionEng !== undefined && { descriptionEng })
      }
    })

    return NextResponse.json({ success: true, data: pricingRule })
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing rule' },
      { status: 500 }
    )
  }
}

// DELETE pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if pricing rule exists
    const existing = await db.pricingRule.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting active to false
    await db.pricingRule.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Pricing rule deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete pricing rule' },
      { status: 500 }
    )
  }
}
