import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST - Reset admin password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    // Find admin user
    const adminUser = await db.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully',
      email: adminUser.email
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
