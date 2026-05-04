'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, User, Phone, MapPin, FileText, AlertCircle, CheckCircle, Loader2, Lock, RefreshCw, ArrowLeft, Upload, X, Image as ImageIcon, Briefcase, Link2, Trash2, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

// Types for form requirements
interface FormRequirement {
  id: string
  fieldId: string
  labelIndo: string
  labelEng: string
  fieldType: string
  required: boolean
  options?: string | null
  placeholderIndo?: string | null
  placeholderEng?: string | null
  order: number
  active: boolean
}

const professions = [
  {
    id: 'architect',
    nameIndo: 'Desain Arsitek',
    nameEng: 'Architectural Designer',
    descriptionIndo: 'Perancang bangunan dengan lisensi arsitek',
    descriptionEng: 'Building designer with architect license',
    requiresSTRA: true,
    requiresCertificate: true
  },
  {
    id: 'licensed_architect',
    nameIndo: 'Arsitek Berlisensi',
    nameEng: 'Licensed Architect',
    descriptionIndo: 'Arsitek profesional dengan STRA valid',
    descriptionEng: 'Professional architect with valid STRA',
    requiresSTRA: true,
    requiresCertificate: true
  },
  {
    id: 'structure',
    nameIndo: 'Desain Struktur',
    nameEng: 'Structural Designer',
    descriptionIndo: 'Perancang struktur bangunan',
    descriptionEng: 'Building structural designer',
    requiresSTRA: false,
    requiresCertificate: true
  },
  {
    id: 'mep',
    nameIndo: 'Desain MEP',
    nameEng: 'MEP Designer',
    descriptionIndo: 'Perancang Mekanikal, Elektrikal, dan Plambing',
    descriptionEng: 'Mechanical, Electrical, and Plumbing Designer',
    requiresSTRA: false,
    requiresCertificate: true
  },
  {
    id: 'drafter',
    nameIndo: 'Drafter',
    nameEng: 'Drafter',
    descriptionIndo: 'Pembuat gambar teknik dan dokumentasi',
    descriptionEng: 'Technical drawing and documentation maker',
    requiresSTRA: false,
    requiresCertificate: false
  },
  {
    id: 'qs',
    nameIndo: 'QS (Quantity Surveyor)',
    nameEng: 'QS (Quantity Surveyor)',
    descriptionIndo: 'Ahli perhitungan quantity dan biaya konstruksi',
    descriptionEng: 'Construction quantity and cost calculation expert',
    requiresSTRA: false,
    requiresCertificate: true
  }
]

const expertiseOptions = [
  { id: 'residential', nameIndo: 'Residential', nameEng: 'Residential' },
  { id: 'hospital', nameIndo: 'Rumah Sakit', nameEng: 'Hospital' },
  { id: 'villa', nameIndo: 'Villa', nameEng: 'Villa' },
  { id: 'cafe_restaurant', nameIndo: 'Kafe & Restoran', nameEng: 'Cafe & Restaurant' },
  { id: 'apartment', nameIndo: 'Apartemen', nameEng: 'Apartment' },
  { id: 'commercial', nameIndo: 'Komersial', nameEng: 'Commercial' }
]

const buildingTypes = [
  { id: 'low_rise', nameIndo: 'Low-rise (≤ 4 lantai)', nameEng: 'Low-rise (≤ 4 floors)' },
  { id: 'mid_rise', nameIndo: 'Mid-rise (5-15 lantai)', nameEng: 'Mid-rise (5-15 floors)' },
  { id: 'high_rise', nameIndo: 'High-rise (> 15 lantai)', nameEng: 'High-rise (> 15 floors)' }
]

