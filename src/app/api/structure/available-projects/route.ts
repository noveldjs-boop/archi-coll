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

    // Get member by email
    const member = await db.member.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        profession: 'structure',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: "Structure member not found" }, { status: 404 })
    }

    // Get available projects (invitations)
    const orderTeams = await db.orderTeam.findMany({
      where: {
        profession: 'structure',
        status: 'invited',
        memberId: null
      },
      include: {
        order: {
          include: {
            client: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format for dashboard
    const availableProjects = orderTeams.map(ot => ({
      id: ot.orderId,
      orderNumber: ot.order.orderNumber,
      clientName: ot.order.client.user.name || ot.order.client.user.email,
      clientEmail: ot.order.client.user.email,
      projectName: ot.order.projectName,
      description: ot.order.description,
      landArea: ot.order.landArea,
      buildingArea: ot.order.buildingArea,
      buildingModel: ot.order.buildingModel,
      buildingFloors: ot.order.buildingFloors,
      buildingCategory: ot.order.buildingCategory,
      qualityLevel: ot.order.qualityLevel,
      rab: ot.order.rab,
      designFee: ot.order.designFee,
      requiredProfessions: ['structure'], // Simplified
      createdAt: ot.createdAt
    }))

    return NextResponse.json({ availableProjects })
  } catch (error) {
    console.error('Error fetching available projects:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
