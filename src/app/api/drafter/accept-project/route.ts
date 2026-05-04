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
    const { projectId, items } = body

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item must be selected" }, { status: 400 })
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

    // Create or update OrderTeam for this drafter with selected items
    const orderTeam = await db.orderTeam.findFirst({
      where: {
        orderId: projectId,
        profession: 'drafter',
        memberId: member.id
      }
    })

    if (orderTeam) {
      // Update existing
      await db.orderTeam.update({
        where: { id: orderTeam.id },
        data: {
          status: 'active',
          assignedItems: JSON.stringify(items)
        }
      })
    } else {
      // Create new
      await db.orderTeam.create({
        data: {
          orderId: projectId,
          profession: 'drafter',
          memberId: member.id,
          status: 'active',
          assignedItems: JSON.stringify(items)
        }
      })
    }

    return NextResponse.json({ message: "Project berhasil diterima!" })
  } catch (error) {
    console.error('Error accepting project:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
