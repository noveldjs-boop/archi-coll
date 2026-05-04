import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const profession = searchParams.get('profession')

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (profession && profession !== 'all') {
      where.profession = profession
    }

    // Fetch members without ratings in include
    const members = await db.member.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        },
        assignments: {
          where: {
            status: { in: ['in_progress', 'accepted'] }
          },
          include: {
            project: {
              select: {
                status: true
              }
            }
          }
        },
        profileProjects: true,
        certificates: {
          where: { verified: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Fetch ratings separately for all member IDs
    const memberIds = members.map(m => m.id)
    const allRatingsReceived = await db.expertiseRating.findMany({
      where: { ratedMemberId: { in: memberIds } }
    })
    const allRatingsGiven = await db.expertiseRating.findMany({
      where: { ratedBy: { in: memberIds } }
    })

    // Calculate rating and format response
    const formattedMembers = members.map(member => {
      // Get ratings for this member
      const ratingsReceived = allRatingsReceived.filter(r => r.ratedMemberId === member.id)
      const ratingsGiven = allRatingsGiven.filter(r => r.ratedBy === member.id)

      // Calculate average rating
      const avgRating = ratingsReceived.length > 0
        ? ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / ratingsReceived.length
        : 0

      // Count active and completed projects
      const activeProjects = member.assignments.filter(a => a.project.status === 'in_progress').length
      const completedProjects = member.assignments.filter(a => a.project.status === 'completed').length

      return {
        id: member.id,
        name: member.user.name || member.user.email.split('@')[0],
        email: member.user.email,
        profession: member.profession,
        phone: member.phone,
        location: member.location,
        bio: member.bio,
        profileImage: member.profileImage,
        experience: member.experience,
        expertise: member.expertise ? member.expertise.split(',') : [],
        buildingTypes: member.buildingTypes ? member.buildingTypes.split(',') : [],
        status: member.status,
        rating: Number(avgRating.toFixed(1)),
        ratingCount: ratingsReceived.length,
        ratingsGiven: ratingsGiven.length,
        activeProjects,
        completedProjects,
        totalProjects: member.assignments.length,
        portfolioProjects: member.profileProjects.length,
        certificates: member.certificates.length,
        createdAt: member.user.createdAt,
        approvedAt: member.approvedAt,
        approvedBy: member.approvedBy
      }
    })

    return NextResponse.json({
      members: formattedMembers,
      total: formattedMembers.length
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
