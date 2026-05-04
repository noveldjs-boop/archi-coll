import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// PUT - Update an order form field (admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fieldId, labelIndo, labelEng, fieldType, required, options, placeholderIndo, placeholderEng, order, active } = body;

    const field = await db.orderFormField.update({
      where: { id },
      data: {
        ...(fieldId && { fieldId }),
        ...(labelIndo && { labelIndo }),
        ...(labelEng && { labelEng }),
        ...(fieldType && { fieldType }),
        ...(required !== undefined && { required }),
        ...(options !== undefined && { options }),
        ...(placeholderIndo !== undefined && { placeholderIndo }),
        ...(placeholderEng !== undefined && { placeholderEng }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, field }, { status: 200 });
  } catch (error) {
    console.error('Error updating order form field:', error);
    return NextResponse.json({ error: 'Failed to update order form field' }, { status: 500 });
  }
}

// DELETE - Delete an order form field (admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.orderFormField.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting order form field:', error);
    return NextResponse.json({ error: 'Failed to delete order form field' }, { status: 500 });
  }
}
