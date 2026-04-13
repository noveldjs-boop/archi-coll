/**
 * Google Drive OAuth Callback Endpoint
 *
 * GET /api/google-drive/callback
 *
 * Handles the OAuth callback from Google, exchanges the authorization code
 * for tokens, and saves them to the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/google-drive';
import { db } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { google } from 'googleapis';

/**
 * GET handler - Handle OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      const errorMessage = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        new URL(`/profile?error=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(
        new URL('/profile?error=missing_code', request.url)
      );
    }

    // Get session to identify the user
    const session = await verifySession();
    if (!session || !session.user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get user's Google email from the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    if (!googleEmail) {
      console.error('Could not retrieve Google email');
      return NextResponse.redirect(
        new URL('/profile?error=no_email', request.url)
      );
    }

    // Save tokens to database
    await db.user.update({
      where: { id: session.user.id },
      data: {
        googleEmail,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: new Date(tokens.expiry_date),
      },
    });

    console.log(`Successfully connected Google Drive for user ${session.user.id} (${googleEmail})`);

    // Redirect to profile page with success
    return NextResponse.redirect(
      new URL('/profile?success=google_drive_connected', request.url)
    );
  } catch (error) {
    console.error('Error in Google Drive callback:', error);

    // Redirect to profile page with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
