import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// GET - Fetch all building categories (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await db.buildingCategory.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching building categories:', error);
    return NextResponse.json({ error: 'Failed to fetch building categories' }, { status: 500 });
  }
}

// POST - Create a new building category (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, labelIndo, labelEng, descriptionIndo, descriptionEng, featuresIndo, featuresEng, icon, imageUrl, order, active } = body;

    if (!categoryId || !labelIndo || !labelEng) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const category = await db.buildingCategory.create({
      data: {
        categoryId,
        labelIndo,
        labelEng,
        descriptionIndo,
        descriptionEng,
        featuresIndo,
        featuresEng,
        icon,
        imageUrl,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Error creating building category:', error);
    return NextResponse.json({ error: 'Failed to create building category' }, { status: 500 });
  }
}
