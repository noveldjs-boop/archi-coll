import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all team members
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      orderBy: [
        { role: 'asc' }, // founder, co-founder, member
        { order: 'asc' }
      ]
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

// POST create new team member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, titleIndo, titleEng, descriptionIndo, descriptionEng, imageUrl, linkedinUrl, email, role, order, active } = body

    const member = await db.teamMember.create({
      data: {
        name,
        titleIndo,
        titleEng,
        descriptionIndo,
        descriptionEng,
        imageUrl,
        linkedinUrl,
        email,
        role: role || 'member',
        order: order ?? 0,
        active: active ?? true
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}
