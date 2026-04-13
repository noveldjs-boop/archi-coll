import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            member: {
              select: {
                id: true,
                profession: true,
                status: true,
                phone: true,
                address: true,
                experience: true,
                portfolioUrl: true
              }
            }
          }
        })

        if (!user) {
          return null
        }

        // Check role and validate password accordingly
        if (user.role === "admin") {
          // Admin login - use environment variable password
          const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

          if (credentials.password !== adminPassword) {
            return null
          }
        } else if (user.role === "member") {
          // Member login - validate with hashed password from database
          if (!user.password) {
            console.error("Member has no password set")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // Check if member is approved and active
          if (user.member?.status !== "active") {
            return null
          }
        } else if (["editor", "finance", "marketing", "hrd"].includes(user.role)) {
          // Staff login (Editor, Finance, Marketing, HRD) - validate with hashed password
          if (!user.password) {
            console.error(`${user.role} has no password set`)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }
        } else {
          // Other roles (user, etc.) - not allowed to login
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberId: user.member?.id,
          profession: user.member?.profession,
          memberStatus: user.member?.status
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/join-member",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: (user as any).id,
          email: (user as any).email,
          name: (user as any).name,
          role: (user as any).role,
          memberId: (user as any).memberId,
          profession: (user as any).profession,
          memberStatus: (user as any).memberStatus
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          memberId: token.memberId as string,
          profession: token.profession as string,
          memberStatus: token.memberStatus as string
        } as any
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development"
}

/**
 * Verify session helper function
 * Returns the current server session using authOptions
 */
export async function verifySession() {
  return await getServerSession(authOptions)
}
