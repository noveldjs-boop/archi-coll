import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all sub-categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const where = categoryId ? { categoryId } : {}

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(subCategories)
  } catch (error) {
    console.error('Error fetching sub-categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sub-categories' },
      { status: 500 }
    )
  }
}

// POST create new sub-category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, code, nameIndo, nameEng, descriptionIndo, descriptionEng, examplesIndo, examplesEng, order, active } = body

    // Validation
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
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

    // Validate JSON for examples
    if (examplesIndo) {
      try {
        JSON.parse(examplesIndo)
      } catch (e) {
        return NextResponse.json(
          { error: 'Examples (Indo) must be valid JSON array' },
          { status: 400 }
        )
      }
    }

    if (examplesEng) {
      try {
        JSON.parse(examplesEng)
      } catch (e) {
        return NextResponse.json(
          { error: 'Examples (Eng) must be valid JSON array' },
          { status: 400 }
        )
      }
    }

    // Check if code already exists in the same category
    const existing = await prisma.subCategory.findUnique({
      where: {
        categoryId_code: {
          categoryId,
          code: code.trim()
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists in this category' },
        { status: 400 }
      )
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        categoryId,
        code: code.trim(),
        nameIndo: nameIndo.trim(),
        nameEng: nameEng.trim(),
        descriptionIndo: descriptionIndo?.trim() || null,
        descriptionEng: descriptionEng?.trim() || null,
        examplesIndo: examplesIndo || null,
        examplesEng: examplesEng || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(subCategory)
  } catch (error) {
    console.error('Error creating sub-category:', error)
    return NextResponse.json(
      { error: 'Failed to create sub-category' },
      { status: 500 }
    )
  }
}

// PUT update sub-category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, categoryId, code, nameIndo, nameEng, descriptionIndo, descriptionEng, examplesIndo, examplesEng, order, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Validation
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
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

    // Validate JSON for examples
    if (examplesIndo) {
      try {
        JSON.parse(examplesIndo)
      } catch (e) {
        return NextResponse.json(
          { error: 'Examples (Indo) must be valid JSON array' },
          { status: 400 }
        )
      }
    }

    if (examplesEng) {
      try {
        JSON.parse(examplesEng)
      } catch (e) {
        return NextResponse.json(
          { error: 'Examples (Eng) must be valid JSON array' },
          { status: 400 }
        )
      }
    }

    // Check if code already exists for another sub-category in the same category
    const existing = await prisma.subCategory.findFirst({
      where: {
        categoryId,
        code: code.trim(),
        NOT: { id }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists in this category' },
        { status: 400 }
      )
    }

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        categoryId,
        code: code.trim(),
        nameIndo: nameIndo.trim(),
        nameEng: nameEng.trim(),
        descriptionIndo: descriptionIndo?.trim() || null,
        descriptionEng: descriptionEng?.trim() || null,
        examplesIndo: examplesIndo || null,
        examplesEng: examplesEng || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(subCategory)
  } catch (error) {
    console.error('Error updating sub-category:', error)
    return NextResponse.json(
      { error: 'Failed to update sub-category' },
      { status: 500 }
    )
  }
}

// DELETE sub-category
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

    await prisma.subCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sub-category:', error)
    return NextResponse.json(
      { error: 'Failed to delete sub-category' },
      { status: 500 }
    )
  }
}
