import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get portfolio data for logged in member
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
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get completed orders where this member was assigned as architect
    const completedOrders = await db.order.findMany({
      where: {
        assignedMemberId: member.id,
        status: 'completed'
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        progressUpdates: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Get portfolio projects uploaded by member
    const portfolioProjects = await db.memberProject.findMany({
      where: {
        memberId: member.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Get ratings given by this member
    const ratingsGiven = await db.expertiseRating.findMany({
      where: {
        ratedBy: member.id
      },
      include: {
        project: {
          include: {
            leader: {
              include: {
                user: true
              }
            }
          }
        },
        ratedMember: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get ratings received by this member
    const ratingsReceived = await db.expertiseRating.findMany({
      where: {
        ratedMemberId: member.id
      },
      include: {
        project: {
          include: {
            leader: {
              include: {
                user: true
              }
            }
          }
        },
        rater: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate expertise stats
    const expertiseStats: Record<string, { count: number; totalRating: number; avgRating: number }> = {}

    completedOrders.forEach(order => {
      const category = order.buildingCategory
      if (!expertiseStats[category]) {
        expertiseStats[category] = { count: 0, totalRating: 0, avgRating: 0 }
      }
      expertiseStats[category].count++
    })

    portfolioProjects.forEach(project => {
      const category = project.category
      if (!expertiseStats[category]) {
        expertiseStats[category] = { count: 0, totalRating: 0, avgRating: 0 }
      }
      expertiseStats[category].count++
    })

    // Calculate average ratings
    ratingsReceived.forEach(rating => {
      const expertiseArea = rating.expertiseArea
      if (!expertiseStats[expertiseArea]) {
        expertiseStats[expertiseArea] = { count: 0, totalRating: 0, avgRating: 0 }
      }
      expertiseStats[expertiseArea].totalRating += rating.rating
    })

    Object.keys(expertiseStats).forEach(key => {
      const stat = expertiseStats[key]
      stat.avgRating = stat.count > 0 ? stat.totalRating / stat.count : 0
    })

    // Get expertise array from member
    let expertiseArray: string[] = []
    if (member.expertise) {
      try {
        expertiseArray = JSON.parse(member.expertise)
      } catch (e) {
        console.error('Error parsing expertise:', e)
      }
    }

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.user?.name,
        email: member.user?.email,
        profession: member.profession,
        expertise: expertiseArray,
        experience: member.experience
      },
      completedOrders: completedOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        projectName: order.projectName,
        clientName: order.clientName,
        buildingCategory: order.buildingCategory,
        buildingArea: order.buildingArea,
        landArea: order.landArea,
        designFee: order.designFee,
        completedAt: order.completedAt,
        role: 'architect' // Main architect role
      })),
      portfolioProjects: portfolioProjects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        imageUrls: project.imageUrls ? JSON.parse(project.imageUrls) : [],
        location: project.location,
        year: project.year,
        order: project.order,
        role: 'portfolio' // From registration portfolio
      })),
      ratingsGiven: ratingsGiven,
      ratingsReceived: ratingsReceived,
      expertiseStats
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}
