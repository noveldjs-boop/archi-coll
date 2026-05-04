import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

const TEST_EMAIL = 'djs.design80@gmail.com'
const ALLOWED_PROFESSIONS = ['architect', 'licensed_architect', 'structure', 'mep', 'drafter', 'qs']

const PROFESSION_LABELS: Record<string, string> = {
  'architect': 'Desain Arsitek',
  'licensed_architect': 'Arsitek Berlisensi',
  'structure': 'Desain Struktur',
  'mep': 'Desain MEP',
  'drafter': 'Drafter',
  'qs': 'QS'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only allow test email to switch professions
    if (session.user.email !== TEST_EMAIL) {
      return NextResponse.json(
        { error: "Only test account can switch professions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { profession } = body

    // Validate profession
    if (!profession || !ALLOWED_PROFESSIONS.includes(profession)) {
      return NextResponse.json(
        {
          error: "Invalid profession",
          allowedProfessions: ALLOWED_PROFESSIONS
        },
        { status: 400 }
      )
    }

    // Find user and update profession
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { member: true }
    })

    if (!user || !user.member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Update member profession
    const updatedMember = await db.member.update({
      where: { id: user.member.id },
      data: { profession }
    })

    return NextResponse.json({
      success: true,
      message: `Profession switched to ${PROFESSION_LABELS[profession]}`,
      member: updatedMember
    })

  } catch (error) {
    console.error("Error switching profession:", error)
    return NextResponse.json(
      { error: "Failed to switch profession" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.email !== TEST_EMAIL) {
      return NextResponse.json(
        { error: "Only test account can view profession info" },
        { status: 403 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { member: true }
    })

    if (!user || !user.member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      currentProfession: user.member.profession,
      availableProfessions: ALLOWED_PROFESSIONS.map(p => ({
        value: p,
        label: PROFESSION_LABELS[p]
      }))
    })

  } catch (error) {
    console.error("Error getting profession info:", error)
    return NextResponse.json(
      { error: "Failed to get profession info" },
      { status: 500 }
    )
  }
}
