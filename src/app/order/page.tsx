'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calculator, MapPin, Home, Layers, FileText, Building, CheckCircle, ArrowRight, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface ServiceCategory {
  id: string
  code: string
  nameIndo: string
  nameEng: string
  subCategories: Array<{
    id: string
    code: string
    nameIndo: string
    nameEng: string
  }>
}

interface BuildingClass {
  id: string
  code: string
  nameIndo: string
  nameEng: string
  color: string
}

interface BuildingScale {
  id: string
  nameIndo: string
  floors: string
  color: string
}

interface PricingRule {
  id: string
  buildingType: string
  qualityLevel: string
  pricePerM2: number
  iaiFeeRate: number
  minFloors: number
  maxFloors?: number
}

interface FormData {
  categoryId: string
  subCategoryId: string
  location: string
  landArea: string
  buildingArea: string
  floors: string
  technicalClass: string
  notes: string
}

interface PriceCalculation {
  rab: number
  designFee: number
  dp: number
  pricePerM2: number
  iaiFeeRate: number
}

export default function OrderPage() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [buildingClasses, setBuildingClasses] = useState<BuildingClass[]>([])
  const [buildingScales, setBuildingScales] = useState<BuildingScale[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    subCategoryId: '',
    location: '',
    landArea: '',
    buildingArea: '',
    floors: '',
    technicalClass: '',
    notes: '',
  })
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null)
  const [massDensity, setMassDensity] = useState<string>('')

  // Get categoryId from URL
  const urlCategoryId = searchParams.get('categoryId') || ''

  // Translations
  const translations = {
    id: {
      title: 'Pesan Jasa Desain Arsitektur',
      subtitle: 'Isi formulir di bawah untuk mendapatkan estimasi biaya dan memulai proyek Anda',
      buildingCategory: 'Kategori Bangunan',
      selectCategory: 'Pilih kategori bangunan',
      subCategory: 'Sub-Kategori',
      selectSubCategory: 'Pilih sub-kategori',
      location: 'Lokasi Proyek',
      locationPlaceholder: 'Masukkan lokasi proyek',
      landArea: 'Luas Lahan (m²)',
      landAreaPlaceholder: 'Masukkan luas lahan',
      buildingArea: 'Luas Bangunan (m²)',
      buildingAreaPlaceholder: 'Auto-calculate (40% dari lahan)',
      floors: 'Jumlah Lantai',
      floorsPlaceholder: 'Masukkan jumlah lantai',
      technicalClass: 'Kelas Teknis',
      selectTechnicalClass: 'Pilih kelas teknis',
      simple: 'Sederhana (K1)',
      medium: 'Menengah (K2)',
      luxury: 'Mewah (K3)',
      notes: 'Catatan Tambahan',
      notesPlaceholder: 'Tambahkan catatan untuk proyek Anda...',
      optional: '(Opsional)',
      priceSimulation: 'Simulasi Harga',
      estimating: 'Menghitung estimasi...',
      rab: 'Estimasi RAB',
      designFee: 'Biaya Desain',
      dp: 'DP Awal (10%)',
      totalFee: 'Total Fee',
      submit: 'Lanjut ke Konfirmasi',
      calculating: 'Menghitung...',
      required: 'Wajib diisi',
      errors: {
        categoryId: 'Pilih kategori bangunan',
        location: 'Masukkan lokasi proyek',
        landArea: 'Masukkan luas lahan',
        floors: 'Masukkan jumlah lantai',
        technicalClass: 'Pilih kelas teknis',
      },
      massDensity: {
        lowRise: 'Low-Rise',
        midRise: 'Mid-Rise',
        highRise: 'High-Rise',
        superTall: 'Super-Tall',
      }
    },
    en: {
      title: 'Order Architecture Design Service',
      subtitle: 'Fill out the form below to get cost estimation and start your project',
      buildingCategory: 'Building Category',
      selectCategory: 'Select building category',
      subCategory: 'Sub-Category',
      selectSubCategory: 'Select sub-category',
      location: 'Project Location',
      locationPlaceholder: 'Enter project location',
      landArea: 'Land Area (m²)',
      landAreaPlaceholder: 'Enter land area',
      buildingArea: 'Building Area (m²)',
      buildingAreaPlaceholder: 'Auto-calculate (40% of land)',
      floors: 'Number of Floors',
      floorsPlaceholder: 'Enter number of floors',
      technicalClass: 'Technical Class',
      selectTechnicalClass: 'Select technical class',
      simple: 'Simple (K1)',
      medium: 'Medium (K2)',
      luxury: 'Luxury (K3)',
      notes: 'Additional Notes',
      notesPlaceholder: 'Add notes for your project...',
      optional: '(Optional)',
      priceSimulation: 'Price Simulation',
      estimating: 'Calculating estimation...',
      rab: 'Estimated RAB',
      designFee: 'Design Fee',
      dp: 'Initial DP (10%)',
      totalFee: 'Total Fee',
      submit: 'Proceed to Confirmation',
      calculating: 'Calculating...',
      required: 'Required',
      errors: {
        categoryId: 'Select building category',
        location: 'Enter project location',
        landArea: 'Enter land area',
        floors: 'Enter number of floors',
        technicalClass: 'Select technical class',
      },
      massDensity: {
        lowRise: 'Low-Rise',
        midRise: 'Mid-Rise',
        highRise: 'High-Rise',
        superTall: 'Super-Tall',
      }
    }
  }

  const text = translations[language]

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, pricingRes] = await Promise.all([
          fetch('/api/services-classification'),
          fetch('/api/pricing-rules'),
        ])

        const servicesData = await servicesRes.json()
        const pricingData = await pricingRes.json()

        if (servicesData.success) {
          setCategories(servicesData.data.categories || [])
          setBuildingClasses(servicesData.data.buildingClasses || [])
          setBuildingScales(servicesData.data.buildingScales || [])
        }

        if (pricingData.success) {
          setPricingRules(pricingData.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Pre-select category from URL
  useEffect(() => {
    if (urlCategoryId && categories.length > 0) {
      const categoryExists = categories.find(cat => cat.id === urlCategoryId)
      if (categoryExists) {
        setFormData(prev => ({ ...prev, categoryId: urlCategoryId }))
      }
    } else if (!formData.categoryId && categories.length > 0) {
      // If no category from URL, select the first one
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }))
    }
  }, [urlCategoryId, categories.length])

  // Auto-select first sub-category when category is selected
  useEffect(() => {
    if (formData.categoryId && !formData.subCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      if (selectedCategory && selectedCategory.subCategories.length > 0) {
        setFormData(prev => ({ ...prev, subCategoryId: selectedCategory.subCategories[0].id }))
      }
    }
  }, [formData.categoryId, categories])

  // Calculate mass density based on floors
  useEffect(() => {
    const floors = parseInt(formData.floors)
    if (!isNaN(floors)) {
      if (floors <= 4) {
        setMassDensity(text.massDensity.lowRise)
      } else if (floors <= 12) {
        setMassDensity(text.massDensity.midRise)
      } else if (floors <= 40) {
        setMassDensity(text.massDensity.highRise)
      } else {
        setMassDensity(text.massDensity.superTall)
      }
    } else {
      setMassDensity('')
    }
  }, [formData.floors, language, text.massDensity])

  // Calculate price
  useEffect(() => {
    async function calculatePrice() {
      const landArea = parseFloat(formData.landArea)
      const buildingArea = parseFloat(formData.buildingArea)
      const floors = parseInt(formData.floors)
      const technicalClass = formData.technicalClass

      if (!landArea || !buildingArea || !floors || !technicalClass) {
        setPriceCalculation(null)
        return
      }

      setIsCalculating(true)

      try {
        // Find matching pricing rule
        const matchingRule = pricingRules.find(rule => {
          const matchType = rule.buildingType === formData.categoryId
          const matchQuality = rule.qualityLevel === technicalClass
          const matchFloors = floors >= rule.minFloors &&
                            (!rule.maxFloors || floors <= rule.maxFloors)
          return matchType && matchQuality && matchFloors
        })

        if (matchingRule) {
          const rab = buildingArea * matchingRule.pricePerM2
          const designFee = rab * matchingRule.iaiFeeRate
          const dp = designFee * 0.1

          setPriceCalculation({
            rab,
            designFee,
            dp,
            pricePerM2: matchingRule.pricePerM2,
            iaiFeeRate: matchingRule.iaiFeeRate,
          })
        } else {
          // Fallback calculation
          const pricePerM2 = 5000000 // default
          const iaiFeeRate = 0.05 // default 5%
          const rab = buildingArea * pricePerM2
          const designFee = rab * iaiFeeRate
          const dp = designFee * 0.1

          setPriceCalculation({
            rab,
            designFee,
            dp,
            pricePerM2,
            iaiFeeRate,
          })
        }
      } catch (error) {
        console.error('Error calculating price:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    const timeoutId = setTimeout(calculatePrice, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.landArea, formData.buildingArea, formData.floors, formData.technicalClass, formData.categoryId, pricingRules.length])

  // Auto-calculate building area (40% of land)
  useEffect(() => {
    const landArea = parseFloat(formData.landArea)
    if (!isNaN(landArea) && landArea > 0) {
      const buildingArea = landArea * 0.4
      setFormData(prev => ({ ...prev, buildingArea: buildingArea.toString() }))
    }
  }, [formData.landArea])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.location.trim()) {
      newErrors.location = text.errors.location
    }
    if (!formData.landArea) {
      newErrors.landArea = text.errors.landArea
    }
    if (!formData.floors) {
      newErrors.floors = text.errors.floors
    }
    if (!formData.technicalClass) {
      newErrors.technicalClass = text.errors.technicalClass
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Save to sessionStorage
    const orderData = {
      ...formData,
      landArea: parseFloat(formData.landArea),
      buildingArea: parseFloat(formData.buildingArea),
      floors: parseInt(formData.floors),
      massDensity,
      priceCalculation,
      createdAt: new Date().toISOString(),
    }

    sessionStorage.setItem('orderData', JSON.stringify(orderData))

    // Redirect to confirmation page
    router.push('/auth/login?redirect=/order/confirm')
  }

  // Get selected category
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1E1E1E' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#9B59B6' }} />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
      {/* Navigation */}
      <Navigation />

      {/* Page Header with gradient */}
      <div className="pt-24 pb-12 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #6B5B95 0%, #9B59B6 50%, #E74C3C 100%)'
      }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{text.title}</h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">{text.subtitle}</p>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-0" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: '#9B59B6' }} />
                  {language === 'id' ? 'Detail Proyek' : 'Project Details'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {language === 'id'
                    ? 'Lengkapi formulir untuk mendapatkan estimasi biaya'
                    : 'Complete the form to get cost estimation'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected Category Info - Read Only */}
                  {selectedCategory && (
                    <div className="p-4 rounded-lg" style={{
                      background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.2) 0%, rgba(155, 89, 182, 0.2) 100%)',
                      border: '1px solid rgba(155, 89, 182, 0.3)'
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-400 mb-1">{language === 'id' ? 'Kategori Bangunan' : 'Building Category'}</p>
                          <p className="text-lg font-bold text-white">
                            {language === 'id' ? selectedCategory.nameIndo : selectedCategory.nameEng}
                          </p>
                          <p className="text-sm text-gray-400">
                            {language === 'id' ? 'Pilih sub-kategori' : 'Select sub-category'}
                          </p>
                        </div>
                        <Badge style={{
                          background: '#9B59B6CC',
                          color: 'white',
                          border: 'none',
                          fontSize: '12px',
                          padding: '6px 12px'
                        }}>
                          {selectedCategory.code}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Sub-Category Selection Cards */}
                  {selectedCategory && (
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {text.subCategory} <span className="text-gray-500 text-sm text-normal">{text.optional}</span>
                      </Label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                      }}>
                        {selectedCategory.subCategories.map((sub) => (
                          <Card
                            key={sub.id}
                            onClick={() => handleInputChange('subCategoryId', sub.id)}
                            style={{
                              background: formData.subCategoryId === sub.id
                                ? 'rgba(155, 89, 182, 0.2)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: formData.subCategoryId === sub.id
                                ? '2px solid #9B59B6'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            className="hover:border-purple-500 hover:bg-purple-500/10"
                          >
                            <CardContent style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                marginBottom: '4px'
                              }}>
                                <Badge
                                  style={{
                                    background: formData.subCategoryId === sub.id
                                      ? '#9B59B6'
                                      : 'rgba(155, 89, 182, 0.3)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '10px',
                                    padding: '2px 6px'
                                  }}
                                >
                                  {sub.code}
                                </Badge>
                                {formData.subCategoryId === sub.id && (
                                  <CheckCircle className="h-4 w-4 text-purple-400" />
                                )}
                              </div>
                              <p style={{
                                fontSize: '13px',
                                color: 'white',
                                fontWeight: formData.subCategoryId === sub.id ? '600' : '400',
                                lineHeight: '1.3'
                              }}>
                                {language === 'id' ? sub.nameIndo : sub.nameEng}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {text.location} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={text.locationPlaceholder}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm">{errors.location}</p>
                    )}
                  </div>

                  {/* Land Area */}
                  <div className="space-y-2">
                    <Label htmlFor="landArea" className="text-white flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {text.landArea} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="landArea"
                      type="number"
                      value={formData.landArea}
                      onChange={(e) => handleInputChange('landArea', e.target.value)}
                      placeholder={text.landAreaPlaceholder}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                    {errors.landArea && (
                      <p className="text-red-500 text-sm">{errors.landArea}</p>
                    )}
                  </div>

                  {/* Building Area (Auto-calculated) */}
                  <div className="space-y-2">
                    <Label htmlFor="buildingArea" className="text-white flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {text.buildingArea} <span className="text-gray-500 text-xs">(40% KDB)</span>
                    </Label>
                    <Input
                      id="buildingArea"
                      type="number"
                      value={formData.buildingArea}
                      onChange={(e) => handleInputChange('buildingArea', e.target.value)}
                      placeholder={text.buildingAreaPlaceholder}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Number of Floors */}
                  <div className="space-y-2">
                    <Label htmlFor="floors" className="text-white flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {text.floors} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="floors"
                      type="number"
                      min="1"
                      value={formData.floors}
                      onChange={(e) => handleInputChange('floors', e.target.value)}
                      placeholder={text.floorsPlaceholder}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                    {errors.floors && (
                      <p className="text-red-500 text-sm">{errors.floors}</p>
                    )}
                    {massDensity && (
                      <Badge
                        variant="outline"
                        className="mt-2"
                        style={{
                          borderColor: '#9B59B6',
                          color: '#9B59B6',
                          backgroundColor: 'rgba(155, 89, 182, 0.1)'
                        }}
                      >
                        {massDensity}
                      </Badge>
                    )}
                  </div>

                  {/* Technical Class */}
                  <div className="space-y-2">
                    <Label htmlFor="technicalClass" className="text-white flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      {text.technicalClass} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.technicalClass}
                      onValueChange={(value) => handleInputChange('technicalClass', value)}
                    >
                      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white focus:border-purple-500">
                        <SelectValue placeholder={text.selectTechnicalClass} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {buildingClasses.map((cls) => (
                          <SelectItem
                            key={cls.id}
                            value={cls.id}
                            className="text-white hover:bg-white/10"
                          >
                            {language === 'id' ? cls.nameIndo : cls.nameEng} ({cls.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.technicalClass && (
                      <p className="text-red-500 text-sm">{errors.technicalClass}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-gray-300">
                      {text.notes} {text.optional}
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder={text.notesPlaceholder}
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #6B5B95 0%, #9B59B6 50%, #E74C3C 100%)',
                    }}
                  >
                    {text.submit}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Price Simulation Section - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-0" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5" style={{ color: '#9B59B6' }} />
                    {text.priceSimulation}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {language === 'id'
                      ? 'Estimasi biaya berdasarkan parameter proyek'
                      : 'Cost estimation based on project parameters'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCalculating ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" style={{ color: '#9B59B6' }} />
                      <span className="text-gray-400">{text.calculating}</span>
                    </div>
                  ) : priceCalculation ? (
                    <>
                      {/* RAB */}
                      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                        <p className="text-sm text-gray-400 mb-1">{text.rab}</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(priceCalculation.rab)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          @ {formatCurrency(priceCalculation.pricePerM2)}/m²
                        </p>
                      </div>

                      {/* Design Fee */}
                      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                        <p className="text-sm text-gray-400 mb-1">{text.designFee}</p>
                        <p className="text-2xl font-bold" style={{ color: '#9B59B6' }}>
                          {formatCurrency(priceCalculation.designFee)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(priceCalculation.iaiFeeRate * 100).toFixed(1)}% dari RAB
                        </p>
                      </div>

                      {/* DP */}
                      <div className="p-4 rounded-lg border-2" style={{
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderColor: '#E74C3C'
                      }}>
                        <p className="text-sm text-gray-400 mb-1">{text.dp}</p>
                        <p className="text-3xl font-bold" style={{ color: '#E74C3C' }}>
                          {formatCurrency(priceCalculation.dp)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'id' ? 'Pembayaran awal' : 'Initial payment'}
                        </p>
                      </div>

                      {/* Total Fee */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{text.totalFee}</span>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-white mt-1">
                          {formatCurrency(priceCalculation.designFee)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">
                        {language === 'id'
                          ? 'Isi form untuk melihat estimasi'
                          : 'Fill the form to see estimation'}
                      </p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400">
                      {language === 'id'
                        ? 'Harga ini adalah estimasi awal. Harga final mungkin berubah tergantung kompleksitas proyek dan spesifikasi material.'
                        : 'This is an initial estimate. Final price may vary depending on project complexity and material specifications.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">ARCHI-COLL</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
