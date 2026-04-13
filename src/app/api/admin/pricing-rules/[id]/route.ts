import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch single pricing rule
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const rule = await db.pricingRule.findUnique({
      where: { id }
    });

    if (!rule) {
      return NextResponse.json({ error: 'Pricing rule not found' }, { status: 404 });
    }

    return NextResponse.json(rule, { status: 200 });
  } catch (error) {
    console.error('Error fetching pricing rule:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rule' }, { status: 500 });
  }
}

// PUT - Update pricing rule
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate building type if provided
    if (body.buildingType && !['low-rise', 'mid-rise', 'high-rise'].includes(body.buildingType)) {
      return NextResponse.json(
        { error: 'Invalid building type. Must be: low-rise, mid-rise, or high-rise' },
        { status: 400 }
      );
    }

    // Validate quality level if provided
    if (body.qualityLevel && !['sederhana', 'menengah', 'mewah'].includes(body.qualityLevel)) {
      return NextResponse.json(
        { error: 'Invalid quality level. Must be: sederhana, menengah, or mewah' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.buildingType !== undefined) updateData.buildingType = body.buildingType;
    if (body.qualityLevel !== undefined) updateData.qualityLevel = body.qualityLevel;
    if (body.pricePerM2 !== undefined) updateData.pricePerM2 = parseFloat(body.pricePerM2);
    if (body.iaiFeeRate !== undefined) updateData.iaiFeeRate = parseFloat(body.iaiFeeRate);
    if (body.minFloors !== undefined) updateData.minFloors = parseInt(body.minFloors);
    if (body.maxFloors !== undefined) updateData.maxFloors = body.maxFloors ? parseInt(body.maxFloors) : null;
    if (body.descriptionIndo !== undefined) updateData.descriptionIndo = body.descriptionIndo;
    if (body.descriptionEng !== undefined) updateData.descriptionEng = body.descriptionEng;
    if (body.active !== undefined) updateData.active = body.active;

    const { id } = await params;
    const rule = await db.pricingRule.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(rule, { status: 200 });
  } catch (error: any) {
    console.error('Error updating pricing rule:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A pricing rule with this building type and quality level already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 });
  }
}

// DELETE - Delete pricing rule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.pricingRule.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Pricing rule deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 });
  }
}
