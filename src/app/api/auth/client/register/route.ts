import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      password,
      phone,
      address,
      clientType,
      companyName
    } = body

    // Validate required fields
    if (!fullName || !email || !password || !phone || !address) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    if (clientType === 'company' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for company type' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and client in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          password: hashedPassword,
          role: 'client'
        }
      })

      // Create client profile
      const client = await tx.client.create({
        data: {
          userId: user.id,
          phone,
          address,
          profession: clientType === 'company' ? 'company' : 'individual',
          companyName: clientType === 'company' ? companyName : null,
          status: 'active' // Auto-approve clients
        }
      })

      return { user, client }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        clientId: result.client.id
      }
    })

  } catch (error) {
    console.error('Client registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
