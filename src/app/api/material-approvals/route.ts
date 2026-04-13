import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Create material approval items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authorization - semua authenticated user bisa membuat approval
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productItemIds, orderId, quantity, notes } = body

    // Validate required fields
    if (!productItemIds || !Array.isArray(productItemIds) || productItemIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'productItemIds is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify all products exist
    const products = await db.productItem.findMany({
      where: {
        id: { in: productItemIds },
        isActive: true
      }
    })

    if (products.length !== productItemIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some products not found or inactive' },
        { status: 404 }
      )
    }

    // Create approval items
    const approvalItems = await db.materialApprovalItem.createMany({
      data: productItemIds.map((productId: string) => ({
        productItemId: productId,
        orderId: orderId || null,
        userId: session.user.id,
        quantity: quantity || 1,
        notes: notes || null,
        status: 'pending'
      }))
    })

    return NextResponse.json({
      success: true,
      message: `${approvalItems.count} item(s) added to approval`,
      count: approvalItems.count
    })
  } catch (error) {
    console.error('Error creating material approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create approval' },
      { status: 500 }
    )
  }
}

// GET - Get user's approval items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id
    }

    if (orderId) {
      where.orderId = orderId
    }

    if (status) {
      where.status = status
    }

    const approvalItems = await db.materialApprovalItem.findMany({
      where,
      include: {
        productItem: {
          include: {
            materialAd: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, approvalItems })
  } catch (error) {
    console.error('Error fetching approval items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval items' },
      { status: 500 }
    )
  }
}
