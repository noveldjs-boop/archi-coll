import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch all active ads for sidebar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement'); // 'sidebar', 'homepage', etc.
    const type = searchParams.get('type'); // 'product', 'service', 'catalog'

    // Build where clause
    const where: any = {
      status: 'active',
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    };

    if (type) {
      where.type = type;
    }

    // Fetch ads
    let ads = await db.ad.findMany({
      where,
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            websiteUrl: true,
            logoUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
    });

    // Filter by placement if specified (check JSON placement field)
    if (placement) {
      ads = ads.filter((ad) => {
        if (!ad.placement) return false;
        try {
          const placements = JSON.parse(ad.placement);
          return placements.includes(placement);
        } catch {
          return false;
        }
      });
    }

    // Increment view count (async, don't wait)
    ads.forEach(async (ad) => {
      try {
        await db.ad.update({
          where: { id: ad.id },
          data: { views: { increment: 1 } },
        });
      } catch (error) {
        // Silent fail for view count
      }
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