// Default fallback form requirements
const defaultFormRequirements: FormRequirement[] = [
  // Step 1: Personal Info
  { id: '1', fieldId: 'name', labelIndo: 'Nama Lengkap', labelEng: 'Full Name', fieldType: 'text', required: true, placeholderIndo: 'Masukkan nama lengkap', placeholderEng: 'Enter full name', order: 1, active: true },
  { id: '2', fieldId: 'email', labelIndo: 'Email', labelEng: 'Email', fieldType: 'email', required: true, placeholderIndo: 'Masukkan email', placeholderEng: 'Enter email', order: 2, active: true },
  { id: '3', fieldId: 'phone', labelIndo: 'Nomor Telepon', labelEng: 'Phone Number', fieldType: 'tel', required: true, placeholderIndo: 'Masukkan nomor telepon', placeholderEng: 'Enter phone number', order: 3, active: true },
  { id: '4', fieldId: 'address', labelIndo: 'Alamat', labelEng: 'Address', fieldType: 'textarea', required: false, placeholderIndo: 'Masukkan alamat lengkap', placeholderEng: 'Enter full address', order: 4, active: true },
  { id: '5', fieldId: 'linkedInUrl', labelIndo: 'URL LinkedIn (Opsional)', labelEng: 'LinkedIn URL (Optional)', fieldType: 'url', required: false, placeholderIndo: 'https://linkedin.com/in/...', placeholderEng: 'https://linkedin.com/in/...', order: 5, active: true },
  { id: '6', fieldId: 'portfolioUrl', labelIndo: 'URL Website Portfolio (Opsional)', labelEng: 'Portfolio Website URL (Optional)', fieldType: 'url', required: false, placeholderIndo: 'https://...', placeholderEng: 'https://...', order: 6, active: true },
  { id: '7', fieldId: 'experience', labelIndo: 'Pengalaman (Tahun)', labelEng: 'Experience (Years)', fieldType: 'number', required: true, placeholderIndo: 'Masukkan tahun pengalaman', placeholderEng: 'Enter years of experience', order: 7, active: true },
  // Step 2: Certification
  { id: '8', fieldId: 'certificateType', labelIndo: 'Tipe Sertifikat', labelEng: 'Certificate Type', fieldType: 'select', required: true, placeholderIndo: 'Pilih tipe sertifikat', placeholderEng: 'Select certificate type', options: JSON.stringify([
    { value: 'STRA', label: 'STRA - Surat Tanda Registrasi Arsitek' },
    { value: 'SKA', label: 'SKA - Surat Keterangan Ahli' },
    { value: 'SKT', label: 'SKT - Surat Keterangan Teknis' },
    { value: 'Sertifikasi Struktur', label: 'Sertifikasi Struktur' },
    { value: 'Sertifikasi MEP', label: 'Sertifikasi MEP' },
    { value: 'Sertifikasi QS', label: 'Sertifikasi QS' },
    { value: 'Sertifikasi Lainnya', label: 'Sertifikasi Lainnya' }
  ]), order: 8, active: true },
  { id: '9', fieldId: 'certificateNumber', labelIndo: 'Nomor Sertifikat', labelEng: 'Certificate Number', fieldType: 'text', required: true, placeholderIndo: 'Masukkan nomor sertifikat', placeholderEng: 'Enter certificate number', order: 9, active: true },
  { id: '10', fieldId: 'issuer', labelIndo: 'Penerbit', labelEng: 'Issuer', fieldType: 'text', required: true, placeholderIndo: 'Misal: IAI, Kementerian PUPR', placeholderEng: 'e.g., IAI, Ministry of PUPR', order: 10, active: true },
  { id: '11', fieldId: 'issuedDate', labelIndo: 'Tanggal Terbit', labelEng: 'Issued Date', fieldType: 'date', required: true, order: 11, active: true },
  { id: '12', fieldId: 'expiryDate', labelIndo: 'Tanggal Kadaluarsa (Opsional)', labelEng: 'Expiry Date (Optional)', fieldType: 'date', required: false, order: 12, active: true },
  { id: '13', fieldId: 'documentUrl', labelIndo: 'URL Dokumen Sertifikat (Opsional)', labelEng: 'Certificate Document URL (Optional)', fieldType: 'text', required: false, placeholderIndo: '/api/images/certificate.jpg', placeholderEng: '/api/images/certificate.jpg', order: 13, active: true },
  // Step 3: Account Security
  { id: '14', fieldId: 'password', labelIndo: 'Password', labelEng: 'Password', fieldType: 'password', required: true, placeholderIndo: 'Masukkan password', placeholderEng: 'Enter password', order: 14, active: true },
  { id: '15', fieldId: 'confirmPassword', labelIndo: 'Konfirmasi Password', labelEng: 'Confirm Password', fieldType: 'password', required: true, placeholderIndo: 'Konfirmasi password', placeholderEng: 'Confirm password', order: 15, active: true },
]

