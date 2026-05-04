import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'suspended', 'expired', 'all'
    const type = searchParams.get('type') // 'product-supplier', 'contractor', 'material-supplier'

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (type) {
      where.type = type
    }

    const partners = await db.partner.findMany({
      where,
      include: {
        ads: true,
        catalogs: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      type,
      status,
      contractStart,
      contractEnd,
      commissionRate,
      logoUrl,
      websiteUrl,
      description
    } = body

    const partner = await db.partner.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        type,
        status: status || 'pending',
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        commissionRate: commissionRate || 0,
        totalRevenue: 0,
        logoUrl,
        websiteUrl,
        description
      }
    })

    return NextResponse.json({ partner }, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      type,
      status,
      contractStart,
      contractEnd,
      commissionRate,
      logoUrl,
      websiteUrl,
      description
    } = body

    const partner = await db.partner.update({
      where: { id },
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        type,
        status,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        commissionRate,
        logoUrl,
        websiteUrl,
        description
      }
    })

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    await db.partner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
}
