import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Check if admin user exists, create if not
export async function GET() {
  try {
    // Check if admin user exists
    let adminUser = await db.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      // Create admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = await db.user.create({
        data: {
          email: 'admin@archi-coll.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'admin',
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user created',
        user: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
        defaultPassword: adminPassword
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user already exists',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      }
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 });
  }
}
