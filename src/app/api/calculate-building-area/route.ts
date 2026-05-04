import { NextRequest, NextResponse } from 'next/server'

// Regulation data based on location and building category
// These are simplified regulations for demonstration
const locationRegulations: Record<string, any> = {
  default: {
    KDB: 0.6,  // Koefisien Dasar Bangunan
    KLB: 2.5,  // Koefisien Lantai Bangunan
    KDH: 0.3,  // Koefisien Daerah Hijau
    RTH: 0.3   // Ruang Terbuka Hijau
  },
  'jakarta': {
    KDB: 0.4,
    KLB: 3.0,
    KDH: 0.3,
    RTH: 0.3
  },
  'bandung': {
    KDB: 0.5,
    KLB: 2.5,
    KDH: 0.3,
    RTH: 0.3
  },
  'surabaya': {
    KDB: 0.5,
    KLB: 2.5,
    KDH: 0.3,
    RTH: 0.3
  },
  'yogyakarta': {
    KDB: 0.6,
    KLB: 2.0,
    KDH: 0.35,
    RTH: 0.35
  },
  'bali': {
    KDB: 0.4,
    KLB: 2.0,
    KDH: 0.4,
    RTH: 0.4
  }
}

// Building category specific adjustments
const categoryAdjustments: Record<string, number> = {
  '1': 1.0,  // Hunian
  '2': 0.9,  // Perkantoran
  '3': 0.8,  // Perdagangan dan Jasa
  '4': 0.7,  // Industri
  '5': 0.85, // Fasilitas Pelayanan Umum
  '6': 0.9   // Budaya dan Rekreasi
}

export async function POST(request: NextRequest) {
  try {
    const { location, categoryCode, landArea } = await request.json()

    if (!landArea || landArea <= 0) {
      return NextResponse.json(
        { error: 'Land area must be greater than 0' },
        { status: 400 }
      )
    }

    // Determine location regulation
    const locationLower = location.toLowerCase()
    let regulation = locationRegulations.default

    for (const [key, value] of Object.entries(locationRegulations)) {
      if (locationLower.includes(key)) {
        regulation = value
        break
      }
    }

    // Get category adjustment
    const categoryNum = categoryCode.split('-')[0] || '1'
    const categoryAdjustment = categoryAdjustments[categoryNum] || 1.0

    // Calculate building area based on KDB
    let buildingArea = landArea * regulation.KDB

    // Apply category adjustment
    buildingArea = buildingArea * categoryAdjustment

    // Ensure minimum building area
    const minBuildingArea = landArea * 0.3
    buildingArea = Math.max(buildingArea, minBuildingArea)

    // Ensure maximum building area based on KLB if floors specified
    const maxBuildingArea = landArea * regulation.KLB
    buildingArea = Math.min(buildingArea, maxBuildingArea)

    return NextResponse.json({
      success: true,
      buildingArea: Math.round(buildingArea * 100) / 100,
      regulations: {
        KDB: regulation.KDB,
        KLB: regulation.KLB,
        KDH: regulation.KDH,
        RTH: regulation.RTH
      },
      categoryAdjustment
    })
  } catch (error) {
    console.error('Error calculating building area:', error)
    return NextResponse.json(
      { error: 'Failed to calculate building area' },
      { status: 500 }
    )
  }
}
