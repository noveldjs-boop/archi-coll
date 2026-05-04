import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        member: {
          select: {
            id: true,
            profession: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { exists: false, error: "Email not found" },
        { status: 404 }
      )
    }

    // Check password
    if (!user.password) {
      return NextResponse.json(
        { exists: true, hasPassword: false, error: "No password set" },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { exists: true, hasPassword: true, passwordValid: false, error: "Invalid password" },
        { status: 401 }
      )
    }

    // Check if user has member profile
    if (!user.member) {
      return NextResponse.json(
        {
          exists: true,
          hasPassword: true,
          passwordValid: true,
          hasMember: false,
          error: "Member profile not found"
        },
        { status: 404 }
      )
    }

    // Return member status
    return NextResponse.json({
      exists: true,
      hasPassword: true,
      passwordValid: true,
      hasMember: true,
      memberStatus: user.member.status,
      memberProfession: user.member.profession,
      canLogin: user.member.status === "active"
    })

  } catch (error) {
    console.error("Error checking member status:", error)
    return NextResponse.json(
      { error: "Failed to check member status" },
      { status: 500 }
    )
  }
}
