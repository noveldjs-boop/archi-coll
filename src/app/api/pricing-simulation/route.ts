import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Calculate pricing simulation based on building area and type
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buildingArea, buildingType, qualityLevel, floors } = body;

    // Validate required fields
    if (!buildingArea) {
      return NextResponse.json(
        { error: 'buildingArea is required' },
        { status: 400 }
      );
    }

    // Parse building area (handle "500 m²" format)
    const areaMatch = buildingArea.toString().match(/[\d.]+/);
    if (!areaMatch) {
      return NextResponse.json(
        { error: 'Invalid building area format' },
        { status: 400 }
      );
    }

    const area = parseFloat(areaMatch[0]);
    if (isNaN(area) || area <= 0) {
      return NextResponse.json(
        { error: 'Building area must be a positive number' },
        { status: 400 }
      );
    }

    // Determine building type based on number of floors (if provided)
    let determinedBuildingType = buildingType;

    if (floors && !buildingType) {
      const numFloors = parseInt(floors);
      if (!isNaN(numFloors)) {
        if (numFloors <= 4) {
          determinedBuildingType = 'low-rise';
        } else if (numFloors <= 15) {
          determinedBuildingType = 'mid-rise';
        } else {
          determinedBuildingType = 'high-rise';
        }
      }
    }

    // Default to low-rise if not determined
    if (!determinedBuildingType) {
      determinedBuildingType = 'low-rise';
    }

    // Default quality level if not provided
    const determinedQualityLevel = qualityLevel || 'menengah';

    // Validate building type
    if (!['low-rise', 'mid-rise', 'high-rise'].includes(determinedBuildingType)) {
      return NextResponse.json(
        { error: 'Invalid building type. Must be: low-rise, mid-rise, or high-rise' },
        { status: 400 }
      );
    }

    // Validate quality level
    if (!['sederhana', 'menengah', 'mewah'].includes(determinedQualityLevel)) {
      return NextResponse.json(
        { error: 'Invalid quality level. Must be: sederhana, menengah, or mewah' },
        { status: 400 }
      );
    }

    // Find applicable pricing rule
    const pricingRule = await db.pricingRule.findFirst({
      where: {
        buildingType: determinedBuildingType,
        qualityLevel: determinedQualityLevel,
        active: true,
      }
    });

    // Get building type labels
    const buildingTypeLabels: { [key: string]: { indo: string; eng: string } } = {
      'low-rise': { indo: 'Low-Rise (≤ 4 lantai)', eng: 'Low-Rise (≤ 4 floors)' },
      'mid-rise': { indo: 'Mid-Rise (5-15 lantai)', eng: 'Mid-Rise (5-15 floors)' },
      'high-rise': { indo: 'High-Rise (> 15 lantai)', eng: 'High-Rise (> 15 floors)' },
    };

    // Get quality level labels
    const qualityLevelLabels: { [key: string]: { indo: string; eng: string } } = {
      'sederhana': { indo: 'Sederhana (K1)', eng: 'Simple (K1)' },
      'menengah': { indo: 'Menengah (K2)', eng: 'Medium (K2)' },
      'mewah': { indo: 'Mewah (K3)', eng: 'Luxury (K3)' },
    };

    const buildingTypeLabel = buildingTypeLabels[determinedBuildingType] || {
      indo: determinedBuildingType,
      eng: determinedBuildingType,
    };

    const qualityLevelLabel = qualityLevelLabels[determinedQualityLevel] || {
      indo: determinedQualityLevel,
      eng: determinedQualityLevel,
    };

    if (!pricingRule) {
      // Return default pricing if no rules exist
      const defaultPricePerM2 = 50000; // 50,000 IDR per m²
      const defaultIaiFeeRate = 0.065; // 6.5%

      const designFee = area * defaultPricePerM2;
      const estimatedRAB = designFee / defaultIaiFeeRate;

      return NextResponse.json(
        {
          buildingArea: area,
          buildingType: determinedBuildingType,
          buildingTypeLabel,
          qualityLevel: determinedQualityLevel,
          qualityLevelLabel,
          floors: floors || null,
          pricing: {
            designFee,
            estimatedRAB,
            pricePerM2: defaultPricePerM2,
            iaiFeeRate: defaultIaiFeeRate * 100,
            currency: 'IDR',
          },
          message: 'No specific pricing rule found, using default rates',
        },
        { status: 200 }
      );
    }

    // Calculate pricing
    const designFee = area * pricingRule.pricePerM2;
    const estimatedRAB = designFee / pricingRule.iaiFeeRate;

    return NextResponse.json(
      {
        buildingArea: area,
        buildingType: determinedBuildingType,
        buildingTypeLabel,
        qualityLevel: determinedQualityLevel,
        qualityLevelLabel,
        floors: floors || null,
        pricing: {
          designFee,
          estimatedRAB,
          pricePerM2: pricingRule.pricePerM2,
          iaiFeeRate: pricingRule.iaiFeeRate * 100,
          currency: 'IDR',
        },
        appliedRule: {
          buildingType: pricingRule.buildingType,
          qualityLevel: pricingRule.qualityLevel,
          minFloors: pricingRule.minFloors,
          maxFloors: pricingRule.maxFloors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}
