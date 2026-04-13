import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

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

    // Get OrderTeam by ID
    const orderTeam = await db.orderTeam.findUnique({
      where: { id }
    })

    if (!orderTeam) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    if (orderTeam.profession !== 'structure') {
      return NextResponse.json({ error: "Invalid invitation for this profession" }, { status: 400 })
    }

    if (orderTeam.status !== 'invited') {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 })
    }

    // Reject the invitation
    const updatedOrderTeam = await db.orderTeam.update({
      where: { id },
      data: {
        status: 'rejected'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Undangan ditolak",
      orderTeam: updatedOrderTeam
    })
  } catch (error) {
    console.error('Error rejecting invitation:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
