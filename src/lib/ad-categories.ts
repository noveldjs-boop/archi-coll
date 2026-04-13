export interface AdCategory {
  id: string
  name: string
  subtitle: string
  description: string
  icon: string  // Lucide icon name
  slug: string  // Untuk URL routing
}

export const AD_CATEGORIES: AdCategory[] = [
  {
    id: 'struktural',
    name: 'Material Struktural',
    subtitle: 'Rangka Bangunan',
    description: 'Beton, Baja, Kayu, Batu, Batu Bata',
    icon: 'Building2',
    slug: 'struktural'
  },
  {
    id: 'penutup-dinding',
    name: 'Material Penutup & Dinding',
    subtitle: 'Dinding & Penutup',
    description: 'Batu Bata, Batako, Hebel, Panel Semen',
    icon: 'Wall',
    slug: 'penutup-dinding'
  },
  {
    id: 'atap-plafon',
    name: 'Material Atap & Plafon',
    subtitle: 'Atap & Plafon',
    description: 'Genteng, Metal Sheet, Asbes, Triplek, Gypsum',
    icon: 'Home',
    slug: 'atap-plafon'
  },
  {
    id: 'finishing',
    name: 'Material Finishing',
    subtitle: 'Interior & Eksterior',
    description: 'Keramik, Granit, Parket, Cat, Wallpaper, Panel Dinding',
    icon: 'Palette',
    slug: 'finishing'
  },
  {
    id: 'transparan-kaca',
    name: 'Material Transparan/Kaca',
    subtitle: 'Kaca & Jendela',
    description: 'Kaca Polos, Kaca Tempered, Jendela Aluminium',
    icon: 'Square',
    slug: 'transparan-kaca'
  },
  {
    id: 'alternatif-alami',
    name: 'Material Alternatif & Alami',
    subtitle: 'Eco-Friendly',
    description: 'Rammed Earth, Bambu, Material Daur Ulang',
    icon: 'Leaf',
    slug: 'alternatif-alami'
  },
  {
    id: 'mep',
    name: 'Material MEP',
    subtitle: 'Mekanikal, Elektrikal, Plumbing',
    description: 'Pipa PVC, Kabel, Bahan Isolasi',
    icon: 'Zap',
    slug: 'mep'
  },
  {
    id: 'sanitary',
    name: 'Material Sanitary',
    subtitle: 'Kamar Mandi',
    description: 'Peralatan & Perlengkapan Kamar Mandi',
    icon: 'Droplet',
    slug: 'sanitary'
  },
  {
    id: 'landscape',
    name: 'Material Landscape',
    subtitle: 'Hardscape, Softscape, Lighting',
    description: 'Paving, Kanstin, Tanaman, Lampu Penerangan',
    icon: 'TreePine',
    slug: 'landscape'
  }
]

// Helper function untuk mendapatkan kategori by slug
export const getCategoryBySlug = (slug: string): AdCategory | undefined => {
  return AD_CATEGORIES.find(cat => cat.slug === slug)
}

// Helper function untuk mendapatkan kategori by id
export const getCategoryById = (id: string): AdCategory | undefined => {
  return AD_CATEGORIES.find(cat => cat.id === id)
}

// Category values untuk validasi
export const CATEGORY_VALUES = [
  'struktural',
  'penutup-dinding',
  'atap-plafon',
  'finishing',
  'transparan-kaca',
  'alternatif-alami',
  'mep',
  'sanitary',
  'landscape'
] as const

export type CategoryValue = typeof CATEGORY_VALUES[number]
