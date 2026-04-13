// API Request/Response Types

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestConfig {
  method?: ApiMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
}
