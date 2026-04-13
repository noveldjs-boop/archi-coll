import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

// GET - Get architect's active project
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        profession: 'architect',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    // Check if architect has active projects (assigned but not completed)
    const activeProjects = await db.order.findMany({
      where: {
        assignedMemberId: member.id,
        status: {
          in: ['in_pre_design', 'in_schematic', 'in_ded', 'in_review']
        }
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        progressUpdates: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        videoSessions: {
          orderBy: {
            scheduledAt: 'desc'
          }
        },
        chatMessages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 50
        }
      },
      orderBy: {
        assignedAt: 'asc'
      }
    })

    if (activeProjects.length === 0) {
      return NextResponse.json({
        hasActiveProjects: false,
        activeProjects: []
      })
    }

    // Calculate progress percentage
    const progressMap: Record<string, number> = {
      'pending': 0,
      'in_pre_design': 15,
      'in_schematic': 40,
      'in_ded': 70,
      'in_review': 90,
      'completed': 100,
      'cancelled': 0
    }

    return NextResponse.json({
      hasActiveProjects: true,
      activeProjects: activeProjects.map(project => ({
        ...project,
        progressPercentage: progressMap[project.status] || 0
      }))
    })
  } catch (error) {
    console.error('Error fetching active project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active project' },
      { status: 500 }
    )
  }
}

// PUT - Update project status/progress
export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, action, stage, percentage, title, description } = body

    // Get member from user session
    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        profession: 'architect',
        status: 'active'
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Architect member not found' }, { status: 404 })
    }

    // Verify the project is assigned to this architect
    const project = await db.order.findFirst({
      where: {
        id: orderId,
        assignedMemberId: member.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or not assigned to you' }, { status: 404 })
    }

    if (action === 'update_status') {
      // Update project status
      const statusMap: Record<string, string> = {
        'pre_design': 'in_pre_design',
        'schematic': 'in_schematic',
        'ded': 'in_ded',
        'review': 'in_review',
        'complete': 'completed'
      }

      const newStatus = statusMap[stage] || stage

      const updatedProject = await db.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null
        }
      })

      return NextResponse.json({ project: updatedProject })
    }

    if (action === 'add_progress') {
      // Add progress update
      const progress = await db.projectProgress.create({
        data: {
          orderId,
          stage,
          title: title || stage,
          description,
          percentage,
          status: 'in_progress'
        }
      })

      return NextResponse.json({ progress })
    }

    if (action === 'complete_progress') {
      // Mark a progress update as completed
      if (stage) {
        await db.projectProgress.updateMany({
          where: {
            orderId,
            stage
          },
          data: {
            status: 'completed'
          }
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
