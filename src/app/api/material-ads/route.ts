import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Fetch all ads (public access for viewing, admin/marketing for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const session = await getServerSession(authOptions)

    // Jika bukan admin/marketing, hanya tampilkan yang aktif
    const isAdminOrMarketing = session?.user?.role === 'ADMIN' || session?.user?.role === 'MARKETING'

    const where = {
      ...(category ? { category } : {}),
      ...(isAdminOrMarketing ? {} : { isActive: true })
    }

    const ads = await db.materialAd.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, ads })
  } catch (error) {
    console.error('Error fetching material ads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

// POST - Create new ad (admin/marketing only)
export async function POST(request: NextRequest) {
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
    const { title, description, category, imageUrl, catalogUrl, price, contact, isActive, companyName, companyLogo, websiteUrl } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, category' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['struktural', 'penutup-dinding', 'atap-plafon', 'finishing', 'transparan-kaca', 'alternatif-alami', 'mep', 'sanitary', 'landscape']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    const ad = await db.materialAd.create({
      data: {
        title,
        description,
        category,
        imageUrl: imageUrl || null,
        catalogUrl: catalogUrl || null,
        price: price || null,
        contact: contact || null,
        isActive: isActive ?? true,
        companyName: companyName || null,
        companyLogo: companyLogo || null,
        websiteUrl: websiteUrl || null
      }
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Error creating material ad:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ad' },
      { status: 500 }
    )
  }
}
