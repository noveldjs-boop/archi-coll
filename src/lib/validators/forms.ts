// Form Validation Schemas

import { isValidEmail, normalizeEmail } from './email'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | undefined
  email?: boolean
  phone?: boolean
}

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate a single field value
 * @param value - Value to validate
 * @param rules - Validation rules
 * @param fieldName - Field name for error messages
 * @returns Error message or undefined if valid
 */
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | undefined {
  // Required validation
  if (rules.required && (!value || value === '')) {
    return `${fieldName} wajib diisi`
  }

  // Skip other validations if value is empty and not required
  if (!value || value === '') {
    return undefined
  }

  // String type validations
  if (typeof value === 'string') {
    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} minimal ${rules.minLength} karakter`
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} maksimal ${rules.maxLength} karakter`
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format tidak valid`
    }

    // Email validation
    if (rules.email && !isValidEmail(value)) {
      return 'Format email tidak valid'
    }

    // Phone validation (Indonesian format)
    if (rules.phone) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/
      const cleaned = value.replace(/[\s-]/g, '')
      if (!phoneRegex.test(cleaned)) {
        return 'Format nomor telepon tidak valid'
      }
    }
  }

  // Number type validations
  if (typeof value === 'number') {
    if (rules.minLength && value < rules.minLength) {
      return `${fieldName} minimal ${rules.minLength}`
    }

    if (rules.maxLength && value > rules.maxLength) {
      return `${fieldName} maksimal ${rules.maxLength}`
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return undefined
}

/**
 * Validate multiple fields
 * @param values - Object with field values
 * @param rules - Object with field validation rules
 * @returns Array of validation errors
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, ValidationRule>>
): ValidationError[] {
  const errors: ValidationError[] = []

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const error = validateField(
      values[field],
      fieldRules,
      field
    )
    if (error) {
      errors.push({ field, message: error })
    }
  })

  return errors
}

/**
 * Check if form has errors
 * @param errors - Array of validation errors
 * @returns Boolean indicating if form has errors
 */
export function hasErrors(errors: ValidationError[]): boolean {
  return errors.length > 0
}

/**
 * Get error message for a specific field
 * @param errors - Array of validation errors
 * @param fieldName - Field name
 * @returns Error message or undefined
 */
export function getErrorMessage(errors: ValidationError[], fieldName: string): string | undefined {
  return errors.find(e => e.field === fieldName)?.message
}

// Common validation rules
export const VALIDATION_RULES = {
  required: { required: true } as ValidationRule,
  email: { required: true, email: true } as ValidationRule,
  phone: { required: true, phone: true } as ValidationRule,
  name: { required: true, minLength: 2, maxLength: 100 } as ValidationRule,
  password: { required: true, minLength: 8 } as ValidationRule,
  message: { required: true, minLength: 10, maxLength: 1000 } as ValidationRule,
  address: { required: true, minLength: 5, maxLength: 500 } as ValidationRule,
} as const
