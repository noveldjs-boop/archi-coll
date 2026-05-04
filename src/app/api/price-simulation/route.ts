import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// Price per m² based on building type and quality level (in IDR)
const pricePerM2Rules: Record<string, any> = {
  'low-rise': {
    'sederhana': 3500000,    // K1
    'menengah': 5500000,     // K2
    'mewah': 8500000         // K3
  },
  'mid-rise': {
    'sederhana': 4500000,
    'menengah': 7000000,
    'mewah': 10000000
  },
  'high-rise': {
    'sederhana': 6000000,
    'menengah': 9000000,
    'mewah': 13000000
  }
}

// IAI fee rates based on technical class and building value
const iaiFeeRates: Record<string, number> = {
  'K1': 0.08,   // Kelas 1 - Bangunan Sederhana
  'K2': 0.10,   // Kelas 2 - Bangunan Menengah
  'K3': 0.12    // Kelas 3 - Bangunan Mewah
}

// Helper function to get service pricing from database
async function getServicePricing(): Promise<Record<string, { rate: number; minFee: number }>> {
  try {
    const services = await db.serviceConfig.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    const pricing: Record<string, { rate: number; minFee: number }> = {}
    services.forEach(service => {
      pricing[service.serviceKey] = {
        rate: service.rate,
        minFee: service.minFee
      }
    })

    return pricing
  } catch (error) {
    console.error('Error fetching service pricing:', error)
    // Fallback to default pricing
    return {
      'architectural': { rate: 0.10, minFee: 25000000 },
      'landscape': { rate: 0.03, minFee: 5000000 },
      'interior': { rate: 0.08, minFee: 15000000 },
      'facade': { rate: 0.04, minFee: 10000000 },
      'structural': { rate: 0.05, minFee: 15000000 },
      'mep': { rate: 0.04, minFee: 10000000 },
      'ded': { rate: 0.03, minFee: 10000000 },
      'imb': { rate: 0.02, minFee: 5000000 },
      'surveyor': { rate: 0.01, minFee: 3000000 }
    }
  }
}

// Helper function to get service name from database
async function getServiceNames(): Promise<Record<string, string>> {
  try {
    const services = await db.serviceConfig.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    const names: Record<string, string> = {}
    services.forEach(service => {
      names[service.serviceKey] = service.labelIndo // Default to Indonesian name
    })

    return names
  } catch (error) {
    console.error('Error fetching service names:', error)
    // Fallback to default names
    return {
      'architectural': 'Desain Arsitektur',
      'landscape': 'Desain Landscape',
      'interior': 'Desain Interior',
      'facade': 'Desain Fasad',
      'structural': 'Desain Struktur',
      'mep': 'Desain MEP',
      'ded': 'Detail Engineering Design',
      'imb': 'IMB (Pengurusan Izin)',
      'surveyor': 'Jasa Surveyor'
    }
  }
}

// Service pricing rates as percentage of RAB (based on Indonesian standards)
// This is now fetched from database, keeping as fallback
const servicePricingFallback: Record<string, { rate: number; minFee: number }> = {
  'architectural': { rate: 0.10, minFee: 25000000 },      // 10% dari RAB
  'landscape': { rate: 0.03, minFee: 5000000 },           // 3% dari RAB
  'interior': { rate: 0.08, minFee: 15000000 },           // 8% dari RAB
  'facade': { rate: 0.04, minFee: 10000000 },             // 4% dari RAB
  'structural': { rate: 0.05, minFee: 15000000 },         // 5% dari RAB
  'mep': { rate: 0.04, minFee: 10000000 },                // 4% dari RAB
  'ded': { rate: 0.03, minFee: 10000000 },                // 3% dari RAB
  'imb': { rate: 0.02, minFee: 5000000 },                 // 2% dari RAB
  'surveyor': { rate: 0.01, minFee: 3000000 }             // 1% dari RAB
}

// Quality level mapping from technical class
const qualityLevelMap: Record<string, string> = {
  'K1': 'sederhana',
  'K2': 'menengah',
  'K3': 'mewah'
}

// Building type based on floors
function getBuildingType(floors: number): string {
  if (floors <= 4) return 'low-rise'
  if (floors <= 8) return 'mid-rise'
  return 'high-rise'
}

// Technical class code extraction
function extractTechnicalClass(technicalClass: string): string {
  if (technicalClass.includes('K1')) return 'K1'
  if (technicalClass.includes('K2')) return 'K2'
  if (technicalClass.includes('K3')) return 'K3'
  return 'K2' // Default
}

