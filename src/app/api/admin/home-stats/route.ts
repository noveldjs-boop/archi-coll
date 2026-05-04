import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Get all home stats (admin)
export async function GET() {
  try {
    const stats = await prisma.homeStats.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching home stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch home stats" },
      { status: 500 }
    )
  }
}

// Create new home stat (admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, labelIndo, labelEng, value, dataSource, icon, order, active } = body

    // Validate required fields
    if (!key || !labelIndo || !labelEng || !icon) {
      return NextResponse.json(
        { error: "Missing required fields: key, labelIndo, labelEng, icon" },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.homeStats.findUnique({
      where: { key }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Statistic with this key already exists" },
        { status: 400 }
      )
    }

    const stat = await prisma.homeStats.create({
      data: {
        key,
        labelIndo,
        labelEng,
        value: value || '',
        dataSource: dataSource || 'static',
        icon,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(stat, { status: 201 })
  } catch (error) {
    console.error("Error creating home stat:", error)
    return NextResponse.json(
      { error: "Failed to create home stat" },
      { status: 500 }
    )
  }
}
