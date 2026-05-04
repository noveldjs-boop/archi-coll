import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// GET - Fetch all form fields for a category
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

    // Get category by database ID
    const category = await db.buildingCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Building category not found' }, { status: 404 });
    }

    const formFields = await db.buildingCategoryFormField.findMany({
      where: { categoryId: category.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ formFields }, { status: 200 });
  } catch (error) {
    console.error('Error fetching form fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form fields' },
      { status: 500 }
    );
  }
}

// POST - Create a new form field for a category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate required fields
    const { fieldId, labelIndo, labelEng, fieldType, required, order } = body;

    if (!fieldId || !labelIndo || !labelEng || !fieldType) {
      return NextResponse.json(
        { error: 'fieldId, labelIndo, labelEng, and fieldType are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.buildingCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Building category not found' },
        { status: 404 }
      );
    }

    // Create form field
    const formField = await db.buildingCategoryFormField.create({
      data: {
        categoryId: category.id,
        fieldId,
        labelIndo,
        labelEng,
        fieldType,
        required: required !== undefined ? required : true,
        options: body.options || null,
        placeholderIndo: body.placeholderIndo || null,
        placeholderEng: body.placeholderEng || null,
        order: order || 0,
        active: true,
      },
    });

    return NextResponse.json({ formField }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating form field:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Field ID already exists for this category' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create form field' },
      { status: 500 }
    );
  }
}
