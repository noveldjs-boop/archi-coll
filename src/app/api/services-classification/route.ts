import { NextResponse } from 'next/server'

// Struktur klasifikasi layanan arsitektur
const servicesData = [
  {
    id: 'residential',
    code: 'A',
    nameIndo: 'Bangunan Hunian',
    nameEng: 'Residential Buildings',
    descriptionIndo: 'Desain hunian nyaman dan fungsional untuk kebutuhan tempat tinggal',
    descriptionEng: 'Comfortable and functional residential design for housing needs',
    icon: 'Home',
    subCategories: [
      {
        id: 'hunian-tunggal',
        code: 'A1',
        nameIndo: 'Hunian Tunggal',
        nameEng: 'Single-Family Housing',
        descriptionIndo: 'Rumah tinggal, villa, dan bungalow untuk keluarga',
        descriptionEng: 'Houses, villas, and bungalows for families',
        examplesIndo: ['Rumah Tipe 36-45', 'Rumah Tipe 60-90', 'Villa Mewah', 'Bungalow'],
        examplesEng: ['Type 36-45 House', 'Type 60-90 House', 'Luxury Villa', 'Bungalow']
      },
      {
        id: 'hunian-kolektif',
        code: 'A2',
        nameIndo: 'Hunian Kolektif',
        nameEng: 'Multi-Family Housing',
        descriptionIndo: 'Apartemen, kondominium, dan rusunawa',
        descriptionEng: 'Apartments, condominiums, and public housing',
        examplesIndo: ['Apartemen Studio', 'Apartemen 2-3 BR', 'Kondominium Mewah', 'Rusunawa'],
        examplesEng: ['Studio Apartment', '2-3 BR Apartment', 'Luxury Condominium', 'Public Housing']
      },
      {
        id: 'hunian-khusus',
        code: 'A3',
        nameIndo: 'Hunian Khusus',
        nameEng: 'Special Housing',
        descriptionIndo: 'Asrama, panti jompo, dan mess militer',
        descriptionEng: 'Dormitories, nursing homes, and military barracks',
        examplesIndo: ['Asrama Mahasiswa', 'Asrama Karyawan', 'Panti Jompo', 'Mess Militer'],
        examplesEng: ['Student Dormitory', 'Employee Dormitory', 'Nursing Home', 'Military Barracks']
      }
    ]
  },
  {
    id: 'commercial',
    code: 'B',
    nameIndo: 'Bangunan Komersial & Bisnis',
    nameEng: 'Commercial & Business Buildings',
    descriptionIndo: 'Desain bangunan untuk kegiatan bisnis dan perdagangan',
    descriptionEng: 'Building design for business and trading activities',
    icon: 'Building2',
    subCategories: [
      {
        id: 'perkantoran',
        code: 'B1',
        nameIndo: 'Perkantoran',
        nameEng: 'Office Buildings',
        descriptionIndo: 'Gedung kantor, co-working space, dan kantor sewa',
        descriptionEng: 'Office buildings, co-working spaces, and rental offices',
        examplesIndo: ['Gedung Kantor Pusat', 'Co-Working Space', 'Kantor Sewa', 'SOHO'],
        examplesEng: ['Headquarters Building', 'Co-Working Space', 'Rental Office', 'SOHO']
      },
      {
        id: 'perdagangan',
        code: 'B2',
        nameIndo: 'Perdagangan',
        nameEng: 'Trade & Retail',
        descriptionIndo: 'Mall, pusat perbelanjaan, pasar, dan ruko',
        descriptionEng: 'Malls, shopping centers, markets, and shophouses',
        examplesIndo: ['Mall', 'Pusat Perbelanjaan', 'Pasar Tradisional', 'Ruko/Rukan'],
        examplesEng: ['Mall', 'Shopping Center', 'Traditional Market', 'Shophouse']
      },
      {
        id: 'perhotelan',
        code: 'B3',
        nameIndo: 'Perhotelan',
        nameEng: 'Hospitality',
        descriptionIndo: 'Hotel, resor, motel, dan hostel',
        descriptionEng: 'Hotels, resorts, motels, and hostels',
        examplesIndo: ['Hotel Bintang 1-3', 'Hotel Bintang 4-5', 'Resor', 'Motel/Hostel'],
        examplesEng: ['1-3 Star Hotel', '4-5 Star Hotel', 'Resort', 'Motel/Hostel']
      }
    ]
  },
  {
    id: 'recreation',
    code: 'C',
    nameIndo: 'Bangunan Rekreasi & Hiburan',
    nameEng: 'Recreation & Entertainment Buildings',
    descriptionIndo: 'Desain bangunan untuk wisata, hiburan, dan olahraga',
    descriptionEng: 'Building design for tourism, entertainment, and sports',
    icon: 'Gamepad2',
    subCategories: [
      {
        id: 'wisata-air',
        code: 'C1',
        nameIndo: 'Wisata Air',
        nameEng: 'Water Tourism',
        descriptionIndo: 'Waterpark, kolam renang, dan akuarium',
        descriptionEng: 'Waterparks, swimming pools, and aquariums',
        examplesIndo: ['Waterpark', 'Kolam Renang Olympic', 'Akuarium Raksasa', 'Water Boom'],
        examplesEng: ['Waterpark', 'Olympic Swimming Pool', 'Giant Aquarium', 'Water Boom']
      },
      {
        id: 'taman-hiburan',
        code: 'C2',
        nameIndo: 'Taman Hiburan',
        nameEng: 'Amusement Parks',
        descriptionIndo: 'Theme park, kebun binatang, dan taman safari',
        descriptionEng: 'Theme parks, zoos, and safari parks',
        examplesIndo: ['Theme Park (Dufan)', 'Kebun Binatang', 'Taman Safari', 'Dunia Fantasi'],
        examplesEng: ['Theme Park', 'Zoo', 'Safari Park', 'Amusement Park']
      },
      {
        id: 'olahraga',
        code: 'C3',
        nameIndo: 'Olahraga',
        nameEng: 'Sports Facilities',
        descriptionIndo: 'Stadion, GOR, sirkuit, dan lapangan golf',
        descriptionEng: 'Stadiums, sports halls, circuits, and golf courses',
        examplesIndo: ['Stadion Bola/Atletik', 'GOR', 'Sirkuit Balap', 'Lapangan Golf'],
        examplesEng: ['Football/Athletic Stadium', 'Sports Hall', 'Racing Circuit', 'Golf Course']
      },
      {
        id: 'seni-budaya',
        code: 'C4',
        nameIndo: 'Seni & Budaya',
        nameEng: 'Arts & Culture',
        descriptionIndo: 'Gedung teater, bioskop, museum, dan galeri seni',
        descriptionEng: 'Theaters, cinemas, museums, and art galleries',
        examplesIndo: ['Gedung Teater', 'Bioskop', 'Museum', 'Galeri Seni', 'Gedung Konser'],
        examplesEng: ['Theater Building', 'Cinema', 'Museum', 'Art Gallery', 'Concert Hall']
      }
    ]
  },
  {
    id: 'institutional',
    code: 'D',
    nameIndo: 'Bangunan Institusional & Publik',
    nameEng: 'Institutional & Public Buildings',
    descriptionIndo: 'Desain untuk pendidikan, kesehatan, pemerintahan, dan transportasi',
    descriptionEng: 'Design for education, health, government, and transportation',
    icon: 'Building',
    subCategories: [
      {
        id: 'pendidikan',
        code: 'D1',
        nameIndo: 'Pendidikan',
        nameEng: 'Education',
        descriptionIndo: 'PAUD, sekolah, kampus, dan laboratorium riset',
        descriptionEng: 'Early childhood, schools, universities, and research labs',
        examplesIndo: ['PAUD/TK', 'SD-SMA', 'Kampus Universitas', 'Laboratorium Riset'],
        examplesEng: ['Early Childhood', 'Schools', 'University Campus', 'Research Laboratory']
      },
      {
        id: 'kesehatan',
        code: 'D2',
        nameIndo: 'Kesehatan',
        nameEng: 'Healthcare',
        descriptionIndo: 'Rumah sakit, klinik, lab medis, dan apotek',
        descriptionEng: 'Hospitals, clinics, medical labs, and pharmacies',
        examplesIndo: ['Rumah Sakit Tipe A-D', 'Klinik', 'Laboratorium Medis', 'Apotek'],
        examplesEng: ['Hospital Type A-D', 'Clinic', 'Medical Laboratory', 'Pharmacy']
      },
      {
        id: 'pemerintahan',
        code: 'D3',
        nameIndo: 'Pemerintahan',
        nameEng: 'Government',
        descriptionIndo: 'Kantor pemerintahan, gedung DPR, dan lembaga lain',
        descriptionEng: 'Government offices, parliament buildings, and institutions',
        examplesIndo: ['Kantor Gubernur/Walikota', 'Gedung DPR', 'Markas Polisi/TNI', 'Penjara'],
        examplesEng: ['Governor/Mayor Office', 'Parliament Building', 'Police/Military HQ', 'Prison']
      },
      {
        id: 'transportasi',
        code: 'D4',
        nameIndo: 'Transportasi',
        nameEng: 'Transportation',
        descriptionIndo: 'Bandara, stasiun, terminal, dan pelabuhan',
        descriptionEng: 'Airports, stations, terminals, and ports',
        examplesIndo: ['Bandara', 'Stasiun Kereta', 'Terminal Bus', 'Pelabuhan/Dermaga'],
        examplesEng: ['Airport', 'Train Station', 'Bus Terminal', 'Port/Dock']
      }
    ]
  },
  {
    id: 'religious',
    code: 'E',
    nameIndo: 'Bangunan Keagamaan',
    nameEng: 'Religious Buildings',
    descriptionIndo: 'Desain bangunan ibadah dan pusat kegiatan keagamaan',
    descriptionEng: 'Design for worship buildings and religious activity centers',
    icon: 'Church',
    subCategories: [
      {
        id: 'masjid',
        code: 'E1',
        nameIndo: 'Masjid',
        nameEng: 'Mosque',
        descriptionIndo: 'Masjid dan musholla untuk ibadah umat Islam',
        descriptionEng: 'Mosques and prayer halls for Islamic worship',
        examplesIndo: ['Masjid Besar', 'Masjid Kecamatan', 'Musholla', 'Islamic Center'],
        examplesEng: ['Grand Mosque', 'District Mosque', 'Prayer Hall', 'Islamic Center']
      },
      {
        id: 'gereja',
        code: 'E2',
        nameIndo: 'Gereja',
        nameEng: 'Church',
        descriptionIndo: 'Gereja dan katedral untuk ibadah Kristen',
        descriptionEng: 'Churches and cathedrals for Christian worship',
        examplesIndo: ['Gereja Protestan', 'Gereja Katolik', 'Katedral', 'Kapel'],
        examplesEng: ['Protestant Church', 'Catholic Church', 'Cathedral', 'Chapel']
      },
      {
        id: 'pura-vihara',
        code: 'E3',
        nameIndo: 'Pura & Vihara',
        nameEng: 'Temple',
        descriptionIndo: 'Pura Hindu dan Vihara Buddha',
        descriptionEng: 'Hindu temples and Buddhist viharas',
        examplesIndo: ['Pura Besar', 'Pura Desa', 'Vihara', 'Candi Buddha'],
        examplesEng: ['Grand Temple', 'Village Temple', 'Vihara', 'Buddhist Temple']
      },
      {
        id: 'klenteng',
        code: 'E4',
        nameIndo: 'Klenteng',
        nameEng: 'Chinese Temple',
        descriptionIndo: 'Klenteng dan pusat studi agama Konghucu',
        descriptionEng: 'Chinese temples and Confucian study centers',
        examplesIndo: ['Klenteng Besar', 'Klenteng Daerah', 'Pusat Studi Agama'],
        examplesEng: ['Grand Chinese Temple', 'District Temple', 'Religious Study Center']
      }
    ]
  },
  {
    id: 'industrial',
    code: 'F',
    nameIndo: 'Bangunan Industri & Infrastruktur',
    nameEng: 'Industrial & Infrastructure Buildings',
    descriptionIndo: 'Desain untuk produksi, penyimpanan, dan energi',
    descriptionEng: 'Design for production, storage, and energy',
    icon: 'Factory',
    subCategories: [
      {
        id: 'produksi',
        code: 'F1',
        nameIndo: 'Produksi',
        nameEng: 'Manufacturing',
        descriptionIndo: 'Pabrik manufaktur dan bengkel alat berat',
        descriptionEng: 'Manufacturing factories and heavy equipment workshops',
        examplesIndo: ['Pabrik Makanan', 'Pabrik Tekstil', 'Bengkel Alat Berat', 'Assembly Plant'],
        examplesEng: ['Food Factory', 'Textile Factory', 'Heavy Equipment Workshop', 'Assembly Plant']
      },
      {
        id: 'penyimpanan',
        code: 'F2',
        nameIndo: 'Penyimpanan',
        nameEng: 'Storage',
        descriptionIndo: 'Gudang logistik, cold storage, dan silo',
        descriptionEng: 'Logistics warehouses, cold storage, and silos',
        examplesIndo: ['Gudang Logistik', 'Cold Storage', 'Silo', 'Distribution Center'],
        examplesEng: ['Logistics Warehouse', 'Cold Storage', 'Silo', 'Distribution Center']
      },
      {
        id: 'energi',
        code: 'F3',
        nameIndo: 'Energi',
        nameEng: 'Energy',
        descriptionIndo: 'Pembangkit listrik, kilang minyak, dan gardu induk',
        descriptionEng: 'Power plants, oil refineries, and substations',
        examplesIndo: ['PLTU/PLTA', 'Kilang Minyak', 'Gardu Induk', 'Pembangkit Listrik'],
        examplesEng: ['Power Plant', 'Oil Refinery', 'Substation', 'Electricity Generator']
      }
    ]
  }
]

