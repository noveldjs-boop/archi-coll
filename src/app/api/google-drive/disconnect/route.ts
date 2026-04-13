/**
 * Google Drive Disconnect Endpoint
 *
 * POST /api/google-drive/disconnect
 *
 * Disconnects Google Drive integration for the current user by
 * removing their tokens from the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/auth';

/**
 * POST handler - Disconnect Google Drive
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to identify the user
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove Google Drive tokens from database
    await db.user.update({
      where: { id: session.user.id },
      data: {
        googleEmail: null,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    console.log(`Successfully disconnected Google Drive for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Google Drive disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to disconnect Google Drive',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
