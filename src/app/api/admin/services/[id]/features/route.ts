import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// GET all features for a service
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const features = await db.serviceFeature.findMany({
      where: { serviceId: id },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(features)
  } catch (error) {
    console.error("Error fetching service features:", error)
    return NextResponse.json(
      { error: "Failed to fetch service features" },
      { status: 500 }
    )
  }
}

// POST create new feature for a service
export async function POST(
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

    const feature = await db.serviceFeature.create({
      data: {
        serviceId: id,
        featureId: `feature_${Date.now()}`, // Auto-generate featureId
        textIndo,
        textEng,
        order: order || 0
      }
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error("Error creating service feature:", error)
    return NextResponse.json(
      { error: "Failed to create service feature" },
      { status: 500 }
    )
  }
}
