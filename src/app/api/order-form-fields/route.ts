import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all active order form fields (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    let fields;

    if (categoryId) {
      // Fetch form fields specific to this building category
      const category = await db.buildingCategory.findUnique({
        where: { categoryId },
        include: {
          formFields: {
            where: { active: true },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!category) {
        return NextResponse.json({ error: 'Building category not found' }, { status: 404 });
      }

      // If category has custom form fields, return them
      if (category.formFields && category.formFields.length > 0) {
        fields = category.formFields;
      } else {
        // Fall back to global form fields if no custom fields
        fields = await db.orderFormField.findMany({
          where: { active: true },
          orderBy: { order: 'asc' },
        });
      }
    } else {
      // Fetch all global order form fields
      fields = await db.orderFormField.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json({ fields }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order form fields:', error);
    return NextResponse.json({ error: 'Failed to fetch order form fields' }, { status: 500 });
  }
}
