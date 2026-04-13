import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// GET - Fetch all category form fields, optionally filtered by categoryId
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const formFields = await db.buildingCategoryFormField.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { categoryId: 'asc' },
        { order: 'asc' },
      ],
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

// POST - Create new category form field
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const requiredFields = ['categoryId', 'fieldId', 'labelIndo', 'labelEng', 'fieldType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate field type
    const validFieldTypes = ['text', 'number', 'select', 'textarea'];
    if (!validFieldTypes.includes(body.fieldType)) {
      return NextResponse.json(
        { error: 'Invalid field type. Must be text, number, select, or textarea' },
        { status: 400 }
      );
    }

    // Validate options for select type
    if (body.fieldType === 'select' && !body.options) {
      return NextResponse.json(
        { error: 'Options are required for select field type' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await db.buildingCategory.findUnique({
      where: { categoryId: body.categoryId },
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
        categoryId: body.categoryId,
        fieldId: body.fieldId,
        labelIndo: body.labelIndo,
        labelEng: body.labelEng,
        fieldType: body.fieldType,
        required: body.required !== undefined ? body.required : true,
        options: body.options || null,
        placeholderIndo: body.placeholderIndo || null,
        placeholderEng: body.placeholderEng || null,
        active: body.active !== undefined ? body.active : true,
        order: body.order !== undefined ? parseInt(body.order) : 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ formField }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category form field:', error);

    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Form field with this field ID already exists in this category' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category form field' },
      { status: 500 }
    );
  }
}
