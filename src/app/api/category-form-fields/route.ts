import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch form fields for a specific category (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Missing required parameter: categoryId' },
        { status: 400 }
      );
    }

    const formFields = await db.buildingCategoryFormField.findMany({
      where: {
        categoryId,
        active: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ formFields }, { status: 200 });
  } catch (error) {
    console.error('Error fetching category form fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category form fields' },
      { status: 500 }
    );
  }
}
