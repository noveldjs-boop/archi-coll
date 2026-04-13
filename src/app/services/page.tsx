'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, LogIn, ArrowRight, MapPin, Calculator, ShoppingCart, Check, Building2, Trees, Home, Building, Cpu, FileText, BadgeCheck, Compass, Layers, Ruler, Package } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

// Icon mapping helper
const iconMap: Record<string, any> = {
  Building2,
  Trees,
  Home,
  Building,
  Cpu,
  FileText,
  BadgeCheck,
  Compass,
  Layers,
  Ruler,
  Package
}

// Types
interface ServiceCategory {
  id: string
  code: string
  nameIndo: string
  nameEng: string
  descriptionIndo: string
  descriptionEng: string
  icon: string
  order: number
  active: boolean
  subCategories?: SubCategory[]
}

interface SubCategory {
  id: string
  categoryId: string
  code: string
  nameIndo: string
  nameEng: string
  descriptionIndo: string
  descriptionEng: string
  examplesIndo: string | null // JSON string array
  examplesEng: string | null // JSON string array
  order: number
  active: boolean
}

interface BuildingClass {
  id: string
  code: string
  nameIndo: string
  nameEng: string
  descriptionIndo: string
  descriptionEng: string
  criteriaIndo: string
  criteriaEng: string
  color: string
}

interface BuildingScale {
  id: string
  nameIndo: string
  floors: string
  examplesIndo: string
  examplesEng: string
  color: string
}

interface ServiceConfig {
  id: string
  serviceKey: string
  labelIndo: string
  labelEng: string
  icon: string | null
  descriptionIndo: string | null
  descriptionEng: string | null
  rate: number
  minFee: number
  order: number
  active: boolean
}

