import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Get single partnership request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partnershipRequest = await db.partnershipRequest.findUnique({
      where: {
        id: id
      }
    })

    if (!partnershipRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partnership request not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partnershipRequest
    })
  } catch (error) {
    console.error('Error fetching partnership request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partnership request'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update partnership request (approve/reject - simplified)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, reviewNotes } = body

    // Get the request to approve/reject
    const partnershipRequest = await db.partnershipRequest.findUnique({
      where: { id: id }
    })

    if (!partnershipRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partnership request not found'
        },
        { status: 404 }
      )
    }

    // Update status based on action
    let newStatus = 'pending'
    if (action === 'approve') {
      newStatus = 'approved'
    } else if (action === 'reject') {
      newStatus = 'rejected'
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "approve" or "reject"'
        },
        { status: 400 }
      )
    }

    // Update the request
    const updatedRequest = await db.partnershipRequest.update({
      where: { id: id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Partnership request ${newStatus} successfully`
    })
  } catch (error) {
    console.error('Error updating partnership request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update partnership request'
      },
      { status: 500 }
    )
  }
}

// PUT - Update partnership request (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, reviewedBy, reviewNotes, partnerId } = body

    // Validate status
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status'
        },
        { status: 400 }
      )
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
      updateData.reviewedAt = new Date()
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy
    }

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes
    }

    if (partnerId) {
      updateData.partnerId = partnerId
    }

    const partnershipRequest = await db.partnershipRequest.update({
      where: {
        id: id
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: partnershipRequest,
      message: 'Partnership request updated successfully'
    })
  } catch (error) {
    console.error('Error updating partnership request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update partnership request'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete partnership request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.partnershipRequest.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Partnership request deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting partnership request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete partnership request'
      },
      { status: 500 }
    )
  }
}
