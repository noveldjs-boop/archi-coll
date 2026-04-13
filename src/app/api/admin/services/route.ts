import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// GET all services
export async function GET() {
  try {
    const services = await db.service.findMany({
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

// POST create new service
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
      code,
      titleId,
      titleIndo,
      titleEng,
      descId,
      descIndo,
      descEng,
      icon,
      imageUrl,
      order,
      active
    } = body

    const service = await db.service.create({
      data: {
        code: code || "",
        titleId,
        titleIndo,
        titleEng,
        descId,
        descIndo,
        descEng,
        icon,
        imageUrl,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
