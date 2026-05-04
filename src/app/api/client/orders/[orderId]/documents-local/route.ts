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

// POST upload document to local storage
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
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG), PDF, and DWG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (50MB)
    if (!validateFileSize(file, 50)) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Save file to local storage
    const folderPath = `documents/${orderId}`
    const filePath = await saveToLocalStorage(file, folderPath)

    // Create document record
    const document = await db.designDocument.create({
      data: {
        orderId: orderId,
        documentType: documentType,
        title: name,
        description: description || null,
        fileUrl: getPublicUrl(filePath), // Keep for backward compatibility
        storageType: 'local',
        filePath: filePath,
        deliveredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...document,
        fileUrl: getPublicUrl(filePath),
      },
      message: 'Document uploaded successfully to local storage',
    })
  } catch (error) {
    console.error('Error uploading document to local storage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document to local storage' },
      { status: 500 }
    )
  }
}
