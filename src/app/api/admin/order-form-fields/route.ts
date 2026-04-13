import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// Fixed: Using authOptions from lib/auth for consistent authentication

// GET - Fetch all order form fields (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fields = await db.orderFormField.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ fields }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order form fields:', error);
    return NextResponse.json({ error: 'Failed to fetch order form fields' }, { status: 500 });
  }
}

// POST - Create a new order form field (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fieldId, labelIndo, labelEng, fieldType, required, options, placeholderIndo, placeholderEng, order, active } = body;

    if (!fieldId || !labelIndo || !labelEng || !fieldType) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const field = await db.orderFormField.create({
      data: {
        fieldId,
        labelIndo,
        labelEng,
        fieldType,
        required: required !== undefined ? required : true,
        options,
        placeholderIndo,
        placeholderEng,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ success: true, field }, { status: 201 });
  } catch (error) {
    console.error('Error creating order form field:', error);
    return NextResponse.json({ error: 'Failed to create order form field' }, { status: 500 });
  }
}
