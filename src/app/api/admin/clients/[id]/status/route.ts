import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

// PATCH - Update client status (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await db.client.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, client }, { status: 200 });
  } catch (error) {
    console.error('Error updating client status:', error);
    return NextResponse.json({ error: 'Failed to update client status' }, { status: 500 });
  }
}
