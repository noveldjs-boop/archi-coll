/**
 * App Configuration
 * Central configuration for the application
 */

export const appConfig = {
  // App Info
  name: 'ARCHI-COLL',
  description: 'Architecture Collaboration Studio',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://archi-coll.com',

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // File Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf'],
    uploadPath: '/uploads',
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== 'false',
    enableContactForm: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM !== 'false',
    enableOrderSystem: process.env.NEXT_PUBLIC_ENABLE_ORDER_SYSTEM !== 'false',
    enableMemberDashboard: process.env.NEXT_PUBLIC_ENABLE_MEMBER_DASHBOARD !== 'false',
    enableAdminDashboard: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD !== 'false',
  },

  // Social Media Links
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  },

  // Contact Info (fallback if database is empty)
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@archi-coll.com',
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+62 21 1234 5678',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+62 812 3456 7890',
    address: process.env.NEXT_PUBLIC_ADDRESS || 'Jl. Architecture No. 123, Jakarta, Indonesia',
  },

  // SEO
  seo: {
    defaultTitle: 'ARCHI-COLL - Architecture & Design Studio',
    defaultDescription: 'Layanan desain arsitektur profesional untuk hunian, komersial, dan hospitality',
    defaultImage: '/og-image.png',
    twitterHandle: '@archicoll',
  },

  // Cache Configuration
  cache: {
    shortTTL: 5 * 60 * 1000, // 5 minutes
    mediumTTL: 30 * 60 * 1000, // 30 minutes
    longTTL: 60 * 60 * 1000, // 1 hour
  },
} as const