// Fallback data in case API fails
const FALLBACK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-a',
    code: 'A',
    nameIndo: 'Bangunan Hunian',
    nameEng: 'Residential Buildings',
    descriptionIndo: 'Desain hunian nyaman dan fungsional untuk kebutuhan tempat tinggal',
    descriptionEng: 'Comfortable and functional residential design for housing needs',
    icon: 'Home',
    order: 0,
    active: true,
    subCategories: [
      {
        id: 'sub-a1',
        categoryId: 'cat-a',
        code: 'A1',
        nameIndo: 'Hunian Tunggal',
        nameEng: 'Single-Family Housing',
        descriptionIndo: 'Rumah tinggal, villa, dan bungalow untuk keluarga',
        descriptionEng: 'Houses, villas, and bungalows for families',
        examplesIndo: JSON.stringify(['Rumah Tipe 36-45', 'Rumah Tipe 60-90', 'Villa Mewah', 'Bungalow']),
        examplesEng: JSON.stringify(['Type 36-45 House', 'Type 60-90 House', 'Luxury Villa', 'Bungalow']),
        order: 0,
        active: true
      },
      {
        id: 'sub-a2',
        categoryId: 'cat-a',
        code: 'A2',
        nameIndo: 'Hunian Kolektif',
        nameEng: 'Multi-Family Housing',
        descriptionIndo: 'Apartemen, kondominium, dan rusunawa',
        descriptionEng: 'Apartments, condominiums, and public housing',
        examplesIndo: JSON.stringify(['Apartemen Studio', 'Apartemen 2-3 BR', 'Kondominium Mewah', 'Rusunawa']),
        examplesEng: JSON.stringify(['Studio Apartment', '2-3 BR Apartment', 'Luxury Condominium', 'Public Housing']),
        order: 1,
        active: true
      }
    ]
  },
  {
    id: 'cat-b',
    code: 'B',
    nameIndo: 'Bangunan Komersial & Bisnis',
    nameEng: 'Commercial & Business Buildings',
    descriptionIndo: 'Desain bangunan untuk kegiatan bisnis dan perdagangan',
    descriptionEng: 'Building design for business and trading activities',
    icon: 'Building2',
    order: 1,
    active: true,
    subCategories: [
      {
        id: 'sub-b1',
        categoryId: 'cat-b',
        code: 'B1',
        nameIndo: 'Perkantoran',
        nameEng: 'Office Buildings',
        descriptionIndo: 'Gedung kantor, co-working space, dan kantor sewa',
        descriptionEng: 'Office buildings, co-working spaces, and rental offices',
        examplesIndo: JSON.stringify(['Gedung Kantor Pusat', 'Co-Working Space', 'Kantor Sewa', 'SOHO']),
        examplesEng: JSON.stringify(['Headquarters Building', 'Co-Working Space', 'Rental Office', 'SOHO']),
        order: 0,
        active: true
      },
      {
        id: 'sub-b2',
        categoryId: 'cat-b',
        code: 'B2',
        nameIndo: 'Perdagangan',
        nameEng: 'Trade & Retail',
        descriptionIndo: 'Mall, pusat perbelanjaan, pasar, dan ruko',
        descriptionEng: 'Malls, shopping centers, markets, and shophouses',
        examplesIndo: JSON.stringify(['Mall', 'Pusat Perbelanjaan', 'Pasar Tradisional', 'Ruko/Rukan']),
        examplesEng: JSON.stringify(['Mall', 'Shopping Center', 'Traditional Market', 'Shophouse']),
        order: 1,
        active: true
      }
    ]
  },
  {
    id: 'cat-c',
    code: 'C',
    nameIndo: 'Bangunan Rekreasi & Hiburan',
    nameEng: 'Recreation & Entertainment Buildings',
    descriptionIndo: 'Desain bangunan untuk wisata, hiburan, dan olahraga',
    descriptionEng: 'Building design for tourism, entertainment, and sports',
    icon: 'Trees',
    order: 2,
    active: true,
    subCategories: [
      {
        id: 'sub-c1',
        categoryId: 'cat-c',
        code: 'C1',
        nameIndo: 'Wisata Air',
        nameEng: 'Water Tourism',
        descriptionIndo: 'Waterpark, kolam renang, dan akuarium',
        descriptionEng: 'Waterparks, swimming pools, and aquariums',
        examplesIndo: JSON.stringify(['Waterpark', 'Kolam Renang Olympic', 'Akuarium Raksasa', 'Water Boom']),
        examplesEng: JSON.stringify(['Waterpark', 'Olympic Swimming Pool', 'Giant Aquarium', 'Water Boom']),
        order: 0,
        active: true
      },
      {
        id: 'sub-c2',
        categoryId: 'cat-c',
        code: 'C2',
        nameIndo: 'Taman Hiburan',
        nameEng: 'Amusement Parks',
        descriptionIndo: 'Theme park, kebun binatang, dan taman safari',
        descriptionEng: 'Theme parks, zoos, and safari parks',
        examplesIndo: JSON.stringify(['Theme Park (Dufan)', 'Kebun Binatang', 'Taman Safari', 'Dunia Fantasi']),
        examplesEng: JSON.stringify(['Theme Park', 'Zoo', 'Safari Park', 'Amusement Park']),
        order: 1,
        active: true
      }
    ]
  },
  {
    id: 'cat-d',
    code: 'D',
    nameIndo: 'Bangunan Institusional & Publik',
    nameEng: 'Institutional & Public Buildings',
    descriptionIndo: 'Desain untuk pendidikan, kesehatan, pemerintahan, dan transportasi',
    descriptionEng: 'Design for education, health, government, and transportation',
    icon: 'Building',
    order: 3,
    active: true,
    subCategories: [
      {
        id: 'sub-d1',
        categoryId: 'cat-d',
        code: 'D1',
        nameIndo: 'Pendidikan',
        nameEng: 'Education',
        descriptionIndo: 'PAUD, sekolah, kampus, dan laboratorium riset',
        descriptionEng: 'Early childhood, schools, universities, and research labs',
        examplesIndo: JSON.stringify(['PAUD/TK', 'SD-SMA', 'Kampus Universitas', 'Laboratorium Riset']),
        examplesEng: JSON.stringify(['Early Childhood', 'Schools', 'University Campus', 'Research Laboratory']),
        order: 0,
        active: true
      },
      {
        id: 'sub-d2',
        categoryId: 'cat-d',
        code: 'D2',
        nameIndo: 'Kesehatan',
        nameEng: 'Healthcare',
        descriptionIndo: 'Rumah sakit, klinik, lab medis, dan apotek',
        descriptionEng: 'Hospitals, clinics, medical labs, and pharmacies',
        examplesIndo: JSON.stringify(['Rumah Sakit Tipe A-D', 'Klinik', 'Laboratorium Medis', 'Apotek']),
        examplesEng: JSON.stringify(['Hospital Type A-D', 'Clinic', 'Medical Laboratory', 'Pharmacy']),
        order: 1,
        active: true
      }
    ]
  },
  {
    id: 'cat-e',
    code: 'E',
    nameIndo: 'Bangunan Keagamaan',
    nameEng: 'Religious Buildings',
    descriptionIndo: 'Desain bangunan ibadah dan pusat kegiatan keagamaan',
    descriptionEng: 'Design for worship buildings and religious activity centers',
    icon: 'BadgeCheck',
    order: 4,
    active: true,
    subCategories: [
      {
        id: 'sub-e1',
        categoryId: 'cat-e',
        code: 'E1',
        nameIndo: 'Masjid',
        nameEng: 'Mosque',
        descriptionIndo: 'Masjid dan musholla untuk ibadah umat Islam',
        descriptionEng: 'Mosques and prayer halls for Islamic worship',
        examplesIndo: JSON.stringify(['Masjid Besar', 'Masjid Kecamatan', 'Musholla', 'Islamic Center']),
        examplesEng: JSON.stringify(['Grand Mosque', 'District Mosque', 'Prayer Hall', 'Islamic Center']),
        order: 0,
        active: true
      },
      {
        id: 'sub-e2',
        categoryId: 'cat-e',
        code: 'E2',
        nameIndo: 'Gereja',
        nameEng: 'Church',
        descriptionIndo: 'Gereja dan katedral untuk ibadah Kristen',
        descriptionEng: 'Churches and cathedrals for Christian worship',
        examplesIndo: JSON.stringify(['Gereja Protestan', 'Gereja Katolik', 'Katedral', 'Kapel']),
        examplesEng: JSON.stringify(['Protestant Church', 'Catholic Church', 'Cathedral', 'Chapel']),
        order: 1,
        active: true
      }
    ]
  },
  {
    id: 'cat-f',
    code: 'F',
    nameIndo: 'Bangunan Industri & Infrastruktur',
    nameEng: 'Industrial & Infrastructure Buildings',
    descriptionIndo: 'Desain untuk produksi, penyimpanan, dan energi',
    descriptionEng: 'Design for production, storage, and energy',
    icon: 'Layers',
    order: 5,
    active: true,
    subCategories: [
      {
        id: 'sub-f1',
        categoryId: 'cat-f',
        code: 'F1',
        nameIndo: 'Produksi',
        nameEng: 'Manufacturing',
        descriptionIndo: 'Pabrik manufaktur dan bengkel alat berat',
        descriptionEng: 'Manufacturing factories and heavy equipment workshops',
        examplesIndo: JSON.stringify(['Pabrik Makanan', 'Pabrik Tekstil', 'Bengkel Alat Berat', 'Assembly Plant']),
        examplesEng: JSON.stringify(['Food Factory', 'Textile Factory', 'Heavy Equipment Workshop', 'Assembly Plant']),
        order: 0,
        active: true
      },
      {
        id: 'sub-f2',
        categoryId: 'cat-f',
        code: 'F2',
        nameIndo: 'Penyimpanan',
        nameEng: 'Storage',
        descriptionIndo: 'Gudang logistik, cold storage, dan silo',
        descriptionEng: 'Logistics warehouses, cold storage, and silos',
        examplesIndo: JSON.stringify(['Gudang Logistik', 'Cold Storage', 'Silo', 'Distribution Center']),
        examplesEng: JSON.stringify(['Logistics Warehouse', 'Cold Storage', 'Silo', 'Distribution Center']),
        order: 1,
        active: true
      }
    ]
  }
]

