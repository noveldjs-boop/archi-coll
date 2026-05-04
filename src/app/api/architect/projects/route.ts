import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get available projects for architect (DP paid, not yet assigned)
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
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    // Get orders that have DP paid but not yet assigned to an architect
    const availableProjects = await db.order.findMany({
      where: {
        dpPaid: true,
        assignedMemberId: null,
        status: {
          in: ['pending', 'in_pre_design']
        },
        paymentStage: 'dp_paid'
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      availableProjects: availableProjects.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        clientEmail: order.client?.user?.email,
        clientPhone: order.client?.phone,
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
        dpPaidAmount: order.simulatedDP10,
        createdAt: order.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching available projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available projects' },
      { status: 500 }
    )
  }
}
