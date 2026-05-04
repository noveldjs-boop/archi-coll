import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Calculate budget simulation based on building area and type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingArea = searchParams.get('buildingArea');
    const buildingType = searchParams.get('buildingType');
    const qualityLevel = searchParams.get('qualityLevel');
    const floors = searchParams.get('floors');

    if (!buildingArea) {
      return NextResponse.json(
        { error: 'Missing required parameter: buildingArea' },
        { status: 400 }
      );
    }

    const area = parseFloat(buildingArea);

    if (isNaN(area) || area <= 0) {
      return NextResponse.json(
        { error: 'Invalid building area' },
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

    // Calculate design fee and RAB
    let designFee = 0;
    let estimatedRAB = 0;
    let pricePerM2 = 0;
    let iaiFeeRate = 0.065; // Default IAI fee rate

    if (pricingRule) {
      pricePerM2 = pricingRule.pricePerM2;
      iaiFeeRate = pricingRule.iaiFeeRate;
      designFee = area * pricePerM2;
      estimatedRAB = designFee / iaiFeeRate; // RAB is the total construction cost
    }

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

    return NextResponse.json({
      success: true,
      data: {
        buildingArea: area,
        buildingType: determinedBuildingType,
        buildingTypeLabel,
        qualityLevel: determinedQualityLevel,
        qualityLevelLabel,
        floors: floors ? parseInt(floors) : null,
        pricePerM2,
        designFee,
        iaiFeeRate: iaiFeeRate * 100, // Convert to percentage
        estimatedRAB,
        currency: 'IDR',
        // Breakdown of calculation
        breakdown: {
          buildingArea: area,
          pricePerM2,
          designFeeFormula: `${area} m² × ${pricePerM2.toLocaleString('id-ID')} = ${designFee.toLocaleString('id-ID')}`,
          designFee,
          iaiFeeRate: `${(iaiFeeRate * 100).toFixed(1)}%`,
          rabFormula: `Fee Desain ÷ ${iaiFeeRate} = ${estimatedRAB.toLocaleString('id-ID')}`,
          estimatedRAB,
          note: 'Fee desain adalah persentase dari biaya konstruksi (RAB) sesuai standar IAI',
        },
      },
    });
  } catch (error) {
    console.error('Error calculating budget simulation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate budget simulation' },
      { status: 500 }
    );
  }
}
