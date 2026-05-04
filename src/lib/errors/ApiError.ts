// API Error Handling

import { AppError, NotFoundError, ValidationError, InternalServerError } from './AppError'

export class ApiError extends AppError {
  public readonly endpoint?: string
  public readonly method?: string

  constructor(
    message: string,
    statusCode: number = 500,
    endpoint?: string,
    method?: string,
    context?: Record<string, any>
  ) {
    super(message, statusCode, true, {
      ...context,
      endpoint,
      method,
    })

    this.endpoint = endpoint
    this.method = method
    this.name = 'ApiError'
  }
}

export class UnauthorizedApiError extends ApiError {
  constructor(endpoint?: string, method?: string) {
    super('Unauthorized access', 401, endpoint, method)
    this.name = 'UnauthorizedApiError'
  }
}

export class ForbiddenApiError extends ApiError {
  constructor(endpoint?: string, method?: string) {
    super('Access forbidden', 403, endpoint, method)
    this.name = 'ForbiddenApiError'
  }
}

export class NotFoundApiError extends ApiError {
  constructor(endpoint?: string, method?: string, resource?: string) {
    super(resource ? `${resource} not found` : 'Resource not found', 404, endpoint, method)
    this.name = 'NotFoundApiError'
  }
}

export class ValidationApiError extends ApiError {
  public readonly validationErrors?: Record<string, string>

  constructor(
    message: string = 'Validation failed',
    validationErrors?: Record<string, string>,
    endpoint?: string,
    method?: string
  ) {
    super(message, 422, endpoint, method, { validationErrors })
    this.validationErrors = validationErrors
    this.name = 'ValidationApiError'
  }
}

export class ConflictApiError extends ApiError {
  constructor(message: string = 'Resource conflict', endpoint?: string, method?: string) {
    super(message, 409, endpoint, method)
    this.name = 'ConflictApiError'
  }
}

export class RateLimitError extends ApiError {
  constructor(endpoint?: string, method?: string, retryAfter?: number) {
    super('Rate limit exceeded', 429, endpoint, method, { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class ServerError extends ApiError {
  constructor(endpoint?: string, method?: string) {
    super('Server error', 500, endpoint, method)
    this.name = 'ServerError'
  }
}

/**
 * Create appropriate ApiError from HTTP status code
 */
export function createApiErrorFromStatus(
  statusCode: number,
  message?: string,
  endpoint?: string,
  method?: string,
  context?: Record<string, any>
): ApiError {
  switch (statusCode) {
    case 400:
      return new ApiError(message || 'Bad request', 400, endpoint, method, context)
    case 401:
      return new UnauthorizedApiError(endpoint, method)
    case 403:
      return new ForbiddenApiError(endpoint, method)
    case 404:
      return new NotFoundApiError(endpoint, method, message)
    case 409:
      return new ConflictApiError(message, endpoint, method)
    case 422:
      return new ValidationApiError(message, context?.validationErrors, endpoint, method)
    case 429:
      return new RateLimitError(endpoint, method, context?.retryAfter)
    default:
      if (statusCode >= 500) {
        return new ServerError(endpoint, method)
      }
      return new ApiError(message || 'API error', statusCode, endpoint, method, context)
  }
}
