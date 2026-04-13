'use client'

import { useState } from 'react'
import { validateForm, VALIDATION_RULES } from '@/lib/validators/forms'

interface ContactFormData {
  name: string
  email: string
  phone: string
  projectType: string
  message: string
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const validationRules = {
      name: VALIDATION_RULES.name,
      email: VALIDATION_RULES.email,
      phone: VALIDATION_RULES.phone,
      message: VALIDATION_RULES.message,
      projectType: { required: true },
    }

    const validationErrors = validateForm(formData, validationRules)

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message
      })
      setErrors(errorMap)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitStatus('success')
        setSubmitMessage('Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          message: '',
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'Gagal mengirim pesan. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setSubmitStatus('error')
      setSubmitMessage('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectType: '',
      message: '',
    })
    setErrors({})
    setSubmitStatus('idle')
    setSubmitMessage('')
  }

  return {
    formData,
    errors,
    isSubmitting,
    submitStatus,
    submitMessage,
    handleChange,
    handleSubmit,
    reset,
  }
}
