/**
 * Features Configuration
 * Feature flags and feature-specific configuration
 */

export const featuresConfig = {
  // Registration & Authentication
  auth: {
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== 'false',
    enableSocialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
    allowedProviders: ['google', 'linkedin'] as const,
    requireEmailVerification: false,
    passwordMinLength: 8,
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Contact Form
  contact: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM !== 'false',
    requireCaptcha: process.env.NEXT_PUBLIC_REQUIRE_CAPTCHA === 'true',
    captchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    notificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL || 'info@archi-coll.com',
    autoReply: true,
  },

  // Order System
  orders: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ORDER_SYSTEM !== 'false',
    allowGuestOrders: true,
    requirePayment: false,
    autoAssignMember: false,
    notificationEmail: process.env.ORDER_NOTIFICATION_EMAIL || 'orders@archi-coll.com',
  },

  // Member Dashboard
  memberDashboard: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_MEMBER_DASHBOARD !== 'false',
    allowProfileEditing: true,
    allowPortfolioManagement: true,
    allowProjectViewing: true,
    maxPortfolioProjects: 20,
    maxPortfolioImagesPerProject: 10,
  },

  // Admin Dashboard
  adminDashboard: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD !== 'false',
    allowedEmails: process.env.ADMIN_ALLOWED_EMAILS?.split(',') || ['admin@archi-coll.com'],
    enableAnalytics: true,
    enableContentManagement: true,
    enableUserManagement: true,
  },

  // Content Management
  content: {
    enableDynamicServices: true,
    enableDynamicPortfolio: true,
    enableDynamicTeamMembers: true,
    enableDynamicAboutContent: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // File Upload
  uploads: {
    enabled: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf'],
    storageProvider: 'local', // 'local' | 's3' | 'cloudinary'
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'ap-southeast-1',
      acl: 'public-read',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
    },
  },

  // Notifications
  notifications: {
    enabled: true,
    channels: ['email', 'in-app'] as const,
    email: {
      enabled: true,
      from: process.env.EMAIL_FROM || 'noreply@archi-coll.com',
      replyTo: process.env.EMAIL_REPLY_TO || 'info@archi-coll.com',
    },
    inApp: {
      enabled: true,
      maxNotifications: 50,
      autoDeleteAfter: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  },

  // Analytics
  analytics: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    provider: process.env.ANALYTICS_PROVIDER || 'none', // 'google', 'plausible', 'none'
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
    trackPageViews: true,
    trackEvents: true,
  },

  // Performance
  performance: {
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableCache: true,
    cacheStrategy: 'swr', // 'swr' | 'react-query' | 'custom'
  },

  // Development Tools
  development: {
    enableDebugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    enableApiDocs: process.env.ENABLE_API_DOCS === 'true',
    enableTestRoutes: process.env.ENABLE_TEST_ROUTES === 'true',
  },
} as const
