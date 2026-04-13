import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get project team and tasks for a project
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get project info to verify this architect is the leader
    const project = await db.order.findUnique({
      where: { id: projectId },
      include: {
        assignedMember: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.assignedMember?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not the leader of this project' },
        { status: 403 }
      )
    }

    // Get team members
    const teamMembers = await db.projectTeam.findMany({
      where: {
        projectId: projectId
      },
      include: {
        member: {
          include: {
            user: true
          }
        }
      }
    })

    // Get work uploads
    const workUploads = await db.projectWork.findMany({
      where: {
        projectId: projectId
      },
      include: {
        uploader: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Define task types based on project requirements
    const taskTypes = [
      { id: 'floor_plan', label: 'Denah', profession: 'drafter' },
      { id: 'elevation', label: 'Tampak', profession: 'drafter' },
      { id: 'section', label: 'Potongan', profession: 'drafter' },
      { id: 'details', label: 'Detail-detail', profession: 'drafter' },
      { id: 'structure', label: 'Struktur', profession: 'structure' },
      { id: 'mep', label: 'MEP', profession: 'mep' },
      { id: '3d_model', label: '3D Model', profession: 'drafter' },
      { id: 'rendering', label: 'Rendering', profession: 'drafter' }
    ]

    // Get available members to add to team
    const availableMembers = await db.member.findMany({
      where: {
        status: 'active',
        id: {
          notIn: teamMembers.map(tm => tm.memberId)
        }
      },
      include: {
        user: true
      }
    })

    return NextResponse.json({
      project: {
        id: project.id,
        orderNumber: project.orderNumber,
        projectName: project.projectName,
        status: project.status
      },
      teamMembers: teamMembers.map(tm => ({
        id: tm.id,
        memberId: tm.memberId,
        name: tm.member.user?.name,
        email: tm.member.user?.email,
        profession: tm.profession,
        role: tm.role,
        status: tm.status,
        assignedAt: tm.assignedAt
      })),
      workUploads: workUploads.map(work => ({
        id: work.id,
        title: work.title,
        description: work.description,
        fileUrl: work.fileUrl,
        fileUrls: work.fileUrls ? JSON.parse(work.fileUrls) : [],
        status: work.status,
        uploadedBy: {
          id: work.uploadedBy,
          name: work.uploader.user?.name,
          profession: work.uploader.profession
        },
        feedback: work.feedback,
        createdAt: work.createdAt,
        reviewedAt: work.reviewedAt
      })),
      taskTypes,
      availableMembers: availableMembers.map(m => ({
        id: m.id,
        name: m.user?.name,
        email: m.user?.email,
        profession: m.profession,
        experience: m.experience,
        expertise: m.expertise ? JSON.parse(m.expertise) : []
      }))
    })
  } catch (error) {
    console.error('Error fetching project management data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project management data' },
      { status: 500 }
    )
  }
}

// POST - Add team member or create task assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, projectId, memberId, profession, role, tasks } = body

    if (!projectId || !action) {
      return NextResponse.json(
        { error: 'Project ID and action are required' },
        { status: 400 }
      )
    }

    // Verify this architect is the project leader
    const project = await db.order.findUnique({
      where: { id: projectId },
      include: {
        assignedMember: true
      }
    })

    if (!project || project.assignedMemberId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'You are not authorized to manage this project' },
        { status: 403 }
      )
    }

    if (action === 'add_member') {
      if (!memberId || !profession) {
        return NextResponse.json(
          { error: 'Member ID and profession are required' },
          { status: 400 }
        )
      }

      // Check if member is already in team
      const existing = await db.projectTeam.findFirst({
        where: {
          projectId,
          memberId
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Member is already in the team' },
          { status: 400 }
        )
      }

      // Add member to team
      const teamMember = await db.projectTeam.create({
        data: {
          projectId,
          memberId,
          profession,
          role: role || 'team_member',
          status: 'active',
          assignedBy: project.assignedMemberId
        },
        include: {
          member: {
            include: {
              user: true
            }
          }
        }
      })

      // Create notification for team member
      await db.inbox.create({
        data: {
          memberId,
          type: 'project',
          title: 'Ditambahkan ke Project Team',
          content: `Anda telah ditambahkan ke project ${project.orderNumber} sebagai ${profession}.`,
          link: `/member/dashboard?projectId=${projectId}`
        }
      })

      return NextResponse.json({
        success: true,
        teamMember,
        message: 'Team member added successfully'
      })
    }

    if (action === 'remove_member') {
      if (!memberId) {
        return NextResponse.json(
          { error: 'Member ID is required' },
          { status: 400 }
        )
      }

      await db.projectTeam.deleteMany({
        where: {
          projectId,
          memberId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Team member removed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing project:', error)
    return NextResponse.json(
      { error: 'Failed to manage project' },
      { status: 500 }
    )
  }
}
