import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// DELETE a member permanently
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find member to check if exists
    const member = await db.member.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Delete member (cascade will delete related certificates)
    await db.member.delete({
      where: { id }
    })

    // Delete the associated user
    await db.user.delete({
      where: { id: member.userId }
    })

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully. Email can now be used for new registration."
    })

  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
}
