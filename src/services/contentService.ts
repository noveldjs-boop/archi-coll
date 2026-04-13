/**
 * Content Service
 * Business logic untuk content management (services, portfolio, team, etc.)
 */

import { db } from '@/lib/db'
import type { Service, PortfolioProject, TeamMember, AboutContent, ContactInfo, OperatingHours, HomeStats } from '@/types'

export const contentService = {
  // Services
  async getServices() {
    return await db.service.findMany({
      where: { active: true },
      include: { features: true },
      orderBy: { order: 'asc' },
    })
  },

  async getServiceById(id: string) {
    return await db.service.findUnique({
      where: { id },
      include: { features: true },
    })
  },

  // Portfolio
  async getPortfolio() {
    return await db.portfolioProject.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
  },

  async getPortfolioById(id: string) {
    return await db.portfolioProject.findUnique({
      where: { id },
    })
  },

  // Team Members
  async getTeamMembers() {
    return await db.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
  },

  async getTeamMemberById(id: string) {
    return await db.teamMember.findUnique({
      where: { id },
    })
  },

  async getTeamMembersByRole(role: string) {
    return await db.teamMember.findMany({
      where: { active: true, role: role as any },
      orderBy: { order: 'asc' },
    })
  },

  // About Content
  async getAboutContent() {
    return await db.aboutContent.findMany({
      orderBy: { order: 'asc' },
    })
  },

  async getAboutContentBySection(section: string) {
    return await db.aboutContent.findMany({
      where: { section: section as any },
      orderBy: { order: 'asc' },
    })
  },

  // Contact Info
  async getContactInfo() {
    return await db.contactInfo.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
  },

  async getContactInfoByType(type: string) {
    return await db.contactInfo.findUnique({
      where: { type },
    })
  },

  // Operating Hours
  async getOperatingHours() {
    return await db.operatingHours.findMany({
      orderBy: { order: 'asc' },
    })
  },

  async getOperatingHoursByDay(day: string) {
    return await db.operatingHours.findUnique({
      where: { day },
    })
  },

  // Home Stats
  async getHomeStats() {
    return await db.homeStats.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
  },

  async getHomeStatsByKey(key: string) {
    return await db.homeStats.findUnique({
      where: { key },
    })
  },

  // Batch fetch (for performance)
  async getAllContent() {
    const [services, portfolio, teamMembers, aboutContent, contactInfo, operatingHours, homeStats] = await Promise.all([
      this.getServices(),
      this.getPortfolio(),
      this.getTeamMembers(),
      this.getAboutContent(),
      this.getContactInfo(),
      this.getOperatingHours(),
      this.getHomeStats(),
    ])

    return {
      services,
      portfolio,
      teamMembers,
      aboutContent,
      contactInfo,
      operatingHours,
      homeStats,
    }
  },
}
