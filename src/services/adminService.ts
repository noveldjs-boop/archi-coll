/**
 * Admin Service
 * Business logic untuk admin operations
 */

import { db } from '@/lib/db'
import type {
  Service,
  ServiceFeature,
  PortfolioProject,
  TeamMember,
  AboutContent,
  ContactInfo,
  OperatingHours,
  HomeStats,
  BuildingCategory,
  PricingRule,
  Member,
} from '@/types'

export const adminService = {
  // Service management
  async createService(data: {
    titleId: string
    titleIndo: string
    titleEng: string
    descId: string
    descIndo: string
    descEng: string
    icon?: string
    imageUrl?: string
    order?: number
  }) {
    return await db.service.create({
      data,
    })
  },

  async updateService(id: string, data: Partial<Service>) {
    return await db.service.update({
      where: { id },
      data,
    })
  },

  async deleteService(id: string) {
    return await db.service.delete({
      where: { id },
    })
  },

  async addServiceFeature(serviceId: string, data: {
    featureId: string
    textIndo: string
    textEng: string
    order?: number
  }) {
    return await db.serviceFeature.create({
      data: { ...data, serviceId },
    })
  },

  // Portfolio management
  async createPortfolioProject(data: {
    titleIndo: string
    titleEng: string
    descriptionIndo?: string
    descriptionEng?: string
    imageUrl?: string
    category: string
    order?: number
  }) {
    return await db.portfolioProject.create({
      data,
    })
  },

  async updatePortfolioProject(id: string, data: Partial<PortfolioProject>) {
    return await db.portfolioProject.update({
      where: { id },
      data,
    })
  },

  async deletePortfolioProject(id: string) {
    return await db.portfolioProject.delete({
      where: { id },
    })
  },

  // Team member management
  async createTeamMember(data: {
    name: string
    titleIndo: string
    titleEng: string
    descriptionIndo?: string
    descriptionEng?: string
    imageUrl?: string
    linkedinUrl?: string
    email?: string
    role: string
    order?: number
  }) {
    return await db.teamMember.create({
      data,
    })
  },

  async updateTeamMember(id: string, data: Partial<TeamMember>) {
    return await db.teamMember.update({
      where: { id },
      data,
    })
  },

  async deleteTeamMember(id: string) {
    return await db.teamMember.delete({
      where: { id },
    })
  },

  // About content management
  async createAboutContent(data: {
    section: 'vision' | 'mission' | 'values'
    contentIndo: string
    contentEng: string
    order?: number
  }) {
    return await db.aboutContent.create({
      data,
    })
  },

  async updateAboutContent(id: string, data: Partial<AboutContent>) {
    return await db.aboutContent.update({
      where: { id },
      data,
    })
  },

  async deleteAboutContent(id: string) {
    return await db.aboutContent.delete({
      where: { id },
    })
  },

  // Contact info management
  async createContactInfo(data: {
    type: string
    labelIndo: string
    labelEng: string
    valueIndo: string
    valueEng: string
    icon: string
    order?: number
  }) {
    return await db.contactInfo.create({
      data,
    })
  },

  async updateContactInfo(id: string, data: Partial<ContactInfo>) {
    return await db.contactInfo.update({
      where: { id },
      data,
    })
  },

  async deleteContactInfo(id: string) {
    return await db.contactInfo.delete({
      where: { id },
    })
  },

  // Operating hours management
  async createOperatingHours(data: {
    day: string
    labelIndo: string
    labelEng: string
    openTime: string
    closeTime: string
    closed?: boolean
    order?: number
  }) {
    return await db.operatingHours.create({
      data,
    })
  },

  async updateOperatingHours(id: string, data: Partial<OperatingHours>) {
    return await db.operatingHours.update({
      where: { id },
      data,
    })
  },

  async deleteOperatingHours(id: string) {
    return await db.operatingHours.delete({
      where: { id },
    })
  },

  // Home stats management
  async createHomeStats(data: {
    key: string
    labelIndo: string
    labelEng: string
    value: string
    dataSource: 'static' | 'dynamic'
    icon: string
    order?: number
  }) {
    return await db.homeStats.create({
      data,
    })
  },

  async updateHomeStats(id: string, data: Partial<HomeStats>) {
    return await db.homeStats.update({
      where: { id },
      data,
    })
  },

  async toggleHomeStats(id: string) {
    const stat = await db.homeStats.findUnique({ where: { id } })
    if (!stat) throw new Error('Home stat not found')

    return await db.homeStats.update({
      where: { id },
      data: { active: !stat.active },
    })
  },

  async deleteHomeStats(id: string) {
    return await db.homeStats.delete({
      where: { id },
    })
  },

  // Member management
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
        ratingsReceived: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async deleteMember(id: string) {
    // Check if member has active projects
    const activeProjects = await db.projectAssignment.count({
      where: {
        memberId: id,
        status: { in: ['accepted', 'in_progress'] },
      },
    })

    if (activeProjects > 0) {
      throw new Error('Cannot delete member with active projects')
    }

    return await db.member.delete({
      where: { id },
    })
  },

  // Building category management
  async getBuildingCategories() {
    return await db.buildingCategory.findMany({
      where: { active: true },
      include: { formFields: true },
      orderBy: { order: 'asc' },
    })
  },

  // Pricing rules management
  async getPricingRules() {
    return await db.pricingRule.findMany({
      where: { active: true },
      orderBy: [{ buildingType: 'asc' }, { qualityLevel: 'asc' }],
    })
  },

  async createPricingRule(data: {
    buildingType: 'low-rise' | 'mid-rise' | 'high-rise'
    qualityLevel: 'sederhana' | 'menengah' | 'mewah'
    pricePerM2: number
    iaiFeeRate: number
    minFloors?: number
    maxFloors?: number
    descriptionIndo?: string
    descriptionEng?: string
  }) {
    return await db.pricingRule.create({
      data,
    })
  },

  async updatePricingRule(id: string, data: Partial<PricingRule>) {
    return await db.pricingRule.update({
      where: { id },
      data,
    })
  },

  async deletePricingRule(id: string) {
    return await db.pricingRule.delete({
      where: { id },
    })
  },

  async togglePricingRule(id: string) {
    const rule = await db.pricingRule.findUnique({ where: { id } })
    if (!rule) throw new Error('Pricing rule not found')

    return await db.pricingRule.update({
      where: { id },
      data: { active: !rule.active },
    })
  },

  // Dashboard statistics
  async getDashboardStats() {
    const [totalMembers, activeMembers, pendingMembers, totalOrders, completedOrders, totalProjects] = await Promise.all([
      db.member.count(),
      db.member.count({ where: { status: 'active' } }),
      db.member.count({ where: { status: 'pending' } }),
      db.order.count(),
      db.order.count({ where: { status: 'completed' } }),
      db.constructionProject.count(),
    ])

    return {
      totalMembers,
      activeMembers,
      pendingMembers,
      totalOrders,
      completedOrders,
      totalProjects,
      orderCompletionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
    }
  },
}
