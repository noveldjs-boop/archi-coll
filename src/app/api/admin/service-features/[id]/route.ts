import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// PUT update feature
export async function PUT(
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

    const body = await req.json()
    const { textIndo, textEng, order } = body

    const updateData: any = {}
    if (textIndo !== undefined) updateData.textIndo = textIndo
    if (textEng !== undefined) updateData.textEng = textEng
    if (order !== undefined) updateData.order = order

    const feature = await db.serviceFeature.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(feature)
  } catch (error) {
    console.error("Error updating service feature:", error)
    return NextResponse.json(
      { error: "Failed to update service feature" },
      { status: 500 }
    )
  }
}

// DELETE feature
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

    await db.serviceFeature.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Feature deleted successfully" })
  } catch (error) {
    console.error("Error deleting service feature:", error)
    return NextResponse.json(
      { error: "Failed to delete service feature" },
      { status: 500 }
    )
  }
}
