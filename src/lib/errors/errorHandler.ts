// Centralized Error Handling

import { AppError } from './AppError'
import { ApiError, createApiErrorFromStatus } from './ApiError'

export interface ErrorResponse {
  success: false
  error: string
  statusCode?: number
  context?: Record<string, any>
  stack?: string
}

/**
 * Handle error and return formatted error response
 */
export function handleError(error: unknown): ErrorResponse {
  // Handle AppError and its subclasses
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      context: error.context,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  // Handle standard Error
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      statusCode: 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      success: false,
      error: error,
      statusCode: 500,
    }
  }

  // Handle unknown errors
  return {
    success: false,
    error: 'An unknown error occurred',
    statusCode: 500,
  }
}

/**
 * Log error to console (can be extended to send to logging service)
 */
export function logError(error: unknown, context?: string): void {
  const errorResponse = handleError(error)

  console.error('=== Error occurred ===')
  if (context) {
    console.error(`Context: ${context}`)
  }
  console.error(`Error: ${errorResponse.error}`)
  if (errorResponse.statusCode) {
    console.error(`Status: ${errorResponse.statusCode}`)
  }
  if (errorResponse.context) {
    console.error('Context:', errorResponse.context)
  }
  if (errorResponse.stack) {
    console.error('Stack:', errorResponse.stack)
  }
  console.error('====================')
}

/**
 * Handle API error from fetch response
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`
  let context: Record<string, any> = {}

  try {
    const data = await response.json()
    if (data.error) {
      errorMessage = data.error
    }
    if (data.message) {
      errorMessage = data.message
    }
    if (data.context) {
      context = data.context
    }
  } catch {
    // Response is not JSON, use status text
  }

  throw createApiErrorFromStatus(response.status, errorMessage, response.url, undefined, context)
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, context)
      throw error
    }
  }
}

/**
 * Check if error is operational (should be shown to user)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const errorResponse = handleError(error)

  // Return different messages based on status code
  switch (errorResponse.statusCode) {
    case 400:
      return 'Permintaan tidak valid. Silakan periksa input Anda.'
    case 401:
      return 'Anda tidak memiliki akses. Silakan login terlebih dahulu.'
    case 403:
      return 'Anda tidak memiliki izin untuk mengakses resource ini.'
    case 404:
      return 'Resource yang dicari tidak ditemukan.'
    case 409:
      return 'Konflik data. Silakan periksa kembali data Anda.'
    case 422:
      return 'Validasi gagal. Silakan periksa input Anda.'
    case 429:
      return 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
    case 500:
    default:
      return 'Terjadi kesalahan server. Silakan coba lagi nanti.'
  }
}
