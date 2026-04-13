import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET existing rating for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
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

    // Check if order exists and belongs to client
    const order = await db.order.findUnique({
      where: {
        id: orderId,
        clientId,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get existing rating
    const rating = await db.clientProjectRating.findUnique({
      where: {
        orderId: orderId,
      },
    })

    if (!rating) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No rating found',
      })
    }

    return NextResponse.json({ success: true, data: rating })
  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rating' },
      { status: 500 }
    )
  }
}

// POST submit new rating for an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
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

    // Check if order exists, belongs to client, and is completed
    const order = await db.order.findUnique({
      where: {
        id: orderId,
        clientId,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating can only be submitted for completed orders',
        },
        { status: 400 }
      )
    }

    // Check if rating already exists
    const existingRating = await db.clientProjectRating.findUnique({
      where: {
        orderId: orderId,
      },
    })

    if (existingRating) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating already exists for this order',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      designQuality = 0,
      communication = 0,
      timeliness = 0,
      professionalism = 0,
      overallSatisfaction,
      whatLiked,
      whatToImprove,
      additionalComments,
    } = body

    // Validate overall satisfaction is required
    if (!overallSatisfaction || overallSatisfaction < 1 || overallSatisfaction > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Overall satisfaction rating is required and must be between 1-5',
        },
        { status: 400 }
      )
    }

    // Validate all ratings are between 0-5
    const ratings = [
      designQuality,
      communication,
      timeliness,
      professionalism,
      overallSatisfaction,
    ]

    for (const rating of ratings) {
      if (rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            error: 'All ratings must be between 0-5',
          },
          { status: 400 }
        )
      }
    }

    // Create rating
    const rating = await db.clientProjectRating.create({
      data: {
        orderId: orderId,
        clientId,
        designQuality,
        communication,
        timeliness,
        professionalism,
        overallSatisfaction,
        whatLiked,
        whatToImprove,
        additionalComments,
      },
    })

    return NextResponse.json({
      success: true,
      data: rating,
      message: 'Rating submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

// PUT update existing rating
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
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

    // Check if rating exists and belongs to client
    const existingRating = await db.clientProjectRating.findUnique({
      where: {
        orderId: orderId,
      },
    })

    if (!existingRating) {
      return NextResponse.json(
        { success: false, error: 'Rating not found' },
        { status: 404 }
      )
    }

    if (existingRating.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this rating' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      designQuality,
      communication,
      timeliness,
      professionalism,
      overallSatisfaction,
      whatLiked,
      whatToImprove,
      additionalComments,
    } = body

    // Validate overall satisfaction if provided
    if (overallSatisfaction !== undefined && (overallSatisfaction < 1 || overallSatisfaction > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Overall satisfaction rating must be between 1-5',
        },
        { status: 400 }
      )
    }

    // Validate all ratings are between 0-5
    const ratings = [
      designQuality,
      communication,
      timeliness,
      professionalism,
      overallSatisfaction,
    ].filter((r): r is number => r !== undefined)

    for (const rating of ratings) {
      if (rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            error: 'All ratings must be between 0-5',
          },
          { status: 400 }
        )
      }
    }

    // Update rating
    const updatedRating = await db.clientProjectRating.update({
      where: {
        orderId: orderId,
      },
      data: {
        ...(designQuality !== undefined && { designQuality }),
        ...(communication !== undefined && { communication }),
        ...(timeliness !== undefined && { timeliness }),
        ...(professionalism !== undefined && { professionalism }),
        ...(overallSatisfaction !== undefined && { overallSatisfaction }),
        ...(whatLiked !== undefined && { whatLiked }),
        ...(whatToImprove !== undefined && { whatToImprove }),
        ...(additionalComments !== undefined && { additionalComments }),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedRating,
      message: 'Rating updated successfully',
    })
  } catch (error) {
    console.error('Error updating rating:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update rating' },
      { status: 500 }
    )
  }
}