const FALLBACK_BUILDING_CLASSES: BuildingClass[] = [
  {
    id: 'class-1',
    code: 'K1',
    nameIndo: 'Kelas 1 - Bangunan Sederhana',
    nameEng: 'Class 1 - Simple Buildings',
    descriptionIndo: 'Bangunan dengan struktur sederhana',
    descriptionEng: 'Buildings with simple structure',
    criteriaIndo: 'RAB < Rp 2.5 Miliar',
    criteriaEng: 'RAB < Rp 2.5 Billion',
    color: '#6B5B95'
  },
  {
    id: 'class-2',
    code: 'K2',
    nameIndo: 'Kelas 2 - Bangunan Menengah',
    nameEng: 'Class 2 - Medium Buildings',
    descriptionIndo: 'Bangunan dengan struktur menengah',
    descriptionEng: 'Buildings with medium structure',
    criteriaIndo: 'RAB Rp 2.5 - 10 Miliar',
    criteriaEng: 'RAB Rp 2.5 - 10 Billion',
    color: '#9B59B6'
  },
  {
    id: 'class-3',
    code: 'K3',
    nameIndo: 'Kelas 3 - Bangunan Mewah',
    nameEng: 'Class 3 - Luxury Buildings',
    descriptionIndo: 'Bangunan dengan struktur kompleks',
    descriptionEng: 'Buildings with complex structure',
    criteriaIndo: 'RAB > Rp 10 Miliar',
    criteriaEng: 'RAB > Rp 10 Billion',
    color: '#E74C3C'
  }
]

const FALLBACK_SERVICE_CONFIGS: ServiceConfig[] = [
  {
    id: 'svc-1',
    serviceKey: 'architectural',
    labelIndo: 'Desain Arsitektur',
    labelEng: 'Architectural Design',
    icon: 'Building2',
    descriptionIndo: 'Perencanaan dan desain bangunan lengkap',
    descriptionEng: 'Complete building planning and design',
    rate: 0.10,
    minFee: 50000000,
    order: 0,
    active: true
  },
  {
    id: 'svc-2',
    serviceKey: 'structural',
    labelIndo: 'Desain Struktur',
    labelEng: 'Structural Design',
    icon: 'Layers',
    descriptionIndo: 'Perhitungan dan desain struktur bangunan',
    descriptionEng: 'Building structure calculation and design',
    rate: 0.04,
    minFee: 25000000,
    order: 1,
    active: true
  },
  {
    id: 'svc-3',
    serviceKey: 'mep',
    labelIndo: 'MEP (Mekanikal, Elektrikal, Plumbing)',
    labelEng: 'MEP (Mechanical, Electrical, Plumbing)',
    icon: 'Cpu',
    descriptionIndo: 'Sistem mekanikal, elektrikal, dan plumbing',
    descriptionEng: 'Mechanical, electrical, and plumbing systems',
    rate: 0.03,
    minFee: 20000000,
    order: 2,
    active: true
  },
  {
    id: 'svc-4',
    serviceKey: 'interior',
    labelIndo: 'Desain Interior',
    labelEng: 'Interior Design',
    icon: 'Home',
    descriptionIndo: 'Perencanaan dan desain interior ruang',
    descriptionEng: 'Space interior planning and design',
    rate: 0.05,
    minFee: 30000000,
    order: 3,
    active: true
  },
  {
    id: 'svc-5',
    serviceKey: 'landscape',
    labelIndo: 'Desain Lanskap',
    labelEng: 'Landscape Design',
    icon: 'Trees',
    descriptionIndo: 'Perencanaan taman dan lanskap',
    descriptionEng: 'Garden and landscape planning',
    rate: 0.02,
    minFee: 15000000,
    order: 4,
    active: true
  }
]

