import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { calculateIAIDesignFee, mapToIAIBuildingCategory } from '@/lib/iai-calculation';

// POST - Calculate design fee and RAB based on building area and category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.categoryId || !body.buildingArea) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, buildingArea' },
        { status: 400 }
      );
    }

    const buildingArea = parseFloat(body.buildingArea);

    if (isNaN(buildingArea) || buildingArea <= 0) {
      return NextResponse.json(
        { error: 'Invalid building area. Must be a positive number' },
        { status: 400 }
      );
    }

    // Find the building category
    const category = await db.buildingCategory.findUnique({
      where: { categoryId: body.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Building category not found' },
        { status: 404 }
      );
    }

    // Determine building type based on floor count
    const buildingFloors = body.buildingFloors ? parseInt(body.buildingFloors) : 1;
    let buildingType: 'low-rise' | 'mid-rise' | 'high-rise';
    if (buildingFloors <= 4) {
      buildingType = 'low-rise';
    } else if (buildingFloors <= 12) {
      buildingType = 'mid-rise';
    } else {
      buildingType = 'high-rise';
    }

    // For simulation, use 'menengah' (medium) as default quality level
    // In production, this should come from form selection
    const qualityLevel = 'menengah' as 'sederhana' | 'menengah' | 'mewah';
    const iaiCategory = mapToIAIBuildingCategory(buildingType, qualityLevel);

    // Calculate design fee using IAI standard
    const calculation = calculateIAIDesignFee(buildingArea, iaiCategory);

    return NextResponse.json({
      buildingType,
      buildingArea,
      buildingCategory: iaiCategory,
      qualityLevel,
      rab: calculation.rab,
      designFee: calculation.designFee,
      preDesignPrice: calculation.preDesignPrice,
      schematicPrice: calculation.schematicPrice,
      dedPrice: calculation.dedPrice,
      iaiFeeRate: calculation.iaiFeeRate,
      pricePerM2: calculation.pricePerM2,
      // Payment terms
      dp10: calculation.dp10,
      remainingAfterDP: calculation.remainingAfterDP,
      payment80AfterAgreed: calculation.payment80AfterAgreed,
      payment20AfterComplete: calculation.payment20AfterComplete,
      currency: 'IDR',
      category: {
        categoryId: category.categoryId,
        labelIndo: category.labelIndo,
        labelEng: category.labelEng,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error calculating design price:', error);
    return NextResponse.json({ error: 'Failed to calculate design price' }, { status: 500 });
  }
}
