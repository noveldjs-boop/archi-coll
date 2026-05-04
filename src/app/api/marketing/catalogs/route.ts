import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    const category = searchParams.get('category')
    const status = searchParams.get('status') // 'active', 'inactive', 'out_of_stock', 'all'

    const where: any = {}
    if (partnerId) {
      where.partnerId = partnerId
    }
    if (category) {
      where.category = category
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const catalogs = await db.productCatalog.findMany({
      where,
      include: {
        partner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ catalogs })
  } catch (error) {
    console.error('Error fetching catalogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalogs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      partnerId,
      name,
      nameIndo,
      nameEng,
      category,
      subCategory,
      description,
      descriptionIndo,
      descriptionEng,
      unit,
      price,
      specifications,
      images,
      datasheetUrl,
      status
    } = body

    const catalog = await db.productCatalog.create({
      data: {
        partnerId,
        name,
        nameIndo,
        nameEng,
        category,
        subCategory,
        description,
        descriptionIndo,
        descriptionEng,
        unit,
        price,
        specifications: specifications ? JSON.stringify(specifications) : null,
        images: images ? JSON.stringify(images) : null,
        datasheetUrl,
        status: status || 'active'
      },
      include: {
        partner: true
      }
    })

    return NextResponse.json({ catalog }, { status: 201 })
  } catch (error) {
    console.error('Error creating catalog:', error)
    return NextResponse.json(
      { error: 'Failed to create catalog' },
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
      name,
      nameIndo,
      nameEng,
      category,
      subCategory,
      description,
      descriptionIndo,
      descriptionEng,
      unit,
      price,
      specifications,
      images,
      datasheetUrl,
      status
    } = body

    const catalog = await db.productCatalog.update({
      where: { id },
      data: {
        partnerId,
        name,
        nameIndo,
        nameEng,
        category,
        subCategory,
        description,
        descriptionIndo,
        descriptionEng,
        unit,
        price,
        specifications: specifications ? JSON.stringify(specifications) : null,
        images: images ? JSON.stringify(images) : null,
        datasheetUrl,
        status
      },
      include: {
        partner: true
      }
    })

    return NextResponse.json({ catalog })
  } catch (error) {
    console.error('Error updating catalog:', error)
    return NextResponse.json(
      { error: 'Failed to update catalog' },
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
        { error: 'Catalog ID is required' },
        { status: 400 }
      )
    }

    await db.productCatalog.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting catalog:', error)
    return NextResponse.json(
      { error: 'Failed to delete catalog' },
      { status: 500 }
    )
  }
}
