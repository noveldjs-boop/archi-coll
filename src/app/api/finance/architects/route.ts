import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get available architects (no active projects)
export async function GET() {
  try {
    // Get all active architects (support 'architect', 'licensed_architect', and 'licensed-architect')
    const allArchitects = await db.member.findMany({
      where: {
        profession: {
          in: ['architect', 'licensed_architect', 'licensed-architect']
        },
        status: 'active'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Get orders that are currently assigned to architects
    const activeOrders = await db.order.findMany({
      where: {
        assignedMemberId: { not: null },
        status: {
          in: ['in_pre_design', 'in_schematic', 'in_ded', 'in_review']
        }
      },
      select: {
        assignedMemberId: true
      }
    })

    const busyArchitectIds = activeOrders.map(o => o.assignedMemberId).filter(Boolean) as string[]

    // Separate available and busy architects
    const availableArchitects = allArchitects.filter(a => !busyArchitectIds.includes(a.id))
    const busyArchitects = allArchitects.filter(a => busyArchitectIds.includes(a.id))

    return NextResponse.json({
      availableArchitects: availableArchitects.map(a => ({
        id: a.id,
        name: a.user?.name || 'N/A',
        email: a.user?.email || 'N/A',
        experience: a.experience,
        expertise: a.expertise ? JSON.parse(a.expertise) : []
      })),
      busyArchitects: busyArchitects.map(a => ({
        id: a.id,
        name: a.user?.name || 'N/A',
        email: a.user?.email || 'N/A'
      }))
    })
  } catch (error) {
    console.error('Error fetching architects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch architects' },
      { status: 500 }
    )
  }
}
