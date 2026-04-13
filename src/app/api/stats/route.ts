import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching home stats...')
    console.log('Prisma client has homeStats:', 'homeStats' in prisma)

    const stats = await prisma.homeStats.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    console.log(`Found ${stats.length} stats`)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching home stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch home stats" },
      { status: 500 }
    )
  }
}
