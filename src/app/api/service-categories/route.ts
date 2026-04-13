import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - Fetch active service categories for public use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false' // default to true
    const includeSubCategories = searchParams.get('includeSubCategories') === 'true'

    const categories = await prisma.serviceCategory.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: 'asc' },
      include: includeSubCategories ? {
        subCategories: {
          orderBy: { order: 'asc' }
        }
      } : undefined
    })

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching service categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    )
  }
}
