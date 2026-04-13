import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET form requirements filtered by profession
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const profession = searchParams.get('profession')

    let requirements

    if (profession && profession !== 'all') {
      // Get requirements specific to this profession OR all professions (null)
      requirements = await db.formRequirement.findMany({
        where: {
          OR: [
            { profession: profession },
            { profession: null }
          ],
          active: true
        },
        orderBy: { order: 'asc' }
      })
    } else {
      // Get all active requirements
      requirements = await db.formRequirement.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
      })
    }

    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error fetching form requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form requirements' },
      { status: 500 }
    )
  }
}
