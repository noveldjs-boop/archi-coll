import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'accepted', 'rejected', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const registrations = await db.member.findMany({
      where: {
        ...where,
        status: 'pending' // Only show pending registrations initially
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        certificates: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
