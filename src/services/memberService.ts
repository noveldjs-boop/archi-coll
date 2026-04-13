/**
 * Member Service
 * Business logic untuk member operations
 */

import { db } from '@/lib/db'
import type { Member, Certificate, MemberProject, ExpertiseRating } from '@/types'

export const memberService = {
  // Get members
  async getMembers(filters?: {
    status?: string
    profession?: string
  }) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.profession) {
      where.profession = filters.profession
    }

    return await db.member.findMany({
      where,
      include: {
        user: true,
        certificates: true,
        profileProjects: true,
        ratingsGiven: true,
        ratingsReceived: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getMemberById(id: string) {
    return await db.member.findUnique({
      where: { id },
      include: {
        user: true,
        certificates: true,
        profileProjects: {
          orderBy: { order: 'asc' },
        },
        ratingsGiven: true,
        ratingsReceived: true,
      },
    })
  },

  async getMemberByUserId(userId: string) {
    return await db.member.findUnique({
      where: { userId },
      include: {
        user: true,
        certificates: true,
        profileProjects: true,
        ratingsGiven: true,
        ratingsReceived: true,
      },
    })
  },

  // Update member status
  async updateMemberStatus(id: string, status: 'pending' | 'active' | 'suspended' | 'rejected') {
    return await db.member.update({
      where: { id },
      data: {
        status,
        ...(status === 'active' ? { approvedAt: new Date().toISOString() } : {}),
      },
    })
  },

  // Update member profile
  async updateMemberProfile(id: string, data: {
    phone?: string
    address?: string
    bio?: string
    location?: string
    profileImage?: string
    experience?: number
    portfolioUrl?: string
    linkedinUrl?: string
    portfolioWebsite?: string
  }) {
    return await db.member.update({
      where: { id },
      data,
    })
  },

  // Delete member
  async deleteMember(id: string) {
    return await db.member.delete({
      where: { id },
    })
  },

  // Certificate operations
  async addCertificate(memberId: string, data: {
    certificateType: string
    certificateNumber?: string
    issuer?: string
    issuedDate?: string
    expiryDate?: string
    documentUrl?: string
  }) {
    return await db.certificate.create({
      data: {
        ...data,
        memberId,
        issuedDate: data.issuedDate ? new Date(data.issuedDate).toISOString() : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null,
      },
    })
  },

  async deleteCertificate(id: string) {
    return await db.certificate.delete({
      where: { id },
    })
  },

  // Portfolio project operations
  async addPortfolioProject(memberId: string, data: {
    title: string
    description?: string
    category: string
    imageUrls: string
    location?: string
    year?: number
    order?: number
  }) {
    return await db.memberProject.create({
      data: {
        ...data,
        memberId,
      },
    })
  },

  async deletePortfolioProject(id: string) {
    return await db.memberProject.delete({
      where: { id },
    })
  },

  // Get member statistics
  async getMemberStats(id: string) {
    const member = await this.getMemberById(id)
    if (!member) return null

    const ratingsReceived = member.ratingsReceived || []
    const avgRating = ratingsReceived.length > 0
      ? ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / ratingsReceived.length
      : 0

    const activeProjects = await db.projectAssignment.count({
      where: {
        memberId: id,
        status: { in: ['accepted', 'in_progress'] },
      },
    })

    const completedProjects = await db.projectAssignment.count({
      where: {
        memberId: id,
        status: 'completed',
      },
    })

    return {
      id: member.id,
      name: member.user?.name || '',
      rating: avgRating,
      ratingCount: ratingsReceived.length,
      activeProjects,
      completedProjects,
      totalProjects: activeProjects + completedProjects,
      portfolioCount: member.profileProjects?.length || 0,
      certificateCount: member.certificates?.length || 0,
    }
  },
}
