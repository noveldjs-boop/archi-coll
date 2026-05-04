import { NextRequest, NextResponse } from 'next/server'
import { signIn } from 'next-auth/react'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists and is a client
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        client: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (user.role !== 'client') {
      return NextResponse.json(
        { error: 'This is not a client account' },
        { status: 403 }
      )
    }

    if (!user.client || user.client.status !== 'active') {
      return NextResponse.json(
        { error: 'Client account is not active' },
        { status: 403 }
      )
    }

    // Let NextAuth handle the actual authentication
    // The actual password validation is done in the auth.ts authorize function
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.client.id
      }
    })

  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
