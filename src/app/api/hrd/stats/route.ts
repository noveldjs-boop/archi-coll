import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current date for monthly comparisons
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total members
    const totalMembers = await db.member.count()
    const activeMembers = await db.member.count({
      where: { status: 'active' }
    })

    // Get new members this month
    const newMembersThisMonth = await db.member.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const newMembersLastMonth = await db.member.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    })

    // Calculate member growth
    let memberGrowth = 0
    if (newMembersLastMonth > 0) {
      memberGrowth = ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
    }

    // Get pending registrations
    const pendingRegistrations = await db.member.count({
      where: { status: 'pending' }
    })

    // Get active construction projects
    const activeProjects = await db.constructionProject.count({
      where: {
        status: {
          in: ['in_progress', 'leader_assigned', 'team_assigned']
        }
      }
    })

    // Get project applications
    const pendingApplications = await db.projectApplication.count({
      where: { status: 'pending' }
    })

    // Get member distribution by profession
    const membersByProfession = await db.member.groupBy({
      by: ['profession'],
      where: { status: 'active' },
      _count: true
    })

    const professionDistribution = membersByProfession.map(item => ({
      profession: item.profession,
      count: item._count
    }))

    return NextResponse.json({
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      memberGrowth,
      pendingRegistrations,
      activeProjects,
      pendingApplications,
      professionDistribution
    })
  } catch (error) {
    console.error('Error fetching HRD stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch HRD statistics' },
      { status: 500 }
    )
  }
}
