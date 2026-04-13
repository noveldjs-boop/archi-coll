import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = params
    
    const member = await db.member.findFirst({
      where: { 
        user: { email: session.user.email }, 
        profession: 'qs',
        status: 'active'
      }
    })
    
    if (!member) {
      return NextResponse.json({ error: "QS member not found" }, { status: 404 })
    }

    const orderTeam = await db.orderTeam.findUnique({
      where: { id }
    })

    if (!orderTeam) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    if (orderTeam.profession !== 'qs') {
      return NextResponse.json({ error: "Invalid invitation for this profession" }, { status: 400 })
    }

    if (orderTeam.status !== 'invited') {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 })
    }

    if (orderTeam.memberId !== null) {
      return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 })
    }

    const updatedOrderTeam = await db.orderTeam.update({
      where: { id },
      data: {
        memberId: member.id,
        status: 'accepted',
        acceptedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Undangan berhasil diterima",
      orderTeam: updatedOrderTeam
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
