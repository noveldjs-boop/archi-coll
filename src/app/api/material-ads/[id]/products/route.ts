import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Fetch all products for a specific ad
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isAdminOrMarketing = session?.user?.role === 'ADMIN' || session?.user?.role === 'MARKETING'

    // Check if ad exists
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

    // Fetch products
    const products = await db.productItem.findMany({
      where: {
        materialAdId: params.id,
        ...(isAdminOrMarketing ? {} : { isActive: true })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
