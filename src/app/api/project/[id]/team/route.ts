import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get project team members
    const projectTeam = await db.projectTeam.findMany({
      where: { projectId: id },
      include: {
        member: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            },
            ratingsReceived: true
          }
        }
      }
    })

    // Get project leader
    const project = await db.constructionProject.findUnique({
      where: { id },
      select: {
        titleIndo: true,
        titleEng: true,
        leaderId: true,
        leader: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            },
            ratingsReceived: true
          }
        }
      }
    })

    // Get all project assignments for more detailed info
    const assignments = await db.projectAssignment.findMany({
      where: {
        projectId: id,
        status: { in: ['in_progress', 'accepted'] }
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            },
            ratingsReceived: true
          }
        }
      }
    })

    // Format team members
    const teamMembers = projectTeam.map(team => {
      const member = team.member
      const assignment = assignments.find(a => a.memberId === member.id)

      // Calculate average rating
      const avgRating = member.ratingsReceived.length > 0
        ? member.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / member.ratingsReceived.length
        : 0

      return {
        id: member.id,
        name: member.user.name || member.user.email.split('@')[0],
        email: member.user.email,
        profession: member.profession,
        role: team.role,
        expertise: member.expertise ? member.expertise.split(',') : [],
        location: member.location,
        profileImage: member.profileImage,
        phone: member.phone,
        experience: member.experience,
        rating: Number(avgRating.toFixed(1)),
        ratingCount: member.ratingsReceived.length,
        assignedAt: team.assignedAt,
        assignedBy: team.assignedBy,
        status: team.status,
        projectRole: assignment?.role || 'team_member',
        expertiseArea: assignment?.expertiseArea || null
      }
    })

    // Format leader if exists
    const leader = project?.leader ? {
      id: project.leader.id,
      name: project.leader.user.name || project.leader.user.email.split('@')[0],
      email: project.leader.user.email,
      profession: project.leader.profession,
      role: 'leader',
      expertise: project.leader.expertise ? project.leader.expertise.split(',') : [],
      location: project.leader.location,
      profileImage: project.leader.profileImage,
      phone: project.leader.phone,
      experience: project.leader.experience,
      rating: project.leader.ratingsReceived.length > 0
        ? Number((project.leader.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / project.leader.ratingsReceived.length).toFixed(1))
        : 0,
      ratingCount: project.leader.ratingsReceived.length
    } : null

    return NextResponse.json({
      project: {
        id,
        title: project?.titleIndo || project?.titleEng,
        leader
      },
      team: teamMembers,
      totalMembers: teamMembers.length
    })
  } catch (error) {
    console.error('Error fetching project team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project team' },
      { status: 500 }
    )
  }
}
