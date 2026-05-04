import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const DRAWING_ITEMS = ['denah', 'tampak', 'potongan', 'plafon', 'detail', '3d', 'perspektif']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const member = await db.member.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        profession: 'drafter',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: "Drafter member not found" }, { status: 404 })
    }

    const orderTeams = await db.orderTeam.findMany({
      where: {
        profession: 'drafter',
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

    // For drafter, we need to check which items are available vs assigned
    const availableProjects = await Promise.all(orderTeams.map(async (ot) => {
      // Get all drafter assignments for this order
      const allAssignments = await db.orderTeam.findMany({
        where: {
          orderId: ot.orderId,
          profession: 'drafter'
        }
      })

      const assignedItems = allAssignments
        .filter(a => a.status === 'active' && a.assignedItems)
        .flatMap(a => JSON.parse(a.assignedItems || '[]'))

      const availableItems = DRAWING_ITEMS.filter(item => !assignedItems.includes(item))

      return {
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
        requiredProfessions: ['drafter'],
        availableItems,
        assignedItems,
        createdAt: ot.createdAt
      }
    }))

    return NextResponse.json({ availableProjects })
  } catch (error) {
    console.error('Error fetching available projects:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
