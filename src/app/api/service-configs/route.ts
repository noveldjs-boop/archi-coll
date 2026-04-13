import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch active service configurations for public use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false' // default to true

    const services = await db.serviceConfig.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: services
    })
  } catch (error) {
    console.error('Error fetching service configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service configurations' },
      { status: 500 }
    )
  }
}
