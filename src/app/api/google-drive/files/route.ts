/**
 * Google Drive Files Endpoint
 *
 * GET /api/google-drive/files?folderId={id} - List files in folder
 * DELETE /api/google-drive/files?id={fileId} - Delete file
 */

import { NextRequest, NextResponse } from 'next/server';
import { listFiles, deleteFile, getFileInfo, refreshAccessToken, isTokenExpired } from '@/lib/google-drive';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/auth';

/**
 * GET handler - List files in folder
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

    // Get folder ID from query
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId') || 'root';

    // List files
    const files = await listFiles(folderId, accessToken);

    return NextResponse.json({
      success: true,
      files,
      folderId,
    });
  } catch (error) {
    console.error('Error listing Google Drive files:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete file
 */
export async function DELETE(request: NextRequest) {
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

    // Get file ID from query
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Delete file
    await deleteFile(fileId, accessToken);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Google Drive file:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