export async function POST(request: NextRequest) {
  try {
    const {
      categoryCode,
      landArea,
      buildingArea,
      floors,
      technicalClass,
      location,
      coordinates,
      selectedServices = [] // Array of selected service keys
    } = await request.json()

    if (!buildingArea || buildingArea <= 0) {
      return NextResponse.json(
        { error: 'Building area must be greater than 0' },
        { status: 400 }
      )
    }

    if (!floors || floors <= 0) {
      return NextResponse.json(
        { error: 'Number of floors must be greater than 0' },
        { status: 400 }
      )
    }

    if (!technicalClass) {
      return NextResponse.json(
        { error: 'Technical class is required' },
        { status: 400 }
      )
    }

    // Determine building type
    const buildingType = getBuildingType(floors)

    // Extract technical class code
    const classCode = extractTechnicalClass(technicalClass)

    // Get quality level
    const qualityLevel = qualityLevelMap[classCode]

    // Get price per m²
    const pricePerM2 = pricePerM2Rules[buildingType]?.[qualityLevel] || 5500000

    // Calculate RAB (Rencana Anggaran Biaya)
    const rab = buildingArea * pricePerM2

    // Get IAI fee rate
    const iaiFeeRate = iaiFeeRates[classCode] || 0.10

    // Calculate design fee based on RAB and IAI fee rate
    const designFee = rab * iaiFeeRate

    // Fetch service pricing from database
    const servicePricing = await getServicePricing()
    const serviceNames = await getServiceNames()

    // Calculate individual service costs based on RAB
    const serviceBreakdown: Record<string, any> = {}
    let totalServiceFee = 0

    // If specific services are selected, calculate only those
    // If no services selected, default to architectural design
    const servicesToCalculate = selectedServices.length > 0 ? selectedServices : ['architectural']

    servicesToCalculate.forEach(serviceKey => {
      const pricing = servicePricing[serviceKey] || servicePricingFallback[serviceKey]
      if (pricing) {
        const calculatedFee = Math.max(rab * pricing.rate, pricing.minFee)
        serviceBreakdown[serviceKey] = {
          fee: Math.round(calculatedFee),
          rate: pricing.rate,
          minFee: pricing.minFee,
          name: serviceNames[serviceKey] || serviceKey
        }
        totalServiceFee += calculatedFee
      }
    })

    // Use total service fee or fallback to design fee
    const finalDesignFee = totalServiceFee > 0 ? totalServiceFee : designFee

    // Calculate initial payment (10% of total design fee)
    const initialPayment = finalDesignFee * 0.10

    // Calculate remaining payment after DP
    const remainingAfterDP = finalDesignFee - initialPayment

    // Payment schedule breakdown
    const paymentSchedule = {
      dp: {
        percentage: 10,
        amount: initialPayment,
        description: 'Pembayaran Awal / Down Payment'
      },
      stage1: {
        percentage: 40,
        amount: designFee * 0.40,
        description: 'Setelah Persetujuan Pra-Desain'
      },
      stage2: {
        percentage: 30,
        amount: designFee * 0.30,
        description: 'Setelah Penyelesaian DED'
      },
      stage3: {
        percentage: 20,
        amount: designFee * 0.20,
        description: 'Setelah Penyelesaian Konstruksi'
      }
    }

    return NextResponse.json({
      success: true,
      rab: Math.round(rab),
      designFee: Math.round(finalDesignFee),
      iaiFeeRate,
      pricePerM2,
      initialPayment: Math.round(initialPayment),
      remainingAfterDP: Math.round(remainingAfterDP),
      buildingType,
      qualityLevel,
      technicalClass: classCode,
      selectedServices: servicesToCalculate,
      serviceBreakdown,
      paymentSchedule,
      breakdown: {
        landArea: {
          value: landArea,
          unit: 'm²'
        },
        buildingArea: {
          value: buildingArea,
          unit: 'm²'
        },
        floors,
        pricePerM2: {
          value: pricePerM2,
          currency: 'IDR'
        },
        rab: {
          value: Math.round(rab),
          currency: 'IDR'
        },
        designFee: {
          value: Math.round(finalDesignFee),
          currency: 'IDR',
          description: selectedServices.length > 0
            ? `Total dari ${selectedServices.length} layanan yang dipilih`
            : `${(iaiFeeRate * 100).toFixed(1)}% dari RAB`
        }
      }
    })
  } catch (error) {
    console.error('Error running price simulation:', error)
    return NextResponse.json(
      { error: 'Failed to run price simulation' },
      { status: 500 }
    )
  }
}
