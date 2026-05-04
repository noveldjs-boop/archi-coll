import { NextResponse } from "next/server"
import db from "@/lib/db"

// GET all active services (public API)
export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        features: {
          orderBy: { order: "asc" }
        }
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}
