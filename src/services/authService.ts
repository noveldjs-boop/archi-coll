/**
 * Authentication Service
 * Business logic untuk authentication
 */

import { db } from '@/lib/db'
import type { User, Member } from '@/types'

export const authService = {
  // User operations
  async getUserByEmail(email: string) {
    return await db.user.findUnique({
      where: { email },
      include: { member: true },
    })
  },

  async getUserById(id: string) {
    return await db.user.findUnique({
      where: { id },
      include: { member: true },
    })
  },

  async createUser(data: { email: string; name?: string; password: string; role: string }) {
    return await db.user.create({
      data,
    })
  },

  async updateUser(id: string, data: Partial<{ name: string; password: string }>) {
    return await db.user.update({
      where: { id },
      data,
    })
  },

  // Member operations
  async getMemberByUserId(userId: string) {
    return await db.member.findUnique({
      where: { userId },
      include: { user: true },
    })
  },

  async createMember(data: {
    userId: string
    profession: string
    phone: string
    address?: string
    bio?: string
    location?: string
    profileImage?: string
    experience?: number
  }) {
    return await db.member.create({
      data,
    })
  },

  async updateMember(id: string, data: Partial<{
    phone: string
    address?: string
    bio?: string
    location?: string
    profileImage?: string
    experience?: number
    portfolioUrl?: string
    linkedinUrl?: string
  }>) {
    return await db.member.update({
      where: { id },
      data,
    })
  },

  // Verify credentials
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email)
    if (!user || !user.password) {
      return null
    }

    // Simple password check (in production, use bcrypt.compare)
    if (user.password === password) {
      return user
    }

    return null
  },

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { email },
    })
    return !!user
  },
}
