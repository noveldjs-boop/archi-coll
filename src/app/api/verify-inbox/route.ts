import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const inbox = await db.inbox.findMany({
      select: {
        id: true,
        memberId: true,
        type: true,
        title: true,
        isRead: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      totalInbox: inbox.length,
      inbox: inbox
    })
  } catch (error) {
    console.error('Error verifying inbox:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify inbox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
