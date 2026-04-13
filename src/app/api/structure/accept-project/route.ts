import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
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

    // Find the OrderTeam invitation
    const orderTeam = await db.orderTeam.findFirst({
      where: {
        orderId: projectId,
        profession: 'structure',
        status: 'invited',
        memberId: null
      }
    })

    if (!orderTeam) {
      return NextResponse.json({ error: "Invitation not found or already accepted" }, { status: 404 })
    }

    // Accept the invitation
    await db.orderTeam.update({
      where: { id: orderTeam.id },
      data: {
        status: 'active',
        memberId: member.id
      }
    })

    return NextResponse.json({ message: "Project berhasil diterima!" })
  } catch (error) {
    console.error('Error accepting project:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
