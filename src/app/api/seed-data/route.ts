import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// POST seed initial data
export async function POST(request: NextRequest) {
  try {
    // Check if data already exists
    const existingCategories = await db.buildingCategory.count()
    const existingPricingRules = await db.pricingRule.count()

    if (existingCategories > 0 || existingPricingRules > 0) {
      return NextResponse.json({
        success: false,
        error: 'Data already exists. Clear database first if you want to reseed.',
        existingCategories,
        existingPricingRules
      }, { status: 400 })
    }

    // Create Building Categories
    const categories = await Promise.all([
      db.buildingCategory.create({
        data: {
          categoryId: 'rumah-tinggal',
          labelIndo: 'Rumah Tinggal',
          labelEng: 'Residential House',
          descriptionIndo: 'Desain rumah tinggal yang nyaman dan fungsional sesuai kebutuhan keluarga Anda',
          descriptionEng: 'Comfortable and functional residential house design according to your family needs',
          featuresIndo: JSON.stringify([
            'Desain denah lantai yang optimal',
            'Fasade modern dan estetis',
            'Tata letak ruang yang efisien',
            'Pertimbangan sirkulasi udara dan pencahayaan',
            'Dokumen lengkap untuk IMB'
          ]),
          featuresEng: JSON.stringify([
            'Optimal floor plan design',
            'Modern and aesthetic facade',
            'Efficient space layout',
            'Air circulation and lighting consideration',
            'Complete documents for building permit'
          ]),
          icon: 'Home',
          order: 1
        }
      }),
      db.buildingCategory.create({
        data: {
          categoryId: 'rumah-kos',
          labelIndo: 'Rumah Kos',
          labelEng: 'Boarding House',
          descriptionIndo: 'Desain rumah kos dengan efisiensi ruang maksimal untuk investasi properti',
          descriptionEng: 'Boarding house design with maximum space efficiency for property investment',
          featuresIndo: JSON.stringify([
            'Optimalisasi jumlah kamar',
            'Desain kamar mandi efisien',
            'Area bersama yang nyaman',
            'Sirkulasi udara yang baik',
            'Desain ramah biaya'
          ]),
          featuresEng: JSON.stringify([
            'Room count optimization',
            'Efficient bathroom design',
            'Comfortable common areas',
            'Good air circulation',
            'Budget-friendly design'
          ]),
          icon: 'Building',
          order: 2
        }
      }),
      db.buildingCategory.create({
        data: {
          categoryId: 'ruko',
          labelIndo: 'Ruko',
          labelEng: 'Shophouse',
          descriptionIndo: 'Desain ruko yang menggabungkan fungsi komersial dan hunian',
          descriptionEng: 'Shophouse design combining commercial and residential functions',
          featuresIndo: JSON.stringify([
            'Area komersial yang menarik',
            'Akses yang mudah untuk pelanggan',
            'Desain fasade yang profesional',
            'Tata ruang fleksibel',
            'Pertimbangan parkir'
          ]),
          featuresEng: JSON.stringify([
            'Attractive commercial area',
            'Easy access for customers',
            'Professional facade design',
            'Flexible space layout',
            'Parking consideration'
          ]),
          icon: 'Store',
          order: 3
        }
      }),
      db.buildingCategory.create({
        data: {
          categoryId: 'apartemen',
          labelIndo: 'Apartemen',
          labelEng: 'Apartment',
          descriptionIndo: 'Desain apartemen dengan konsep hunian vertikal modern',
          descriptionEng: 'Modern vertical living concept apartment design',
          featuresIndo: JSON.stringify([
            'Unit tipe studio hingga 3BR',
            'Fasilitas bersama lengkap',
            'Desain interior modern',
            'Optimalisasi ruang terbatas',
            'Sistem keamanan terintegrasi'
          ]),
          featuresEng: JSON.stringify([
            'Studio to 3BR unit types',
            'Complete common facilities',
            'Modern interior design',
            'Limited space optimization',
            'Integrated security system'
          ]),
          icon: 'Building2',
          order: 4
        }
      }),
      db.buildingCategory.create({
        data: {
          categoryId: 'kantor',
          labelIndo: 'Kantor',
          labelEng: 'Office',
          descriptionIndo: 'Desain kantor yang produktif dan profesional untuk bisnis Anda',
          descriptionEng: 'Productive and professional office design for your business',
          featuresIndo: JSON.stringify([
            'Layout kerja yang efisien',
            'Ruang meeting yang nyaman',
            'Desain yang mencerminkan brand',
            'Sirkulasi yang baik',
            'Pertimbangan akustik'
          ]),
          featuresEng: JSON.stringify([
            'Efficient work layout',
            'Comfortable meeting rooms',
            'Brand-reflecting design',
            'Good circulation',
            'Acoustic consideration'
          ]),
          icon: 'Building2',
          order: 5
        }
      }),
      db.buildingCategory.create({
        data: {
          categoryId: 'villa',
          labelIndo: 'Villa',
          labelEng: 'Villa',
          descriptionIndo: 'Desain villa mewah untuk liburan atau hunian eksklusif',
          descriptionEng: 'Luxury villa design for vacation or exclusive living',
          featuresIndo: JSON.stringify([
            'Desain yang eksklusif dan mewah',
            'Integrasi dengan landscape',
            'Private pool dan outdoor area',
            'Master suite yang luas',
            'Fasilitas hiburan lengkap'
          ]),
          featuresEng: JSON.stringify([
            'Exclusive and luxurious design',
            'Landscape integration',
            'Private pool and outdoor area',
            'Spacious master suite',
            'Complete entertainment facilities'
          ]),
          icon: 'Home',
          order: 6
        }
      })
    ])

    // Add form fields for each category
    await Promise.all([
      // Rumah Tinggal fields
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[0].id,
          fieldId: 'jumlah_kamar_tidur',
          labelIndo: 'Jumlah Kamar Tidur',
          labelEng: 'Number of Bedrooms',
          fieldType: 'number',
          required: true,
          placeholderIndo: 'Contoh: 3',
          placeholderEng: 'Example: 3',
          order: 1
        }
      }),
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[0].id,
          fieldId: 'jumlah_kamar_mandi',
          labelIndo: 'Jumlah Kamar Mandi',
          labelEng: 'Number of Bathrooms',
          fieldType: 'number',
          required: true,
          placeholderIndo: 'Contoh: 2',
          placeholderEng: 'Example: 2',
          order: 2
        }
      }),
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[0].id,
          fieldId: 'gudang_garasi',
          labelIndo: 'Gudang / Garasi',
          labelEng: 'Warehouse / Garage',
          fieldType: 'select',
          required: false,
          options: JSON.stringify([
            { value: 'garasi_1_mobil', label: 'Garasi 1 Mobil' },
            { value: 'garasi_2_mobil', label: 'Garasi 2 Mobil' },
            { value: 'carport', label: 'Carport' },
            { value: 'gudang', label: 'Gudang' },
            { value: 'tidak_ada', label: 'Tidak Ada' }
          ]),
          order: 3
        }
      }),
      // Ruko fields
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[2].id,
          fieldId: 'jumlah_lantai_komersial',
          labelIndo: 'Jumlah Lantai Komersial',
          labelEng: 'Number of Commercial Floors',
          fieldType: 'number',
          required: true,
          placeholderIndo: 'Contoh: 2',
          placeholderEng: 'Example: 2',
          order: 1
        }
      }),
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[2].id,
          fieldId: 'ada_hunian',
          labelIndo: 'Ada Hunian di Atas',
          labelEng: 'Residential on Upper Floor',
          fieldType: 'select',
          required: true,
          options: JSON.stringify([
            { value: 'ya', label: 'Ya' },
            { value: 'tidak', label: 'Tidak' }
          ]),
          order: 2
        }
      }),
      // Apartemen fields
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[3].id,
          fieldId: 'jumlah_unit',
          labelIndo: 'Jumlah Unit',
          labelEng: 'Number of Units',
          fieldType: 'number',
          required: true,
          placeholderIndo: 'Contoh: 24',
          placeholderEng: 'Example: 24',
          order: 1
        }
      }),
      db.buildingCategoryFormField.create({
        data: {
          categoryId: categories[3].id,
          fieldId: 'tipe_unit',
          labelIndo: 'Tipe Unit',
          labelEng: 'Unit Type',
          fieldType: 'select',
          required: true,
          options: JSON.stringify([
            { value: 'studio', label: 'Studio' },
            { value: '1br', label: '1 Bedroom' },
            { value: '2br', label: '2 Bedroom' },
            { value: '3br', label: '3 Bedroom' },
            { value: 'mixed', label: 'Campuran' }
          ]),
          order: 2
        }
      })
    ])

    // Create Pricing Rules
    const pricingRules = await Promise.all([
      // Low-rise
      db.pricingRule.create({
        data: {
          buildingType: 'low-rise',
          qualityLevel: 'sederhana',
          pricePerM2: 3500000,
          iaiFeeRate: 0.065,
          minFloors: 1,
          maxFloors: 4,
          descriptionIndo: 'Bangunan low-rise kualitas sederhana (K1)',
          descriptionEng: 'Low-rise building simple quality (K1)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'low-rise',
          qualityLevel: 'menengah',
          pricePerM2: 5500000,
          iaiFeeRate: 0.070,
          minFloors: 1,
          maxFloors: 4,
          descriptionIndo: 'Bangunan low-rise kualitas menengah (K2)',
          descriptionEng: 'Low-rise building medium quality (K2)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'low-rise',
          qualityLevel: 'mewah',
          pricePerM2: 10000000,
          iaiFeeRate: 0.080,
          minFloors: 1,
          maxFloors: 4,
          descriptionIndo: 'Bangunan low-rise kualitas mewah (K3)',
          descriptionEng: 'Low-rise building luxury quality (K3)'
        }
      }),
      // Mid-rise
      db.pricingRule.create({
        data: {
          buildingType: 'mid-rise',
          qualityLevel: 'sederhana',
          pricePerM2: 5500000,
          iaiFeeRate: 0.065,
          minFloors: 5,
          maxFloors: 8,
          descriptionIndo: 'Bangunan mid-rise kualitas sederhana (K1)',
          descriptionEng: 'Mid-rise building simple quality (K1)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'mid-rise',
          qualityLevel: 'menengah',
          pricePerM2: 7500000,
          iaiFeeRate: 0.070,
          minFloors: 5,
          maxFloors: 8,
          descriptionIndo: 'Bangunan mid-rise kualitas menengah (K2)',
          descriptionEng: 'Mid-rise building medium quality (K2)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'mid-rise',
          qualityLevel: 'mewah',
          pricePerM2: 12000000,
          iaiFeeRate: 0.080,
          minFloors: 5,
          maxFloors: 8,
          descriptionIndo: 'Bangunan mid-rise kualitas mewah (K3)',
          descriptionEng: 'Mid-rise building luxury quality (K3)'
        }
      }),
      // High-rise
      db.pricingRule.create({
        data: {
          buildingType: 'high-rise',
          qualityLevel: 'sederhana',
          pricePerM2: 7500000,
          iaiFeeRate: 0.065,
          minFloors: 9,
          descriptionIndo: 'Bangunan high-rise kualitas sederhana (K1)',
          descriptionEng: 'High-rise building simple quality (K1)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'high-rise',
          qualityLevel: 'menengah',
          pricePerM2: 10000000,
          iaiFeeRate: 0.070,
          minFloors: 9,
          descriptionIndo: 'Bangunan high-rise kualitas menengah (K2)',
          descriptionEng: 'High-rise building medium quality (K2)'
        }
      }),
      db.pricingRule.create({
        data: {
          buildingType: 'high-rise',
          qualityLevel: 'mewah',
          pricePerM2: 15000000,
          iaiFeeRate: 0.080,
          minFloors: 9,
          descriptionIndo: 'Bangunan high-rise kualitas mewah (K3)',
          descriptionEng: 'High-rise building luxury quality (K3)'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      data: {
        categoriesCreated: categories.length,
        pricingRulesCreated: pricingRules.length
      }
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}
