// HTTP Client with interceptors and error handling

import type { ApiResponse, ApiRequestConfig } from '@/types'

const API_BASE_URL = ''

export async function apiRequest<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, params } = config

  // Build URL with query params
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Request config
  const requestConfig: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
  }

  // Add body for non-GET requests
  if (method !== 'GET' && body !== undefined) {
    requestConfig.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestConfig)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }
      return {
        success: true,
        data: (await response.text()) as T,
      }
    }

    // Parse JSON response
    const data = await response.json()

    // Handle HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
        data: data.data,
      }
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    }
  } catch (error) {
    console.error('API Request Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T = any>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'POST', body }),

  put: <T = any>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body: any, config?: Omit<ApiRequestConfig, 'method'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
}
