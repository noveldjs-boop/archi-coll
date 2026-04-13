import { NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const demoUsers = [
      {
        email: 'architect@demo.com',
        password: 'archi123',
        name: 'Demo Architect',
        profession: 'architect',
        phone: '081234567890'
      },
      {
        email: 'structure@demo.com',
        password: 'structure123',
        name: 'Demo Structure Engineer',
        profession: 'structure',
        phone: '081234567891'
      },
      {
        email: 'mep@demo.com',
        password: 'mep123',
        name: 'Demo MEP Engineer',
        profession: 'mep',
        phone: '081234567892'
      },
      {
        email: 'drafter@demo.com',
        password: 'drafter123',
        name: 'Demo Drafter',
        profession: 'drafter',
        phone: '081234567893'
      },
      {
        email: 'qs@demo.com',
        password: 'qs123',
        name: 'Demo QS',
        profession: 'qs',
        phone: '081234567894'
      },
      {
        email: 'licensed@demo.com',
        password: 'licensed123',
        name: 'Demo Licensed Architect',
        profession: 'licensed-architect',
        phone: '081234567895'
      }
    ]

    const results = []

    for (const demoUser of demoUsers) {
      // Check if user already exists
      let user = await db.user.findUnique({
        where: { email: demoUser.email },
        include: { member: true }
      })

      if (!user) {
        // Create new user
        const hashedPassword = await bcrypt.hash(demoUser.password, 10)

        user = await db.user.create({
          data: {
            email: demoUser.email,
            name: demoUser.name,
            password: hashedPassword,
            role: 'member',
            member: {
              create: {
                profession: demoUser.profession,
                phone: demoUser.phone,
                status: 'active',
                experience: 5,
                bio: `Demo account for ${demoUser.profession} profession`,
                location: 'Jakarta, Indonesia'
              }
            }
          },
          include: { member: true }
        })

        results.push({
          email: demoUser.email,
          action: 'created',
          profession: demoUser.profession
        })
      } else {
        // Update existing user if needed
        if (!user.member) {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              member: {
                create: {
                  profession: demoUser.profession,
                  phone: demoUser.phone,
                  status: 'active',
                  experience: 5,
                  bio: `Demo account for ${demoUser.profession} profession`,
                  location: 'Jakarta, Indonesia'
                }
              }
            },
            include: { member: true }
          })
          results.push({
            email: demoUser.email,
            action: 'member_created',
            profession: demoUser.profession
          })
        } else {
          // Update password if needed
          const isPasswordValid = await bcrypt.compare(demoUser.password, user.password || '')
          if (!isPasswordValid && user.password) {
            const hashedPassword = await bcrypt.hash(demoUser.password, 10)
            await db.user.update({
              where: { id: user.id },
              data: { password: hashedPassword }
            })
            results.push({
              email: demoUser.email,
              action: 'password_updated',
              profession: user.member.profession
            })
          } else {
            results.push({
              email: demoUser.email,
              action: 'exists',
              profession: user.member.profession
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users checked/created successfully',
      results
    })
  } catch (error) {
    console.error('Error seeding demo users:', error)
    return NextResponse.json(
      { error: 'Failed to seed demo users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await db.user.findMany({
      where: {
        email: {
          in: [
            'architect@demo.com',
            'structure@demo.com',
            'mep@demo.com',
            'drafter@demo.com',
            'qs@demo.com',
            'licensed@demo.com'
          ]
        }
      },
      select: {
        email: true,
        name: true,
        role: true,
        password: true,
        member: {
          select: {
            profession: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        hasPassword: !!u.password,
        profession: u.member?.profession,
        memberStatus: u.member?.status
      }))
    })
  } catch (error) {
    console.error('Error fetching demo users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch demo users' },
      { status: 500 }
    )
  }
}
