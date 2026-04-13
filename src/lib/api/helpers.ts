// API Response Helpers

import type { ApiResponse, PaginatedResponse } from '@/types'

/**
 * Check if API response is successful
 */
export function isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined
}

/**
 * Check if API response has error
 */
export function isError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } {
  return response.success === false && response.error !== undefined
}

/**
 * Extract data from API response, throw error if failed
 */
export function extractData<T>(response: ApiResponse<T>): T {
  if (isError(response)) {
    throw new Error(response.error)
  }
  return response.data!
}

/**
 * Get error message from API response
 */
export function getErrorMessage<T>(response: ApiResponse<T>, defaultMessage = 'An error occurred'): string {
  return response.error || response.message || defaultMessage
}

/**
 * Check if paginated response has more pages
 */
export function hasNextPage<T>(response: PaginatedResponse<T>): boolean {
  return (response.pagination?.page || 0) < (response.pagination?.totalPages || 0)
}

/**
 * Check if paginated response has previous pages
 */
export function hasPreviousPage<T>(response: PaginatedResponse<T>): boolean {
  return (response.pagination?.page || 1) > 1
}

/**
 * Get total pages from paginated response
 */
export function getTotalPages<T>(response: PaginatedResponse<T>): number {
  return response.pagination?.totalPages || 1
}

/**
 * Get current page from paginated response
 */
export function getCurrentPage<T>(response: PaginatedResponse<T>): number {
  return response.pagination?.page || 1
}

/**
 * Handle API error with logging and user-friendly message
 */
export function handleApiError(error: unknown, context = 'API Request'): string {
  console.error(`${context} error:`, error)

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}
