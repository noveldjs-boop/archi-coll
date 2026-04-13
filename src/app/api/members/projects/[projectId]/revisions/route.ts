import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// GET all revisions for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { member: true }
    })

    if (!user || !user.member) {
      return NextResponse.json(
        { error: "Not a member" },
        { status: 403 }
      )
    }

    // Check if user has access to this project
    const assignment = await db.projectAssignment.findFirst({
      where: {
        projectId,
        memberId: user.member.id
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "No access to this project" },
        { status: 403 }
      )
    }

    const revisions = await db.projectRevision.findMany({
      where: { projectId },
      orderBy: { revisionNumber: "asc" }
    })

    return NextResponse.json(revisions)
  } catch (error) {
    console.error("Error fetching revisions:", error)
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    )
  }
}

// POST create new revision
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { member: true }
    })

    if (!user || !user.member) {
      return NextResponse.json(
        { error: "Not a member" },
        { status: 403 }
      )
    }

    // Check if user has access to this project
    const assignment = await db.projectAssignment.findFirst({
      where: {
        projectId,
        memberId: user.member.id
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "No access to this project" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, documentUrl } = body

    // Get the next revision number
    const lastRevision = await db.projectRevision.findFirst({
      where: { projectId },
      orderBy: { revisionNumber: "desc" }
    })

    const revisionNumber = (lastRevision?.revisionNumber || 0) + 1

    const revision = await db.projectRevision.create({
      data: {
        projectId,
        revisionNumber,
        title,
        description,
        documentUrl,
        uploadedBy: user.member.id
      }
    })

    return NextResponse.json(revision, { status: 201 })
  } catch (error) {
    console.error("Error creating revision:", error)
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    )
  }
}
