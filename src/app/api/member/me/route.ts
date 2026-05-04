import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get user from session (will be improved with proper auth)
    // For now, we'll use a simple approach based on email
    const session = request.headers.get('authorization')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.replace('Bearer ', '')

    // Find user with member data
    const user = await db.user.findUnique({
      where: { email },
      include: {
        member: {
          include: {
            profileProjects: true
          }
        }
      }
    })

    if (!user || !user.member) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const member = user.member

    // Format skills based on member data
    const skills = member.expertise
      ? member.expertise.split(',').map(exp => ({
          expertise: exp.trim(),
          assistantProjectsCompleted: 0, // Will be calculated from actual data
          requiredProjects: 4,
          currentStatus: exp.trim() === 'Villa' ? 'Architect' : 'Assistant'
        }))
      : []

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profession: member.profession,
        skills,
        totalProjects: member.profileProjects?.length || 0,
        completedProjects: 0, // Will be calculated from actual data
        activeProjects: 0, // Will be calculated from actual data
        pendingReviews: 0,
        rating: 0, // Will be calculated from ratings
        memberSince: member.createdAt?.toISOString().split('T')[0] || '2024-01-01'
      }
    })
  } catch (error) {
    console.error('Error fetching member data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    )
  }
}
