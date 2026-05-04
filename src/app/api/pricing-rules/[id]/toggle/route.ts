import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// PUT toggle pricing rule active status
export async function PUT(
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

    // Toggle active status
    const updatedRule = await db.pricingRule.update({
      where: { id },
      data: { active: !existing.active }
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedRule,
      message: `Pricing rule ${existing.active ? 'dinonaktifkan' : 'diaktifkan'} successfully`
    })
  } catch (error) {
    console.error('Error toggling pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle pricing rule' },
      { status: 500 }
    )
  }
}
