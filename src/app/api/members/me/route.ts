import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      console.log('[API /api/members/me] No session or email found')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('[API /api/members/me] Session found for:', session.user.email, 'Role:', session.user.role)

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        member: {
          include: {
            profileProjects: true
          }
        }
      }
    })

    if (!user) {
      console.error('[API /api/members/me] User not found in database:', session.user.email)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.role !== "member") {
      console.error('[API /api/members/me] User is not a member:', user.role)
      return NextResponse.json(
        { error: "Not a member" },
        { status: 403 }
      )
    }

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      member: user.member,
      profileProjects: user.member?.profileProjects || []
    }

    console.log('[API /api/members/me] Returning data for:', user.email)
    return NextResponse.json(responseData)

  } catch (error) {
    console.error("[API /api/members/me] Error fetching member info:", error)
    return NextResponse.json(
      { error: "Failed to fetch member info" },
      { status: 500 }
    )
  }
}
