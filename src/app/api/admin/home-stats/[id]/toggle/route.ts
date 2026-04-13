import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Toggle active status of home stat (admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get current status
    const stat = await prisma.homeStats.findUnique({
      where: { id }
    })

    if (!stat) {
      return NextResponse.json(
        { error: "Home stat not found" },
        { status: 404 }
      )
    }

    // Toggle active status
    const updatedStat = await prisma.homeStats.update({
      where: { id },
      data: { active: !stat.active }
    })

    return NextResponse.json({
      success: true,
      active: updatedStat.active
    })
  } catch (error) {
    console.error("Error toggling home stat:", error)
    return NextResponse.json(
      { error: "Failed to toggle home stat" },
      { status: 500 }
    )
  }
}