// Kelas Teknis
const buildingClasses = [
  {
    id: 'sederhana',
    code: 'K1',
    nameIndo: 'Kelas Sederhana',
    nameEng: 'Simple Class',
    descriptionIndo: 'Bangunan dengan desain standar dan teknologi konstruksi konvensional',
    descriptionEng: 'Buildings with standard design and conventional construction technology',
    criteriaIndo: 'Luas terbatas, maksimal 2 lantai, bentang struktur pendek',
    criteriaEng: 'Limited area, maximum 2 floors, short structural span',
    color: '#6B5B95'
  },
  {
    id: 'tidak-sederhana',
    code: 'K2',
    nameIndo: 'Kelas Tidak Sederhana',
    nameEng: 'Non-Simple Class',
    descriptionIndo: 'Bangunan yang membutuhkan detail arsitektur khusus dan perhitungan struktur menengah',
    descriptionEng: 'Buildings requiring special architectural details and medium structural calculations',
    criteriaIndo: 'Bertingkat sedang (3-8 lantai), menggunakan sistem MEP yang kompleks',
    criteriaEng: 'Medium-rise (3-8 floors), using complex MEP systems',
    color: '#9B59B6'
  },
  {
    id: 'khusus',
    code: 'K3',
    nameIndo: 'Kelas Khusus',
    nameEng: 'Special Class',
    descriptionIndo: 'Bangunan dengan standar keamanan tinggi, teknologi mutakhir, atau bentuk ikonik',
    descriptionEng: 'Buildings with high security standards, advanced technology, or iconic forms',
    criteriaIndo: 'Pencakar langit, bentang lebar (stadion), sistem proteksi radiasi/kimia',
    criteriaEng: 'Skyscrapers, wide spans (stadiums), radiation/chemical protection systems',
    color: '#E74C3C'
  }
]