export default function MemberRegisterPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [formRequirements, setFormRequirements] = useState<FormRequirement[]>(defaultFormRequirements)

  // Email already registered dialog state
  const [emailExistsDialogOpen, setEmailExistsDialogOpen] = useState(false)
  const [emailExistsData, setEmailExistsData] = useState<any>(null)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [resetPasswordResult, setResetPasswordResult] = useState<any>(null)

  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    profession: '',
    experience: '',
    linkedInUrl: '',
    portfolioUrl: '',
    certificateType: '',
    certificateNumber: '',
    issuer: '',
    issuedDate: '',
    expiryDate: '',
    documentUrl: '',
    password: '',
    confirmPassword: ''
  })

  const [expertise, setExpertise] = useState<string[]>([])
  const [buildingType, setBuildingType] = useState<string>('')
  const [portfolioImages, setPortfolioImages] = useState<File[]>([])
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([])
  const [portfolioDescription, setPortfolioDescription] = useState('')
  const [imageUploadError, setImageUploadError] = useState<string>('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch form requirements from API
  useEffect(() => {
    const fetchFormRequirements = async () => {
      try {
        const response = await fetch('/api/form-requirements')
        if (response.ok) {
          const data = await response.json()

          // Define CRITICAL fields that MUST always be shown
          const criticalFields = [
            {
              id: 'req_name',
              fieldId: 'name',
              labelIndo: 'Nama Lengkap',
              labelEng: 'Full Name',
              fieldType: 'text',
              required: true,
              placeholderIndo: 'Masukkan nama lengkap',
              placeholderEng: 'Enter full name',
              order: 1,
              active: true
            },
            {
              id: 'req_profession',
              fieldId: 'profession',
              labelIndo: 'Profesi',
              labelEng: 'Profession',
              fieldType: 'select',
              required: true,
              placeholderIndo: 'Pilih profesi',
              placeholderEng: 'Select profession',
              order: 5,
              active: true
            },
            {
              id: 'req_email',
              fieldId: 'email',
              labelIndo: 'Email',
              labelEng: 'Email',
              fieldType: 'email',
              required: true,
              placeholderIndo: 'Masukkan email',
              placeholderEng: 'Enter email',
              order: 2,
              active: true
            },
            {
              id: 'req_password',
              fieldId: 'password',
              labelIndo: 'Password',
              labelEng: 'Password',
              fieldType: 'password',
              required: true,
              placeholderIndo: 'Masukkan password',
              placeholderEng: 'Enter password',
              order: 14,
              active: true
            },
            {
              id: 'req_confirm_password',
              fieldId: 'confirmPassword',
              labelIndo: 'Konfirmasi Password',
              labelEng: 'Confirm Password',
              fieldType: 'password',
              required: true,
              placeholderIndo: 'Konfirmasi password',
              placeholderEng: 'Confirm password',
              order: 15,
              active: true
            }
          ]

          const criticalFieldIds = criticalFields.map(f => f.fieldId)
          let combinedRequirements: FormRequirement[] = []

          // Add critical fields that are NOT in API data
          criticalFields.forEach(criticalField => {
            const apiField = data.find(f => f.fieldId === criticalField.fieldId)
            if (!apiField) {
              combinedRequirements.push(criticalField)
            } else {
              combinedRequirements.push({ ...apiField, active: true })
            }
          })

          // Add API fields that are NOT critical
          data.forEach(apiField => {
            if (!criticalFieldIds.includes(apiField.fieldId)) {
              combinedRequirements.push(apiField)
            }
          })

          combinedRequirements.sort((a, b) => a.order - b.order)
          setFormRequirements(combinedRequirements)
        }
      } catch (error) {
        console.error('Failed to fetch form requirements:', error)
      } finally {
        setFetchingData(false)
      }
    }

    fetchFormRequirements()
  }, [])

  const selectedProfession = professions.find(p => p.id === formData.profession)

  // Fetch dynamic form requirements when profession changes
  useEffect(() => {
    const fetchDynamicFormRequirements = async (profession: string) => {
      try {
        const response = await fetch(`/api/form-requirements?profession=${profession}`)
        if (response.ok) {
          const data = await response.json()

          // Define CRITICAL fields that MUST always be shown
          const criticalFields = [
            {
              id: 'req_name',
              fieldId: 'name',
              labelIndo: 'Nama Lengkap',
              labelEng: 'Full Name',
              fieldType: 'text',
              required: true,
              placeholderIndo: 'Masukkan nama lengkap',
              placeholderEng: 'Enter full name',
              order: 1,
              active: true
            },
            {
              id: 'req_email',
              fieldId: 'email',
              labelIndo: 'Email',
              labelEng: 'Email',
              fieldType: 'email',
              required: true,
              placeholderIndo: 'Masukkan email',
              placeholderEng: 'Enter email',
              order: 2,
              active: true
            },
            {
              id: 'req_password',
              fieldId: 'password',
              labelIndo: 'Password',
              labelEng: 'Password',
              fieldType: 'password',
              required: true,
              placeholderIndo: 'Masukkan password',
              placeholderEng: 'Enter password',
              order: 14,
              active: true
            },
            {
              id: 'req_confirm_password',
              fieldId: 'confirmPassword',
              labelIndo: 'Konfirmasi Password',
              labelEng: 'Confirm Password',
              fieldType: 'password',
              required: true,
              placeholderIndo: 'Konfirmasi password',
              placeholderEng: 'Confirm password',
              order: 15,
              active: true
            }
          ]

          const criticalFieldIds = criticalFields.map(f => f.fieldId)
          let combinedRequirements: FormRequirement[] = []

          // Add critical fields that are NOT in API data
          criticalFields.forEach(criticalField => {
            const apiField = data.find(f => f.fieldId === criticalField.fieldId)
            if (!apiField) {
              combinedRequirements.push(criticalField)
            } else {
              combinedRequirements.push({ ...apiField, active: true })
            }
          })

          // Add API fields that are NOT critical
          data.forEach(apiField => {
            if (!criticalFieldIds.includes(apiField.fieldId)) {
              combinedRequirements.push(apiField)
            }
          })

          combinedRequirements.sort((a, b) => a.order - b.order)
          setFormRequirements(combinedRequirements)
        }
      } catch (error) {
        console.error('Failed to fetch dynamic form requirements:', error)
      }
    }

    if (formData.profession) {
      fetchDynamicFormRequirements(formData.profession)
    }
  }, [formData.profession])

  const getStepFields = (stepNumber: number): FormRequirement[] => {
    const step1Fields = ['name', 'email', 'phone', 'address', 'linkedInUrl', 'portfolioUrl', 'experience']
    const step3Fields = ['certificateType', 'certificateNumber', 'issuer', 'issuedDate', 'expiryDate', 'documentUrl']
    const step4Fields = ['password', 'confirmPassword']

    const fieldIds = stepNumber === 1 ? step1Fields : stepNumber === 3 ? step3Fields : stepNumber === 4 ? step4Fields : []
    return formRequirements.filter(req => fieldIds.includes(req.fieldId)).sort((a, b) => a.order - b.order)
  }

  const step1Fields = getStepFields(1)
  const step3Fields = getStepFields(3)
  const step4Fields = getStepFields(4)

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    const step1Fields = ['name', 'email', 'phone', 'address', 'linkedInUrl', 'portfolioUrl', 'experience']
    const requiredFields = formRequirements.filter(f => f.required && step1Fields.includes(f.fieldId))

    for (const field of requiredFields) {
      const value = formData[field.fieldId]

      if (!value?.trim()) {
        newErrors[field.fieldId] = language === 'id' ? `${field.labelIndo} wajib diisi` : `${field.labelEng} is required`
        continue
      }

      if (field.fieldId === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field.fieldId] = language === 'id' ? 'Email tidak valid' : 'Invalid email'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    // Validate profession
    if (!formData.profession) {
      newErrors.profession = language === 'id' ? 'Profesi wajib dipilih' : 'Profession is required'
    }

    // Validate expertise (at least one required) - only for architect and licensed_architect
    if ((formData.profession === 'architect' || formData.profession === 'licensed_architect') && expertise.length === 0) {
      newErrors.expertise = language === 'id' ? 'Minimal satu keahlian harus dipilih' : 'At least one expertise must be selected'
    }

    // Validate building type for licensed architects
    if (formData.profession === 'licensed_architect' && !buildingType) {
      newErrors.buildingType = language === 'id' ? 'Tipe bangunan wajib dipilih untuk arsitek berlisensi' : 'Building type is required for licensed architects'
    }

    // Validate portfolio images (at least one required) - only for architect and licensed_architect
    if ((formData.profession === 'architect' || formData.profession === 'licensed_architect') && portfolioImages.length === 0) {
      newErrors.portfolioImages = language === 'id' ? 'Minimal satu gambar portfolio harus diupload' : 'At least one portfolio image must be uploaded'
    }

    // Validate portfolio description (min 50 characters) - only for architect and licensed_architect
    if ((formData.profession === 'architect' || formData.profession === 'licensed_architect')) {
      if (!portfolioDescription.trim()) {
        newErrors.portfolioDescription = language === 'id' ? 'Deskripsi portfolio wajib diisi' : 'Portfolio description is required'
      } else if (portfolioDescription.trim().length < 50) {
        newErrors.portfolioDescription = language === 'id' ? 'Deskripsi portfolio minimal 50 karakter' : 'Portfolio description must be at least 50 characters'
      }
    }

    // Validate experience
    if (!formData.experience) {
      newErrors.experience = language === 'id' ? 'Pengalaman wajib diisi' : 'Experience is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (selectedProfession?.requiresCertificate) {
      const step3Fields = ['certificateType', 'certificateNumber', 'issuer', 'issuedDate']
      const requiredFields = formRequirements.filter(f => f.required && step3Fields.includes(f.fieldId))
      for (const field of requiredFields) {
        if (!formData[field.fieldId]?.trim()) {
          newErrors[field.fieldId] = language === 'id' ? `${field.labelIndo} wajib diisi` : `${field.labelEng} is required`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password?.trim()) {
      newErrors.password = language === 'id' ? 'Password wajib diisi' : 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = language === 'id' ? 'Password minimal 8 karakter' : 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'id' ? 'Password tidak cocok' : 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setImageUploadError('')

    Array.from(files).forEach(file => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setImageUploadError(language === 'id' ? 'Hanya file JPEG, PNG, atau WebP yang diperbolehkan' : 'Only JPEG, PNG, or WebP files are allowed')
        return
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError(language === 'id' ? 'Ukuran file maksimal 2MB' : 'Maximum file size is 2MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPortfolioImages(prev => [...prev, file])
        if (reader.result) {
          setPortfolioPreviews(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index))
    setPortfolioPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const toggleExpertise = (expertiseId: string) => {
    setExpertise(prev => 
      prev.includes(expertiseId) 
        ? prev.filter(id => id !== expertiseId)
        : [...prev, expertiseId]
    )
    // Clear error when user makes a selection
    if (errors.expertise) {
      setErrors(prev => ({ ...prev, expertise: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      return
    }

    setLoading(true)

    try {
      // Check if email already exists
      const checkResponse = await fetch('/api/members/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const checkData = await checkResponse.json()

      if (checkData.found) {
        setEmailExistsData(checkData)
        setEmailExistsDialogOpen(true)
        setLoading(false)
        return
      }

      // Proceed with registration
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience) || 0
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: language === 'id' ? 'Pendaftaran Berhasil' : 'Registration Successful',
          description: language === 'id'
            ? 'Akun Anda sedang ditinjau oleh Tenaga Ahli. Silakan tunggu persetujuan.'
            : 'Your account is being reviewed by Tenaga Ahli (Professional Experts). Please wait for approval.',
        })
        router.push('/join-member')
      } else {
        toast({
          title: language === 'id' ? 'Pendaftaran Gagal' : 'Registration Failed',
          description: data.error || (language === 'id' ? 'Terjadi kesalahan' : 'An error occurred'),
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: language === 'id' ? 'Pendaftaran Gagal' : 'Registration Failed',
        description: language === 'id' ? 'Terjadi kesalahan' : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      // Skip Step 3 for professions that don't require certificate (drafter)
      if (selectedProfession?.requiresCertificate) {
        setStep(3)
      } else {
        setStep(4)
      }
    } else if (step === 3 && validateStep3()) {
      setStep(4)
    }
  }

  const renderField = (field: FormRequirement) => {
    const label = language === 'id' ? field.labelIndo : field.labelEng
    const placeholder = language === 'id' ? field.placeholderIndo : field.placeholderEng
    const error = errors[field.fieldId]

    if (field.fieldType === 'select') {
      let options: { value: string; label: string }[] = []

      if (field.fieldId === 'profession') {
        options = professions.map(p => ({ value: p.id, label: language === 'id' ? p.nameIndo : p.nameEng }))
      } else if (field.options) {
        options = JSON.parse(field.options)
      }

      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-gray-300">{label}{field.required && ' *'}</Label>
          <Select
            value={formData[field.fieldId]}
            onValueChange={(value) => setFormData({ ...formData, [field.fieldId]: value })}
          >
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )
    }

    if (field.fieldType === 'textarea') {
      return (
        <div key={field.id} className="space-y-2">
          <Label className="text-gray-300">{label}{field.required && ' *'}</Label>
          <Textarea
            placeholder={placeholder || undefined}
            value={formData[field.fieldId]}
            onChange={(e) => setFormData({ ...formData, [field.fieldId]: e.target.value })}
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px]"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )
    }

    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-gray-300">{label}{field.required && ' *'}</Label>
        <Input
          type={field.fieldType}
          placeholder={placeholder || undefined}
          value={formData[field.fieldId]}
          onChange={(e) => setFormData({ ...formData, [field.fieldId]: e.target.value })}
          className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      <Navigation />

      <div className="pt-24 pb-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/join-member" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
          </Link>

          <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                {language === 'id' ? 'Pendaftaran Member' : 'Member Registration'}
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                {language === 'id' ? 'Daftar sebagai profesional di ARCHI-COLL' : 'Register as a professional at ARCHI-COLL'}
              </CardDescription>

              {/* Important Notice */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300 text-center">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {language === 'id'
                    ? 'Setelah mendaftar, akun Anda akan direview oleh Tenaga Ahli sebelum bisa login.'
                    : 'After registration, your account will be reviewed by Tenaga Ahli (Professional Experts) before you can login.'}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-6 mb-2">
                {[1, 2, 3, 4].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= s ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]' : 'bg-gray-700'
                    }`}>
                      <span className={`text-sm font-medium ${step >= s ? 'text-white' : 'text-gray-400'}`}>
                        {s}
                      </span>
                    </div>
                    {s < 4 && <div className={`w-12 h-1 mx-1 ${step > s ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]' : 'bg-gray-700'}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm mt-2">
                <span className={step >= 1 ? 'text-white' : 'text-gray-500'}>
                  {language === 'id' ? 'Info Pribadi' : 'Personal Info'}
                </span>
                <span className={step >= 2 ? 'text-white' : 'text-gray-500'}>
                  {language === 'id' ? 'Profesi & Keahlian' : 'Profession & Expertise'}
                </span>
                <span className={step >= 3 ? 'text-white' : 'text-gray-500'}>
                  {language === 'id' ? 'Sertifikasi' : 'Certification'}
                </span>
                <span className={step >= 4 ? 'text-white' : 'text-gray-500'}>
                  {language === 'id' ? 'Akun' : 'Account'}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              {fetchingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#9B59B6]" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {step1Fields.map(renderField)}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Profession, Expertise & Portfolio */}
                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Profession Selection */}
                      <Card className="bg-gradient-to-r from-[#6B5B95]/10 to-[#E74C3C]/10 border-[#9B59B6]/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            {language === 'id' ? 'Profesi' : 'Profession'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-gray-300">{language === 'id' ? 'Pilih Profesi' : 'Select Profession'} *</Label>
                            <Select
                              value={formData.profession}
                              onValueChange={(value) => {
                                setFormData({ ...formData, profession: value })
                                setExpertise([])
                                setBuildingType('')
                                if (errors.profession) {
                                  setErrors(prev => ({ ...prev, profession: '' }))
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white mt-2">
                                <SelectValue placeholder={language === 'id' ? 'Pilih profesi' : 'Select profession'} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                {professions.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="text-white">
                                    {language === 'id' ? p.nameIndo : p.nameEng}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.profession && <p className="text-sm text-red-500">{errors.profession}</p>}
                          </div>

                          {selectedProfession && (
                            <div className="p-3 bg-gradient-to-r from-[#6B5B95]/20 to-[#E74C3C]/20 rounded-lg border border-[#9B59B6]/30">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[#9B59B6] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-white font-medium mb-1">
                                    {language === 'id' ? selectedProfession.nameIndo : selectedProfession.nameEng}
                                  </h4>
                                  <p className="text-gray-300 text-sm mb-2">
                                    {language === 'id' ? selectedProfession.descriptionIndo : selectedProfession.descriptionEng}
                                  </p>
                                  {/* Profession-specific requirements */}
                                  <div className="mt-2">
                                    {formData.profession === 'architect' && (
                                      <Badge className="bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]">
                                        {language === 'id' ? 'Memerlukan: STRA, Keahlian, Portfolio' : 'Requires: STRA, Expertise, Portfolio'}
                                      </Badge>
                                    )}
                                    {formData.profession === 'licensed_architect' && (
                                      <Badge className="bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]">
                                        {language === 'id' ? 'Memerlukan: STRA, Keahlian, Tipe Bangunan, Portfolio' : 'Requires: STRA, Expertise, Building Type, Portfolio'}
                                      </Badge>
                                    )}
                                    {(formData.profession === 'structure' || formData.profession === 'mep' || formData.profession === 'qs') && (
                                      <Badge className="bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]">
                                        {language === 'id' ? 'Memerlukan: Sertifikat' : 'Requires: Certificate'}
                                      </Badge>
                                    )}
                                    {formData.profession === 'drafter' && (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500">
                                        {language === 'id' ? 'Tidak memerlukan sertifikat atau lisensi' : 'No certificate or license required'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Expertise Selection - Only for architect and licensed_architect */}
                      {(formData.profession === 'architect' || formData.profession === 'licensed_architect') && (
                        <Card className="bg-gradient-to-r from-[#3498DB]/10 to-[#2ECC71]/10 border-[#3498DB]/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                              <Building2 className="w-5 h-5" />
                              {language === 'id' ? 'Keahlian Arsitektur' : 'Architecture Expertise'}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {language === 'id' ? 'Pilih minimal satu area keahlian' : 'Select at least one area of expertise'} *
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {expertiseOptions.map((option) => (
                                <div
                                  key={option.id}
                                  onClick={() => toggleExpertise(option.id)}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    expertise.includes(option.id)
                                      ? 'bg-gradient-to-r from-[#6B5B95]/30 to-[#E74C3C]/30 border-[#9B59B6]'
                                      : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      expertise.includes(option.id) ? 'bg-[#9B59B6] border-[#9B59B6]' : 'border-gray-500'
                                    }`}>
                                      {expertise.includes(option.id) && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-white text-sm font-medium">
                                      {language === 'id' ? option.nameIndo : option.nameEng}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {errors.expertise && <p className="text-sm text-red-500 mt-2">{errors.expertise}</p>}
                          </CardContent>
                        </Card>
                      )}

                      {/* Building Type (Only for Licensed Architects) */}
                      {formData.profession === 'licensed_architect' && (
                        <Card className="bg-gradient-to-r from-[#9B59B6]/10 to-[#E91E63]/10 border-[#E91E63]/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                              <Building2 className="w-5 h-5" />
                              {language === 'id' ? 'Tipe Bangunan' : 'Building Type'}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {language === 'id' ? 'Wajib untuk arsitek berlisensi' : 'Required for licensed architects'} *
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Select
                              value={buildingType}
                              onValueChange={(value) => {
                                setBuildingType(value)
                                if (errors.buildingType) {
                                  setErrors(prev => ({ ...prev, buildingType: '' }))
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                <SelectValue placeholder={language === 'id' ? 'Pilih tipe bangunan' : 'Select building type'} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                {buildingTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id} className="text-white">
                                    {language === 'id' ? type.nameIndo : type.nameEng}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.buildingType && <p className="text-sm text-red-500 mt-2">{errors.buildingType}</p>}
                          </CardContent>
                        </Card>
                      )}

                      {/* Portfolio Upload - Only for architect and licensed_architect */}
                      {(formData.profession === 'architect' || formData.profession === 'licensed_architect') && (
                        <Card className="bg-gradient-to-r from-[#2ECC71]/10 to-[#F39C12]/10 border-[#2ECC71]/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                              <ImageIcon className="w-5 h-5" />
                              {language === 'id' ? 'Upload Portfolio' : 'Portfolio Upload'}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {language === 'id' ? 'Upload minimal 1 gambar (JPEG, PNG, WebP, maks 2MB)' : 'Upload at least 1 image (JPEG, PNG, WebP, max 2MB)'} *
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                id="portfolio-upload"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="portfolio-upload"
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6B5B95] to-[#E74C3C] text-white rounded-lg cursor-pointer hover:from-[#5a4a7e] hover:to-[#d03b2b] transition-all"
                              >
                                <Upload className="w-4 h-4" />
                                {language === 'id' ? 'Pilih Gambar' : 'Select Images'}
                              </label>
                              <span className="text-gray-400 text-sm">
                                {portfolioImages.length} {language === 'id' ? 'gambar dipilih' : 'images selected'}
                              </span>
                            </div>
                            {imageUploadError && <p className="text-sm text-red-500">{imageUploadError}</p>}
                            {errors.portfolioImages && <p className="text-sm text-red-500">{errors.portfolioImages}</p>}

                            {/* Image Previews */}
                            {portfolioPreviews.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {portfolioPreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={preview}
                                      alt={`Portfolio ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Portfolio Description - Only for architect and licensed_architect */}
                      {(formData.profession === 'architect' || formData.profession === 'licensed_architect') && (
                        <Card className="bg-gradient-to-r from-[#F39C12]/10 to-[#E67E22]/10 border-[#F39C12]/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {language === 'id' ? 'Deskripsi Portfolio' : 'Portfolio Description'}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {language === 'id' ? 'Jelaskan proyek dan pengalaman Anda (minimal 50 karakter)' : 'Describe your projects and experience (min 50 characters)'} *
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              placeholder={language === 'id' 
                                ? 'Jelaskan proyek-proyek yang pernah Anda kerjakan, spesialisasi, dan pengalaman profesional Anda...\n\nDescribe the projects you have worked on, your specialization, and professional experience...'
                                : 'Describe the projects you have worked on, your specialization, and professional experience...\n\nJelaskan proyek-proyek yang pernah Anda kerjakan, spesialisasi, dan pengalaman profesional Anda...'}
                              value={portfolioDescription}
                              onChange={(e) => {
                                setPortfolioDescription(e.target.value)
                                if (errors.portfolioDescription) {
                                  setErrors(prev => ({ ...prev, portfolioDescription: '' }))
                                }
                              }}
                              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 min-h-[120px]"
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-400 text-sm">
                                {portfolioDescription.length} / 50+ {language === 'id' ? 'karakter' : 'characters'}
                              </span>
                              {portfolioDescription.length >= 50 && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            {errors.portfolioDescription && <p className="text-sm text-red-500 mt-2">{errors.portfolioDescription}</p>}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Step 3: Certification */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-r from-[#9B59B6]/10 to-[#8E44AD]/10 border-[#9B59B6]/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {language === 'id' ? 'Sertifikasi' : 'Certification'}
                          </CardTitle>
                          {selectedProfession?.requiresCertificate && (
                            <CardDescription className="text-gray-400">
                              {language === 'id' ? 'Untuk profesi ini, sertifikasi diperlukan' : 'For this profession, certification is required'}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedProfession?.requiresCertificate ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {step3Fields.map(renderField)}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-400">
                              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                              <p>
                                {language === 'id' 
                                  ? 'Profesi ini tidak memerlukan sertifikasi. Silakan lanjut ke langkah berikutnya.' 
                                  : 'This profession does not require certification. Please proceed to the next step.'}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 4: Account Security */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <Card className="bg-gradient-to-r from-[#E74C3C]/10 to-[#C0392B]/10 border-[#E74C3C]/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            {language === 'id' ? 'Keamanan Akun' : 'Account Security'}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {language === 'id' ? 'Buat password aman untuk akun Anda' : 'Create a secure password for your account'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step4Fields.map(renderField)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-700">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                      >
                        {language === 'id' ? 'Kembali' : 'Back'}
                      </Button>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {step < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] text-white"
                      >
                        {language === 'id' ? 'Lanjut' : 'Next'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'id' ? 'Memproses...' : 'Processing...'}
                          </>
                        ) : (
                          language === 'id' ? 'Daftar Sekarang' : 'Register Now'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E]/95 backdrop-blur-sm text-gray-300 py-3 sm:py-4 border-t border-gray-700 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9B59B6]" />
              <span className="font-semibold text-sm sm:text-base">ARCHI-COLL</span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}.
            </p>
          </div>
        </div>
      </footer>

      {/* Email Already Exists Dialog */}
      <Dialog open={emailExistsDialogOpen} onOpenChange={setEmailExistsDialogOpen}>
        <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {language === 'id' ? 'Email Sudah Terdaftar' : 'Email Already Registered'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {language === 'id' 
                ? 'Email ini sudah terdaftar dalam sistem. Silakan login untuk melanjutkan.'
                : 'This email is already registered. Please login to continue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/join-member')}
              className="w-full bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] hover:from-[#5a4a7e] hover:via-[#8a4a9f] hover:to-[#d03b2b] text-white"
            >
              {language === 'id' ? 'Login Sekarang' : 'Login Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