export default function ServicesPage() {
  const router = useRouter()
  const { language, t } = useLanguage()

  // States
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [buildingClasses, setBuildingClasses] = useState<BuildingClass[]>([])
  const [buildingScales, setBuildingScales] = useState<BuildingScale[]>([])
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    coordinates: '',
    landArea: '',
    buildingArea: '',
    floors: '',
    technicalClass: '',
    notes: ''
  })
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [buildingScale, setBuildingScale] = useState<string>('')
  const [selectedServices, setSelectedServices] = useState<string[]>(['architectural']) // Default to architectural design

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchServicesData(),
        fetchServiceConfigs(),
        fetchBuildingClassesAndScales()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  const fetchServicesData = async () => {
    try {
      // Try to fetch from service-categories API first (database)
      try {
        const res = await fetch('/api/service-categories?includeSubCategories=true')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          const categoriesData = data.data || []
          setCategories(categoriesData)
          // Extract sub-categories from all categories
          const allSubCategories: SubCategory[] = []
          categoriesData.forEach((cat: ServiceCategory) => {
            if (cat.subCategories && cat.subCategories.length > 0) {
              allSubCategories.push(...cat.subCategories)
            }
          })
          setSubCategories(allSubCategories)
          return
        }
      } catch (e) {
        console.log('service-categories API failed, trying fallback')
      }

      // Fallback: Use services-classification API
      try {
        const res = await fetch('/api/services-classification')
        const data = await res.json()
        if (data.success && data.data) {
          const categoriesData = data.data.categories || []
          // Transform the data structure to match our interface
          const transformedCategories: ServiceCategory[] = categoriesData.map((cat: any) => ({
            id: cat.id,
            code: cat.code,
            nameIndo: cat.nameIndo,
            nameEng: cat.nameEng,
            descriptionIndo: cat.descriptionIndo,
            descriptionEng: cat.descriptionEng,
            icon: cat.icon,
            order: 0,
            active: true,
            subCategories: cat.subCategories.map((sub: any) => ({
              id: sub.id,
              categoryId: cat.id,
              code: sub.code,
              nameIndo: sub.nameIndo,
              nameEng: sub.nameEng,
              descriptionIndo: sub.descriptionIndo,
              descriptionEng: sub.descriptionEng,
              examplesIndo: sub.examplesIndo ? JSON.stringify(sub.examplesIndo) : null,
              examplesEng: sub.examplesEng ? JSON.stringify(sub.examplesEng) : null,
              order: 0,
              active: true
            }))
          }))
          setCategories(transformedCategories)
          // Extract sub-categories from all categories
          const allSubCategories: SubCategory[] = []
          transformedCategories.forEach((cat: ServiceCategory) => {
            if (cat.subCategories && cat.subCategories.length > 0) {
              allSubCategories.push(...cat.subCategories)
            }
          })
          setSubCategories(allSubCategories)
          return
        }
      } catch (e) {
        console.log('services-classification API failed, using static fallback')
      }

      // Final fallback: Use static data
      console.log('Using fallback categories data')
      setCategories(FALLBACK_CATEGORIES)
      const allSubCategories: SubCategory[] = []
      FALLBACK_CATEGORIES.forEach((cat: ServiceCategory) => {
        if (cat.subCategories && cat.subCategories.length > 0) {
          allSubCategories.push(...cat.subCategories)
        }
      })
      setSubCategories(allSubCategories)
    } catch (error) {
      console.error('Error fetching services data:', error)
      // Use fallback data even on error
      setCategories(FALLBACK_CATEGORIES)
      const allSubCategories: SubCategory[] = []
      FALLBACK_CATEGORIES.forEach((cat: ServiceCategory) => {
        if (cat.subCategories && cat.subCategories.length > 0) {
          allSubCategories.push(...cat.subCategories)
        }
      })
      setSubCategories(allSubCategories)
    }
  }

  const fetchBuildingClassesAndScales = async () => {
    try {
      const res = await fetch('/api/services-classification')
      const data = await res.json()
      if (data.success) {
        setBuildingClasses(data.data.buildingClasses)
        setBuildingScales(data.data.buildingScales)
      } else {
        // Use fallback
        setBuildingClasses(FALLBACK_BUILDING_CLASSES)
        setBuildingScales([
          { id: 'scale-1', nameIndo: 'Low-Rise (1-4 Lantai)', floors: '1-4', examplesIndo: 'Rumah tinggal, ruko, kantor kecil', examplesEng: 'Houses, shophouses, small offices', color: '#6B5B95' },
          { id: 'scale-2', nameIndo: 'Mid-Rise (5-8 Lantai)', floors: '5-8', examplesIndo: 'Apartemen, hotel menengah', examplesEng: 'Apartments, medium hotels', color: '#9B59B6' },
          { id: 'scale-3', nameIndo: 'High-Rise (9+ Lantai)', floors: '9+', examplesIndo: 'Gedung pencakar langit, hotel bintang 5', examplesEng: 'Skyscrapers, 5-star hotels', color: '#E74C3C' }
        ])
      }
    } catch (error) {
      console.error('Error fetching building classes and scales, using fallback:', error)
      setBuildingClasses(FALLBACK_BUILDING_CLASSES)
      setBuildingScales([
        { id: 'scale-1', nameIndo: 'Low-Rise (1-4 Lantai)', floors: '1-4', examplesIndo: 'Rumah tinggal, ruko, kantor kecil', examplesEng: 'Houses, shophouses, small offices', color: '#6B5B95' },
        { id: 'scale-2', nameIndo: 'Mid-Rise (5-8 Lantai)', floors: '5-8', examplesIndo: 'Apartemen, hotel menengah', examplesEng: 'Apartments, medium hotels', color: '#9B59B6' },
        { id: 'scale-3', nameIndo: 'High-Rise (9+ Lantai)', floors: '9+', examplesIndo: 'Gedung pencakar langit, hotel bintang 5', examplesEng: 'Skyscrapers, 5-star hotels', color: '#E74C3C' }
      ])
    }
  }

  const fetchServiceConfigs = async () => {
    try {
      const res = await fetch('/api/service-configs')
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setServiceConfigs(data.data)
        // Set default selected service if available
        if (data.data.length > 0 && !selectedServices.includes(data.data[0].serviceKey)) {
          setSelectedServices([data.data[0].serviceKey])
        }
      } else {
        // Use fallback
        setServiceConfigs(FALLBACK_SERVICE_CONFIGS)
      }
    } catch (error) {
      console.error('Error fetching service configs, using fallback:', error)
      setServiceConfigs(FALLBACK_SERVICE_CONFIGS)
    }
  }

  // Auto-calculate building scale based on floors
  useEffect(() => {
    const floors = parseInt(formData.floors) || 0
    if (floors <= 4) {
      setBuildingScale(language === 'id' ? 'Low-Rise (1-4 Lantai)' : 'Low-Rise (1-4 Floors)')
    } else if (floors <= 8) {
      setBuildingScale(language === 'id' ? 'Mid-Rise (5-8 Lantai)' : 'Mid-Rise (5-8 Floors)')
    } else {
      setBuildingScale(language === 'id' ? 'High-Rise (9+ Lantai)' : 'High-Rise (9+ Floors)')
    }
  }, [formData.floors, language])

  // Calculate building area based on KDB, KLB, KDH, RTH
  const calculateBuildingArea = async (location: string, categoryCode: string, landArea: number) => {
    try {
      const res = await fetch('/api/calculate-building-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, categoryCode, landArea })
      })
      const data = await res.json()
      return data.buildingArea || landArea * 0.6 // Default fallback
    } catch (error) {
      console.error('Error calculating building area:', error)
      return landArea * 0.6 // Default fallback
    }
  }

  // Handle location selection from Google Maps
  const handleLocationSelect = async (location: string, coordinates: string) => {
    setFormData(prev => ({ ...prev, location, coordinates }))

    // Auto-calculate building area based on location and regulations
    if (formData.landArea && selectedSubCategory) {
      const landAreaNum = parseFloat(formData.landArea)
      if (landAreaNum > 0) {
        const calculatedArea = await calculateBuildingArea(
          location,
          selectedSubCategory.code,
          landAreaNum
        )
        setFormData(prev => ({ ...prev, buildingArea: calculatedArea.toString() }))
      }
    }
  }

  // Run price simulation
  const runSimulation = async () => {
    setSimulating(true)
    try {
      const res = await fetch('/api/price-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryCode: selectedSubCategory?.code,
          landArea: parseFloat(formData.landArea),
          buildingArea: parseFloat(formData.buildingArea),
          floors: parseInt(formData.floors),
          technicalClass: formData.technicalClass,
          location: formData.location,
          coordinates: formData.coordinates,
          selectedServices
        })
      })
      const data = await res.json()
      setSimulationResult(data)
    } catch (error) {
      console.error('Error running simulation:', error)
    } finally {
      setSimulating(false)
    }
  }

  const handleOrderClick = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory)
    setOrderDialogOpen(true)
    // Reset form
    setFormData({
      projectName: '',
      location: '',
      coordinates: '',
      landArea: '',
      buildingArea: '',
      floors: '',
      technicalClass: '',
      notes: ''
    })
    setSimulationResult(null)
    setSelectedServices(['architectural']) // Reset to default
  }

  const handleProceedToOrder = () => {
    // Store order data in session storage
    const orderData = {
      subCategory: selectedSubCategory,
      formData,
      simulationResult,
      buildingScale,
      selectedServices
    }
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))

    // Check if user is logged in
    const clientUser = localStorage.getItem('clientUser')
    if (clientUser) {
      // Redirect to client dashboard
      router.push('/client/dashboard')
    } else {
      // Redirect to client auth
      router.push('/client/auth')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', color: '#9B59B6', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="relative z-10 h-screen flex flex-col">
        <Navigation />

        {/* Header */}
        <section className="pt-24 pb-8 flex-shrink-0">
          <div style={{ maxWidth: '98%', margin: '0 auto', padding: '0 16px' }}>
            <Badge style={{ marginBottom: '16px', background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', color: 'white', border: 'none' }}>
              {language === 'id' ? 'Layanan' : 'Services'}
            </Badge>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 'bold', marginBottom: '16px' }}>
              <span style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {language === 'id' ? 'Pesan Layanan Arsitektur' : 'Order Architecture Services'}
              </span>
            </h1>
            <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '672px', marginBottom: '32px' }}>
              {language === 'id'
                ? 'Pilih kategori bangunan dan pesan layanan desain arsitektur profesional untuk proyek Anda'
                : 'Choose a building category and order professional architectural design services for your project'}
            </p>
          </div>
        </section>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-24">
          <div style={{ maxWidth: '98%', margin: '0 auto', padding: '0 16px' }}>

            {!selectedCategory ? (
              <>
                {/* Categories Grid - 3x2 layout matching portfolio style */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '24px',
                  marginBottom: '64px',
                  maxWidth: '1400px',
                  margin: '0 auto 64px auto'
                }}>
                  {categories.map((category, index) => {
                    const colors = ['#6B5B95', '#9B59B6', '#E74C3C', '#F39C12', '#F1C40F', '#3498DB']
                    const color = colors[index % colors.length]

                    return (
                      <Card
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          background: 'rgba(42, 42, 42, 0.8)',
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${color}`,
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          padding: '24px',
                          minHeight: '320px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        className="group"
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <CardHeader style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Badge style={{
                              background: `${color}CC`,
                              color: 'white',
                              border: 'none',
                              fontSize: '13px',
                              padding: '6px 12px',
                              fontWeight: '600'
                            }}>
                              {category.code}
                            </Badge>
                          </div>
                          <CardTitle style={{
                            fontSize: '22px',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            lineHeight: '1.2',
                            background: index % 2 === 0 ? 'linear-gradient(to right, #6B5B95, #9B59B6)' : 'linear-gradient(to right, #E74C3C, #F39C12)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            {language === 'id' ? category.nameIndo.toUpperCase() : category.nameEng.toUpperCase()}
                          </CardTitle>
                          <CardDescription style={{
                            fontSize: '15px',
                            color: '#d1d5db',
                            lineHeight: '1.5',
                            marginBottom: '16px'
                          }}>
                            {language === 'id' ? category.descriptionIndo : category.descriptionEng}
                          </CardDescription>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            color: color,
                            fontWeight: '600',
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            border: `1px solid ${color}40`,
                            width: 'fit-content'
                          }}>
                            <span style={{ fontSize: '16px' }}>•</span>
                            {category.subCategories?.length || 0} {language === 'id' ? 'JENIS BANGUNAN' : 'BUILDING TYPES'}
                          </div>
                        </CardHeader>
                        <CardContent style={{ paddingTop: 0 }}>
                          <Button
                            style={{
                              width: '100%',
                              background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)',
                              color: 'white',
                              padding: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.3s'
                            }}
                          >
                            {language === 'id' ? 'Lihat Jenis Bangunan' : 'View Building Types'}
                            <ArrowRight style={{ marginLeft: '8px', width: '16px', height: '16px' }} />
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Login/Register Button at Bottom */}
                <div className="mt-12 mb-16 px-4 text-center">
                  <p className="text-lg text-gray-400 mb-4">
                    {language === 'id' 
                      ? 'Log in atau daftar sebagai klien untuk memulai proses pemesanan jasa desain arsitektur profesional'
                      : 'Log in or register as a client to start ordering professional architectural design services'}
                  </p>
                  <Button
                    onClick={() => router.push('/client/auth')}
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-4 text-lg"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    {language === 'id' ? 'Log in atau Daftar sebagai Klien' : 'Log in or Register as Client'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCategory(null)}
                  style={{ color: 'white', marginBottom: '24px' }}
                >
                  <ArrowRight style={{ width: '16px', height: '16px', marginRight: '8px', transform: 'rotate(180deg)' }} />
                  {language === 'id' ? 'Kembali ke Kategori' : 'Back to Categories'}
                </Button>

                {/* Sub Categories with Order Button */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '64px' }}>
                  {subCategories
                    .filter((sub) => sub.categoryId === selectedCategory.id)
                    .map((sub) => {
                      const colors = ['#6B5B95', '#9B59B6', '#E74C3C', '#F39C12', '#F1C40F', '#3498DB']
                      const color = colors[parseInt(selectedCategory.code) % colors.length]
                      const examplesIndo = sub.examplesIndo ? JSON.parse(sub.examplesIndo) : []
                      const examplesEng = sub.examplesEng ? JSON.parse(sub.examplesEng) : []
                      const currentExamples = language === 'id' ? examplesIndo : examplesEng

                      return (
                        <Card key={sub.id} style={{
                          background: 'rgba(42, 42, 42, 0.8)',
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${color}40`,
                          transition: 'all 0.3s'
                        }}>
                          <CardHeader>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <Badge style={{ background: 'linear-gradient(to right, #6B5B95, #9B59B6)', color: 'white', border: 'none', fontSize: '14px', padding: '6px 12px' }}>
                                {sub.code}
                              </Badge>
                              <CardTitle style={{ fontSize: '20px', color: 'white' }}>
                                {language === 'id' ? sub.nameIndo : sub.nameEng}
                              </CardTitle>
                            </div>
                            <CardDescription style={{ fontSize: '15px', color: '#d1d5db', marginBottom: '16px' }}>
                              {language === 'id' ? sub.descriptionIndo : sub.descriptionEng}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div style={{ marginBottom: '20px' }}>
                              <p style={{ fontSize: '14px', color: '#9B59B6', fontWeight: '600', marginBottom: '8px' }}>
                                {language === 'id' ? 'Contoh Proyek:' : 'Project Examples:'}
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {currentExamples.map((example, idx) => (
                                  <span key={idx} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                    padding: '4px 10px',
                                    background: 'rgba(107, 91, 149, 0.1)',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(107, 91, 149, 0.3)',
                                    color: '#d1d5db'
                                  }}>
                                    {example}
                                  </span>
                                ))}
                              </div>
                              {currentExamples.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#6B5B95', fontStyle: 'italic' }}>
                                  {language === 'id' ? 'Tidak ada contoh proyek' : 'No project examples'}
                                </p>
                              )}
                            </div>
                            <Dialog open={orderDialogOpen && selectedSubCategory?.id === sub.id} onOpenChange={setOrderDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => handleOrderClick(sub)}
                                style={{
                                  width: '100%',
                                  background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)',
                                  color: 'white'
                                }}
                              >
                                <ShoppingCart style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                                {language === 'id' ? 'Pemesanan' : 'Order Now'}
                                <ArrowRight style={{ marginLeft: '8px', width: '16px', height: '16px' }} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#2A2A2A] border-gray-700 text-white" style={{ maxHeight: '90vh' }}>
                              <DialogHeader>
                                <DialogTitle style={{ fontSize: '24px', marginBottom: '8px' }}>
                                  {language === 'id' ? 'Formulir Pemesanan' : 'Order Form'}
                                </DialogTitle>
                                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                                  {language === 'id' ? 'Silakan isi detail proyek Anda' : 'Please fill in your project details'}
                                </p>
                              </DialogHeader>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                                {/* Project Name */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    <FileText style={{ display: 'inline', width: '14px', height: '14px', marginRight: '4px', verticalAlign: 'middle' }} />
                                    {language === 'id' ? 'Nama Proyek' : 'Project Name'}
                                  </Label>
                                  <Input
                                    placeholder={language === 'id' ? 'Contoh: Rumah Tinggal Pak Budi, Apartemen Mewah Green Valley...' : 'Example: Mr. Budi Residence, Green Valley Luxury Apartment...'}
                                    value={formData.projectName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white'
                                    }}
                                  />
                                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    {language === 'id' ? 'Beri nama untuk proyek Anda' : 'Give a name to your project'}
                                  </p>
                                </div>

                                {/* Location with Google Maps */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    <MapPin style={{ display: 'inline', width: '14px', height: '14px', marginRight: '4px', verticalAlign: 'middle' }} />
                                    {language === 'id' ? 'Lokasi Proyek' : 'Project Location'}
                                  </Label>
                                  <Input
                                    placeholder={language === 'id' ? 'Masukkan alamat lengkap...' : 'Enter full address...'}
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    onBlur={() => handleLocationSelect(formData.location, formData.coordinates)}
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white'
                                    }}
                                  />
                                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    {language === 'id' ? 'Sistem akan otomatis menghitung luas bangunan berdasarkan KDB, KLB, KDH, dan RTH' : 'System will automatically calculate building area based on KDB, KLB, KDH, and RTH'}
                                  </p>
                                </div>

                                {/* Land Area */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    {language === 'id' ? 'Luas Lahan (m²)' : 'Land Area (m²)'}
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="Contoh: 500"
                                    value={formData.landArea}
                                    onChange={(e) => setFormData(prev => ({ ...prev, landArea: e.target.value }))}
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white'
                                    }}
                                  />
                                </div>

                                {/* Building Area - Auto-calculated */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    <Calculator style={{ display: 'inline', width: '14px', height: '14px', marginRight: '4px', verticalAlign: 'middle' }} />
                                    {language === 'id' ? 'Luas Bangunan (m²) - Otomatis' : 'Building Area (m²) - Auto-calculated'}
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder={language === 'id' ? 'Akan dihitung otomatis...' : 'Will be auto-calculated...'}
                                    value={formData.buildingArea}
                                    onChange={(e) => setFormData(prev => ({ ...prev, buildingArea: e.target.value }))}
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white'
                                    }}
                                  />
                                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    {language === 'id' ? 'Disesuaikan dengan aturan KDB, KLB, KDH, dan RTH' : 'Adjusted according to KDB, KLB, KDH, and RTH regulations'}
                                  </p>
                                </div>

                                {/* Number of Floors */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    {language === 'id' ? 'Jumlah Lantai' : 'Number of Floors'}
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="Contoh: 2"
                                    value={formData.floors}
                                    onChange={(e) => setFormData(prev => ({ ...prev, floors: e.target.value }))}
                                    min="1"
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white'
                                    }}
                                  />
                                  {buildingScale && (
                                    <Badge style={{ marginTop: '8px', background: 'linear-gradient(to right, #6B5B95, #9B59B6)', color: 'white', border: 'none', fontSize: '12px' }}>
                                      {buildingScale}
                                    </Badge>
                                  )}
                                </div>

                                {/* Technical Class Selection */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    {language === 'id' ? 'Klasifikasi Kelas Teknis' : 'Technical Class Classification'}
                                  </Label>
                                  <Select value={formData.technicalClass} onValueChange={(value) => setFormData(prev => ({ ...prev, technicalClass: value }))}>
                                    <SelectTrigger style={{ background: '#1E1E1E', border: '1px solid #4b5563', color: 'white' }}>
                                      <SelectValue placeholder={language === 'id' ? 'Pilih kelas teknis...' : 'Select technical class...'} />
                                    </SelectTrigger>
                                    <SelectContent style={{ background: '#1E1E1E', border: '1px solid #4b5563' }}>
                                      {buildingClasses.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.code} style={{ color: 'white' }}>
                                          {cls.code} - {language === 'id' ? cls.nameIndo : cls.nameEng}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Notes */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '8px', display: 'block' }}>
                                    {language === 'id' ? 'Catatan Tambahan' : 'Additional Notes'}
                                  </Label>
                                  <Textarea
                                    placeholder={language === 'id' ? 'Tuliskan kebutuhan spesifik Anda...' : 'Write your specific requirements...'}
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    style={{
                                      background: '#1E1E1E',
                                      border: '1px solid #4b5563',
                                      color: 'white',
                                      resize: 'vertical'
                                    }}
                                  />
                                </div>

                                {/* Service Selection */}
                                <div>
                                  <Label style={{ color: 'white', marginBottom: '12px', display: 'block', fontSize: '16px', fontWeight: '600' }}>
                                    {language === 'id' ? 'Pilih Layanan yang Dibutuhkan' : 'Select Required Services'}
                                  </Label>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '12px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: '4px'
                                  }}>
                                    {serviceConfigs.map((service) => {
                                      const isSelected = selectedServices.includes(service.serviceKey)
                                      const colors = ['#6B5B95', '#9B59B6', '#E74C3C', '#F39C12', '#F1C40F', '#3498DB']
                                      const color = colors[serviceConfigs.indexOf(service) % colors.length]
                                      const IconComponent = service.icon ? iconMap[service.icon] || Building2 : Building2

                                      return (
                                        <div
                                          key={service.id}
                                          onClick={() => {
                                            if (isSelected) {
                                              // Don't allow unchecking if it's the only service
                                              if (selectedServices.length > 1) {
                                                setSelectedServices(prev => prev.filter(s => s !== service.serviceKey))
                                              }
                                            } else {
                                              setSelectedServices(prev => [...prev, service.serviceKey])
                                            }
                                          }}
                                          style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                                            background: isSelected ? `${color}20` : 'rgba(30, 30, 30, 0.5)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px'
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                                              e.currentTarget.style.borderColor = `${color}60`
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.background = 'rgba(30, 30, 30, 0.5)'
                                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                            }
                                          }}
                                        >
                                          <div style={{
                                            width: '20px',
                                            height: '20px',
                                            minWidth: '20px',
                                            borderRadius: '4px',
                                            border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.3)'}`,
                                            background: isSelected ? color : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: '2px',
                                            flexShrink: 0
                                          }}>
                                            {isSelected && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                                          </div>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                              <span style={{ color: color }}>
                                                <IconComponent className="w-5 h-5" />
                                              </span>
                                              <span style={{
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                lineHeight: '1.3'
                                              }}>
                                                {language === 'id' ? service.labelIndo : service.labelEng}
                                              </span>
                                            </div>
                                            <p style={{
                                              color: '#9ca3af',
                                              fontSize: '12px',
                                              lineHeight: '1.4',
                                              margin: 0
                                            }}>
                                              {language === 'id' ? service.descriptionIndo : service.descriptionEng}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                                    {language === 'id'
                                      ? 'Pilih minimal satu layanan. Pilih multiple layanan untuk paket lengkap.'
                                      : 'Select at least one service. Choose multiple services for a complete package.'}
                                  </p>
                                </div>

                                {/* Simulation Button */}
                                <Button
                                  onClick={runSimulation}
                                  disabled={simulating || !formData.landArea || !formData.buildingArea || !formData.floors || !formData.technicalClass}
                                  style={{
                                    width: '100%',
                                    background: 'linear-gradient(to right, #6B5B95, #9B59B6, #E74C3C)',
                                    color: 'white'
                                  }}
                                >
                                  {simulating ? (
                                    <>
                                      <Loader2 style={{ marginRight: '8px', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                      {language === 'id' ? 'Menghitung...' : 'Calculating...'}
                                    </>
                                  ) : (
                                    <>
                                      <Calculator style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                                      {language === 'id' ? 'Simulasi Harga' : 'Price Simulation'}
                                    </>
                                  )}
                                </Button>

                                {/* Simulation Result */}
                                {simulationResult && (
                                  <div style={{
                                    padding: '20px',
                                    background: 'rgba(107, 91, 149, 0.1)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(107, 91, 149, 0.3)'
                                  }}>
                                    <h4 style={{ color: '#9B59B6', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                                      {language === 'id' ? 'Hasil Simulasi Harga' : 'Price Simulation Result'}
                                    </h4>

                                    {/* Service Breakdown */}
                                    {simulationResult.serviceBreakdown && Object.keys(simulationResult.serviceBreakdown).length > 0 && (
                                      <div style={{ marginBottom: '20px' }}>
                                        <h5 style={{ color: '#E74C3C', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                                          {language === 'id' ? 'Rincian per Layanan:' : 'Breakdown by Service:'}
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                          {Object.entries(simulationResult.serviceBreakdown).map(([key, service]: [string, any]) => {
                                            const colors = ['#6B5B95', '#9B59B6', '#E74C3C', '#F39C12', '#F1C40F', '#3498DB']
                                            const serviceConfig = serviceConfigs.find(s => s.serviceKey === key)
                                            const serviceIndex = serviceConfig ? serviceConfigs.indexOf(serviceConfig) : 0
                                            const color = colors[serviceIndex % colors.length]
                                            const IconComponent = serviceConfig?.icon ? (iconMap[serviceConfig.icon] || Building2) : Building2

                                            return (
                                              <div
                                                key={key}
                                                style={{
                                                  padding: '12px',
                                                  background: `${color}15`,
                                                  borderRadius: '8px',
                                                  borderLeft: `3px solid ${color}`,
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center'
                                                }}
                                              >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ color: color }}>
                                                      <IconComponent className="w-4 h-4" />
                                                    </span>
                                                    <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>
                                                      {service.name}
                                                    </span>
                                                  </div>
                                                  <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>
                                                    {(service.rate * 100).toFixed(0)}% dari RAB (Min: Rp {service.minFee?.toLocaleString('id-ID')})
                                                  </p>
                                                </div>
                                                <span style={{ color: color, fontWeight: '700', fontSize: '14px', marginLeft: '12px' }}>
                                                  Rp {service.fee?.toLocaleString('id-ID')}
                                                </span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Summary */}
                                    <div style={{ display: 'grid', gap: '12px', fontSize: '14px', paddingTop: '16px', borderTop: '1px solid rgba(107, 91, 149, 0.3)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db' }}>
                                        <span>{language === 'id' ? 'Estimasi RAB:' : 'Estimated RAB:'}</span>
                                        <span style={{ fontWeight: '600', color: 'white' }}>
                                          Rp {simulationResult.rab?.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db' }}>
                                        <span>{language === 'id' ? 'Total Biaya Jasa:' : 'Total Service Fee:'}</span>
                                        <span style={{ fontWeight: '600', color: '#9B59B6' }}>
                                          Rp {simulationResult.designFee?.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db' }}>
                                        <span>{language === 'id' ? 'Pembayaran Awal (10%):' : 'Initial Payment (10%):'}</span>
                                        <span style={{ fontWeight: '700', color: '#E74C3C', fontSize: '15px' }}>
                                          Rp {simulationResult.initialPayment?.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db', fontSize: '12px' }}>
                                        <span>{language === 'id' ? 'Sisa Pembayaran:' : 'Remaining Payment:'}</span>
                                        <span style={{ fontWeight: '600', color: '#d1d5db' }}>
                                          Rp {simulationResult.remainingAfterDP?.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Selected Services Info */}
                                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', fontStyle: 'italic' }}>
                                      {language === 'id'
                                        ? `*Harga berdasarkan ${simulationResult.selectedServices?.length || 0} layanan yang dipilih`
                                        : `*Price based on ${simulationResult.selectedServices?.length || 0} selected services`}
                                    </p>
                                  </div>
                                )}

                                {/* Proceed to Order Button */}
                                {simulationResult && (
                                  <Button
                                    onClick={handleProceedToOrder}
                                    style={{
                                      width: '100%',
                                      background: 'linear-gradient(to right, #27AE60, #2ECC71)',
                                      color: 'white',
                                      marginTop: '8px'
                                    }}
                                  >
                                    {language === 'id' ? 'Lanjutkan ke Pemesanan' : 'Proceed to Order'}
                                    <ArrowRight style={{ marginLeft: '8px', width: '16px', height: '16px' }} />
                                  </Button>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer - Same as home page */}
        <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
          <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <Image
                    src="/logo-archi-coll.png"
                    alt="ARCHI-COLL Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                    sizes="32px"
                  />
                </div>
                <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">ARCHI-COLL</span>
              </div>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
