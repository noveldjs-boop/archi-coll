import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Check if there are active members for a building category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');

    // Support both old 'category' and new 'categoryId' parameters
    const targetCategory = categoryId || category;

    if (!targetCategory) {
      return NextResponse.json({ error: 'Category or categoryId parameter is required' }, { status: 400 });
    }

    // Check for active members with expertise in this category
    // The expertise field contains comma-separated category IDs
    const members = await db.member.findMany({
      where: {
        status: 'active',
        expertise: {
          contains: targetCategory,
        },
      },
    });

    const hasMembers = members.length > 0;

    return NextResponse.json(
      {
        hasMembers,
        count: members.length,
        category: targetCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking category members:', error);
    return NextResponse.json({ error: 'Failed to check category members' }, { status: 500 });
  }
}
