import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST upload payment proof
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'client') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = session.user.clientId

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID not found' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const paymentId = formData.get('paymentId') as string
    const notes = formData.get('notes') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG) and PDF are allowed' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Get payment and verify it belongs to client's order
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.order.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to this payment' },
        { status: 403 }
      )
    }

    // In a real implementation, you would upload the file to a storage service
    // For now, we'll simulate it by converting to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const proofUrl = `data:${file.type};base64,${base64}`

    // Update payment with proof
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        proofUrl,
        paidAt: new Date(),
        paymentMethod: 'bank_transfer',
        notes: notes || null,
      },
    })

    // Update order status based on payment type
    let orderUpdateData: any = {}

    if (payment.type === 'dp') {
      orderUpdateData = {
        dpPaid: true,
        dpPaymentDate: new Date(),
        paymentStage: 'dp_paid',
        dpPaidAmount: payment.amount,
      }
    } else if (payment.type === 'payment_80_percent') {
      orderUpdateData = {
        payment80PercentPaid: true,
        payment80Date: new Date(),
        paymentStage: 'payment_80_percent',
      }
    } else if (payment.type === 'payment_20_percent') {
      orderUpdateData = {
        payment20PercentPaid: true,
        payment20Date: new Date(),
        paymentStage: 'payment_20_percent',
        fullyPaid: true,
      }
    }

    if (Object.keys(orderUpdateData).length > 0) {
      await db.order.update({
        where: { id: payment.orderId },
        data: orderUpdateData,
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Payment proof uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}