// Klasifikasi Kepadatan Massa
const buildingScales = [
  {
    id: 'low-rise',
    nameIndo: 'Low-Rise',
    floors: '1-4 Lantai',
    examplesIndo: 'Rumah, Ruko, Gudang',
    examplesEng: 'House, Shophouse, Warehouse',
    color: '#6B5B95'
  },
  {
    id: 'mid-rise',
    nameIndo: 'Mid-Rise',
    floors: '5-12 Lantai',
    examplesIndo: 'Apartemen Menengah, Kantor',
    examplesEng: 'Medium Apartment, Office',
    color: '#9B59B6'
  },
  {
    id: 'high-rise',
    nameIndo: 'High-Rise',
    floors: '13-40 Lantai',
    examplesIndo: 'Hotel Mewah, Perkantoran Pusat',
    examplesEng: 'Luxury Hotel, Central Office',
    color: '#E74C3C'
  },
  {
    id: 'super-tall',
    nameIndo: 'Super-Tall/Skyscraper',
    floors: '>40 Lantai / >300m',
    examplesIndo: 'Pencakar Langit Ikonik',
    examplesEng: 'Iconic Skyscrapers',
    color: '#F39C12'
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        categories: servicesData,
        buildingClasses,
        buildingScales
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services classification' },
      { status: 500 }
    )
  }
}
