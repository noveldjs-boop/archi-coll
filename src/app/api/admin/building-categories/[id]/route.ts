import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// PUT - Update a building category (admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, labelIndo, labelEng, descriptionIndo, descriptionEng, featuresIndo, featuresEng, icon, imageUrl, order, active } = body;

    const category = await db.buildingCategory.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(labelIndo && { labelIndo }),
        ...(labelEng && { labelEng }),
        ...(descriptionIndo !== undefined && { descriptionIndo }),
        ...(descriptionEng !== undefined && { descriptionEng }),
        ...(featuresIndo !== undefined && { featuresIndo }),
        ...(featuresEng !== undefined && { featuresEng }),
        ...(icon !== undefined && { icon }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    console.error('Error updating building category:', error);
    return NextResponse.json({ error: 'Failed to update building category' }, { status: 500 });
  }
}

// DELETE - Delete a building category (admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.buildingCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting building category:', error);
    return NextResponse.json({ error: 'Failed to delete building category' }, { status: 500 });
  }
}
