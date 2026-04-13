import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// GET all portfolio projects
export async function GET() {
  try {
    const projects = await db.portfolioProject.findMany({
      orderBy: { order: "asc" }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST create new portfolio project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      titleIndo,
      titleEng,
      descriptionIndo,
      descriptionEng,
      imageUrl,
      category,
      order,
      active
    } = body

    const project = await db.portfolioProject.create({
      data: {
        titleIndo,
        titleEng,
        descriptionIndo,
        descriptionEng,
        imageUrl,
        category,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
