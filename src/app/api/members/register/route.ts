import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      phone,
      address,
      profession,
      experience,
      portfolioUrl,
      certificateType,
      certificateNumber,
      issuer,
      issuedDate,
      expiryDate,
      documentUrl,
      password
    } = body

    // Validate CRITICAL required fields (these must always exist regardless of admin settings)
    // These are essential for the system to function:
    // - name: User identification
    // - email: Login and communication
    // - profession: Determines dashboard layout (REQUIRED - cannot be disabled)
    // - password: Account security
    if (!name || !email || !profession || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, profession, and password are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with member role and hashed password
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "member"
      }
    })

    // Create member profile
    const member = await db.member.create({
      data: {
        userId: user.id,
        profession,
        phone,
        address,
        experience: parseInt(experience) || 0,
        portfolioUrl,
        status: "pending" // Needs admin approval
      }
    })

    // Create certificate if provided
    if (certificateType && certificateNumber && issuer && issuedDate) {
      await db.certificate.create({
        data: {
          memberId: member.id,
          certificateType,
          certificateNumber,
          issuer,
          issuedDate: new Date(issuedDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          documentUrl,
          verified: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please wait for admin approval.",
      memberId: member.id
    }, { status: 201 })

  } catch (error) {
    console.error("Error registering member:", error)
    return NextResponse.json(
      { error: "Failed to register member" },
      { status: 500 }
    )
  }
}
