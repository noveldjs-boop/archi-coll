import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = formData.get('orderId') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const type = formData.get('type') as string
    const proof = formData.get('proof') as File

    if (!orderId || !paymentMethod || !proof) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Save payment proof
    const bytes = await proof.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const filename = `payment_${orderId}_${timestamp}${path.extname(proof.name)}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'payments', filename)

    // Ensure directory exists
    const fs = await import('fs')
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Write file
    await writeFile(filepath, buffer)

    const proofUrl = `/uploads/payments/${filename}`

    // Calculate payment amount based on type
    let amount = 0
    if (type === 'dp') {
      amount = order.simulatedDP10
    } else if (type === 'payment_80_percent') {
      amount = order.finalPayment80 || 0
    } else if (type === 'payment_20_percent') {
      amount = order.finalPayment20 || 0
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        orderId,
        type,
        amount,
        paymentMethod,
        proofUrl,
        paidAt: new Date()
      }
    })

    // Update order status
    const updateData: any = {}
    if (type === 'dp') {
      updateData.dpPaid = true
      updateData.dpPaymentDate = new Date()
      updateData.paymentStage = 'dp_paid'
    }

    await db.order.update({
      where: { id: orderId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error uploading payment:', error)
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}
