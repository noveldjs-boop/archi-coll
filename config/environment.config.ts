/**
 * Environment Configuration
 * Type-safe environment variables
 */

type Environment = 'development' | 'staging' | 'production'

export interface EnvironmentConfig {
  nodeEnv: string
  environment: Environment
  apiUrl: string
  publicUrl: string
  isDevelopment: boolean
  isStaging: boolean
  isProduction: boolean
  database: {
    url: string
  }
  auth: {
    secret: string
    sessionMaxAge: number
  }
  email: {
    from: string
    replyTo?: string
    smtp?: {
      host: string
      port: number
      user: string
      password: string
    }
  }
  upload: {
    provider: 'local' | 's3' | 'cloudinary'
    maxFileSize: number
    s3?: {
      bucket: string
      region: string
      accessKeyId: string
      secretAccessKey: string
    }
    cloudinary?: {
      cloudName: string
      apiKey: string
      apiSecret: string
      uploadPreset: string
    }
  }
  analytics?: {
    googleAnalyticsId?: string
    plausibleDomain?: string
  }
}

function getEnvironment(): Environment {
  const env = process.env.NODE_ENV
  if (env === 'production') return 'production'
  if (env === 'staging') return 'staging'
  return 'development'
}

export const env: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  environment: getEnvironment(),
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  publicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  isDevelopment: getEnvironment() === 'development',
  isStaging: getEnvironment() === 'staging',
  isProduction: getEnvironment() === 'production',

  database: {
    url: process.env.DATABASE_URL || 'file:./db/custom.db',
  },

  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production',
    sessionMaxAge: parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE || '86400000'), // 24 hours
  },

  email: {
    from: process.env.EMAIL_FROM || 'noreply@archi-coll.com',
    replyTo: process.env.EMAIL_REPLY_TO,
    smtp: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          user: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASSWORD || '',
        }
      : undefined,
  },

  upload: {
    provider: (process.env.UPLOAD_PROVIDER as 'local' | 's3' | 'cloudinary') || 'local',
    maxFileSize: parseInt(process.env.MAX_UPLOAD_SIZE || '5242880'), // 5MB
    s3: process.env.S3_BUCKET
      ? {
          bucket: process.env.S3_BUCKET,
          region: process.env.S3_REGION || 'ap-southeast-1',
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        }
      : undefined,
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME
      ? {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY || '',
          apiSecret: process.env.CLOUDINARY_API_SECRET || '',
          uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
        }
      : undefined,
  },

  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  },
} as const

// Validation function to check required environment variables
export function validateEnvironment(): string[] {
  const errors: string[] = []

  if (env.isProduction) {
    if (!env.auth.secret || env.auth.secret === 'default-secret-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be set in production')
    }

    if (!env.database.url) {
      errors.push('DATABASE_URL must be set')
    }
  }

  return errors
}
