import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch all service configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const services = await db.serviceConfig.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: services
    })
  } catch (error) {
    console.error('Error fetching service configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service configurations' },
      { status: 500 }
    )
  }
}

// POST - Create new service configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceKey,
      labelIndo,
      labelEng,
      icon,
      descriptionIndo,
      descriptionEng,
      rate,
      minFee,
      order,
      active
    } = body

    // Validate required fields
    if (!serviceKey || !labelIndo || !labelEng || rate === undefined || minFee === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceKey, labelIndo, labelEng, rate, minFee' },
        { status: 400 }
      )
    }

    // Check if serviceKey already exists
    const existing = await db.serviceConfig.findUnique({
      where: { serviceKey }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Service with this key already exists' },
        { status: 400 }
      )
    }

    // Create service configuration
    const service = await db.serviceConfig.create({
      data: {
        serviceKey,
        labelIndo,
        labelEng,
        icon: icon || null,
        descriptionIndo: descriptionIndo || null,
        descriptionEng: descriptionEng || null,
        rate: parseFloat(rate),
        minFee: parseFloat(minFee),
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service configuration created successfully'
    })
  } catch (error) {
    console.error('Error creating service configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create service configuration' },
      { status: 500 }
    )
  }
}

// PUT - Update service configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existing = await db.serviceConfig.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service configuration not found' },
        { status: 404 }
      )
    }

    // If updating serviceKey, check for conflicts
    if (updateData.serviceKey && updateData.serviceKey !== existing.serviceKey) {
      const conflict = await db.serviceConfig.findUnique({
        where: { serviceKey: updateData.serviceKey }
      })

      if (conflict) {
        return NextResponse.json(
          { error: 'Service with this key already exists' },
          { status: 400 }
        )
      }
    }

    // Update numeric fields
    if (updateData.rate !== undefined) {
      updateData.rate = parseFloat(updateData.rate)
    }
    if (updateData.minFee !== undefined) {
      updateData.minFee = parseFloat(updateData.minFee)
    }

    // Update service configuration
    const service = await db.serviceConfig.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service configuration updated successfully'
    })
  } catch (error) {
    console.error('Error updating service configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update service configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existing = await db.serviceConfig.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service configuration not found' },
        { status: 404 }
      )
    }

    // Delete service configuration
    await db.serviceConfig.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Service configuration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting service configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete service configuration' },
      { status: 500 }
    )
  }
}
