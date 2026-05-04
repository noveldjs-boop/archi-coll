/**
 * API Configuration
 * Configuration for API endpoints and settings
 */

export const apiConfig = {
  // Base URL (relative for same-origin, absolute for external)
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  // API Version
  version: 'v1',

  // Timeout settings
  timeouts: {
    default: 30000, // 30 seconds
    upload: 120000, // 2 minutes
    download: 60000, // 1 minute
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000, // milliseconds
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },

  // Request headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Response caching
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    endpointsToCache: [
      '/api/services',
      '/api/portfolio',
      '/api/team-members',
      '/api/contact-info',
      '/api/operating-hours',
      '/api/home-stats',
    ],
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Error handling
  errors: {
    showUserFriendlyMessages: true,
    logErrors: true,
    sendToErrorService: process.env.NODE_ENV === 'production',
  },

  // Authentication
  auth: {
    tokenStorageKey: 'auth_token',
    refreshTokenStorageKey: 'refresh_token',
    tokenExpirationBuffer: 5 * 60 * 1000, // 5 minutes before expiration
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // File upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    chunkSize: 1024 * 1024, // 1MB chunks
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
} as const
