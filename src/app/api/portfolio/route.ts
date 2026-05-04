import { NextResponse } from "next/server"
import db from "@/lib/db"

// GET all active portfolio projects (public API)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const where = category
      ? { active: true, category }
      : { active: true }

    const projects = await db.portfolioProject.findMany({
      where,
      orderBy: { order: "asc" }
    })

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch portfolio" },
      { status: 500 }
    )
  }
}
