/**
 * Google Drive Status Endpoint
 *
 * GET /api/google-drive/status
 *
 * Returns the Google Drive connection status for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/auth';

/**
 * GET handler - Get Google Drive connection status
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to identify the user
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if connected
    const isConnected = !!(user.googleAccessToken && user.googleRefreshToken);

    return NextResponse.json({
      success: true,
      connected: isConnected,
      googleEmail: null,
      hasToken: !!user.googleAccessToken,
      hasRefreshToken: !!user.googleRefreshToken,
    });
  } catch (error) {
    console.error('Error getting Google Drive status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
