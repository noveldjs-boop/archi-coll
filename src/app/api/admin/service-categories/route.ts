import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all service categories
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        subCategories: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching service categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    )
  }
}

// POST create new service category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, nameIndo, nameEng, descriptionIndo, descriptionEng, icon, order, active } = body

    // Validation
    if (!code?.trim()) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }
    if (!nameIndo?.trim()) {
      return NextResponse.json(
        { error: 'Name (Indo) is required' },
        { status: 400 }
      )
    }
    if (!nameEng?.trim()) {
      return NextResponse.json(
        { error: 'Name (Eng) is required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.serviceCategory.findUnique({
      where: { code: code.trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.serviceCategory.create({
      data: {
        code: code.trim(),
        nameIndo: nameIndo.trim(),
        nameEng: nameEng.trim(),
        descriptionIndo: descriptionIndo?.trim() || null,
        descriptionEng: descriptionEng?.trim() || null,
        icon: icon || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating service category:', error)
    return NextResponse.json(
      { error: 'Failed to create service category' },
      { status: 500 }
    )
  }
}

// PUT update service category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, code, nameIndo, nameEng, descriptionIndo, descriptionEng, icon, order, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Validation
    if (!code?.trim()) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }
    if (!nameIndo?.trim()) {
      return NextResponse.json(
        { error: 'Name (Indo) is required' },
        { status: 400 }
      )
    }
    if (!nameEng?.trim()) {
      return NextResponse.json(
        { error: 'Name (Eng) is required' },
        { status: 400 }
      )
    }

    // Check if code already exists for another category
    const existing = await prisma.serviceCategory.findFirst({
      where: {
        code: code.trim(),
        NOT: { id }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        code: code.trim(),
        nameIndo: nameIndo.trim(),
        nameEng: nameEng.trim(),
        descriptionIndo: descriptionIndo?.trim() || null,
        descriptionEng: descriptionEng?.trim() || null,
        icon: icon || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating service category:', error)
    return NextResponse.json(
      { error: 'Failed to update service category' },
      { status: 500 }
    )
  }
}

// DELETE service category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Delete will cascade to sub-categories
    await prisma.serviceCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service category:', error)
    return NextResponse.json(
      { error: 'Failed to delete service category' },
      { status: 500 }
    )
  }
}
