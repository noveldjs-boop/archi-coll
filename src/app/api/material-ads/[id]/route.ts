import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get ad by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isAdminOrMarketing = session?.user?.role === 'ADMIN' || session?.user?.role === 'MARKETING'

    const ad = await db.materialAd.findUnique({
      where: { id: params.id }
    })

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      )
    }

    // Jika bukan admin/marketing dan ad tidak aktif, return 404
    if (!isAdminOrMarketing && !ad.isActive) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Error fetching material ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad' },
      { status: 500 }
    )
  }
}

// PUT - Update ad (admin/marketing only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authorization
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MARKETING')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, imageUrl, catalogUrl, price, contact, isActive } = body

    // Validate category if provided
    if (category) {
      const validCategories = ['struktural', 'penutup-dinding', 'atap-plafon', 'finishing', 'transparan-kaca', 'alternatif-alami', 'mep', 'sanitary', 'landscape']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    const ad = await db.materialAd.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(catalogUrl !== undefined && { catalogUrl }),
        ...(price !== undefined && { price }),
        ...(contact !== undefined && { contact }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Error updating material ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ad' },
      { status: 500 }
    )
  }
}

// DELETE - Delete ad (admin/marketing only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authorization
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MARKETING')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.materialAd.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Ad deleted successfully' })
  } catch (error) {
    console.error('Error deleting material ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad' },
      { status: 500 }
    )
  }
}
