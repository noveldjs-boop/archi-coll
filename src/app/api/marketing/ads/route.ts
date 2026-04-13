import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'active', 'paused', 'expired', 'rejected', 'all'
    const partnerId = searchParams.get('partnerId')
    const type = searchParams.get('type') // 'product', 'service', 'catalog'

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (partnerId) {
      where.partnerId = partnerId
    }
    if (type) {
      where.type = type
    }

    const ads = await db.ad.findMany({
      where,
      include: {
        partner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      partnerId,
      title,
      titleIndo,
      titleEng,
      description,
      descriptionIndo,
      descriptionEng,
      type,
      imageUrl,
      imageUrls,
      linkUrl,
      placement,
      startDate,
      endDate,
      priority
    } = body

    const ad = await db.ad.create({
      data: {
        partnerId,
        title,
        titleIndo,
        titleEng,
        description,
        descriptionIndo,
        descriptionEng,
        type,
        imageUrl,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
        linkUrl,
        placement: placement ? JSON.stringify(placement) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        priority: priority || 0,
        views: 0,
        clicks: 0,
        status: 'pending'
      },
      include: {
        partner: true
      }
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      partnerId,
      title,
      titleIndo,
      titleEng,
      description,
      descriptionIndo,
      descriptionEng,
      type,
      imageUrl,
      imageUrls,
      linkUrl,
      placement,
      startDate,
      endDate,
      priority,
      status,
      action // 'approve', 'reject'
    } = body

    // Handle approval/rejection
    if (action === 'approve') {
      const ad = await db.ad.update({
        where: { id },
        data: {
          status: 'active',
          approvedAt: new Date()
        }
      })
      return NextResponse.json({ ad })
    } else if (action === 'reject') {
      const ad = await db.ad.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: body.rejectionReason || ''
        }
      })
      return NextResponse.json({ ad })
    }

    // Regular update
    const ad = await db.ad.update({
      where: { id },
      data: {
        partnerId,
        title,
        titleIndo,
        titleEng,
        description,
        descriptionIndo,
        descriptionEng,
        type,
        imageUrl,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
        linkUrl,
        placement: placement ? JSON.stringify(placement) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        priority,
        status
      },
      include: {
        partner: true
      }
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json(
      { error: 'Failed to update ad' },
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
        { error: 'Ad ID is required' },
        { status: 400 }
      )
    }

    await db.ad.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    )
  }
}
