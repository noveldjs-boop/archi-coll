import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - List all partnership requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const requests = await db.partnershipRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: requests
    })
  } catch (error) {
    console.error('Error fetching partnership requests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partnership requests'
      },
      { status: 500 }
    )
  }
}

// POST - Create new partnership request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { companyName, contactPerson, email, phone, partnershipType, description } = body

    // Validate required fields
    if (!companyName || !contactPerson || !email || !partnershipType || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    // Create partnership request
    const partnershipRequest = await db.partnershipRequest.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone: phone || null,
        partnershipType,
        description,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      data: partnershipRequest,
      message: 'Partnership request submitted successfully'
    })
  } catch (error) {
    console.error('Error creating partnership request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create partnership request'
      },
      { status: 500 }
    )
  }
}
