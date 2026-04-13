import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { member: true }
    })

    if (!user || !user.member) {
      return NextResponse.json(
        { error: "Not a member" },
        { status: 403 }
      )
    }

    const inbox = await db.inbox.findMany({
      where: { memberId: user.member.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(inbox)
  } catch (error) {
    console.error("Error fetching inbox:", error)
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    )
  }
}
