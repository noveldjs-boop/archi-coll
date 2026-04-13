import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Update home stat (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { key, labelIndo, labelEng, value, dataSource, icon, order, active } = body

    // Get current stat to check data source
    const currentStat = await prisma.homeStats.findUnique({
      where: { id }
    })

    if (!currentStat) {
      return NextResponse.json(
        { error: "Statistic not found" },
        { status: 404 }
      )
    }

    // For dynamic stats, don't allow updating value
    const isDynamic = currentStat.dataSource === 'dynamic' || dataSource === 'dynamic'

    const updateData: any = {}
    if (key) updateData.key = key
    if (labelIndo) updateData.labelIndo = labelIndo
    if (labelEng) updateData.labelEng = labelEng
    if (!isDynamic && value !== undefined) updateData.value = value
    if (dataSource) updateData.dataSource = dataSource
    if (icon) updateData.icon = icon
    if (order !== undefined) updateData.order = order
    if (active !== undefined) updateData.active = active

    const stat = await prisma.homeStats.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(stat)
  } catch (error) {
    console.error("Error updating home stat:", error)
    return NextResponse.json(
      { error: "Failed to update home stat" },
      { status: 500 }
    )
  }
}

// Delete home stat (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.homeStats.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home stat:", error)
    return NextResponse.json(
      { error: "Failed to delete home stat" },
      { status: 500 }
    )
  }
}
