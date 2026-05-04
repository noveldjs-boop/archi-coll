// Custom hook for order form

import { useState } from 'react'
import { api } from '@/lib/api/client'
import { validateForm, VALIDATION_RULES } from '@/lib/validators/forms'

interface ClientInfo {
  clientName: string
  clientPhone: string
  clientAddress: string
  clientProfession: string
  clientCompanyName: string
}

interface BuildingInfo {
  landArea: string
  landPosition: string
  landBoundary: string
  accessRoadWidth: string
  buildingArea: string
  buildingModel: string
  buildingFloors: string
  structureType: string
  buildingType: 'low-rise' | 'mid-rise' | 'high-rise'
  qualityLevel: 'sederhana' | 'menengah' | 'mewah'
}

interface OrderFormData extends ClientInfo, BuildingInfo {
  description: string
  location: string
  dynamicFields: Record<string, string>
}

interface UseOrderFormOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useOrderForm(options: UseOrderFormOptions = {}) {
  const { onSuccess, onError } = options

  const [formData, setFormData] = useState<OrderFormData>({
    // Client info
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    clientProfession: '',
    clientCompanyName: '',
    // Building info
    landArea: '',
    landPosition: '',
    landBoundary: '',
    accessRoadWidth: '',
    buildingArea: '',
    buildingModel: '',
    buildingFloors: '',
    structureType: '',
    buildingType: 'low-rise',
    qualityLevel: 'menengah',
    // Project details
    description: '',
    location: '',
    // Dynamic fields
    dynamicFields: {},
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleDynamicFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: { ...prev.dynamicFields, [fieldId]: value },
    }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const validationErrors = validateForm(formData, {
      clientName: { ...VALIDATION_RULES.name, required: true },
      clientPhone: { ...VALIDATION_RULES.phone, required: true },
      clientAddress: { ...VALIDATION_RULES.address, required: true },
      buildingArea: { required: true, custom: (value) => {
        const num = parseFloat(value)
        return !value || num <= 0 ? 'Luas bangunan harus lebih dari 0' : undefined
      }},
      buildingFloors: { required: true, custom: (value) => {
        const num = parseInt(value)
        return !value || num <= 0 ? 'Jumlah lantai harus lebih dari 0' : undefined
      }},
    })

    const errorsMap: Record<string, string> = {}
    validationErrors.forEach(err => {
      errorsMap[err.field] = err.message
    })

    setErrors(errorsMap)
    return validationErrors.length === 0
  }

  const handleSubmit = async (categoryId?: string, categoryName?: string, calculationResult?: any) => {
    if (!categoryId || !categoryName) {
      onError?.('Category information is required')
      return
    }

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      const payload = {
        // Client info
        clientId: 'mock-client-id',
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        clientProfession: formData.clientProfession,
        clientCompanyName: formData.clientCompanyName,
        // Category info
        categoryId,
        categoryName,
        // Building info
        landArea: formData.landArea,
        landPosition: formData.landPosition,
        landBoundary: formData.landBoundary,
        accessRoadWidth: formData.accessRoadWidth,
        buildingArea: formData.buildingArea,
        buildingModel: formData.buildingModel,
        buildingFloors: formData.buildingFloors,
        structureType: formData.structureType,
        buildingCategory: categoryId,
        buildingType: formData.buildingType,
        qualityLevel: formData.qualityLevel,
        // Project details
        description: formData.description,
        location: formData.location,
        // Pricing (from calculation)
        rab: calculationResult?.rab || 0,
        designFee: calculationResult?.designFee || 0,
        iaiFeeRate: calculationResult?.iaiFeeRate || 0,
        pricePerM2: calculationResult?.pricePerM2 || 0,
        simulatedDP10: calculationResult?.dpPayment || 0,
        // Dynamic form fields
        formData: formData.dynamicFields,
      }

      const response = await api.post('/api/orders', payload)

      if (response.success) {
        setIsSuccess(true)
        setFormData({
          clientName: '',
          clientPhone: '',
          clientAddress: '',
          clientProfession: '',
          clientCompanyName: '',
          landArea: '',
          landPosition: '',
          landBoundary: '',
          accessRoadWidth: '',
          buildingArea: '',
          buildingModel: '',
          buildingFloors: '',
          structureType: '',
          buildingType: 'low-rise',
          qualityLevel: 'menengah',
          description: '',
          location: '',
          dynamicFields: {},
        })
        onSuccess?.()
      } else {
        const errorMessage = response.error || 'Failed to submit order'
        onError?.(errorMessage)
        setErrors({ form: errorMessage })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit order'
      onError?.(errorMessage)
      setErrors({ form: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      clientProfession: '',
      clientCompanyName: '',
      landArea: '',
      landPosition: '',
      landBoundary: '',
      accessRoadWidth: '',
      buildingArea: '',
      buildingModel: '',
      buildingFloors: '',
      structureType: '',
      buildingType: 'low-rise',
      qualityLevel: 'menengah',
      description: '',
      location: '',
      dynamicFields: {},
    })
    setErrors({})
    setIsSuccess(false)
  }

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    handleChange,
    handleDynamicFieldChange,
    handleSubmit,
    resetForm,
  }
}
