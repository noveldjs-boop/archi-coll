import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch sub-categories for public use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false' // default to true
    const categoryId = searchParams.get('categoryId')

    const where: any = activeOnly ? { active: true } : undefined
    if (categoryId) {
      where.categoryId = categoryId
    }

    const subCategories = await db.subCategory.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: subCategories
    })
  } catch (error) {
    console.error('Error fetching sub-categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sub-categories' },
      { status: 500 }
    )
  }
}
