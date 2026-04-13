import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  uploadFile,
  deleteFile,
  refreshAccessToken,
  isTokenExpired,
} from '@/lib/google-drive'

// POST upload avatar to Google Drive
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG and PNG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 2MB limit' },
        { status: 400 }
      )
    }

    // Get current user data
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if Google Drive is connected
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      return NextResponse.json(
        { success: false, error: 'Google Drive not connected. Please connect your Google Drive first.' },
        { status: 400 }
      )
    }

    // Check if token is expired and refresh if needed
    let accessToken = user.googleAccessToken
    if (user.googleTokenExpiry && isTokenExpired(user.googleTokenExpiry.getTime())) {
      console.log('Access token expired, refreshing...')
      try {
        const newTokens = await refreshAccessToken(user.googleRefreshToken)

        // Update tokens in database
        await db.user.update({
          where: { id: userId },
          data: {
            googleAccessToken: newTokens.access_token,
            googleTokenExpiry: new Date(newTokens.expiry_date),
          },
        })

        accessToken = newTokens.access_token
      } catch (error) {
        console.error('Error refreshing access token:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to refresh access token. Please reconnect Google Drive.' },
          { status: 401 }
        )
      }
    }

    // Delete old avatar from Drive if it exists
    if (user.avatarDriveFileId && user.avatarStorageType === 'drive') {
      try {
        await deleteFile(user.avatarDriveFileId, accessToken)
      } catch (error) {
        console.error('Error deleting old avatar from Drive:', error)
        // Continue even if deletion fails
      }
    }

    // Upload to Google Drive
    const folderName = `avatars/${userId}`
    const driveFile = await uploadFile(file, folderName, accessToken, {
      description: `Profile avatar for user ${userId}`,
    })

    // Update user with new avatar
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        avatarStorageType: 'drive',
        avatarDriveFileId: driveFile.id,
        avatarUrl: driveFile.webViewLink,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: driveFile.webViewLink,
        avatarStorageType: 'drive',
        avatarDriveFileId: driveFile.id,
      },
      message: 'Avatar uploaded successfully to Google Drive',
    })
  } catch (error) {
    console.error('Error uploading avatar to Google Drive:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar to Google Drive' },
      { status: 500 }
    )
  }
}
