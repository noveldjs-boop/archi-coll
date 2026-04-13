import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const {
      clientId,
      subCategory,
      formData,
      simulationResult,
      buildingScale
    } = await request.json()

    // Validate required fields
    if (!clientId || !subCategory || !formData || !simulationResult) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Get client details
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: { user: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Generate order number with timestamp for uniqueness
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `ORD-${new Date().getFullYear()}-${timestamp}${random}`

    // Determine building type based on floors
    const floors = parseInt(formData.floors) || 1
    let buildingType = 'low-rise'
    if (floors > 4 && floors <= 8) {
      buildingType = 'mid-rise'
    } else if (floors > 8) {
      buildingType = 'high-rise'
    }

    // Determine quality level from technical class
    let qualityLevel = 'menengah' // default
    if (formData.technicalClass.includes('K1')) {
      qualityLevel = 'sederhana'
    } else if (formData.technicalClass.includes('K3')) {
      qualityLevel = 'mewah'
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        clientId,
        clientName: client.user.name || '',
        clientPhone: client.phone,
        clientAddress: client.address || '',
        clientProfession: client.profession || '',
        clientCompanyName: client.companyName || null,
        // Building information
        landArea: formData.landArea,
        landPosition: 'Hook', // Default, can be updated
        landBoundary: null,
        accessRoadWidth: null,
        buildingArea: formData.buildingArea,
        buildingModel: subCategory.nameIndo,
        buildingFloors: formData.floors,
        structureType: 'Beton Bertulang', // Default
        buildingCategory: subCategory.code,
        buildingType,
        qualityLevel,
        // Project details
        projectName: formData.projectName || null,
        description: formData.notes || null,
        locationAddress: formData.location || null,
        coordinates: formData.coordinates || null,
        // Pricing from simulation
        rab: simulationResult.rab || 0,
        designFee: simulationResult.designFee || 0,
        iaiFeeRate: simulationResult.iaiFeeRate || 0,
        pricePerM2: simulationResult.pricePerM2 || 0,
        simulatedDP10: simulationResult.initialPayment || 0,
        dpPaidAmount: 0,
        remainingAfterDP: (simulationResult.designFee || 0) - (simulationResult.initialPayment || 0),
        // Initial status
        status: 'pending',
        paymentStage: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
