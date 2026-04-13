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
        profession: 'mep',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: "MEP member not found" }, { status: 404 })
    }

    const invitations = await db.orderTeam.findMany({
      where: {
        profession: 'mep',
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
            },
            assignedMember: {
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

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
