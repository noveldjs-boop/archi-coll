import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { orderId, rating, feedback } = await request.json()

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid order ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Get order
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order with rating
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        clientRating: rating,
        ratingFeedback: feedback || null,
        ratedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
