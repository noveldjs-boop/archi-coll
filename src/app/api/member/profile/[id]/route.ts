import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const member = await db.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        },
        certificates: {
          where: {
            verified: true
          },
          select: {
            certificateType: true,
            certificateNumber: true,
            issuer: true,
            issuedDate: true,
            expiryDate: true,
            documentUrl: true
          }
        },
        profileProjects: {
          orderBy: { year: 'desc' }
        },
        ratingsReceived: {
          include: {
            project: {
              select: {
                titleIndo: true,
                titleEng: true
              }
            }
          }
        },
        assignments: {
          where: {
            status: 'in_progress'
          },
          include: {
            project: {
              select: {
                id: true,
                titleIndo: true,
                titleEng: true,
                status: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const assistantProjects = member.assistantProjects
      ? JSON.parse(member.assistantProjects)
      : {}

    const portfolioImages = member.portfolioImages
      ? JSON.parse(member.portfolioImages)
      : []

    const expertise = member.expertise ? member.expertise.split(',') : []
    const buildingTypes = member.buildingTypes ? member.buildingTypes.split(',') : []

    // Calculate average rating
    const avgRating =
      member.ratingsReceived.length > 0
        ? member.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / member.ratingsReceived.length
        : 0

    // Count ratings by expertise area
    const ratingsByExpertise = member.ratingsReceived.reduce((acc, rating) => {
      if (!acc[rating.expertiseArea]) {
        acc[rating.expertiseArea] = { count: 0, total: 0 }
      }
      acc[rating.expertiseArea].count++
      acc[rating.expertiseArea].total += rating.rating
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    // Format response
    const response = {
      id: member.id,
      name: member.user.name || member.user.email.split('@')[0],
      email: member.user.email,
      profession: member.profession,
      phone: member.phone,
      location: member.location,
      bio: member.bio,
      profileImage: member.profileImage,
      experience: member.experience,
      expertise,
      buildingTypes,
      portfolioImages,
      portfolioDescription: member.portfolioDescription,
      linkedinUrl: member.linkedinUrl,
      portfolioWebsite: member.portfolioWebsite,
      assistantProjects,
      certificates: member.certificates,
      portfolioProjects: member.profileProjects,
      activeProjects: member.assignments.map(a => ({
        id: a.project.id,
        title: a.project.titleIndo || a.project.titleEng,
        category: a.project.category,
        status: a.project.status,
        role: a.role
      })),
      ratings: {
        average: Number(avgRating.toFixed(1)),
        count: member.ratingsReceived.length,
        byExpertise: Object.entries(ratingsByExpertise).reduce((acc, [expertise, data]) => {
          acc[expertise] = {
            count: data.count,
            average: Number((data.total / data.count).toFixed(1))
          }
          return acc
        }, {} as Record<string, { count: number; average: number }>)
      },
      createdAt: member.createdAt,
      approvedAt: member.approvedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching member profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member profile' },
      { status: 500 }
    )
  }
}
