import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch all company news/announcements
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const targetAudience = searchParams.get('targetAudience');

    // Build where clause
    const where: any = {
      active: true,
      // Only show news that hasn't expired yet
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (category) {
      where.category = category;
    }

    if (targetAudience) {
      where.OR = [
        { targetAudience: null },
        { targetAudience: 'all' },
        { targetAudience: targetAudience },
      ];
    }

    // Fetch news, ordered by priority (urgent first) and date (newest first)
    const news = await db.companyNews.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // urgent, high, normal, low
        { publishedAt: 'desc' },
      ],
      take: 20,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
