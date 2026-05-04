import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// GET all chat messages for a project
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

    const chatMessages = await db.projectChat.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    })

    // Get member names for all messages
    const memberIds = [...new Set(chatMessages.map(msg => msg.memberId))]
    const members = await db.member.findMany({
      where: { id: { in: memberIds } },
      include: { user: true }
    })

    const memberMap = new Map(members.map(m => [m.id, m.user?.name || 'Member']))

    // Transform to include member name
    const formattedMessages = chatMessages.map(msg => ({
      ...msg,
      memberName: memberMap.get(msg.memberId) || 'Member'
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    )
  }
}

// POST send chat message
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
    const { message, attachmentUrl } = body

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const chatMessage = await db.projectChat.create({
      data: {
        projectId,
        memberId: user.member.id,
        message,
        attachmentUrl: attachmentUrl || null
      }
    })

    return NextResponse.json(chatMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending chat message:", error)
    return NextResponse.json(
      { error: "Failed to send chat message" },
      { status: 500 }
    )
  }
}
