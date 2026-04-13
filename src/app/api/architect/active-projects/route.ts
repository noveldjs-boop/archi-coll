import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get all active projects for architect (unlimited)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        profession: 'architect',
        status: 'active'
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    // Get all active projects for this architect (unlimited)
    const activeProjects = await db.order.findMany({
      where: {
        assignedMemberId: member.id,
        status: {
          in: ['in_pre_design', 'in_schematic', 'in_ded', 'in_review']
        }
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        progressUpdates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    return NextResponse.json({
      activeProjects: activeProjects.map(order => {
        const latestProgress = order.progressUpdates[0]
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          clientName: order.clientName,
          clientEmail: order.client?.user?.email,
          projectName: order.projectName,
          description: order.description,
          landArea: order.landArea,
          buildingArea: order.buildingArea,
          buildingModel: order.buildingModel,
          buildingFloors: order.buildingFloors,
          buildingCategory: order.buildingCategory,
          qualityLevel: order.qualityLevel,
          rab: order.rab,
          designFee: order.designFee,
          status: order.status,
          progressPercentage: latestProgress?.percentage || 0,
          createdAt: order.createdAt,
          assignedAt: order.assignedAt
        }
      })
    })
  } catch (error) {
    console.error('Error fetching active projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active projects' },
      { status: 500 }
    )
  }
}
