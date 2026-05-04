import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import crypto from "crypto"

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
      // For security, don't reveal that email doesn't exist
      return NextResponse.json({
        message: "Jika email terdaftar, Anda akan menerima link reset password",
        success: true
      })
    }

    // Check if user is a member
    if (user.role !== "member") {
      return NextResponse.json({
        message: "Jika email terdaftar, Anda akan menerima link reset password",
        success: true
      })
    }

    // Generate a temporary password reset token (in production, this should be sent via email)
    // For now, we'll create a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex')

    // In production, you would:
    // 1. Generate a reset token
    // 2. Save it to database with expiration
    // 3. Send email with reset link
    // 4. User clicks link and sets new password

    // For this implementation, we'll reset the password to the temporary one
    // and display it (NOT recommended for production, just for demonstration)
    const bcrypt = (await import('bcryptjs')).default
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Password sementara Anda: " + tempPassword + ". Silakan login dan ubah password Anda.",
      tempPassword: tempPassword, // Only for demo purposes
      note: "Dalam production, password sementara akan dikirim ke email"
    }, { status: 200 })

  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
