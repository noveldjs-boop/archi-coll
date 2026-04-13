/**
 * Google Drive OAuth Authentication Endpoint
 *
 * GET /api/google-drive/auth
 *
 * Returns the Google OAuth authorization URL with a secure state token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-drive';
import { randomBytes } from 'crypto';

/**
 * Generate a secure state token for CSRF protection
 */
function generateState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * GET handler - Generate OAuth URL
 */
export async function GET(request: NextRequest) {
  try {
    // Generate secure state token
    const state = generateState();

    // Get OAuth authorization URL
    const authUrl = await getAuthUrl(state);

    // Return the auth URL and state to the client
    return NextResponse.json({
      success: true,
      authUrl,
      state,
    });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate OAuth URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
