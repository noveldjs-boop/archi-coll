import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  saveToLocalStorage,
  validateFileType,
  validateFileSize,
  getPublicUrl,
} from '@/lib/local-storage'

// POST upload avatar to local storage
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
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG and PNG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (2MB)
    if (!validateFileSize(file, 2)) {
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

    // Delete old avatar if it's local
    if (user.avatarFilePath && user.avatarStorageType === 'local') {
      const { deleteLocalFile } = await import('@/lib/local-storage')
      await deleteLocalFile(user.avatarFilePath)
    }

    // Save file to local storage
    const folderPath = `avatars/${userId}`
    const filePath = await saveToLocalStorage(file, folderPath)

    // Update user with new avatar
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        avatarStorageType: 'local',
        avatarFilePath: filePath,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: getPublicUrl(filePath),
        avatarStorageType: 'local',
        avatarFilePath: filePath,
      },
      message: 'Avatar uploaded successfully to local storage',
    })
  } catch (error) {
    console.error('Error uploading avatar to local storage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar to local storage' },
      { status: 500 }
    )
  }
}
