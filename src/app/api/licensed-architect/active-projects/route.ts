import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const member = await db.member.findFirst({
      where: { 
        user: { email: session.user.email }, 
        profession: 'licensed-architect',
        status: 'active'
      }
    })
    
    if (!member) {
      return NextResponse.json({ error: "Licensed Architect member not found" }, { status: 404 })
    }

    const activeProjects = await db.orderTeam.findMany({
      where: {
        profession: 'licensed-architect',
        memberId: member.id,
        status: 'accepted'
      },
      include: {
        order: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            assignedMember: {
              include: {
                user: true
              }
            },
            teamMembers: {
              include: {
                member: {
                  include: {
                    user: true
                  }
                }
              }
            },
            progressUpdates: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    })

    const projectsWithProgress = activeProjects.map(orderTeam => {
      const order = orderTeam.order
      const latestProgress = order.progressUpdates[0]
      const progress = latestProgress?.percentage || 0

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
        progressPercentage: progress,
        createdAt: order.createdAt,
        assignedAt: order.assignedAt || orderTeam.acceptedAt,
        assignedProfessions: order.teamMembers?.map((tm: any) => tm.profession) || []
      }
    })

    return NextResponse.json({
      activeProjects: projectsWithProgress,
      hasActiveProjects: projectsWithProgress.length > 0
    })
  } catch (error) {
    console.error('Error fetching active projects:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
