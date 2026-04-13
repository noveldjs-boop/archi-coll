import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const orders = await db.order.findMany({
      where: {
        clientId: clientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    // Find client by user email
    const client = await db.client.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get order data from request body
    const orderData = await request.json()

    // Extract data from the orderData structure sent from order/confirm page
    const {
      categoryId,
      subCategoryId,
      location,
      landArea,
      buildingArea,
      floors,
      technicalClass,
      notes,
      massDensity,
      priceCalculation,
      categoryName,
      subCategoryName,
      technicalClassName,
      projectName
    } = orderData

    // Validate required fields
    if (!categoryId || !location || !landArea || !buildingArea || !floors || !technicalClass || !priceCalculation) {
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      )
    }

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `ORD-${new Date().getFullYear()}-${timestamp}${random}`

    // Determine building type based on floors
    const floorCount = parseInt(floors) || 1
    let buildingType = 'low-rise'
    if (floorCount > 4 && floorCount <= 8) {
      buildingType = 'mid-rise'
    } else if (floorCount > 8) {
      buildingType = 'high-rise'
    }

    // Determine quality level from technical class
    let qualityLevel = 'menengah' // default
    if (technicalClassName && technicalClassName.includes('K1')) {
      qualityLevel = 'sederhana'
    } else if (technicalClassName && technicalClassName.includes('K3')) {
      qualityLevel = 'mewah'
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        clientName: client.user.name || '',
        clientPhone: client.phone,
        clientAddress: client.address || '',
        clientProfession: client.profession || '',
        clientCompanyName: client.companyName || null,
        // Building information
        landArea: landArea.toString(),
        landPosition: 'Hook', // Default
        landBoundary: null,
        accessRoadWidth: null,
        buildingArea: buildingArea.toString(),
        buildingModel: subCategoryName || categoryName || 'Custom',
        buildingFloors: floors.toString(),
        structureType: 'Beton Bertulang', // Default
        buildingCategory: categoryId,
        buildingType,
        qualityLevel,
        // Project details
        projectName: projectName || null,
        description: notes || null,
        locationAddress: location || null,
        coordinates: null,
        // Technical classifications
        teknicalClass: technicalClassName || technicalClass,
        densityClass: massDensity || null,
        // Pricing from calculation
        rab: priceCalculation.rab || 0,
        designFee: priceCalculation.designFee || 0,
        iaiFeeRate: priceCalculation.iaiFeeRate || 0,
        pricePerM2: priceCalculation.pricePerM2 || 0,
        simulatedDP10: priceCalculation.dp || 0,
        dpPaidAmount: 0,
        remainingAfterDP: (priceCalculation.designFee || 0) - (priceCalculation.dp || 0),
        // Initial status
        status: 'pending',
        paymentStage: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber
      }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
