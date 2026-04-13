import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// PUT - Update a form field
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, fieldId } = await params;
    const body = await req.json();

    // Get category by database ID
    const category = await db.buildingCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Building category not found' }, { status: 404 });
    }

    // Update form field
    const formField = await db.buildingCategoryFormField.updateMany({
      where: {
        categoryId: category.id,
        fieldId,
      },
      data: {
        ...(body.labelIndo !== undefined && { labelIndo: body.labelIndo }),
        ...(body.labelEng !== undefined && { labelEng: body.labelEng }),
        ...(body.fieldType !== undefined && { fieldType: body.fieldType }),
        ...(body.required !== undefined && { required: body.required }),
        ...(body.options !== undefined && { options: body.options }),
        ...(body.placeholderIndo !== undefined && { placeholderIndo: body.placeholderIndo }),
        ...(body.placeholderEng !== undefined && { placeholderEng: body.placeholderEng }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    if (formField.count === 0) {
      return NextResponse.json(
        { error: 'Form field not found' },
        { status: 404 }
      );
    }

    // Fetch updated field
    const updatedField = await db.buildingCategoryFormField.findFirst({
      where: { categoryId: category.id, fieldId },
    });

    return NextResponse.json({ formField: updatedField }, { status: 200 });
  } catch (error) {
    console.error('Error updating form field:', error);
    return NextResponse.json(
      { error: 'Failed to update form field' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a form field
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, fieldId } = await params;

    // Get category by database ID
    const category = await db.buildingCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Building category not found' }, { status: 404 });
    }

    const formField = await db.buildingCategoryFormField.deleteMany({
      where: {
        categoryId: category.id,
        fieldId,
      },
    });

    if (formField.count === 0) {
      return NextResponse.json(
        { error: 'Form field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Form field deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting form field:', error);
    return NextResponse.json(
      { error: 'Failed to delete form field' },
      { status: 500 }
    );
  }
}
