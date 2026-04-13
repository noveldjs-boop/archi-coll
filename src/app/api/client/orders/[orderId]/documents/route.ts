import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  uploadFile,
  refreshAccessToken,
  isTokenExpired,
} from '@/lib/google-drive'

// POST upload document to Google Drive
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'client') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = session.user.clientId
    const { orderId } = params

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID not found' },
        { status: 400 }
      )
    }

    // Verify order belongs to client
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to this order' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const documentType = formData.get('documentType') as string || 'schematic'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Document name is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/vnd.dwg',
      'application/dwg',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG), PDF, and DWG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Get user to check Google Drive connection
    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
          where: { id: session.user.id },
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

    // Upload to Google Drive
    const folderName = `documents/${orderId}`
    const driveFile = await uploadFile(file, folderName, accessToken, {
      description: description || `Document for order ${orderId}`,
    })

    // Create document record
    const document = await db.designDocument.create({
      data: {
        orderId: orderId,
        documentType: documentType,
        title: name,
        description: description || null,
        fileUrl: driveFile.webViewLink, // Keep for backward compatibility
        storageType: 'drive',
        driveFileId: driveFile.id,
        deliveredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...document,
        fileUrl: driveFile.webViewLink,
      },
      message: 'Document uploaded successfully to Google Drive',
    })
  } catch (error) {
    console.error('Error uploading document to Google Drive:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document to Google Drive' },
      { status: 500 }
    )
  }
}
