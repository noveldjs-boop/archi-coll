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
      where: { user: { email: session.user.email }, profession: 'drafter' },
      include: { user: true }
    })
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }
    const tasks = []
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching available tasks:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
