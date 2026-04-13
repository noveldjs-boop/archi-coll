import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// PUT - Update category form field
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate field type if provided
    if (body.fieldType) {
      const validFieldTypes = ['text', 'number', 'select', 'textarea'];
      if (!validFieldTypes.includes(body.fieldType)) {
        return NextResponse.json(
          { error: 'Invalid field type. Must be text, number, select, or textarea' },
          { status: 400 }
        );
      }
    }

    // Update form field
    const formField = await db.buildingCategoryFormField.update({
      where: { id },
      data: {
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.fieldId && { fieldId: body.fieldId }),
        ...(body.labelIndo && { labelIndo: body.labelIndo }),
        ...(body.labelEng && { labelEng: body.labelEng }),
        ...(body.fieldType && { fieldType: body.fieldType }),
        ...(body.required !== undefined && { required: body.required }),
        ...(body.options !== undefined && { options: body.options }),
        ...(body.placeholderIndo !== undefined && { placeholderIndo: body.placeholderIndo }),
        ...(body.placeholderEng !== undefined && { placeholderEng: body.placeholderEng }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.order !== undefined && { order: parseInt(body.order) }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ formField }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category form field:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Form field not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Form field with this field ID already exists in this category' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category form field' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category form field
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.buildingCategoryFormField.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Form field deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting category form field:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Form field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete form field' },
      { status: 500 }
    );
  }
}
