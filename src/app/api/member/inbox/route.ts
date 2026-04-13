import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get inbox messages for logged in member
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get inbox messages
    const messages = await db.inbox.findMany({
      where: {
        memberId: member.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching inbox:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}
