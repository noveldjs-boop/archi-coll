/**
 * Google Drive Folders Endpoint
 *
 * POST /api/google-drive/folders - Create new folder
 * POST /api/google-drive/folders/share - Share folder with email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFolder, shareFolder, refreshAccessToken, isTokenExpired } from '@/lib/google-drive';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/auth';

/**
 * POST handler - Create folder or share folder
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

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken || !user.googleRefreshToken) {
      return NextResponse.json(
        { success: false, error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = user.googleAccessToken;
    if (user.googleTokenExpiry && isTokenExpired(user.googleTokenExpiry.getTime())) {
      console.log('Access token expired, refreshing...');
      const newTokens = await refreshAccessToken(user.googleRefreshToken);

      // Update tokens in database
      await db.user.update({
        where: { id: session.user.id },
        data: {
          googleAccessToken: newTokens.access_token,
          googleTokenExpiry: new Date(newTokens.expiry_date),
        },
      });

      accessToken = newTokens.access_token;
    }

    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      // Create folder
      const { name, parentId, description } = body;

      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Folder name is required' },
          { status: 400 }
        );
      }

      const folder = await createFolder(
        name,
        parentId || 'root',
        accessToken,
        { description }
      );

      return NextResponse.json({
        success: true,
        folder,
        message: 'Folder created successfully',
      });
    } else if (action === 'share') {
      // Share folder
      const { folderId, email, role, notify, emailMessage } = body;

      if (!folderId || !email || !role) {
        return NextResponse.json(
          { success: false, error: 'Folder ID, email, and role are required' },
          { status: 400 }
        );
      }

      await shareFolder(
        folderId,
        email,
        role,
        accessToken,
        { notify, emailMessage }
      );

      return NextResponse.json({
        success: true,
        message: `Folder shared successfully with ${email}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "create" or "share"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in Google Drive folders endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
