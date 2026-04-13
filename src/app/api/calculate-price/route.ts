import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// POST calculate price based on parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buildingArea, floors, qualityLevel } = body

    // Validate required fields
    if (!buildingArea || !floors || !qualityLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: buildingArea, floors, qualityLevel' },
        { status: 400 }
      )
    }

    const area = parseFloat(buildingArea)
    const numFloors = parseInt(floors)

    if (isNaN(area) || isNaN(numFloors) || area <= 0 || numFloors <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid buildingArea or floors values' },
        { status: 400 }
      )
    }

    // Determine building type based on floors
    let buildingType = 'low-rise'
    if (numFloors <= 4) {
      buildingType = 'low-rise'
    } else if (numFloors <= 8) {
      buildingType = 'mid-rise'
    } else {
      buildingType = 'high-rise'
    }

    // Find applicable pricing rule
    const pricingRule = await db.pricingRule.findFirst({
      where: {
        buildingType,
        qualityLevel,
        active: true,
        minFloors: { lte: numFloors },
        OR: [
          { maxFloors: null },
          { maxFloors: { gte: numFloors } }
        ]
      }
    })

    if (!pricingRule) {
      return NextResponse.json(
        { success: false, error: 'No pricing rule found for the given parameters' },
        { status: 404 }
      )
    }

    // Calculate RAB (Construction Cost)
    const rab = area * pricingRule.pricePerM2

    // Calculate design fee based on IAI fee rate
    const designFee = rab * pricingRule.iaiFeeRate

    // Calculate payment breakdown
    const dpPayment = designFee * 0.10
    const remainingPayment = designFee - dpPayment
    const remaining80Percent = remainingPayment * 0.80
    const remaining20Percent = remainingPayment * 0.20

    // Calculate package breakdown
    const preDesignPrice = designFee * 0.15
    const schematicPrice = designFee * 0.25
    const dedPrice = designFee * 0.60

    return NextResponse.json({
      success: true,
      data: {
        buildingType,
        qualityLevel,
        floors: numFloors,
        area,
        pricePerM2: pricingRule.pricePerM2,
        iaiFeeRate: pricingRule.iaiFeeRate,
        rab,
        designFee,
        dpPayment,
        remainingPayment,
        remaining80Percent,
        remaining20Percent,
        preDesignPrice,
        schematicPrice,
        dedPrice,
        pricingRule: {
          id: pricingRule.id,
          descriptionIndo: pricingRule.descriptionIndo,
          descriptionEng: pricingRule.descriptionEng
        }
      }
    })
  } catch (error) {
    console.error('Error calculating price:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate price' },
      { status: 500 }
    )
  }
}
