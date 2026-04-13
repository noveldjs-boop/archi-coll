import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all pricing rules
export async function GET() {
  try {
    const pricingRules = await db.pricingRule.findMany({
      where: { active: true },
      orderBy: [
        { buildingType: 'asc' },
        { qualityLevel: 'asc' }
      ]
    })

    // Group by building type
    const grouped = pricingRules.reduce((acc, rule) => {
      if (!acc[rule.buildingType]) {
        acc[rule.buildingType] = []
      }
      acc[rule.buildingType].push(rule)
      return acc
    }, {} as Record<string, typeof pricingRules>)

    return NextResponse.json({ success: true, data: pricingRules, grouped })
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing rules' },
      { status: 500 }
    )
  }
}

// POST create new pricing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      buildingType,
      qualityLevel,
      pricePerM2,
      iaiFeeRate,
      minFloors = 0,
      maxFloors,
      active = true,
      descriptionIndo,
      descriptionEng
    } = body

    // Validate required fields
    if (!buildingType || !qualityLevel || !pricePerM2 || !iaiFeeRate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const pricingRule = await db.pricingRule.create({
      data: {
        buildingType,
        qualityLevel,
        pricePerM2: parseFloat(pricePerM2),
        iaiFeeRate: parseFloat(iaiFeeRate),
        minFloors,
        maxFloors,
        active,
        descriptionIndo,
        descriptionEng
      }
    })

    return NextResponse.json({ success: true, data: pricingRule }, { status: 201 })
  } catch (error) {
    console.error('Error creating pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create pricing rule' },
      { status: 500 }
    )
  }
}
