import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all product catalogs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const partnerId = searchParams.get('partnerId');

    // Build where clause
    const where: any = {
      status: 'active',
    };

    if (category) {
      where.category = category;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    // Fetch catalogs
    const catalogs = await db.productCatalog.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            websiteUrl: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 50,
    });

    return NextResponse.json({ success: true, data: catalogs });
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalogs' },
      { status: 500 }
    );
  }
}
