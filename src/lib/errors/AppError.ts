// Base Error Class

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)

    // Maintains proper stack trace for where our error was thrown
    Object.setPrototypeOf(this, new.target.prototype)

    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    this.name = this.constructor.name

    Error.captureStackTrace(this)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    }
  }
}

// Common Error Types
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', context?: Record<string, any>) {
    super(message, 400, true, context)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', context?: Record<string, any>) {
    super(message, 401, true, context)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', context?: Record<string, any>) {
    super(message, 403, true, context)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 404, true, context)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', context?: Record<string, any>) {
    super(message, 409, true, context)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: Record<string, any>) {
    super(message, 422, true, context)
    this.name = 'ValidationError'
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super(message, 500, false, context)
    this.name = 'InternalServerError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error', context?: Record<string, any>) {
    super(message, 503, true, context)
    this.name = 'NetworkError'
  }
}
