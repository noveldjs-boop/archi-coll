import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Get single partner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partner = await db.partner.findUnique({
      where: {
        id: id
      },
      include: {
        ads: true,
        catalogs: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partner
    })
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partner'
      },
      { status: 500 }
    )
  }
}

// PUT - Update partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      userId,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      status,
      contractStart,
      contractEnd,
      commissionRate,
      logoUrl,
      websiteUrl,
      description
    } = body

    const updateData: any = {
      updatedAt: new Date()
    }

    if (userId !== undefined) updateData.userId = userId
    if (companyName) updateData.companyName = companyName
    if (contactPerson) updateData.contactPerson = contactPerson
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (status) updateData.status = status
    if (contractStart) updateData.contractStart = new Date(contractStart)
    if (contractEnd) updateData.contractEnd = new Date(contractEnd)
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl
    if (description !== undefined) updateData.description = description

    const partner = await db.partner.update({
      where: {
        id: id
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner updated successfully'
    })
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update partner'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.partner.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete partner'
      },
      { status: 500 }
    )
  }
}
