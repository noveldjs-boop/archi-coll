import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - List all partners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const partners = await db.partner.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        ads: true,
        catalogs: true
      }
    })

    return NextResponse.json({
      success: true,
      data: partners
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partners'
      },
      { status: 500 }
    )
  }
}

// POST - Create new partner (from approved request or manual)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userId,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      type,
      contractStart,
      contractEnd,
      commissionRate,
      logoUrl,
      websiteUrl,
      description
    } = body

    // Validate required fields
    if (!companyName || !contactPerson || !email || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    // Create partner
    const partner = await db.partner.create({
      data: {
        userId: userId || null,
        companyName,
        contactPerson,
        email,
        phone: phone || null,
        address: address || null,
        type,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        commissionRate: commissionRate || null,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        description: description || null,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner created successfully'
    })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create partner'
      },
      { status: 500 }
    )
  }
}
