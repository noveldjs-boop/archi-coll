import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        member: true
      }
    })

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "Email not registered"
      })
    }

    // Check if user is a member
    if (user.role !== "member") {
      return NextResponse.json(
        { error: "This account is not a member account" },
        { status: 403 }
      )
    }

    // Show member information without sensitive data
    return NextResponse.json({
      found: true,
      email: user.email,
      name: user.name,
      memberStatus: user.member?.status || "unknown",
      profession: user.member?.profession || "unknown",
      canResetPassword: !!user.password, // Only allow reset if password exists
      message: "Email already registered"
    })

  } catch (error) {
    console.error("Error checking email:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}
