import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all pricing rules
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await db.pricingRule.findMany({
      orderBy: [
        { buildingType: 'asc' },
        { qualityLevel: 'asc' },
        { minFloors: 'asc' }
      ]
    });

    return NextResponse.json(rules, { status: 200 });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
}

// POST - Create new pricing rule
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.buildingType || !body.qualityLevel || !body.pricePerM2) {
      return NextResponse.json(
        { error: 'Missing required fields: buildingType, qualityLevel, pricePerM2' },
        { status: 400 }
      );
    }

    // Validate building type
    if (!['low-rise', 'mid-rise', 'high-rise'].includes(body.buildingType)) {
      return NextResponse.json(
        { error: 'Invalid building type. Must be: low-rise, mid-rise, or high-rise' },
        { status: 400 }
      );
    }

    // Validate quality level
    if (!['sederhana', 'menengah', 'mewah'].includes(body.qualityLevel)) {
      return NextResponse.json(
        { error: 'Invalid quality level. Must be: sederhana, menengah, or mewah' },
        { status: 400 }
      );
    }

    // Validate maxFloors if provided
    if (body.maxFloors !== undefined && body.maxFloors !== null) {
      if (body.minFloors !== undefined && body.maxFloors <= body.minFloors) {
        return NextResponse.json(
          { error: 'maxFloors must be greater than minFloors' },
          { status: 400 }
        );
      }
    }

    const rule = await db.pricingRule.create({
      data: {
        buildingType: body.buildingType,
        qualityLevel: body.qualityLevel,
        pricePerM2: parseFloat(body.pricePerM2),
        iaiFeeRate: body.iaiFeeRate !== undefined ? parseFloat(body.iaiFeeRate) : 0.065,
        minFloors: body.minFloors !== undefined ? parseInt(body.minFloors) : 0,
        maxFloors: body.maxFloors !== undefined && body.maxFloors !== null ? parseInt(body.maxFloors) : null,
        descriptionIndo: body.descriptionIndo || null,
        descriptionEng: body.descriptionEng || null,
        active: body.active !== undefined ? body.active : true,
      }
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pricing rule:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A pricing rule with this building type and quality level already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}
