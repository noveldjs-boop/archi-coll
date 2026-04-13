import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET all orders (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (clientId) {
      where.clientId = clientId
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: {
            user: true
          }
        },
        assignedMember: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      clientName,
      clientPhone,
      clientAddress,
      clientProfession,
      clientCompanyName,
      categoryId,
      categoryName,
      // Building information
      landArea,
      landPosition,
      landBoundary,
      accessRoadWidth,
      buildingArea,
      buildingModel,
      buildingFloors,
      structureType,
      buildingCategory,
      buildingType,
      qualityLevel,
      // Project details
      description,
      location,
      coordinates,
      // Pricing (calculated from frontend)
      rab,
      designFee,
      iaiFeeRate,
      pricePerM2,
      simulatedDP10,
      // Additional form data (dynamic fields)
      formData
    } = body

    // Validate required fields
    if (!clientId || !clientName || !clientPhone || !clientAddress || !buildingArea || !buildingFloors || !buildingCategory) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        clientId,
        clientName,
        clientPhone,
        clientAddress,
        clientProfession,
        clientCompanyName,
        landArea: landArea?.toString() || '',
        landPosition: landPosition || '',
        landBoundary,
        accessRoadWidth,
        buildingArea: buildingArea.toString(),
        buildingModel: buildingModel || '',
        buildingFloors: buildingFloors.toString(),
        structureType: structureType || '',
        buildingCategory,
        buildingType: buildingType || '',
        qualityLevel: qualityLevel || '',
        description,
        locationAddress: location,
        coordinates,
        rab: parseFloat(rab) || 0,
        designFee: parseFloat(designFee) || 0,
        iaiFeeRate: parseFloat(iaiFeeRate) || 0,
        pricePerM2: parseFloat(pricePerM2) || 0,
        simulatedDP10: parseFloat(simulatedDP10) || 0,
        dpPaidAmount: 0,
        remainingAfterDP: (parseFloat(designFee) || 0) - (parseFloat(simulatedDP10) || 0)
      }
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
